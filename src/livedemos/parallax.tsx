import { useEffect, useState } from 'react'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { usePrefersReducedMotion } from '../lib/motion'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * 整页版「视差滚动」：三段 sticky 场景，每段三层（背景大字 / 网格、中景卡片、
 * 前景小标签）读同一条命名 view() 时间线，只是 keyframes 的距离与方向不同。
 *
 * 位移全部加在层自己身上，sticky 容器不加 transform——否则它内部的 fixed 后代
 * 会改以它为参照。触屏、窄屏与 reduced-motion 下动画整体关闭，构图保持静态。
 * 不支持命名滚动时间线的浏览器同样停在原位，不做假的减速动画。
 */

const CSS_TEXT = [
  '@keyframes live-px-back {',
  '  from { transform: translate3d(0, 2rem, 0); }',
  '  to { transform: translate3d(0, -2rem, 0); }',
  '}',
  '@keyframes live-px-grid {',
  '  from { transform: translate3d(0, 1.5rem, 0); }',
  '  to { transform: translate3d(0, -1.5rem, 0); }',
  '}',
  '@keyframes live-px-mid {',
  '  from { transform: translate3d(0, 3rem, 0); }',
  '  to { transform: translate3d(0, -3rem, 0); }',
  '}',
  '@keyframes live-px-fore {',
  '  from { transform: translate3d(0, -4rem, 0); }',
  '  to { transform: translate3d(0, 4rem, 0); }',
  '}',
  '.live-px-grid {',
  '  background-image:',
  '    linear-gradient(color-mix(in srgb, var(--ink) 7%, transparent) 1px, transparent 1px),',
  '    linear-gradient(90deg, color-mix(in srgb, var(--ink) 7%, transparent) 1px, transparent 1px);',
  '  background-size: 3rem 3rem;',
  '}',
  '@supports (animation-timeline: view()) and (view-timeline-name: --px-tl) {',
  '  .live-px-scene {',
  '    view-timeline: --px-tl block;',
  '  }',
  '  .live-px-back {',
  '    animation: live-px-back linear both;',
  '    animation-timeline: --px-tl;',
  '    animation-range: contain 0% contain 100%;',
  '  }',
  '  .live-px-grid {',
  '    animation: live-px-grid linear both;',
  '    animation-timeline: --px-tl;',
  '    animation-range: contain 0% contain 100%;',
  '  }',
  '  .live-px-mid {',
  '    animation: live-px-mid linear both;',
  '    animation-timeline: --px-tl;',
  '    animation-range: contain 0% contain 100%;',
  '  }',
  '  .live-px-fore {',
  '    animation: live-px-fore linear both;',
  '    animation-timeline: --px-tl;',
  '    animation-range: contain 0% contain 100%;',
  '  }',
  '}',
  '@media (pointer: coarse), (max-width: 640px), (prefers-reduced-motion: reduce) {',
  '  .live-px-back, .live-px-grid, .live-px-mid, .live-px-fore {',
  '    animation: none !important;',
  '    transform: none !important;',
  '  }',
  '}',
].join('\n')

const SNIPPET = [
  '/* a tall scene owns one named view timeline */',
  '.live-px-scene {',
  '  view-timeline: --px-tl block;',
  '}',
  '',
  '/* every layer reads the same timeline at its own speed */',
  '.live-px-back {',
  '  animation: live-px-back linear both;',
  '  animation-timeline: --px-tl;',
  '  animation-range: contain 0% contain 100%;',
  '}',
  '',
  '.live-px-fore {',
  '  animation: live-px-fore linear both;',
  '  animation-timeline: --px-tl;',
  '  animation-range: contain 0% contain 100%;',
  '}',
  '',
  '/* touch, narrow screens and reduced motion: no parallax */',
  '@media (pointer: coarse), (max-width: 640px), (prefers-reduced-motion: reduce) {',
  '  .live-px-back, .live-px-grid, .live-px-mid, .live-px-fore {',
  '    animation: none !important;',
  '    transform: none !important;',
  '  }',
  '}',
].join('\n')

