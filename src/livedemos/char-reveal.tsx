import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * Full-page character reveal: the paragraphs below enter one token at a time.
 *
 * The important part is the order of operations. Every block is readable in the
 * server output and stays readable when JS never runs; the animation class is
 * only attached after mount, so nothing is hidden behind a script that might
 * fail. Each block arms once — it never replays when it scrolls back into view —
 * and replay belongs to the button.
 *
 * CSS owns the motion: one keyframes block, per-token animation-delay inline.
 * Reduced motion never arms anything, so the text simply sits there.
 */

const CSS_TEXT = [
  '@keyframes live-cr-rise {',
  '  from {',
  '    opacity: 0;',
  '    transform: translate3d(0, 0.55em, 0);',
  '  }',
  '  to {',
  '    opacity: 1;',
  '    transform: translate3d(0, 0, 0);',
  '  }',
  '}',
  '',
  '/*',
  ' * The base state is visible. The animation adds the hidden start via',
  ' * animation-fill-mode: both, so text without the class is never invisible.',
  ' */',
  '.live-cr-token {',
  '  display: inline-block;',
  '  white-space: pre;',
  '}',
  '',
  '.live-cr-run .live-cr-token {',
  '  animation: live-cr-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both;',
  '}',
  '',
  '@media (prefers-reduced-motion: reduce) {',
  '  .live-cr-run .live-cr-token {',
  '    animation: none !important;',
  '    opacity: 1 !important;',
  '    transform: none !important;',
  '  }',
  '}',
].join('\n')

const SNIPPET = [
  '/* base state: visible. motion is added by a class, never by absence. */',
  '.reveal__token {',
  '  display: inline-block;',
  '  white-space: pre;',
  '}',
  '',
  '.reveal.is-running .reveal__token {',
  '  animation: rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both;',
  '}',
  '',
  '@keyframes rise {',
  '  from { opacity: 0; transform: translate3d(0, 0.55em, 0); }',
  '  to   { opacity: 1; transform: translate3d(0, 0, 0); }',
  '}',
  '',
  '@media (prefers-reduced-motion: reduce) {',
  '  .reveal.is-running .reveal__token {',
  '    animation: none !important;',
  '    opacity: 1 !important;',
  '    transform: none !important;',
  '  }',
  '}',
].join('\n')

const JS_SNIPPET = [
  'const io = new IntersectionObserver((entries) => {',
  '  if (!entries.some((e) => e.isIntersecting)) return',
  '  io.disconnect()        // arm once: no replay on scroll',
  '  block.classList.add("is-running")',
  '}, { threshold: 0.4 })',
  '',
  'io.observe(block)',
  '',
  '/* visual text is split; assistive tech gets the whole sentence */',
  'text.setAttribute("aria-hidden", "true")',
  'srOnly.textContent = sentence',
].join('\n')

