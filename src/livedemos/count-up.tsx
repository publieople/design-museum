import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * Full-page count-up: every statistic on this page rolls when it first enters
 * the viewport, and then stays put. The page itself is the dashboard.
 *
 * Server output carries the final value so the page is readable without JS.
 * After mount the value is reset to zero and a requestAnimationFrame loop writes
 * textContent directly — no setState per frame, so React never re-renders sixty
 * times a second. Reduced motion skips the loop and keeps the final value.
 */

const nf = new Intl.NumberFormat('en-US')

function format(value: number): string {
  return nf.format(Math.round(value))
}

const EASE_NOTE = 'easeOutExpo: 1 - 2^(-10t)'

const CSS_TEXT = [
  '.live-cu-value {',
  '  font-variant-numeric: tabular-nums;',
  '  font-feature-settings: "tnum" 1;',
  '  /* reserve the width of the largest value to stop layout shift */',
  '  display: inline-block;',
  '  min-width: 6ch;',
  '  text-align: right;',
  '}',
  '',
  '@media (prefers-reduced-motion: reduce) {',
  '  .live-cu-value { transition: none; }',
  '}',
].join('\n')

const SNIPPET = [
  'function countUp(el, target, duration) {',
  '  const start = performance.now()',
  '',
  '  function frame(now) {',
  '    const t = Math.min(1, (now - start) / duration)',
  '    const eased = 1 - Math.pow(2, -10 * t)',
  '    el.textContent = Math.round(target * eased).toLocaleString()',
  '    if (t < 1) requestAnimationFrame(frame)',
  '  }',
  '',
  '  el.textContent = "0"',
  '  requestAnimationFrame(frame)',
  '}',
  '',
  '/* fire once, when the number is 30% visible */',
  'const io = new IntersectionObserver((entries) => {',
  '  if (!entries.some((e) => e.isIntersecting)) return',
  '  io.disconnect()',
  '  countUp(el, target, 1200)',
  '}, { threshold: 0.3 })',
  '',
  'io.observe(el)',
].join('\n')

