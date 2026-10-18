import { useState } from 'react'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { usePrefersReducedMotion } from '../lib/motion'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * 整页版「滚动揭示」：页面本身就是演示。
 *
 * 首屏完全不参与动画——没有 opacity: 0 的等待；从第 01 节开始，每一块档案
 * （section 头 + 标本卡）挂 .live-sr-plate，用 view() 时间线在进入视口时
 * 上浮淡入。对照区两栏内容相同，差别只在「哪些行动了」。不支持 view() 的
 * 浏览器、以及 reduced-motion，全部停在终态，内容静态可读。
 */

const CSS_TEXT = [
  '@keyframes live-sr-rise {',
  '  from { opacity: 0; transform: translate3d(0, 26px, 0); }',
  '  to { opacity: 1; transform: translate3d(0, 0, 0); }',
  '}',
  '@supports (animation-timeline: view()) {',
  '  .live-sr-plate {',
  '    animation: live-sr-rise linear both;',
  '    animation-timeline: view();',
  '    animation-range: entry 0% cover 30%;',
  '  }',
  '}',
  '@media (prefers-reduced-motion: reduce) {',
  '  .live-sr-plate { animation: none !important; }',
  '}',
].join('\n')

const SNIPPET = [
  '/* reveal once, on entry */',
  '.live-sr-plate {',
  '  animation: live-sr-rise linear both;',
  '  animation-timeline: view();',
  '  animation-range: entry 0% cover 30%;',
  '}',
  '',
  '@keyframes live-sr-rise {',
  '  from { opacity: 0; transform: translate3d(0, 26px, 0); }',
  '  to   { opacity: 1; transform: translate3d(0, 0, 0); }',
  '}',
  '',
  '/* reduced motion: the content is already in place */',
  '@media (prefers-reduced-motion: reduce) {',
  '  .live-sr-plate { animation: none; }',
  '}',
].join('\n')