const T = {
  eyebrow: { zh: '现场 · 视差滚动', en: 'LIVE · PARALLAX' },
  title: { zh: '三层，三种速度', en: 'Three layers, three speeds' },
  lede: {
    zh: '继续往下滚。背景的大字走得最慢，中景卡片居中，前景小标签反向走。景深不是画出来的，是速度差算出来的：层与层差开，眼睛就把它读成远近。',
    en: 'Keep scrolling. The big background word moves slowest, the mid card holds the centre, and the small foreground label travels the other way. Depth is not drawn, it is computed from a speed difference: separate the layers and the eye reads distance.',
  },
  heroNote: {
    zh: '这一页没有演示框：下面三段各占 190vh，sticky 把每段钉住一屏，三层在同一段时间轴上按不同速度走。滚动没有被监听，它就是时间轴。',
    en: 'There is no demo box here: each of the three scenes below is 190vh tall, sticky pins it for one screen, and its three layers move at different speeds along that single timeline. Nothing listens to the scroll; the scroll is the timeline.',
  },
  legend: [
    {
      name: { zh: '背景层', en: 'BACK layer' },
      note: { zh: '全程 4rem · 最慢', en: '4rem total · slowest' },
      tone: 'line',
    },
    {
      name: { zh: '中景层', en: 'MID layer' },
      note: { zh: '全程 6rem · 跟着卡片', en: '6rem total · with the card' },
      tone: 'strong',
    },
    {
      name: { zh: '前景层', en: 'FORE layer' },
      note: { zh: '全程 8rem · 方向相反', en: '8rem total · opposite direction' },
      tone: 'accent',
    },
  ],
  hint: { zh: '向下滚动', en: 'Scroll' },
  statusNative: {
    zh: '原生命名 view() 时间线：三层读同一条 --px-tl，没有监听器，也没有 rAF。',
    en: 'Native named view() timeline: all three layers read the same --px-tl, with no listeners and no rAF.',
  },
  statusFallback: {
    zh: '静态兜底：此浏览器不支持命名滚动时间线，三层停在原位，构图仍然完整。',
    en: 'Static fallback: this browser does not support named scroll timelines, so the layers stay in place and the composition still holds.',
  },
  statusSmall: {
    zh: '窄屏或触屏：视差已关闭，三层回到静态构图。',
    en: 'Narrow or touch screen: parallax is off and the layers return to a static composition.',
  },
  statusReduced: {
    zh: '已按系统设置减少动态：所有层归零，内容不跟着滚动走。',
    en: 'Reduced motion is on: every layer is reset and nothing follows the scroll.',
  },
  scenes: [
    {
      kicker: { zh: '场景 01 · 背景 / 中景 / 前景', en: 'Scene 01 · back / mid / fore' },
      code: 'P-01',
      title: { zh: '景深来自速度差', en: 'Depth comes from a speed gap' },
      body: {
        zh: '三层都只做 translate3d：背景走 4rem，中景走 6rem，前景反向走 8rem。三者的差，眼睛读成纵深；卡片本身没有变大，也没有变小。',
        en: 'All three layers only use translate3d: the back travels 4rem, the mid travels 6rem, the fore travels 8rem the other way. The eye reads that gap as depth; the card itself neither grows nor shrinks.',
      },
      note: {
        zh: '背景 4rem · 中景 6rem · 前景 8rem（相反）',
        en: 'back 4rem · mid 6rem · fore 8rem (opposite)',
      },
      fore: { zh: '前景 · 反向', en: 'FORE · opposite' },
    },
    {
      kicker: { zh: '场景 02 · 层只负责一层', en: 'Scene 02 · one layer, one job' },
      code: 'P-02',
      title: { zh: '一层只做一件事', en: 'One layer, one job' },
      body: {
        zh: '背景负责尺度（大字与网格），中景负责内容（卡片），前景负责距离（压在最前的小标签）。位移加在各层自己身上；sticky 容器不加 transform——否则它里面的 fixed 子元素会改以它为参照。',
        en: 'The back layer carries scale (the big word and the grid), the mid layer carries content (the card), the fore layer carries distance (the small label pressed to the front). Motion lives on the layers themselves; the sticky container gets no transform, or a fixed descendant inside it would start to reference the container instead.',
      },
      note: {
        zh: 'sticky 只负责停住 · 位移只加在层上',
        en: 'sticky only pins · motion lives on the layers',
      },
      fore: { zh: '前景 · 最前', en: 'FORE · nearest' },
    },
    {
      kicker: { zh: '场景 03 · 配比', en: 'Scene 03 · the ratio' },
      code: 'P-03',
      title: { zh: '慢背景，快前景', en: 'Slow back, fast front' },
      body: {
        zh: '常见配比：背景速度是前景的 0.3–0.6 倍，整段位移不超过容器高度的一半。本页是 4 / 6 / 8rem，差距温和；再大就不是纵深，是晕船。',
        en: 'A common ratio: the back moves at 0.3–0.6 times the speed of the fore, and total travel stays under half the container height. This page uses 4 / 6 / 8rem, a gentle gap; any more and it stops being depth and becomes seasickness.',
      },
      note: {
        zh: '最大位移 8rem · 容器高度 100svh',
        en: 'max travel 8rem · container height 100svh',
      },
      fore: { zh: '前景 · 反向', en: 'FORE · opposite' },
    },
  ],
  compareEyebrow: { zh: '04 · 对照', en: '04 · Comparison' },
  compareTitle: {
    zh: '同一张卡片：有景深 vs 平铺',
    en: 'Same card: with depth vs flat',
  },
  compareBody: {
    zh: '同一张滚动、同一张卡片。左边只有卡片一层；右边加了背景大字与前景标签，卡片自己的位移一模一样——看起来却像停在不同的距离上。',
    en: 'The same scroll, the same card. On the left there is only the card; on the right a big background word and a foreground label are added while the card moves exactly as before — yet it appears to sit at a different distance.',
  },
  flatLabel: { zh: 'A · 平铺', en: 'A · Flat' },
  flatMeta: { zh: '1 层 · 0 个速度参照', en: '1 layer · 0 speed references' },
  flatCaption: {
    zh: '卡片跟着视口走。没有别的参照，所以看不出深度。',
    en: 'The card moves with the viewport. With nothing else as a reference, there is no depth to see.',
  },
  depthLabel: { zh: 'B · 有景深', en: 'B · With depth' },
  depthMeta: { zh: '3 层 · 2 个速度参照', en: '3 layers · 2 speed references' },
  depthCaption: {
    zh: '背景慢、前景反向。卡片没变，但有了两个速度参照，纵深就成立了。',
    en: 'The back is slow and the fore moves the other way. The card has not changed, but with two speed references the depth appears.',
  },
  compareNote: {
    zh: '纵深不是加在卡片上的，是加在它前面和后面那两层上的。卡片本身依旧是一张纸。',
    en: 'Depth is not added to the card; it is added to the layers in front of and behind it. The card itself is still a sheet of paper.',
  },
  guardEyebrow: { zh: '05 · 什么时候别用', en: '05 · When not to use it' },
  guardTitle: { zh: '三种情况，直接关掉', en: 'Three cases, switch it off' },
  guards: [
    {
      code: 'C-01',
      title: { zh: '触屏与窄屏', en: 'Touch and narrow screens' },
      body: {
        zh: '手指没有「远近」这层信息，滚动还带回弹（iOS 尤其明显，视差会跳一下）。这一页在 (pointer: coarse) 与 640px 以下直接关掉视差，只留静态构图。',
        en: 'A finger has no depth signal to help, and scrolling bounces back (on iOS especially, parallax jumps). This page turns parallax off under (pointer: coarse) and below 640px, leaving a static composition.',
      },
    },
    {
      code: 'C-02',
      title: { zh: '减少动态', en: 'Reduced motion' },
      body: {
        zh: 'prefers-reduced-motion: reduce 时所有层归零，页面照常可读，只是不跟着滚动走。动画是增强，不是内容。',
        en: 'Under prefers-reduced-motion: reduce, every layer is reset. The page reads the same; it simply does not move with the scroll. Motion is an enhancement, not the content.',
      },
    },
    {
      code: 'C-03',
      title: { zh: '视差过度会晕', en: 'Too much travel makes people sick' },
      body: {
        zh: '背景与前景的速度差 0.3–0.6 倍就够；单层位移不超过容器高度的一半。超过这个量，读者读不进内容，只会觉得晕。',
        en: 'A 0.3–0.6 speed ratio between back and fore is plenty; single-layer travel should stay under half the container height. Beyond that, readers cannot stay with the content and simply feel ill.',
      },
    },
  ],
  guardNote: {
    zh: '这也是为什么三段场景都用 contain 0% → contain 100%：进入时开始，离开时结束，正好覆盖 sticky 停住的那一段，滚过头不会留下半截动画。',
    en: 'That is also why every scene uses contain 0% to contain 100%: it starts on entry and ends on exit, exactly covering the sticky dwell, so overshooting the scroll never leaves an animation half-played.',
  },
  codeEyebrow: { zh: '06 · 这一页在用的代码', en: '06 · The code this page runs' },
  codeTitle: { zh: 'sticky 的停住段就是时间轴', en: 'The sticky dwell is the timeline' },
  codeNote: {
    zh: '没有 scroll 监听，也没有 rAF：高个子场景自己声明 view-timeline: --px-tl，三层读同一条时间线，只是各自的 keyframes 距离不同——景深是这么来的。',
    en: 'No scroll listener and no rAF: the tall scene declares view-timeline: --px-tl, and all three layers read that one timeline with different keyframe distances — that is where the depth comes from.',
  },
  back: { zh: '回到词条：视差滚动', en: 'Back to the entry: Parallax' },
} as const