const T = {
  eyebrow: { zh: '现场 · 数字滚动', en: 'LIVE · COUNT UP' },
  title: { zh: '数字往上走，然后停住', en: 'The number climbs, then holds' },
  lede: {
    zh: '这一页是一块仪表盘。四组数字都在进入视口时从 0 滚到目标值，滚完就停在终值上——不再动。往下滚，看它们各自开始。',
    en: 'This page is a dashboard. Four statistics roll from 0 to their target when they enter the viewport, then hold at the final value and never move again. Scroll down and watch each one start.',
  },
  heroNote: {
    zh: '为什么必须整页：数字滚动是「进入视口才开始」的效果。放在演示框里，你只能看到它跑一遍；放在整页里，你才能检查它有没有在错误的时机触发、位数变化时有没有把旁边的文字挤开。',
    en: 'Why the whole page: a count-up is meant to start when it enters the viewport. Inside a demo box you only see it play once; across a whole page you can check that it fires at the right moment and that a digit-count change does not shove the neighbouring text.',
  },
  replay: { zh: '重播全部', en: 'Replay all' },
  duration: { zh: '时长', en: 'Duration' },
  heroStat: {
    value: 12800,
    suffix: { zh: '人', en: 'users' },
    label: { zh: '本月新增访问', en: 'New visitors this month' },
    note: {
      zh: '4 位变 5 位的那一下最容易抖：先用 tabular-nums 与预留宽度把它压住。',
      en: 'The jump from four digits to five is where layout shakes: tabular-nums plus reserved width pins it down.',
    },
  },
  stats: [
    {
      value: 96,
      suffix: { zh: '%', en: '%' },
      label: { zh: '首屏渲染命中率', en: 'First-render hit rate' },
      note: { zh: '示例数据', en: 'Sample data' },
    },
    {
      value: 248,
      suffix: { zh: 'ms', en: 'ms' },
      label: { zh: '平均交互延迟', en: 'Average interaction latency' },
      note: { zh: '示例数据', en: 'Sample data' },
    },
    {
      value: 42,
      suffix: { zh: '件', en: 'items' },
      label: { zh: '页面里同时在动的数字', en: 'Numbers moving at once' },
      note: { zh: '示例数据', en: 'Sample data' },
    },
  ],
  sections: [
    {
      title: { zh: '位数会变，宽度不能变', en: 'Digits change, width must not' },
      figure: ['9 → 10', '99 → 100', 'tabular-nums + min-width'],
      body: {
        zh: '从 9 变 10、从 99 变 100，字数一变，等宽的比例字就会把右边的单位挤开。两个修法一起用：font-variant-numeric: tabular-nums 让每位数字等宽，容器再预留最大位数的宽度。这样滚动过程中整行不跳，读者也不会觉得数字在抖。',
        en: 'Going from 9 to 10 or 99 to 100 changes the character count, and proportional digits then shove the unit to the right. Use both fixes together: font-variant-numeric: tabular-nums keeps every digit the same width, and the container reserves the width of the largest value. The line stays still while the number runs.',
      },
    },
    {
      title: { zh: 'rAF 用的是时间戳', en: 'rAF gives you a timestamp' },
      figure: ['now - start', '→ t', '→ eased'],
      body: {
        zh: 'requestAnimationFrame 的回调会拿到一个高精度时间戳。用它减去开始时间得到进度 t，再交给缓动函数——掉帧时数字会直接跳到正确位置。反过来，用 setInterval 每帧加一个固定值，一旦掉帧就会越走越慢，最后停在目标值之外。',
        en: 'The requestAnimationFrame callback receives a high-resolution timestamp. Subtract the start time to get progress t, then hand it to the easing curve — when frames drop, the number simply skips to the right place. Adding a fixed step per tick in setInterval instead falls behind on dropped frames and can end short of the target.',
      },
    },
    {
      title: { zh: '触发一次就够', en: 'Trigger once, then stop' },
      figure: ['threshold 0.3', 'io.disconnect()', 'no replay on scroll'],
      body: {
        zh: '用 IntersectionObserver 观察数字本身，threshold 取 0.3：至少露出三成才开始，避免刚冒头就滚完。触发后立刻 disconnect，回到视口不再重播——每次滚过都重放一遍，会让读者以为页面在反复加载。想重播就交给用户按按钮，比如上面的「重播全部」。',
        en: 'Observe the number itself with IntersectionObserver and a threshold of 0.3: start once at least a third is visible, so it does not finish before it appears. Disconnect immediately after firing so scrolling back never replays it — replaying on every pass makes the page feel like it keeps reloading. Let a button own the replay instead, like Replay all above.',
      },
    },
    {
      title: { zh: '什么时候别用', en: 'When not to use it' },
      figure: ['real-time? no', 'tables? no', 'decor? no'],
      body: {
        zh: '实时变动的数字不要用滚动：它每隔几秒就变，动画永远播不完整，看起来像卡住。表格里的数字也别用——读者要横向比较，动起来只会妨碍。还有一类是用它给毫不重要的数字加戏：滚动本身会让数字显得比实际更重要，数值撑不起这个注意力时，静态显示更好。',
        en: 'Do not count real-time numbers: they change every few seconds, so the animation never finishes and looks stuck. Do not count numbers in tables either — readers compare across columns and motion only gets in the way. Nor use it to dramatise a number that does not matter: the motion makes it look more important than it is, and a static value is better when the number cannot carry that attention.',
      },
    },
  ],
  paramsTitle: { zh: '推荐取值', en: 'Recommended values' },
  params: [
    { label: { zh: '时长', en: 'Duration' }, value: '800–1500ms' },
    { label: { zh: '缓动', en: 'Easing' }, value: EASE_NOTE },
    { label: { zh: '排版', en: 'Typesetting' }, value: 'font-variant-numeric: tabular-nums' },
    { label: { zh: '触发', en: 'Trigger' }, value: 'IntersectionObserver · threshold 0.3' },
    { label: { zh: '重播', en: 'Replay' }, value: { zh: '只播一次，重播交给按钮', en: 'Play once; a button owns replay' } },
    { label: { zh: '降级', en: 'Fallback' }, value: { zh: '直接渲染终值', en: 'Render the final value outright' } },
  ],
  codeTitle: { zh: '这一页实际在用的', en: 'What this page actually runs' },
  codeNote: {
    zh: '循环里只写 textContent，没有 setState：六十帧里 React 一次都不重渲染。帧句柄和 observer 都在 cleanup 里收掉，卸载后不会再有回调。',
    en: 'The loop only writes textContent, never setState: React does not re-render once across sixty frames. Both the frame handle and the observer are released in cleanup, so nothing fires after unmount.',
  },
  reducedNote: {
    zh: '如果系统开了减少动态，数字不滚：四条统计一进来就是终值，读起来和静态仪表盘一样。',
    en: 'If reduced motion is on, the numbers do not roll: all four statistics appear at their final value, reading exactly like a static dashboard.',
  },
  back: { zh: '回到词条：数字滚动', en: 'Back to the entry: Count Up' },
} as const

