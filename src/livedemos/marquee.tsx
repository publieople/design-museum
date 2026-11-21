import { useState } from 'react'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * Full-page marquee: this page is the wall.
 *
 * A marquee inside a box only proves the box is wide enough. A full-bleed band
 * shows the three things that actually break: the seam at the loop point, the
 * speed relative to reading, and what happens at the two edges.
 *
 * The track holds two identical copies and translates by -50%. The duplicate is
 * aria-hidden, the paused state is one data attribute, and nothing reads the
 * scroll position: this effect is pure CSS.
 */

const CSS_TEXT = [
  '@keyframes live-mq-shift {',
  '  from { transform: translate3d(0, 0, 0); }',
  '  to   { transform: translate3d(-50%, 0, 0); }',
  '}',
  '',
  '.live-mq-track {',
  '  display: flex;',
  '  width: max-content;',
  '  animation: live-mq-shift linear infinite;',
  '  will-change: transform;',
  '}',
  '',
  '/* one attribute is the single source of truth for the pause state */',
  ".live-mq-track[data-paused='true'] { animation-play-state: paused; }",
  '@media (hover: hover) {',
  '  .live-mq-band:hover .live-mq-track { animation-play-state: paused; }',
  '}',
  '',
  '/* fade both ends so items do not get cut in half at the viewport edge */',
  '.live-mq-band {',
  '  -webkit-mask-image: linear-gradient(90deg, transparent, black 7%, black 93%, transparent);',
  '  mask-image: linear-gradient(90deg, transparent, black 7%, black 93%, transparent);',
  '}',
  '',
  '/* reduced motion: stop the loop, drop the duplicate, wrap into a static list */',
  '@media (prefers-reduced-motion: reduce) {',
  '  .live-mq-track {',
  '    animation: none !important;',
  '    transform: none !important;',
  '    width: 100%;',
  '    flex-wrap: wrap;',
  '  }',
  '  .live-mq-dup { display: none; }',
  '}',
].join('\n')

const SNIPPET = [
  '/* two identical copies, shifted by exactly half the track */',
  '.marquee {',
  '  overflow: hidden;',
  '  mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);',
  '}',
  '',
  '.marquee__track {',
  '  display: flex;',
  '  width: max-content;',
  '  animation: slide 24s linear infinite;',
  '}',
  '',
  '@keyframes slide {',
  '  from { transform: translate3d(0, 0, 0); }',
  '  to   { transform: translate3d(-50%, 0, 0); }',
  '}',
  '',
  '/* hover and keyboard focus pause it, and so does the explicit button */',
  '.marquee:hover .marquee__track,',
  '.marquee:focus-within .marquee__track,',
  ".marquee__track[data-paused='true'] {",
  '  animation-play-state: paused;',
  '}',
  '',
  '@media (prefers-reduced-motion: reduce) {',
  '  .marquee__track { animation: none; transform: none; width: 100%; flex-wrap: wrap; }',
  '  .marquee__dup { display: none; }',
  '}',
].join('\n')

type Bi = { zh: string; en: string }
type BandItem = string | Bi