const T = {
  eyebrow: { zh: '现场 · 滚动揭示', en: 'LIVE · SCROLL REVEAL' },
  title: { zh: '滚动揭示', en: 'Scroll reveal' },
  lede: {
    zh: '内容进入视口时上浮、淡入，一次，然后停住。这一页没有演示框：往下滚，每一块档案自己到位。首屏除外——首屏的内容一进页面就在，不等任何滚动。',
    en: 'Content rises and fades in as it enters the viewport. Once, then it stops. There is no demo box here: scroll down and each archive plate settles into place. The first screen is the exception: it is readable the moment the page loads, with no scroll required.',
  },
  heroNote: {
    zh: '注意第一屏没有任何动画，也没有 opacity: 0 的等待。页面最贵的位置，不该藏起来等滚动。',
    en: 'Notice that the first screen has no animation and no waiting behind opacity: 0. The most expensive position on a page should not hide until you scroll.',
  },
  hint: { zh: '向下滚动', en: 'Scroll' },
  statusNative: {
    zh: '原生 view() 时间线：动画进度由滚动位置驱动，没有监听器，也没有 rAF。',
    en: 'Native view() timeline: progress is driven by scroll position, with no listeners and no rAF.',
  },
  statusFallback: {
    zh: '静态兜底：此浏览器不支持滚动驱动动画，内容全部停在终态。',
    en: 'Static fallback: this browser does not support scroll-driven animations, so everything sits in its final state.',
  },
  statusReduced: {
    zh: '已按系统设置减少动态：所有上浮与淡入关闭，内容直接到位。',
    en: 'Reduced motion is on: every rise and fade is off, and content is already in place.',
  },
  whatEyebrow: { zh: '01 · 它是什么', en: '01 · What it is' },
  whatTitle: { zh: '一块一块，到位就停', en: 'One at a time, then it stops' },
  whatBody: {
    zh: '滚动揭示是最老、也最容易被滥用的滚动效果：元素从下方 12–32px 处浮起，透明度从 0 到 1，播放一次，之后不再参与滚动。展台版用 IntersectionObserver 触发一次；这一页用 CSS 的 view() 时间线，连「触发」都省了——动画进度直接绑在元素露出视口的比例上。',
    en: 'Scroll reveal is the oldest — and most easily overused — scroll effect: an element rises from 12–32px below and fades from transparent, plays once, then stops taking part in the scroll. The stage version fires once through IntersectionObserver; this page uses the CSS view() timeline and skips the trigger entirely: progress is tied directly to how much of the element is visible.',
  },
  specimens: [
    {
      kicker: { zh: '触发', en: 'Trigger' },
      code: 'S-01',
      title: { zh: '露出 15%–25% 时开始', en: 'Start at 15%–25% visible' },
      body: {
        zh: '元素进入视口约四分之一时开始，播放途中不再重新判断。触发一次之后立刻取消观察。',
        en: 'Start when roughly a quarter of the element is visible, and do not re-evaluate while it plays. Stop observing right after the trigger.',
      },
    },
    {
      kicker: { zh: '动作', en: 'Motion' },
      code: 'S-02',
      title: { zh: '上移 12–32px', en: 'Rise 12–32px' },
      body: {
        zh: '只改 transform 与 opacity，不改 top 或 margin。位移再大就像东西从下面掉出来，眼睛会去追它。',
        en: 'Only transform and opacity change, never top or margin. Any more travel and it looks like the block drops in from below, and the eye follows it.',
      },
    },
    {
      kicker: { zh: '时间', en: 'Timing' },
      code: 'S-03',
      title: { zh: '400–700ms，先快后慢', en: '400–700ms, fast then soft' },
      body: {
        zh: '配 cubic-bezier(0.22, 1, 0.36, 1)。短于 300ms 像闪一下，长于 900ms 读者会站在那里等它。',
        en: 'Pair it with cubic-bezier(0.22, 1, 0.36, 1). Under 300ms reads as a flicker; over 900ms and readers stand there waiting for it.',
      },
    },
    {
      kicker: { zh: '次数', en: 'Repetition' },
      code: 'S-04',
      title: { zh: '只播一次', en: 'Once only' },
      body: {
        zh: '往回滚不重播。重复播放会让读者开始测试动画，而不是读内容。',
        en: 'Do not replay on scroll back. Replaying makes readers test the animation instead of reading.',
      },
    },
  ],
  contrastEyebrow: { zh: '02 · 对照', en: '02 · Comparison' },
  contrastTitle: {
    zh: '同一段内容：每块都动 vs 只动关键节点',
    en: 'Same content: everything moves vs key nodes only',
  },
  contrastBody: {
    zh: '两栏是同一份六行内容、同样一屏高度。左边每一行都浮起；右边只有两个结构节点（章节标题）浮起。区别不是速度，是「谁值得动」。',
    en: 'Both columns hold the same six rows at the same screen height. On the left every row reveals; on the right only two structural nodes (section titles) do. The difference is not speed, it is which rows deserve motion.',
  },
  panelA: { zh: 'A · 每块都动', en: 'A · Everything moves' },
  panelB: { zh: 'B · 只动关键节点', en: 'B · Key nodes only' },
  countA: { zh: '6 / 6 浮起', en: '6 / 6 reveal' },
  countB: { zh: '2 / 6 浮起', en: '2 / 6 reveal' },
  captionA: {
    zh: '读者一路都在等下一块出现，视线被动画牵着走。连首屏标题也在等滚动——最贵的位置先给了空白。',
    en: 'Readers spend the whole page waiting for the next block, their eye pulled by the motion. Even the hero title waits for scroll: the most expensive position is given away to emptiness.',
  },
  captionB: {
    zh: '只有两个章节标题动，其余内容到位即可。节奏落在结构上，眼睛停在内容上。',
    en: 'Only two section titles move; everything else is simply there. The rhythm lands on structure, and the eye stays on the content.',
  },
  legend: { zh: '↑ 浮起　— 不动', en: '↑ reveals   — static' },
  takeaway: {
    zh: '一屏超过两个节奏点，读者就开始数动画，不再读字。',
    en: 'More than two beats per screen and readers start counting animations instead of reading.',
  },
  specEyebrow: { zh: '03 · 取值', en: '03 · Values' },
  specTitle: { zh: '照抄这一组就够', en: 'A set you can copy' },
  specs: [
    {
      label: { zh: '位移', en: 'Distance' },
      value: '12–32px',
      note: {
        zh: '本页用 26px。再大就像东西从下面掉进来。',
        en: '26px here. Any more and the block looks like it drops in from below.',
      },
    },
    {
      label: { zh: '时长', en: 'Duration' },
      value: '400–700ms',
      note: {
        zh: '本页 550ms。越短越像故障，越长越像卡住。',
        en: '550ms here. Shorter reads as a glitch, longer as a stall.',
      },
    },
    {
      label: { zh: '缓动', en: 'Easing' },
      value: 'cubic-bezier(0.22, 1, 0.36, 1)',
      note: {
        zh: '先快后慢，收尾不砸下来。',
        en: 'Fast start, soft landing.',
      },
    },
    {
      label: { zh: '触发区间', en: 'Trigger range' },
      value: '15%–25%',
      note: {
        zh: '本页是 view() entry 0% → cover 30%，比固定阈值更平滑。',
        en: 'This page uses view() entry 0% to cover 30%, smoother than a fixed threshold.',
      },
    },
    {
      label: { zh: '次数', en: 'Repetition' },
      value: { zh: '一次', en: 'Once' },
      note: {
        zh: '触发后取消观察，或让动画停在终态。',
        en: 'Unobserve after the trigger, or let the animation end in its final state.',
      },
    },
  ],
  avoidEyebrow: { zh: '04 · 什么时候别用', en: '04 · When not to use it' },
  avoidTitle: { zh: '出现一种，就关掉', en: 'If one of these appears, turn it off' },
  avoid: [
    {
      code: 'A-01',
      title: { zh: '每一段都浮', en: 'Every section floats' },
      body: {
        zh: '读者会开始等下一块出现，注意力从内容挪到动画上。一屏两个节奏点已经算多，再多就是噪音。',
        en: 'Readers start waiting for the next block, and attention moves from content to motion. Two beats per screen is already a lot; more is noise.',
      },
    },
    {
      code: 'A-02',
      title: { zh: '首屏内容靠滚动才出现', en: 'First screen hidden until scroll' },
      body: {
        zh: '首屏是最贵的位置。设成透明等滚动，第一次访问的人先看见空白，慢网时更糟。',
        en: 'The first screen is the most expensive position. Hiding it behind opacity until scroll shows newcomers a blank screen first, and worse on a slow connection.',
      },
    },
    {
      code: 'A-03',
      title: { zh: '减少动态的人还得等动画', en: 'Reduced motion still waits' },
      body: {
        zh: 'prefers-reduced-motion: reduce 下不要位移、不要淡入，直接渲染终态。动画是增强，不是内容。',
        en: 'Under prefers-reduced-motion: reduce, drop the travel and the fade and render the final state. Motion is an enhancement, not the content.',
      },
    },
  ],
  avoidNote: {
    zh: '还有一条底线：opacity: 0 只能写在确定会生效的动画里。动画不生效时，内容必须已经能读——否则整页等于不存在。',
    en: 'One more floor: only write opacity: 0 inside an animation that is guaranteed to run. When it does not run, the content must already be readable — otherwise the page might as well not exist.',
  },
  codeEyebrow: { zh: '05 · 这一页在用的代码', en: '05 · The code this page runs' },
  codeTitle: { zh: '触发交给滚动位置', en: 'Let scroll position do the triggering' },
  codeNote: {
    zh: '没有 IntersectionObserver，也没有 scroll 监听：支持 view() 的浏览器把滚动位置直接当时间轴，不支持时停在终态。首屏 hero 不加 .live-sr-plate，所以它连起始的 0 透明度都没有。',
    en: 'No IntersectionObserver and no scroll listener: browsers with view() use scroll position as the timeline, and everyone else stays in the final state. The hero is not given .live-sr-plate, so it never even has a starting opacity of 0.',
  },
  back: { zh: '回到词条：滚动揭示', en: 'Back to the entry: Scroll reveal' },
} as const