const T = {
  eyebrow: { zh: '现场 · 逐字显现', en: 'LIVE · CHARACTER REVEAL' },
  title: { zh: '一个字，一个字，落下来', en: 'One token at a time' },
  lede: {
    zh: '大标题一动不动，先让你读完。下面那一行才是演示：每个字从下方浮上来，间隔 45ms 依次到位，一共不到一秒。',
    en: 'The headline does not move, so you can read it first. The line below is the demo: each token floats up from below, 45ms apart, and the whole run is under a second.',
  },
  heroNote: {
    zh: '为什么必须整页：逐字显现靠的是「一行字有多少个、最后一个要等多久」。盒子里那行十个字刚好，一整句三十个字的总时长才是真问题——这一页让你看见等待是怎么累加的。',
    en: 'Why the whole page: a character reveal depends on how many tokens a line has and how long the last one waits. Ten characters in a box look fine; a real thirty-token sentence is where the wait compounds — and this page shows that accumulation.',
  },
  demoCaption: {
    zh: '这一行是演示：它进入视口才播，只播一次。',
    en: 'This line is the demo: it plays when it enters view, exactly once.',
  },
  replay: { zh: '重播这一段', en: 'Replay this block' },
  stagger: { zh: '字间隔', en: 'Stagger' },
  totalLabel: { zh: '这一段总时长', en: 'Total for this block' },
  blocks: [
    {
      id: 'block-a',
      text: {
        zh: '首屏不该藏字。标题是读者最先要读的东西，把它做成透明的、等脚本跑起来再点亮，等于赌脚本不会失败。',
        en: 'The first screen should not hide its text. A headline is the first thing a reader needs, and starting it transparent until a script wakes up is a bet that the script will not fail.',
      },
    },
    {
      id: 'block-b',
      text: {
        zh: '所以顺序要反过来：文字默认可见，动画只是加在它上面的一层。' + 'CSS 播不了，句子还在；JS 没加载，句子还在。',
        en: 'So the order is inverted: text is visible by default, and the animation is a layer added on top. If CSS cannot run, the sentence is still there; if JS never loads, the sentence is still there.',
      },
    },
    {
      id: 'block-c',
      text: {
        zh: '只播一次也是硬要求。滚回来就重放一遍，读者会以为页面在反复加载。',
        en: 'Playing exactly once is a hard requirement too. Replaying whenever the block scrolls back makes the page feel like it keeps reloading.',
      },
    },
  ],
  sections: [
    {
      title: { zh: '先把字摆好，再让它入场', en: 'Lay the text out first, then animate it in' },
      figure: ['opacity: 1 (base)', 'animation: both', 'never inline opacity: 0'],
      body: {
        zh: '逐字显现不是让字「写出来」，而是让已经排好版的字依次回到原位。所以基础状态必须是可见的：动画用 animation-fill-mode: both 借走开始帧，播完再交还最终帧。这样一来，动画类没加上、被浏览器忽略、或者系统要求减少动态时，文字都只是静止的正文，而不是一片空白。',
        en: 'A character reveal does not write the text out; it brings already typeset characters back to rest in order. The base state therefore has to be visible: animation-fill-mode: both borrows the start frame and hands back the final one. If the class is missing, the browser ignores the animation, or the system asks for reduced motion, the text is simply static prose — never a blank area.',
      },
    },
    {
      title: { zh: '只播一次，重播交给按钮', en: 'Play once, let a button replay' },
      figure: ['threshold 0.4', 'disconnect()', 'replay = user action'],
      body: {
        zh: '把 IntersectionObserver 的回调写成「每次进入都加上动画类」，就会在滚动来回时反复重播。正确做法是第一次进入视口就 disconnect，之后再也不管。要重播就明说：给一个按钮，用户点了才重来。上面的「重播这一段」就是这样的按钮，它重建整段节点，所以动画从零开始。',
        en: 'If the IntersectionObserver callback adds the animation class on every entry, the block replays whenever the reader scrolls around. The correct pattern disconnects after the first intersection and never looks again. Replay should be explicit: a button the user presses, like Replay this block above, which remounts the block so the animation starts from zero.',
      },
    },
    {
      title: { zh: '中文按字拆，英文按词拆', en: 'Split Chinese by character, English by word' },
      figure: ['zh: Array.from', 'en: split by space', 'Intl.Segmenter'],
      body: {
        zh: '中文没有词间空格，按字符拆正好；英文按字母拆会打断单词、破坏连字和字偶距，读者看到的是一串跳动的碎片。英文应该按词拆，或者用 Intl.Segmenter 按 grapheme 或 word 切。拆分之后还要处理读屏：可视文字设 aria-hidden，另外放一份完整句子给读屏软件。',
        en: 'Chinese has no spaces between words, so splitting by character is natural. Splitting English by letter breaks words, ligatures, and kerning, and readers see a run of jumping fragments. Split English by word instead, or segment it with Intl.Segmenter by grapheme or word. After splitting, handle assistive tech: mark the visual text aria-hidden and provide the whole sentence separately.',
      },
    },
    {
      title: { zh: '什么时候别用', en: 'When not to use it' },
      figure: ['long text? no', 'body copy? no', 'every page? no'],
      body: {
        zh: '超过二三十字的文本不要用：字间隔乘字数就是最后一个字的等待时间，40 字乘 50ms 已经两秒。正文更不要用——读者要能一眼扫读，逐字动起来只会挡住视线。也别每个页面都来一次：首屏标题值得，第二屏第三屏不值得，重复三次之后它就从「讲究」变成「套路」。',
        en: 'Do not use it beyond twenty or thirty tokens: stagger times token count is how long the last one waits, and 40 tokens at 50ms is already two seconds. Never for body copy — readers need to scan, and per-token motion only blocks the eye. And do not do it on every page: it earns its place in a hero, not in the second and third section, and after the third repeat it stops being care and becomes a tic.',
      },
    },
  ],
  paramsTitle: { zh: '推荐取值', en: 'Recommended values' },
  params: [
    { label: { zh: '单字时长', en: 'Per token' }, value: '300–600ms' },
    { label: { zh: '字间隔', en: 'Stagger' }, value: '20–50ms' },
    { label: { zh: '位移', en: 'Offset' }, value: '0.4–0.8em' },
    { label: { zh: '缓动', en: 'Easing' }, value: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    { label: { zh: '字数上限', en: 'Token cap' }, value: '20–30' },
    { label: { zh: '降级', en: 'Fallback' }, value: { zh: '不播，整句静止可读', en: 'No run; the sentence is static' } },
  ],
  codeTitle: { zh: '这一页实际在用的', en: 'What this page actually runs' },
  codeNote: {
    zh: 'CSS 负责动，JS 只负责「什么时候加上动画类」。类和文字都在，动画才会跑；类没加上，文字照样在。',
    en: 'CSS does the motion; JS only decides when to add the animation class. With the class and the text both present the animation runs; without the class the text is still there.',
  },
  reducedNote: {
    zh: '如果系统开了减少动态，这一页不会给任何一段加动画类：三段文字一直是静止的，不会藏起来再出现。',
    en: 'If reduced motion is on, this page never adds the animation class to any block: all three paragraphs stay static and never hide first.',
  },
  back: { zh: '回到词条：逐字显现', en: 'Back to the entry: Character Reveal' },
} as const

function tokenize(text: string, locale: 'zh' | 'en'): string[] {
  if (locale === 'en') {
    return text.split(/(\s+)/).filter((part) => part.length > 0)
  }
  return Array.from(text)
}

function countTokens(text: string, locale: 'zh' | 'en'): number {
  return tokenize(text, locale).filter((part) => part.trim().length > 0).length
}

function Reveal({
  text,
  locale,
  stagger,
  runId,
  immediate,
}: {
  text: string
  locale: 'zh' | 'en'
  stagger: number
  runId: number
  immediate?: boolean
}) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    const block = ref.current
    if (!block) return
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    }
    if (immediate) {
      const frame = requestAnimationFrame(() => setRunning(true))
      return () => cancelAnimationFrame(frame)
    }
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        setRunning(true)
      },
      { threshold: 0.4 },
    )
    observer.observe(block)
    return () => observer.disconnect()
  }, [immediate, runId])

  const tokens = tokenize(text, locale)
  const parts = tokens.map((token, index) => {
    const isSpace = token.trim().length === 0
    const before = tokens.slice(0, index).filter((part) => part.trim().length > 0).length
    return { token, isSpace, delay: before * stagger }
  })

  return (
    <span ref={ref} className="inline">
      <span aria-hidden="true" className={running ? 'live-cr-run' : undefined}>
        {parts.map((part, index) =>
          part.isSpace ? (
            <span key={index}>{part.token}</span>
          ) : (
            <span
              key={index}
              className="live-cr-token"
              style={{ animationDelay: part.delay + 'ms' }}
            >
              {part.token}
            </span>
          ),
        )}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  )
}