const T = {
  eyebrow: { zh: '现场 · 跑马灯', en: 'LIVE · MARQUEE' },
  title: { zh: '一面一直在走的墙', en: 'A wall that never stops' },
  lede: {
    zh: '整页只有跑马灯。三条带子铺满视口，一条 26 秒走完一轮，一条反向，一条慢一半。没有演示框，也没有「开始」按钮——它从页面加载就在走。',
    en: 'The whole page is the marquee. Three full-bleed bands: one takes 26 seconds per loop, one runs the other way, one is twice as slow. No demo box and no play button — it has been running since the page loaded.',
  },
  heroNote: {
    zh: '为什么必须整页：盒子里只有一条 30rem 的带子，你看到的其实是「进度条在动」，速度、接缝和两端渐隐全都不成立。只有铺满视口，跑马灯才是跑马灯。',
    en: 'Why the whole page: inside a box a 30rem band reads as a progress bar moving. Speed, seam, and edge fade cannot be judged there. Only a full-bleed band is actually a marquee.',
  },
  controlSpeed: { zh: '速度', en: 'Speed' },
  controlPause: { zh: '暂停', en: 'Pause' },
  controlResume: { zh: '继续', en: 'Resume' },
  controlReverse: { zh: '反向', en: 'Reverse' },
  controlPaused: { zh: '已暂停', en: 'Paused' },
  controlRunning: { zh: '运行中', en: 'Running' },
  controlNote: {
    zh: '悬停任何一条带子也会暂停——这是惯例，不是彩蛋。',
    en: 'Hovering any band pauses it too — that is convention, not an easter egg.',
  },
  bands: [
    {
      id: 'names',
      label: { zh: 'A · 效果名', en: 'A · Effect names' },
      variant: 'display',
      baseSeconds: 26,
      reverse: false,
      items: [
        { zh: '跑马灯', en: 'Marquee' },
        { zh: '逐字显现', en: 'Character Reveal' },
        { zh: '骨架屏微光', en: 'Skeleton Shimmer' },
        { zh: '数字滚动', en: 'Count Up' },
        { zh: '滚动吸附', en: 'Scroll Snap' },
        { zh: '视差滚动', en: 'Parallax' },
        { zh: '粘性堆叠', en: 'Sticky Stack' },
      ] as readonly BandItem[],
    },
    {
      id: 'tokens',
      label: { zh: 'B · 关键词', en: 'B · Tokens' },
      variant: 'mono',
      baseSeconds: 18,
      reverse: true,
      items: [
        'transform: translate3d',
        'linear infinite',
        'aria-hidden',
        '@keyframes',
        'mask-image',
        'animation-play-state',
        'width: max-content',
      ] as readonly BandItem[],
    },
    {
      id: 'rules',
      label: { zh: 'C · 三条规矩', en: 'C · Three rules' },
      variant: 'body',
      baseSeconds: 34,
      reverse: false,
      items: [
        { zh: '复制一份，再平移一半', en: 'Duplicate once, shift by half' },
        { zh: '只动 transform，不动 margin', en: 'Move transform, never margin' },
        { zh: '复制的那份要 aria-hidden', en: 'Hide the duplicate from screen readers' },
        { zh: '内容比容器短就先别循环', en: 'Never loop content shorter than the container' },
      ] as readonly BandItem[],
    },
  ],
  sections: [
    {
      title: { zh: '复制一份，再平移一半', en: 'Duplicate once, then shift by half' },
      figure: ['copy A + copy B', '→ translate3d(-50%)', '→ jump back to 0'],
      body: {
        zh: '接缝靠算术消掉：把同一份内容并排两份，整条轨道左移正好 50%，移完的瞬间第一份刚好走到第二份原来的位置，画面和起点一模一样，于是归零不会跳。只复制一份不够，还要保证一份的宽度大于容器，否则接缝会落在屏幕里。',
        en: 'The seam is removed by arithmetic: place two identical copies side by side and move the whole track left by exactly 50%. At that instant copy A sits where copy B started, so resetting to zero is invisible. One copy is not enough — a single copy must also be wider than the container, or the seam lands on screen.',
      },
    },
    {
      title: { zh: '只动 transform', en: 'Only move transform' },
      figure: ['translate3d ✓', 'margin-left ✗', 'left ✗'],
      body: {
        zh: '位移必须走 transform: translate3d。用 margin-left 或 left 动画，每一帧都要重新布局，一条带子里几十个节点，代价按节点数叠加；translate3d 只合成，交给 GPU。速度取 20–60px/s 左右，大约是一个人阅读速度的一半——再快就变成装饰噪音。',
        en: 'Travel has to be transform: translate3d. Animating margin-left or left re-lays-out every frame, and a band with dozens of nodes multiplies that cost; translate3d only composites. Keep the speed around 20–60px/s, roughly half a reading pace — faster turns into decorative noise.',
      },
    },
    {
      title: { zh: '读屏、暂停与降级', en: 'Screen readers, pausing, and fallback' },
      figure: ['dup: aria-hidden', 'pause: button', 'reduced: static'],
      body: {
        zh: '复制出来的那一份设 aria-hidden="true"，否则读屏会把每条内容念两遍。悬停或聚焦时暂停是惯例，但慢读的用户没法悬停，所以还要有一个真的暂停按钮。prefers-reduced-motion 下整条轨道停住、复制份隐藏、内容换行成静态列表——这一页就是这么做的。',
        en: 'The duplicated copy carries aria-hidden="true", or assistive tech reads every item twice. Pausing on hover or focus is convention, but a slow reader cannot hover, so an explicit pause button is still required. Under prefers-reduced-motion the track stops, the duplicate disappears, and the items wrap into a static list — which is exactly what this page does.',
      },
    },
    {
      title: { zh: '什么时候别用', en: 'When not to use it' },
      figure: ['compare? no', 'read fully? no', '4 logos? no'],
      body: {
        zh: '要逐条比较的内容不要做成跑马灯：它一走，读者就没法并排看。必须读完才算数的信息也不要——跑马灯默认人只读得到一部分。只有四个 logo 时它更没必要：静态排列反而更清楚。跑马灯适合「很多、很短、顺便看一眼」的内容。',
        en: 'Do not marquee content people must compare: once it moves, side-by-side reading is gone. Do not marquee information that must be read in full — by default readers only catch a fraction. And four logos do not need it at all: a static row is clearer. It suits content that is numerous, short, and glanceable.',
      },
    },
  ],
  paramsTitle: { zh: '推荐取值', en: 'Recommended values' },
  params: [
    { label: { zh: '速度', en: 'Speed' }, value: '20–60px/s' },
    { label: { zh: '一轮时长', en: 'Loop time' }, value: '18–34s' },
    { label: { zh: '无缝', en: 'Seamless' }, value: { zh: '复制一份，平移 50%', en: 'Duplicate once, shift 50%' } },
    { label: { zh: '两端', en: 'Edges' }, value: { zh: 'mask-image 渐隐 7%–8%', en: 'mask-image fade over 7%–8%' } },
    { label: { zh: '暂停', en: 'Pause' }, value: { zh: '悬停 + 明确的按钮', en: 'Hover plus an explicit button' } },
    { label: { zh: '降级', en: 'Fallback' }, value: { zh: '停住，换成静态换行列表', en: 'Stop, wrap into a static list' } },
  ],
  codeTitle: { zh: '这一页实际在用的', en: 'What this page actually runs' },
  codeNote: {
    zh: '三条带子共用同一个 keyframes，只是 animation-duration 与 animation-direction 不同；暂停靠 data-paused 这一个属性，悬停暂停和按钮写的是同一个状态。',
    en: 'All three bands share one keyframes block; only animation-duration and animation-direction differ. Pausing goes through the single data-paused attribute, so the hover rule and the button write the same state.',
  },
  reducedNote: {
    zh: '如果系统开了减少动态，这一页不会自动滚动：轨道停住、复制份隐藏、三条带子变成换行的静态列表。',
    en: 'If reduced motion is on, this page does not auto-scroll: the track stops, the duplicate is hidden, and the three bands become wrapped static lists.',
  },
  back: { zh: '回到词条：跑马灯', en: 'Back to the entry: Marquee' },
} as const