const ROWS = [
  { zh: '首屏标题', en: 'Hero title', key: false },
  { zh: '正文', en: 'Body copy', key: false },
  { zh: '配图', en: 'Figure', key: false },
  { zh: '章节标题', en: 'Section title', key: true },
  { zh: '正文', en: 'Body copy', key: false },
  { zh: '章节标题', en: 'Section title', key: true },
] as const

function ContrastPanel({
  label,
  code,
  count,
  caption,
  rows,
}: {
  label: string
  code: string
  count: string
  caption: string
  rows: { text: string; moves: boolean }[]
}) {
  return (
    <figure className="plate flex flex-col gap-4 p-4 sm:p-5">
      <figcaption className="flex items-center justify-between gap-2">
        <span className="label-mono text-ink-2">{label}</span>
        <span className="stamp">{code}</span>
      </figcaption>
      <p className="font-mono text-[11px] text-accent">{count}</p>
      <ul className="flex flex-col">
        {rows.map((row, index) => (
          <li
            key={row.text + index}
            className="flex items-center gap-3 border-b border-line py-2 last:border-b-0"
          >
            <span className="font-mono text-[10px] text-muted">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className={row.moves ? 'text-caption text-ink' : 'text-caption text-muted'}>
              {row.text}
            </span>
            <span
              aria-hidden="true"
              className={
                row.moves
                  ? 'ml-auto font-mono text-[11px] text-accent'
                  : 'ml-auto font-mono text-[11px] text-muted'
              }
            >
              {row.moves ? '↑' : '—'}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-caption text-muted">{caption}</p>
    </figure>
  )
}

export default function ScrollRevealLive() {
  const locale = useLocale()
  const reduced = usePrefersReducedMotion()
  const [native] = useState(
    () =>
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('animation-timeline: view()'),
  )

  const status = reduced
    ? pick(T.statusReduced, locale)
    : native
      ? pick(T.statusNative, locale)
      : pick(T.statusFallback, locale)

  const rowsFor = (always: boolean) =>
    ROWS.map((row) => ({ text: pick(row, locale), moves: always ? true : row.key }))

  return (
    <div className="relative min-h-svh bg-canvas pb-28">
      <style>{CSS_TEXT}</style>

      <section className="flex min-h-svh flex-col justify-between px-5 pb-28 pt-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-6">
          <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
          <h2 className="max-w-[12ch] font-display text-display font-semibold leading-[1.04] text-ink">
            {pick(T.title, locale)}
          </h2>
          <p className="max-w-[56ch] text-body text-ink-2">{pick(T.lede, locale)}</p>
          <p className="max-w-[58ch] border-l-2 border-accent pl-4 text-caption text-ink-2">
            {pick(T.heroNote, locale)}
          </p>
        </div>
        <div className="mx-auto flex w-full max-w-[88rem] flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 font-mono text-[11px] text-muted">
          <span className="stamp">M-04</span>
          <span className="text-ink-2">{status}</span>
          <span className="ml-auto">{pick(T.hint, locale)} ↓</span>
        </div>
      </section>

      <section
        aria-labelledby="live-sr-what"
        className="px-5 py-20 sm:px-8"
      >
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-8">
          <div className="live-sr-plate flex flex-col gap-4 border-t border-line pt-6 md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-10">
            <p className="label-mono text-muted">{pick(T.whatEyebrow, locale)}</p>
            <div className="flex max-w-[64ch] flex-col gap-3">
              <h2 id="live-sr-what" className="font-display text-h2 text-ink">
                {pick(T.whatTitle, locale)}
              </h2>
              <p className="text-body text-ink-2">{pick(T.whatBody, locale)}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {T.specimens.map((item) => (
              <article
                key={item.code}
                className="live-sr-plate plate flex flex-col gap-3 p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="label-mono text-muted">{pick(item.kicker, locale)}</span>
                  <span className="stamp">{item.code}</span>
                </div>
                <h3 className="font-display text-h3 text-ink">{pick(item.title, locale)}</h3>
                <p className="text-caption text-ink-2">{pick(item.body, locale)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="live-sr-contrast" className="px-5 py-20 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-8">
          <div className="flex flex-col gap-4 border-t border-line pt-6 md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-10">
            <p className="label-mono text-muted">{pick(T.contrastEyebrow, locale)}</p>
            <div className="flex max-w-[64ch] flex-col gap-3">
              <h2 id="live-sr-contrast" className="font-display text-h2 text-ink">
                {pick(T.contrastTitle, locale)}
              </h2>
              <p className="text-body text-ink-2">{pick(T.contrastBody, locale)}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ContrastPanel
              label={pick(T.panelA, locale)}
              code="A"
              count={pick(T.countA, locale)}
              caption={pick(T.captionA, locale)}
              rows={rowsFor(true)}
            />
            <ContrastPanel
              label={pick(T.panelB, locale)}
              code="B"
              count={pick(T.countB, locale)}
              caption={pick(T.captionB, locale)}
              rows={rowsFor(false)}
            />
          </div>
          <p className="font-mono text-[11px] text-muted">{pick(T.legend, locale)}</p>
          <p className="max-w-[60ch] border-l-2 border-accent pl-4 text-caption text-ink-2">
            {pick(T.takeaway, locale)}
          </p>
        </div>
      </section>

      <section aria-labelledby="live-sr-spec" className="px-5 py-20 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-8">
          <div className="flex flex-col gap-4 border-t border-line pt-6 md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-10">
            <p className="label-mono text-muted">{pick(T.specEyebrow, locale)}</p>
            <h2 id="live-sr-spec" className="font-display text-h2 text-ink">
              {pick(T.specTitle, locale)}
            </h2>
          </div>
          <dl className="flex flex-col">
            {T.specs.map((spec) => (
              <div
                key={pick(spec.label, locale)}
                className="grid gap-2 border-t border-line py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6 lg:grid-cols-[9rem_minmax(0,0.9fr)_minmax(0,1.1fr)]"
              >
                <dt className="label-mono text-muted">{pick(spec.label, locale)}</dt>
                <dd className="font-mono text-[12px] text-ink">
                  {typeof spec.value === 'string' ? spec.value : pick(spec.value, locale)}
                </dd>
                <dd className="text-caption text-ink-2">{pick(spec.note, locale)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="live-sr-avoid" className="px-5 py-20 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-8">
          <div className="flex flex-col gap-4 border-t border-line pt-6 md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-10">
            <p className="label-mono text-muted">{pick(T.avoidEyebrow, locale)}</p>
            <h2 id="live-sr-avoid" className="max-w-[22ch] font-display text-h2 text-ink">
              {pick(T.avoidTitle, locale)}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {T.avoid.map((item) => (
              <article key={item.code} className="plate flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <span aria-hidden="true" className="font-mono text-[15px] text-accent">
                    ×
                  </span>
                  <span className="stamp">{item.code}</span>
                </div>
                <h3 className="font-display text-h3 text-ink">{pick(item.title, locale)}</h3>
                <p className="text-caption text-ink-2">{pick(item.body, locale)}</p>
              </article>
            ))}
          </div>
          <p className="max-w-[64ch] border-t border-line pt-4 text-caption text-muted">
            {pick(T.avoidNote, locale)}
          </p>
        </div>
      </section>

      <section aria-labelledby="live-sr-code" className="px-5 pb-20 pt-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-5">
          <div className="flex flex-col gap-2 border-b-2 border-ink pb-3 sm:flex-row sm:items-baseline sm:justify-between">
            <div className="flex flex-col gap-1">
              <p className="label-mono text-muted">{pick(T.codeEyebrow, locale)}</p>
              <h2 id="live-sr-code" className="font-display text-h3 text-ink">
                {pick(T.codeTitle, locale)}
              </h2>
            </div>
            <span className="label-mono">M-04</span>
          </div>
          <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
            {SNIPPET}
          </pre>
          <p className="max-w-[64ch] text-caption text-muted">{pick(T.codeNote, locale)}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 font-mono text-[11px] text-muted">
            <span className="stamp">M-04</span>
            <span className="text-ink-2">{status}</span>
          </div>
          <Link
            to={entryPath('scroll-reveal')}
            className="text-link self-start font-mono text-[11px] text-accent no-underline"
          >
            ← {pick(T.back, locale)}
          </Link>
        </div>
      </section>
    </div>
  )
}
