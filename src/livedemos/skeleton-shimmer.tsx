import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * Full-page skeleton shimmer: six cards that start as skeletons, all sharing one
 * sweep animation, and can be swapped for the real content in place.
 *
 * The page is the argument. A shimmer is not decoration — it is a promise that
 * this box is the exact box the content will fill. So the demo ships with a
 * "mismatched skeleton" switch: flip it and watch every card jump when the data
 * arrives. That jump is the thing the entry warns about, and you cannot see it
 * in a single box.
 */

const CSS_TEXT = [
  '@keyframes live-sk-sweep {',
  '  from { transform: translate3d(-100%, 0, 0); }',
  '  to   { transform: translate3d(100%, 0, 0); }',
  '}',
  '',
  '/*',
  ' * The bone colour is currentColor at 9%. Never a hex value: the page',
  ' * has to follow the theme, and the skeleton is not content.',
  ' */',
  '.live-sk-bone {',
  '  display: block;',
  '  position: relative;',
  '  overflow: hidden;',
  '  border-radius: 2px;',
  '  background: color-mix(in srgb, currentColor 9%, transparent);',
  '}',
  '',
  '/* the highlight is a pseudo-element sliding across, not a background-position */',
  '.live-sk-bone::after {',
  '  content: "";',
  '  position: absolute;',
  '  inset: 0;',
  '  background: linear-gradient(',
  '    90deg,',
  '    transparent 0%,',
  '    color-mix(in srgb, var(--raised) 55%, transparent) 50%,',
  '    transparent 100%',
  '  );',
  '  animation: live-sk-sweep 1.6s linear infinite;',
  '}',
  '',
  '@media (prefers-reduced-motion: reduce) {',
  '  .live-sk-bone::after {',
  '    animation: none !important;',
  '    opacity: 0;',
  '  }',
  '}',
].join('\n')

const SNIPPET = [
  '.skeleton {',
  '  position: relative;',
  '  overflow: hidden;',
  '  border-radius: 2px;                /* match the real box */',
  '  background: color-mix(in srgb, currentColor 9%, transparent);',
  '}',
  '',
  '.skeleton::after {',
  '  content: "";',
  '  position: absolute;',
  '  inset: 0;',
  '  background: linear-gradient(90deg,',
  '    transparent 0%,',
  '    color-mix(in srgb, var(--raised) 55%, transparent) 50%,',
  '    transparent 100%);',
  '  animation: sweep 1.6s linear infinite;  /* one duration, shared */',
  '}',
  '',
  '@keyframes sweep {',
  '  from { transform: translate3d(-100%, 0, 0); }',
  '  to   { transform: translate3d(100%, 0, 0); }',
  '}',
  '',
  '@media (prefers-reduced-motion: reduce) {',
  '  .skeleton::after { animation: none !important; opacity: 0; }',
  '}',
].join('\n')

const JS_SNIPPET = [
  '/* the honest part: skeletons only while a request is actually open */',
  'async function loadCards() {',
  '  const started = performance.now()',
  '  const data = await api.cards()          // the only reason to shimmer',
  '  const elapsed = performance.now() - started',
  '',
  '  /* a flash of skeleton under ~150ms looks like a bug, not a load */',
  '  await wait(Math.max(0, 150 - elapsed))',
  '  setCards(data)',
  '}',
  '',
  '/* and a floor for the empty state, not for the shimmer */',
  'const TIMEOUT = 8000   // then: "still loading, retry?" — never shimmer forever',
].join('\n')