export default function LiveCharReveal() {
  const locale = useLocale()
  const [stagger, setStagger] = useState(45)
  const [runId, setRunId] = useState(0)

  const demoText = pick(
    {
      zh: '把一句话拆成字，再依次落位。',
      en: 'Split a sentence into tokens, then land them in order.',
    },
    locale,
  )
  const demoCount = countTokens(demoText, locale)
  const demoTotal = Math.round((480 + Math.max(0, demoCount - 1) * stagger) / 100) / 10

  return (
    <div className="relative bg-canvas pb-28">
      <style>{CSS_TEXT}</style>

      <section
        aria-label={pick(T.title, locale)}
        className="mx-auto flex min-h-[86svh] w-full max-w-[88rem] flex-col justify-center gap-6 px-5 py-16 sm:px-8"
      >
        <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
        <h2 className="max-w-[18ch] font-display text-display font-semibold leading-[1.04] text-ink">
          {pick(T.title, locale)}
        </h2>
        <p className="max-w-[56ch] text-body text-ink-2">{pick(T.lede, locale)}</p>

        <div className="mt-2 border-y border-line py-10">
          <p className="max-w-[46ch] font-display text-h1 leading-[1.2] text-ink">
            <Reveal text={demoText} locale={locale} stagger={stagger} runId={runId} immediate />
          </p>
          <p className="mt-4 font-mono text-[10px] text-muted">{pick(T.demoCaption, locale)}</p>
        </div>

        <p className="max-w-[58ch] border-l-2 border-accent pl-4 text-caption text-ink-2">
          {pick(T.heroNote, locale)}
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-2">
          <button
            type="button"
            onClick={() => setRunId((id) => id + 1)}
            className="border border-line-strong bg-raised px-3 py-1.5 font-mono text-[11px] text-ink transition-colors hover:border-ink"
          >
            {pick(T.replay, locale)}
          </button>
          <label className="flex items-center gap-3 font-mono text-[11px] text-muted">
            <span>{pick(T.stagger, locale)}</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={stagger}
              aria-label={pick(T.stagger, locale)}
              onChange={(event) => setStagger(Number(event.target.value))}
              className="h-1 w-32 accent-[var(--accent)]"
            />
            <span className="tabular-nums text-ink">{stagger}ms</span>
          </label>
          <span className="font-mono text-[11px] text-muted">
            {pick(T.totalLabel, locale)} ≈ {demoTotal.toFixed(1)}s · {demoCount}
          </span>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[88rem] px-5 py-4 sm:px-8">
        <div className="flex flex-col gap-10 border-t border-line pt-10">
          {T.blocks.map((block) => (
            <p
              key={block.id}
              className="max-w-[62ch] font-display text-h2 leading-[1.35] text-ink"
            >
              <Reveal
                text={pick(block.text, locale)}
                locale={locale}
                stagger={stagger}
                runId={runId}
              />
            </p>
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setRunId((id) => id + 1)}
              className="border border-line-strong bg-raised px-3 py-1.5 font-mono text-[11px] text-ink transition-colors hover:border-ink"
            >
              {pick(T.replay, locale)}
            </button>
            <span className="font-mono text-[10px] text-muted">{pick(T.demoCaption, locale)}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[88rem] px-5 sm:px-8">
        {T.sections.map((section, index) => (
          <section
            key={section.title.zh}
            aria-labelledby={'live-cr-section-' + index}
            className="grid gap-6 border-t border-line py-10 md:grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,15rem)] md:gap-10"
          >
            <div className="flex items-baseline gap-3 md:flex-col md:gap-2">
              <span aria-hidden="true" className="font-display text-h1 leading-none text-line-strong">
                {'0' + (index + 1)}
              </span>
              <span className="label-mono text-muted">T</span>
            </div>
            <div className="flex max-w-[58ch] flex-col gap-3">
              <h2 id={'live-cr-section-' + index} className="font-display text-h2 text-ink">
                {pick(section.title, locale)}
              </h2>
              <p className="text-body text-ink-2">{pick(section.body, locale)}</p>
            </div>
            <pre className="self-start overflow-x-auto border-l-2 border-accent pl-3 font-mono text-[10px] leading-relaxed text-muted">
              {section.figure.join('\n')}
            </pre>
          </section>
        ))}
      </div>

      <section aria-label={pick(T.paramsTitle, locale)} className="mx-auto w-full max-w-[88rem] px-5 py-12 sm:px-8">
        <div className="grid gap-6 border-t border-line pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-h2 text-ink">{pick(T.paramsTitle, locale)}</h2>
            <dl className="flex flex-col">
              {T.params.map((row) => (
                <div
                  key={row.label.zh}
                  className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 border-b border-line py-2.5"
                >
                  <dt className="label-mono">{pick(row.label, locale)}</dt>
                  <dd className="text-caption text-ink">
                    {typeof row.value === 'string' ? row.value : pick(row.value, locale)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <pre className="well self-start overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
            {SNIPPET}
          </pre>
        </div>
      </section>

      <section aria-label={pick(T.codeTitle, locale)} className="mx-auto w-full max-w-[88rem] px-5 pb-8 sm:px-8">
        <div className="flex flex-col gap-3 border-t border-line pt-6">
          <div className="flex items-baseline justify-between gap-3 border-b-2 border-ink pb-3">
            <h2 className="font-display text-h3 text-ink">{pick(T.codeTitle, locale)}</h2>
            <span className="label-mono">{runId}</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
              {JS_SNIPPET}
            </pre>
            <div className="flex flex-col gap-3">
              <p className="max-w-[56ch] text-caption text-ink-2">{pick(T.codeNote, locale)}</p>
              <p className="max-w-[56ch] text-caption text-muted">{pick(T.reducedNote, locale)}</p>
            </div>
          </div>
          <Link
            to={entryPath('char-reveal')}
            className="text-link self-start font-mono text-[11px] text-accent no-underline"
          >
            {pick(T.back, locale)} →
          </Link>
        </div>
      </section>
    </div>
  )
}