function Stat({
  value,
  prefix,
  suffix,
  label,
  note,
  duration,
  runId,
  big,
}: {
  value: number
  prefix?: string
  suffix: string
  label: string
  note: string
  duration: number
  runId: number
  big?: boolean
}) {
  const ref = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const final = format(value)
    el.textContent = final

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    // Reduced motion keeps the final value: no frame loop at all.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let done = false
    let observer: IntersectionObserver | null = null

    const run = () => {
      if (done) return
      done = true
      const start = performance.now()
      el.textContent = format(0)
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
        el.textContent = format(value * eased)
        if (t < 1) {
          frame = requestAnimationFrame(tick)
        } else {
          el.textContent = final
        }
      }
      frame = requestAnimationFrame(tick)
    }

    if (typeof IntersectionObserver === 'undefined') {
      run()
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return
          observer?.disconnect()
          observer = null
          run()
        },
        { threshold: 0.3 },
      )
      observer.observe(el)
    }

    return () => {
      done = true
      observer?.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [value, duration, runId])

  return (
    <div className="flex flex-col gap-2">
      <p className="label-mono text-muted">{label}</p>
      <p
        className={
          big
            ? 'flex items-baseline gap-2 font-display text-display font-semibold leading-none text-ink'
            : 'flex items-baseline gap-2 font-display text-h1 leading-none text-ink'
        }
      >
        {prefix ? <span className="text-h3 text-muted">{prefix}</span> : null}
        <span ref={ref} className="live-cu-value">
          {format(value)}
        </span>
        <span className={big ? 'text-h3 text-ink-2' : 'text-caption text-ink-2'}>{suffix}</span>
      </p>
      <p className="font-mono text-[10px] text-muted">{note}</p>
      <span aria-hidden="true" className="sr-only">
        {label}
      </span>
    </div>
  )
}

export default function LiveCountUp() {
  const locale = useLocale()
  const [runId, setRunId] = useState(0)
  const [duration, setDuration] = useState(1200)

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
        <p className="max-w-[58ch] border-l-2 border-accent pl-4 text-caption text-ink-2">
          {pick(T.heroNote, locale)}
        </p>

        <div className="mt-4 border-y border-line py-8">
          <Stat
            value={T.heroStat.value}
            suffix={pick(T.heroStat.suffix, locale)}
            label={pick(T.heroStat.label, locale)}
            note={pick(T.heroStat.note, locale)}
            duration={duration}
            runId={runId}
            big
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            onClick={() => setRunId((id) => id + 1)}
            className="border border-line-strong bg-raised px-3 py-1.5 font-mono text-[11px] text-ink transition-colors hover:border-ink"
          >
            {pick(T.replay, locale)}
          </button>
          <label className="flex items-center gap-3 font-mono text-[11px] text-muted">
            <span>{pick(T.duration, locale)}</span>
            <input
              type="range"
              min={400}
              max={2400}
              step={100}
              value={duration}
              aria-label={pick(T.duration, locale)}
              onChange={(event) => setDuration(Number(event.target.value))}
              className="h-1 w-32 accent-[var(--accent)]"
            />
            <span className="tabular-nums text-ink">{duration}ms</span>
          </label>
        </div>
      </section>

      <section
        aria-label={pick(T.stats[0].label, locale)}
        className="mx-auto w-full max-w-[88rem] px-5 sm:px-8"
      >
        <div className="grid gap-8 border-t border-line py-12 sm:grid-cols-3">
          {T.stats.map((stat) => (
            <Stat
              key={stat.value}
              value={stat.value}
              suffix={pick(stat.suffix, locale)}
              label={pick(stat.label, locale)}
              note={pick(stat.note, locale)}
              duration={duration}
              runId={runId}
            />
          ))}
        </div>
      </section>

      <div className="mx-auto w-full max-w-[88rem] px-5 sm:px-8">
        {T.sections.map((section, index) => (
          <section
            key={section.title.zh}
            aria-labelledby={'live-cu-section-' + index}
            className="grid gap-6 border-t border-line py-10 md:grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,15rem)] md:gap-10"
          >
            <div className="flex items-baseline gap-3 md:flex-col md:gap-2">
              <span aria-hidden="true" className="font-display text-h1 leading-none text-line-strong">
                {'0' + (index + 1)}
              </span>
              <span className="label-mono text-muted">T</span>
            </div>
            <div className="flex max-w-[58ch] flex-col gap-3">
              <h2 id={'live-cu-section-' + index} className="font-display text-h2 text-ink">
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
            <span className="label-mono">rAF + IO</span>
          </div>
          <p className="max-w-[64ch] text-caption text-ink-2">{pick(T.codeNote, locale)}</p>
          <p className="max-w-[64ch] text-caption text-muted">{pick(T.reducedNote, locale)}</p>
          <Link
            to={entryPath('count-up')}
            className="text-link self-start font-mono text-[11px] text-accent no-underline"
          >
            {pick(T.back, locale)} →
          </Link>
        </div>
      </section>
    </div>
  )
}