const T = {
  eyebrow: { zh: '现场 · 骨架屏微光', en: 'LIVE · SKELETON SHIMMER' },
  title: { zh: '光带扫过还没有内容的盒子', en: 'A band of light across a box with nothing in it' },
  lede: {
    zh: '下面六张卡正在「加载」。光带每 1.6 秒扫过一次，所有卡同步。按下按钮它们会原地换成真实内容——如果骨架量错了，你会看见整页跳一下。',
    en: 'Six cards below are loading. A band of light crosses each one every 1.6s, all in sync. Press the button and they swap for real content in place — if the skeleton was measured wrong, you will see the page jump.',
  },
  heroNote: {
    zh: '为什么必须整页：微光只有在一排盒子、一段等待、一次替换里才说得清。单个盒子里看不出两条骨架是否同步、也看不出换成内容时会不会跳——这两件事恰好是骨架屏最容易做错的地方。',
    en: 'Why the whole page: a shimmer only makes sense as a row of boxes, one wait, one swap. A single box cannot show whether two skeletons are in sync, or whether the swap will jump — and those are exactly the two places skeletons go wrong.',
  },
  loadNow: { zh: '模拟加载完成', en: 'Finish loading' },
  reset: { zh: '回到骨架', en: 'Back to skeleton' },
  mismatch: { zh: '故意错位', en: 'Mismatched skeleton' },
  mismatchOff: { zh: '布局严格一致', en: 'Exact same layout' },
  phaseLoading: { zh: '状态：加载中', en: 'State: loading' },
  phaseReady: { zh: '状态：已就绪', en: 'State: ready' },
  cards: [
    {
      id: 'card-1',
      kind: { zh: '文章', en: 'Article' },
      title: { zh: '滚动的代价', en: 'The cost of scrolling' },
      meta: { zh: '8 分钟阅读', en: '8 min read' },
      body: {
        zh: '滚动里有三样东西会同时变化：位置、速度、方向。只盯着位置的那一类效果，最后都会显得平。',
        en: 'Three things change during scroll at once: position, velocity, direction. Effects that watch only position end up looking flat.',
      },
    },
    {
      id: 'card-2',
      kind: { zh: '笔记', en: 'Note' },
      title: { zh: '过渡应该比你以为的短', en: 'Transitions are shorter than you think' },
      meta: { zh: '更新于今天', en: 'Updated today' },
      body: {
        zh: '200ms 已经足够让一个状态变化显得「顺」，600ms 就开始让人等。先调短，再决定要不要变长。',
        en: '200ms is already enough to make a state change feel smooth, and 600ms starts making people wait. Shorten first, then decide whether to grow it.',
      },
    },
    {
      id: 'card-3',
      kind: { zh: '案例', en: 'Case' },
      title: { zh: '一张图判定的对比', en: 'A comparison judged from one image' },
      meta: { zh: '3 个版本', en: '3 versions' },
      body: {
        zh: '把两个状态并排放在同一张图里，争议会少一半。并排不是为了好看，是为了让差异无法回避。',
        en: 'Putting two states side by side in one image removes half the argument. Side by side is not for looks; it makes the difference impossible to avoid.',
      },
    },
    {
      id: 'card-4',
      kind: { zh: '清单', en: 'List' },
      title: { zh: '提交前要看的四件事', en: 'Four things before you ship' },
      meta: { zh: '5 条', en: '5 items' },
      body: {
        zh: '键盘能走完吗、缩到 375 会横溢吗、关掉动画还能读吗、颜色只剩两种时还认得出来吗。',
        en: 'Can a keyboard finish the flow, does 375px overflow, is it readable with motion off, and is it still understandable in two colours.',
      },
    },
    {
      id: 'card-5',
      kind: { zh: '术语', en: 'Term' },
      title: { zh: '占位符不是骨架', en: 'A placeholder is not a skeleton' },
      meta: { zh: '2 分钟', en: '2 min' },
      body: {
        zh: '一个居中的转圈什么都不承诺；骨架承诺的是「内容到这里、就是这么高」。所以骨架的尺寸必须来自真实内容。',
        en: 'A centered spinner promises nothing. A skeleton promises this content, at this height. That is why its measurements must come from the real content.',
      },
    },
    {
      id: 'card-6',
      kind: { zh: '工具', en: 'Tool' },
      title: { zh: '用同一条动画', en: 'Share one animation' },
      meta: { zh: 'CSS', en: 'CSS' },
      body: {
        zh: '六条骨架各写一个 animation-duration，只要有一个不一样，整排就会互相错相，看起来像在抖。',
        en: 'Give six skeletons their own animation-duration and one mismatch makes the row drift out of phase, which reads as jitter.',
      },
    },
  ] as const,
  sections: [
    {
      title: { zh: '光带走的是 transform，不是背景位置', en: 'The band moves by transform, not by background-position' },
      figure: ['translate3d(-100%)', 'inset: 0 overlay', 'compositor only'],
      body: {
        zh: '常见写法是把渐变背景的 background-position 从 -100% 推到 100%，但那会让浏览器每帧重新计算整块背景并重绘。换成一层伪元素覆盖、只改 transform，动画就落在合成层上，主线程不参与，六张卡一起扫也不会掉帧。',
        en: 'The common version pushes background-position from -100% to 100%, which makes the browser recompute and repaint the whole background every frame. Use an absolutely positioned pseudo-element and animate only transform: the work stays on the compositor, the main thread is untouched, and six cards sweeping at once still hold their frame rate.',
      },
    },
    {
      title: { zh: '骨架的形状就是承诺', en: 'The shape of the skeleton is the promise' },
      figure: ['measure the real card', 'same height, same radius', 'CLS = 0'],
      body: {
        zh: '骨架的价值全在「尺寸等于真实内容」。标题两行就画两行，图片 16:9 就画 16:9，圆角 2px 就用 2px。差一点点，内容到位时盒子会撑开或收缩，整页跟着跳，读者的视线在那一瞬间丢失位置。打开上面的「故意错位」，再点一次加载，差别立刻可见。',
        en: 'A skeleton is worth exactly as much as its measurements match. Two title lines for two lines, 16:9 for 16:9, 2px radius for 2px. Get it slightly wrong and the box expands or collapses when content lands, the page shifts, and the reader loses their place mid-scan. Turn on Mismatched skeleton above, load again, and the difference is immediate.',
      },
    },
    {
      title: { zh: '什么时候该收手', en: 'When to stop shimmering' },
      figure: ['<150ms: skip', '>8s: say something', 'error: say it'],
      body: {
        zh: '数据 150ms 内就到，别闪一下骨架——那看起来像页面抽了一下。真的慢到五秒以上，微光就不再是信息而是噪音：换成一句「还在加载」加一个重试入口。请求失败也必须离开骨架状态，否则读者会一直等一个永远不会来的东西。',
        en: 'If data arrives within 150ms, skip the skeleton — a single flash reads as a glitch. Past five seconds the shimmer stops being information and becomes noise: replace it with a line saying it is still loading plus a retry. A failed request must also leave the skeleton state, or the reader waits forever for something that is not coming.',
      },
    },
    {
      title: { zh: '同步与降级', en: 'Sync and the reduced-motion fallback' },
      figure: ['one duration', 'one delay: 0', 'reduce: static bones'],
      body: {
        zh: '整排骨架共用同一条 animation 和同一个开始的时刻，相位才会一致；任何一条单独设置了 delay 或 duration，整排就开始错相。系统要求减少动态时，扫光直接关掉，只留静态的灰块——骨架本身传达「这里会有内容」，不需要动起来才能做到。',
        en: 'A row of skeletons shares one animation and one start moment, so the phases line up; give any single bone its own delay or duration and the row drifts apart. When the system asks for reduced motion, turn the sweep off and keep the static grey bones — the skeleton already says content will be here, and it does not need motion to say it.',
      },
    },
  ],
  paramsTitle: { zh: '推荐取值', en: 'Recommended values' },
  params: [
    { label: { zh: '单次扫过', en: 'Sweep duration' }, value: '1.2–1.8s' },
    { label: { zh: '高光带宽', en: 'Highlight width' }, value: { zh: '容器的 20%–40%', en: '20%–40% of the box' } },
    { label: { zh: '骨架底色', en: 'Bone colour' }, value: 'currentColor 8%–12%' },
    { label: { zh: '高光强度', en: 'Highlight' }, value: '40%–55%' },
    { label: { zh: '圆角', en: 'Radius' }, value: { zh: '与真实内容一致', en: 'match the real content' } },
    { label: { zh: '最短显示', en: 'Minimum display' }, value: '150ms' },
    { label: { zh: '最长等待', en: 'Maximum wait' }, value: { zh: '5–8s 后给兜底文案', en: '5–8s, then a fallback line' } },
    { label: { zh: '降级', en: 'Fallback' }, value: { zh: '关掉扫光，保留静态骨架', en: 'Stop the sweep, keep static bones' } },
  ],
  codeTitle: { zh: '这一页实际在用的', en: 'What this page actually runs' },
  codeNote: {
    zh: 'CSS 只描述一条扫光；骨架和内容的盒子由同一套尺寸决定，替换时高度不变。',
    en: 'The CSS describes one sweep. Skeleton and content share the same box measurements, so the swap does not change any height.',
  },
  reducedNote: {
    zh: '如果系统开了减少动态，光带是静止的：卡片仍然显示为骨架，只是不扫。',
    en: 'If reduced motion is on, the band is static: cards still show as skeletons, they just do not sweep.',
  },
  back: { zh: '回到词条：骨架屏微光', en: 'Back to the entry: Skeleton Shimmer' },
} as const