function MidCard({
  id,
  kicker,
  code,
  title,
  body,
  note,
}: {
  id: string
  kicker: string
  code: string
  title: string
  body: string
  note: string
}) {
  return (
    <div className="live-px-mid plate relative z-10 mx-auto flex w-full max-w-md flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-2">
        <span className="label-mono text-muted">{kicker}</span>
        <span className="stamp">{code}</span>
      </div>
      <h2 id={id} className="font-display text-h2 text-ink">
        {title}
      </h2>
      <p className="text-caption text-ink-2">{body}</p>
      <p className="border-t border-line pt-3 font-mono text-[10px] text-muted">{note}</p>
    </div>
  )
}

function MiniCard({ label }: { label: string }) {
  return (
    <div className="w-36 border border-line-strong bg-raised p-3">
      <div className="flex items-center justify-between font-mono text-[9px] text-muted">
        <span>M-05</span>
        <span>{label}</span>
      </div>
      <p className="mt-3 font-display text-[15px] leading-tight text-ink">Parallax</p>
      <span aria-hidden="true" className="mt-2 block h-[2px] w-full bg-line">
        <span className="block h-full w-2/3 bg-accent" />
      </span>
    </div>
  )
}

export default function ParallaxLive() {
  const locale = useLocale()
  const reduced = usePrefersReducedMotion()
  const [small, setSmall] = useState(false)
  const [native] = useState(
    () =>
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('(animation-timeline: view()) and (view-timeline-name: --px-tl)'),
  )

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const media = window.matchMedia('(pointer: coarse), (max-width: 640px)')
    const sync = () => setSmall(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const status = reduced
    ? pick(T.statusReduced, locale)
    : small
      ? pick(T.statusSmall, locale)
      : native
        ? pick(T.statusNative, locale)
        : pick(T.statusFallback, locale)

  return (
    <div className="relative min-h-svh bg-canvas pb-28">
      <style>{CSS_TEXT}</style>

      <section className="flex min-h-svh flex-col justify-between px-5 pb-28 pt-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-6">
          <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
          <h2 className="max-w-[14ch] font-display text-display font-semibold leading-[1.04] text-ink">
            {pick(T.title, locale)}
          </h2>
          <p className="max-w-[56ch] text-body text-ink-2">{pick(T.lede, locale)}</p>
          <p className="max-w-[58ch] border-l-2 border-accent pl-4 text-caption text-ink-2">
            {pick(T.heroNote, locale)}
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {T.legend.map((row) => (
              <li
                key={pick(row.name, locale)}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted"
              >
                <span
                  aria-hidden="true"
                  className={
                    'inline-block h-2 w-6 border border-line ' +
                    (row.tone === 'accent'
                      ? 'bg-accent'
                      : row.tone === 'strong'
                        ? 'bg-line-strong'
                        : 'bg-line')
                  }
                />
                <span className="text-ink">{pick(row.name, locale)}</span>
                <span>{pick(row.note, locale)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mx-auto flex w-full max-w-[88rem] flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 font-mono text-[11px] text-muted">
          <span className="stamp">M-05</span>
          <span className="text-ink-2">{status}</span>
          <span className="ml-auto">{pick(T.hint, locale)} ↓</span>
        </div>
      </section>

      {T.scenes.map((scene, index) => (
        <section
          key={scene.code}
          aria-labelledby={'live-px-scene-' + (index + 1)}
          className="live-px-scene relative h-[190vh]"
        >
          <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden">
            <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
              <p
                className="live-px-back select-none whitespace-nowrap font-display text-[clamp(5rem,22vw,18rem)] font-semibold leading-none"
                style={{ color: 'color-mix(in srgb, var(--ink) 9%, transparent)' }}
              >
                {index === 0 ? 'DEPTH' : index === 1 ? 'LAYERS' : 'M-05'}
              </p>
            </div>
            <div aria-hidden="true" className="live-px-grid absolute inset-[-20%]" />
            {index === 1 ? (
              <div className="relative z-10 mx-auto grid w-full max-w-[88rem] items-center px-5 sm:px-8 md:grid-cols-2">
                <div className="md:col-start-2">
                  <MidCard
                    id="live-px-scene-2"
                    kicker={pick(scene.kicker, locale)}
                    code={scene.code}
                    title={pick(scene.title, locale)}
                    body={pick(scene.body, locale)}
                    note={pick(scene.note, locale)}
                  />
                </div>
              </div>
            ) : (
              <div className="relative z-10 mx-auto w-full max-w-[88rem] px-5 sm:px-8">
                <MidCard
                  id={'live-px-scene-' + (index + 1)}
                  kicker={pick(scene.kicker, locale)}
                  code={scene.code}
                  title={pick(scene.title, locale)}
                  body={pick(scene.body, locale)}
                  note={pick(scene.note, locale)}
                />
              </div>
            )}
            <div
              className={
                'live-px-fore absolute z-20 ' +
                (index === 0
                  ? 'bottom-[16%] left-4 sm:left-[10%]'
                  : index === 1
                    ? 'right-4 top-[12%] sm:right-[10%]'
                    : 'bottom-[12%] right-4 sm:right-[12%]')
              }
            >
              <span className="border border-line-strong bg-raised px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-ink-2">
                {pick(scene.fore, locale)}
              </span>
            </div>
          </div>
        </section>
      ))}

      <section aria-labelledby="live-px-compare" className="px-5 py-20 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-8">
          <div className="flex flex-col gap-4 border-t border-line pt-6 md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-10">
            <p className="label-mono text-muted">{pick(T.compareEyebrow, locale)}</p>
            <div className="flex max-w-[64ch] flex-col gap-3">
              <h2 id="live-px-compare" className="font-display text-h2 text-ink">
                {pick(T.compareTitle, locale)}
              </h2>
              <p className="text-body text-ink-2">{pick(T.compareBody, locale)}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <figure className="plate flex flex-col gap-3 p-4">
              <figcaption className="flex items-center justify-between gap-2">
                <span className="label-mono text-ink-2">{pick(T.flatLabel, locale)}</span>
                <span className="stamp">A</span>
              </figcaption>
              <p className="font-mono text-[10px] text-muted">{pick(T.flatMeta, locale)}</p>
              <div className="relative flex h-60 items-center justify-center overflow-hidden border border-line bg-surface">
                <MiniCard label={pick(T.flatLabel, locale)} />
              </div>
              <p className="text-caption text-muted">{pick(T.flatCaption, locale)}</p>
            </figure>
            <figure className="plate flex flex-col gap-3 p-4">
              <figcaption className="flex items-center justify-between gap-2">
                <span className="label-mono text-ink-2">{pick(T.depthLabel, locale)}</span>
                <span className="stamp">B</span>
              </figcaption>
              <p className="font-mono text-[10px] text-muted">{pick(T.depthMeta, locale)}</p>
              <div className="relative h-60 overflow-hidden border border-line bg-surface">
                <span
                  aria-hidden="true"
                  className="absolute left-3 top-2 select-none font-display text-[5rem] font-semibold leading-none"
                  style={{ color: 'color-mix(in srgb, var(--ink) 10%, transparent)' }}
                >
                  05
                </span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <MiniCard label={pick(T.depthLabel, locale)} />
                </div>
                <span className="absolute bottom-3 right-3 border border-line-strong bg-raised px-1.5 py-0.5 font-mono text-[9px] text-ink-2">
                  FORE
                </span>
              </div>
              <p className="text-caption text-muted">{pick(T.depthCaption, locale)}</p>
            </figure>
          </div>
          <p className="max-w-[64ch] border-l-2 border-accent pl-4 text-caption text-ink-2">
            {pick(T.compareNote, locale)}
          </p>
        </div>
      </section>

      <section aria-labelledby="live-px-guard" className="px-5 py-20 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-8">
          <div className="flex flex-col gap-4 border-t border-line pt-6 md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-10">
            <p className="label-mono text-muted">{pick(T.guardEyebrow, locale)}</p>
            <h2 id="live-px-guard" className="max-w-[22ch] font-display text-h2 text-ink">
              {pick(T.guardTitle, locale)}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {T.guards.map((item) => (
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
          <p className="max-w-[66ch] border-t border-line pt-4 text-caption text-muted">
            {pick(T.guardNote, locale)}
          </p>
        </div>
      </section>

      <section aria-labelledby="live-px-code" className="px-5 pb-20 pt-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-5">
          <div className="flex flex-col gap-2 border-b-2 border-ink pb-3 sm:flex-row sm:items-baseline sm:justify-between">
            <div className="flex flex-col gap-1">
              <p className="label-mono text-muted">{pick(T.codeEyebrow, locale)}</p>
              <h2 id="live-px-code" className="font-display text-h3 text-ink">
                {pick(T.codeTitle, locale)}
              </h2>
            </div>
            <span className="label-mono">M-05</span>
          </div>
          <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
            {SNIPPET}
          </pre>
          <p className="max-w-[64ch] text-caption text-muted">{pick(T.codeNote, locale)}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 font-mono text-[11px] text-muted">
            <span className="stamp">M-05</span>
            <span className="text-ink-2">{status}</span>
          </div>
          <Link
            to={entryPath('parallax')}
            className="text-link self-start font-mono text-[11px] text-accent no-underline"
          >
            ← {pick(T.back, locale)}
          </Link>
        </div>
      </section>
    </div>
  )
}