function itemText(item: BandItem, locale: 'zh' | 'en'): string {
  return typeof item === 'string' ? item : pick(item, locale)
}

function Band({
  band,
  locale,
  paused,
  reverse,
  factor,
}: {
  band: (typeof T.bands)[number]
  locale: 'zh' | 'en'
  paused: boolean
  reverse: boolean
  factor: number
}) {
  const direction = reverse !== band.reverse ? 'reverse' : 'normal'
  const style = {
    animationDuration: (band.baseSeconds * factor).toFixed(2) + 's',
    animationDirection: direction,
  }
  const itemClass =
    band.variant === 'display'
      ? 'font-display text-h2 font-semibold text-ink'
      : band.variant === 'mono'
        ? 'font-mono text-[13px] tracking-[0.08em] text-ink-2'
        : 'text-body text-ink-2'

  const copy = (dup: boolean) => (
    <ul
      className={'flex shrink-0 items-center' + (dup ? ' live-mq-dup' : '')}
      aria-hidden={dup ? 'true' : undefined}
    >
      {band.items.map((item, index) => (
        <li key={band.id + '-' + index} className="flex items-center gap-3 px-4">
          <span aria-hidden="true" className="inline-block h-1.5 w-1.5 shrink-0 bg-accent" />
          <span className={itemClass}>{itemText(item, locale)}</span>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="live-mq-band border-y border-line py-4">
      <div className="mx-auto mb-2 flex w-full max-w-[88rem] items-center justify-between gap-3 px-5 sm:px-8">
        <span className="label-mono text-muted">{pick(band.label, locale)}</span>
        <span className="font-mono text-[10px] text-muted">
          {(band.baseSeconds * factor).toFixed(1)}s · {direction}
        </span>
      </div>
      <div className="live-mq-viewport overflow-hidden">
        <div className="live-mq-track" data-paused={paused ? 'true' : 'false'} style={style}>
          {copy(false)}
          {copy(true)}
        </div>
      </div>
    </div>
  )
}

export default function LiveMarquee() {
  const locale = useLocale()
  const [paused, setPaused] = useState(false)
  const [reverse, setReverse] = useState(false)
  const [speed, setSpeed] = useState(40)
  const factor = 40 / speed

  return (
    <div className="relative bg-canvas pb-28">
      <style>{CSS_TEXT}</style>

      <section
        aria-label={pick(T.title, locale)}
        className="mx-auto flex min-h-[78svh] w-full max-w-[88rem] flex-col justify-center gap-6 px-5 py-16 sm:px-8"
      >
        <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
        <h2 className="max-w-[18ch] font-display text-display font-semibold leading-[1.04] text-ink">
          {pick(T.title, locale)}
        </h2>
        <p className="max-w-[56ch] text-body text-ink-2">{pick(T.lede, locale)}</p>
        <p className="max-w-[58ch] border-l-2 border-accent pl-4 text-caption text-ink-2">
          {pick(T.heroNote, locale)}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-4">
          <button
            type="button"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
            className="border border-line-strong bg-raised px-3 py-1.5 font-mono text-[11px] text-ink transition-colors hover:border-ink"
          >
            {paused ? pick(T.controlResume, locale) : pick(T.controlPause, locale)}
          </button>
          <button
            type="button"
            aria-pressed={reverse}
            onClick={() => setReverse((value) => !value)}
            className="border border-line-strong bg-raised px-3 py-1.5 font-mono text-[11px] text-ink transition-colors hover:border-ink"
          >
            {pick(T.controlReverse, locale)}
          </button>
          <label className="flex items-center gap-3 font-mono text-[11px] text-muted">
            <span>{pick(T.controlSpeed, locale)}</span>
            <input
              type="range"
              min={10}
              max={80}
              step={5}
              value={speed}
              aria-label={pick(T.controlSpeed, locale)}
              onChange={(event) => setSpeed(Number(event.target.value))}
              className="h-1 w-32 accent-[var(--accent)]"
            />
            <span className="tabular-nums text-ink">{speed}px/s</span>
          </label>
          <span className="font-mono text-[11px] text-accent">
            {paused ? pick(T.controlPaused, locale) : pick(T.controlRunning, locale)}
          </span>
        </div>
        <p className="font-mono text-[10px] text-muted">{pick(T.controlNote, locale)}</p>
      </section>

      <div className="flex flex-col">
        {T.bands.map((band) => (
          <Band
            key={band.id}
            band={band}
            locale={locale}
            paused={paused}
            reverse={reverse}
            factor={factor}
          />
        ))}
      </div>

      <div className="mx-auto w-full max-w-[88rem] px-5 pt-16 sm:px-8">
        {T.sections.map((section, index) => (
          <section
            key={section.title.zh}
            aria-labelledby={'live-mq-section-' + index}
            className="grid gap-6 border-t border-line py-10 md:grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,14rem)] md:gap-10"
          >
            <div className="flex items-baseline gap-3 md:flex-col md:gap-2">
              <span aria-hidden="true" className="font-display text-h1 leading-none text-line-strong">
                {'0' + (index + 1)}
              </span>
              <span className="label-mono text-muted">M</span>
            </div>
            <div className="flex max-w-[58ch] flex-col gap-3">
              <h2 id={'live-mq-section-' + index} className="font-display text-h2 text-ink">
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
            <span className="label-mono">{paused ? 'paused' : 'running'}</span>
          </div>
          <p className="max-w-[64ch] text-caption text-ink-2">{pick(T.codeNote, locale)}</p>
          <p className="max-w-[64ch] text-caption text-muted">{pick(T.reducedNote, locale)}</p>
          <Link
            to={entryPath('marquee')}
            className="text-link self-start font-mono text-[11px] text-accent no-underline"
          >
            {pick(T.back, locale)} →
          </Link>
        </div>
      </section>
    </div>
  )
}