type CardData = (typeof T.cards)[number]

function SkeletonCard({ mismatch }: { mismatch: boolean }) {
  const titleH = mismatch ? 'h-3 w-3/5' : 'h-4 w-3/5'
  return (
    <div className="flex flex-col gap-4 border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <span className={'live-sk-bone ' + (mismatch ? 'h-6 w-6' : 'h-8 w-8')} />
        <span className={'live-sk-bone ' + (mismatch ? 'h-2 w-16' : 'h-2.5 w-20')} />
      </div>
      <span className={'live-sk-bone ' + titleH} />
      <span className="live-sk-bone h-2.5 w-full" />
      <span className={'live-sk-bone ' + (mismatch ? 'h-2.5 w-2/3' : 'h-2.5 w-4/5')} />
      <span className={'live-sk-bone ' + (mismatch ? 'mt-1 h-10 w-full' : 'mt-2 h-16 w-full')} />
      <span className="live-sk-bone h-2 w-1/4" />
    </div>
  )
}

function RealCard({ card, locale }: { card: CardData; locale: 'zh' | 'en' }) {
  return (
    <div className="flex flex-col gap-3 border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="label-mono text-accent">{pick(card.kind, locale)}</span>
        <span className="font-mono text-[10px] text-muted">{pick(card.meta, locale)}</span>
      </div>
      <h3 className="font-display text-h3 leading-snug text-ink">{pick(card.title, locale)}</h3>
      <p className="text-caption text-ink-2">{pick(card.body, locale)}</p>
      <div className="mt-auto flex items-center gap-2 border-t border-line pt-3">
        <span className="h-6 w-6 border border-line-strong" aria-hidden="true" />
        <span className="font-mono text-[10px] text-muted">{pick(card.meta, locale)}</span>
      </div>
    </div>
  )
}

export default function LiveSkeletonShimmer() {
  const locale = useLocale()
  const [ready, setReady] = useState(false)
  const [mismatch, setMismatch] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    }
  }, [])

  function load() {
    if (timer.current !== null) window.clearTimeout(timer.current)
    setReady(false)
    timer.current = window.setTimeout(() => {
      timer.current = null
      setReady(true)
    }, 1400)
  }

  return (
    <div className="relative bg-canvas pb-28">
      <style>{CSS_TEXT}</style>

      <section
        aria-label={pick(T.title, locale)}
        className="mx-auto flex min-h-[86svh] w-full max-w-[88rem] flex-col justify-center gap-6 px-5 py-16 sm:px-8"
      >
        <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
        <h2 className="max-w-[20ch] font-display text-display font-semibold leading-[1.04] text-ink">
          {pick(T.title, locale)}
        </h2>
        <p className="max-w-[56ch] text-body text-ink-2">{pick(T.lede, locale)}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-line py-4">
          <button
            type="button"
            onClick={load}
            className="border border-line-strong bg-raised px-3 py-1.5 font-mono text-[11px] text-ink transition-colors hover:border-ink"
          >
            {pick(ready ? T.reset : T.loadNow, locale)}
          </button>
          <button
            type="button"
            aria-pressed={mismatch}
            onClick={() => setMismatch((value) => !value)}
            className={
              'border px-3 py-1.5 font-mono text-[11px] transition-colors ' +
              (mismatch
                ? 'border-accent bg-accent-soft text-ink'
                : 'border-line-strong bg-raised text-ink hover:border-ink')
            }
          >
            {pick(mismatch ? T.mismatch : T.mismatchOff, locale)}
          </button>
          <span className="font-mono text-[10px] text-muted">
            {pick(ready ? T.phaseReady : T.phaseLoading, locale)}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {T.cards.map((card) =>
            ready ? (
              <RealCard key={card.id} card={card} locale={locale} />
            ) : (
              <SkeletonCard key={card.id} mismatch={mismatch} />
            ),
          )}
        </div>

        <p className="max-w-[58ch] border-l-2 border-accent pl-4 text-caption text-ink-2">
          {pick(T.heroNote, locale)}
        </p>
      </section>

      <div className="mx-auto w-full max-w-[88rem] px-5 sm:px-8">
        {T.sections.map((section, index) => (
          <section
            key={section.title.zh}
            aria-labelledby={'live-sk-section-' + index}
            className="grid gap-6 border-t border-line py-10 md:grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,15rem)] md:gap-10"
          >
            <div className="flex items-baseline gap-3 md:flex-col md:gap-2">
              <span aria-hidden="true" className="font-display text-h1 leading-none text-line-strong">
                {'0' + (index + 1)}
              </span>
              <span className="label-mono text-muted">F</span>
            </div>
            <div className="flex max-w-[58ch] flex-col gap-3">
              <h2 id={'live-sk-section-' + index} className="font-display text-h2 text-ink">
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
                  className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 border-b border-line py-2.5"
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
            <span className="label-mono">F-04</span>
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
            to={entryPath('skeleton-shimmer')}
            className="text-link self-start font-mono text-[11px] text-accent no-underline"
          >
            {pick(T.back, locale)} →
          </Link>
        </div>
      </section>
    </div>
  )
}
