import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { usePrefersReducedMotion } from '../lib/motion'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * Full-page scroll snapping: one tall container, five panels, one dot per panel.
 *
 * The page is a single scroller so the mechanism stays visible. Snapping is a
 * property of the container (scroll-snap-type) plus a property of each child
 * (scroll-snap-align); neither works alone, and the demo only reads correctly
 * when the container is exactly one viewport tall — which is also why the
 * entry warns against mandatory snapping in containers taller than the screen.
 */

const CSS_TEXT = [
  '/*',
  ' * Container: the snap axis and strictness live here.',
  ' * Panel: the stop point lives there. Neither works on its own.',
  ' */',
  '.live-ss-track {',
  '  height: 100svh;',
  '  overflow-y: auto;',
  '  scroll-snap-type: y mandatory;',
  '  scroll-behavior: smooth;',
  '  scroll-padding-top: 0px;',
  '  overscroll-behavior-y: contain;',
  '}',
  '',
  '.live-ss-panel {',
  '  min-height: 100%;',
  '  scroll-snap-align: start;',
  '  scroll-snap-stop: always;',
  '}',
  '',
  '@media (prefers-reduced-motion: reduce) {',
  '  /* snapping is not motion; smooth scrolling is. Drop the latter, keep the page usable. */',
  '  .live-ss-track {',
  '    scroll-snap-type: none;',
  '    scroll-behavior: auto;',
  '  }',
  '  .live-ss-panel {',
  '    scroll-snap-align: none;',
  '  }',
  '}',
].join('\n')

const SNIPPET = [
  '.gallery {',
  '  height: 100svh;',
  '  overflow-y: auto;',
  '  scroll-snap-type: y mandatory;   /* the container owns the axis */',
  '  scroll-padding-top: 16px;         /* breathing room at the stop point */',
  '}',
  '',
  '.gallery > section {',
  '  min-height: 100%;',
  '  scroll-snap-align: start;         /* the child owns the stop point */',
  '  scroll-snap-stop: always;         /* never skip a panel on a fast flick */',
  '}',
  '',
  '@media (prefers-reduced-motion: reduce) {',
  '  .gallery { scroll-snap-type: none; scroll-behavior: auto; }',
  '  .gallery > section { scroll-snap-align: none; }',
  '}',
].join('\n')

const JS_SNIPPET = [
  'const track = /* the scroll container */',
  'const panels = [...track.querySelectorAll("[data-panel]")]',
  '',
  '/* the dots read state from the scroller, they do not drive it */',
  'const io = new IntersectionObserver((entries) => {',
  '  for (const entry of entries) {',
  '    if (!entry.isIntersecting) continue',
  '    setActive(Number(entry.target.dataset.panel))',
  '  }',
  '}, { root: track, threshold: 0.55 })',
  '',
  'panels.forEach((panel) => io.observe(panel))',
  'return () => io.disconnect()',
].join('\n')

const T = {
  eyebrow: { zh: '现场 · 滚动捕捉', en: 'LIVE · SCROLL SNAP' },
  title: { zh: '滚一下，正好停在一节开头', en: 'One flick, one panel' },
  lede: {
    zh: '这一页只有一个滚动容器：它比屏幕高正好一倍。上下滚动，面板会自己对齐到边界；右侧的圆点告诉你停在第几节。',
    en: 'This page is one scroll container, exactly one viewport tall. Scroll and each panel settles on its own edge; the dots on the right show which one you are on.',
  },
  hint: { zh: '滚动 · 或点右侧圆点', en: 'Scroll — or tap a dot' },
  heroNote: {
    zh: '为什么必须整页：吸附是容器和子项的约定。放进一个 600px 高的盒子里，你只能看到「它好像会吸一下」，看不到它和视口高度、和指示点、和键盘翻页之间的关系——而它出问题，几乎总是出在这些关系上。',
    en: 'Why the whole page: snapping is a contract between a container and its children. Inside a 600px box you only see that it sort of clicks; you cannot see how it relates to viewport height, to the dots, or to keyboard paging — and that is where it breaks.',
  },
  panels: [
    {
      id: 'principle',
      label: { zh: '原理', en: 'Mechanics' },
      title: { zh: '两行 CSS，各管一半', en: 'Two declarations, two owners' },
      figure: ['container: snap-type', 'child: snap-align', 'snap-stop: always'],
      body: {
        zh: 'scroll-snap-type 写在滚动容器上，声明轴和严格程度；scroll-snap-align 写在每一节上，声明停在哪条边。写在容器上的 align 不生效，写在子项上的 type 也不生效——这是最常见的失败，看起来「加了但没反应」。start 表示子项的上边缘对齐容器上边缘，center 和 end 也一样按各自的边对齐。',
        en: 'scroll-snap-type goes on the scroll container and declares the axis and strictness; scroll-snap-align goes on each panel and declares which edge stops. An align on the container does nothing, and a type on a child does nothing — the most common failure, where it looks added but never reacts. start aligns the child top with the container top, and center and end follow their own edges.',
      },
    },
    {
      id: 'when',
      label: { zh: '边界', en: 'Limits' },
      title: { zh: 'mandatory 只在容器等于视口时老实', en: 'mandatory behaves only when the container is the viewport' },
      figure: ['panel > container?', 'content gets pinned', 'use proximity'],
      body: {
        zh: 'mandatory 的意思是「不许停在两节之间」。如果某一节比容器还高，它的尾部就会被永久藏住：你滚到可滚的尽头，浏览器还是会把这一节的开头吸回来。纵向全屏分节用它没问题；一屏放不下的长文章就别用 mandatory，改用 proximity，让它在附近才吸。容器也必须有确定的高度和 overflow，否则根本没有可吸附的滚动。',
        en: 'mandatory means never rest between panels. If one panel is taller than the container, its tail is permanently unreachable: you scroll to the end and the browser still pulls the panel start back. It is fine for full-screen vertical sections; for a long article that does not fit one screen, use proximity so it only snaps when close. The container also needs a definite height and overflow, or there is no scroll to snap.',
      },
    },
    {
      id: 'dots',
      label: { zh: '指示点', en: 'The dots' },
      title: { zh: '圆点读状态，不驱动状态', en: 'The dots read the state, they do not drive it' },
      figure: ['IO root = track', 'threshold 0.55', 'click = scrollTo'],
      body: {
        zh: '指示点应该是滚动的镜子，不是第二套真相。用 IntersectionObserver 以容器为 root、阈值 0.55 观察每一节，谁过半谁就是当前节，点击时再 scrollTo 到那一节的 offsetTop。要留神两件事：吸附只作用在滚动容器内部，页面上那些 position: fixed 的元素不参与；键盘用户按 PageDown 走的是原生滚动，不会替你调 scrollTo，所以别把导航只做成鼠标能用的圆点。',
        en: 'Dots should mirror the scroll, not become a second source of truth. Observe each panel with an IntersectionObserver rooted at the container, threshold 0.55, so whichever is past half becomes current, and on click scrollTo that panel offsetTop. Two things to watch: snapping only applies inside the scroll container and never to position: fixed elements, and PageDown uses native scrolling rather than your scrollTo — so do not make the dots the only way to navigate.',
      },
    },
    {
      id: 'reduced',
      label: { zh: '降级', en: 'Fallback' },
      title: { zh: '吸附不是动画，平滑滚动才是', en: 'Snapping is not motion; smooth scrolling is' },
      figure: ['snap: keep or drop?', 'behavior: auto', 'never trap focus'],
      body: {
        zh: '吸附本身不产生位移，但它经常和 scroll-behavior: smooth 绑在一起，而平滑滚动确实是动画。系统要求减少动态时，把 scroll-behavior 改成 auto——瞬间跳过去，节的结构还在。要不要连吸附一起去掉，看你的取舍：这一页选择一起去掉，退回普通滚动，因为强制吸附会让惯性的滚动变得难以预测。',
        en: 'Snapping itself does not move anything, but it is usually paired with scroll-behavior: smooth, and smooth scrolling is motion. When the system asks for reduced motion, set scroll-behavior to auto — an instant jump keeps the section structure. Whether to drop snapping too is a judgement call: this page drops it and falls back to plain scrolling, because forced snapping makes inertial scrolling unpredictable.',
      },
    },
  ] as const,
  paramsTitle: { zh: '推荐取值', en: 'Recommended values' },
  params: [
    { label: { zh: '严格程度', en: 'Strictness' }, value: { zh: '全屏分节用 mandatory，其它用 proximity', en: 'mandatory for full-screen sections, proximity elsewhere' } },
    { label: { zh: '对齐边', en: 'Alignment' }, value: 'snap-align: start' },
    { label: { zh: '留白', en: 'Padding' }, value: 'scroll-padding: 12–24px' },
    { label: { zh: '快速滑动', en: 'Fast flick' }, value: 'scroll-snap-stop: always' },
    { label: { zh: '面板高度', en: 'Panel height' }, value: { zh: '不超过容器', en: 'no taller than the container' } },
    { label: { zh: '降级', en: 'Fallback' }, value: { zh: 'scroll-behavior: auto，可选去掉吸附', en: 'scroll-behavior: auto, snapping optional' } },
  ],
  codeTitle: { zh: '这一页实际在用的', en: 'What this page actually runs' },
  codeNote: {
    zh: '容器负责 snap-type 与 overflow，面板负责 snap-align；圆点用 IntersectionObserver 反向读书数。',
    en: 'The container owns snap-type and overflow, panels own snap-align, and the dots read the position back through an IntersectionObserver.',
  },
  reducedNote: {
    zh: '如果系统开了减少动态，这一页的吸附会被关掉、平滑滚动改成瞬时：变成普通的上下滚动，节还在，只是不再自己对齐。',
    en: 'If reduced motion is on, snapping is turned off here and smooth scrolling becomes instant: plain vertical scrolling, sections intact, no automatic alignment.',
  },
  back: { zh: '回到词条：滚动捕捉', en: 'Back to the entry: Scroll Snap' },
} as const

export default function LiveScrollSnap() {
  const locale = useLocale()
  const reduced = usePrefersReducedMotion()
  const track = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const root = track.current
    if (!root || typeof IntersectionObserver === 'undefined') return
    const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-panel]'))
    if (panels.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const index = Number(entry.target.getAttribute('data-panel'))
          if (!Number.isNaN(index)) setActive(index)
        }
      },
      { root, threshold: 0.55 },
    )
    panels.forEach((panel) => observer.observe(panel))
    return () => observer.disconnect()
  }, [])

  function goTo(index: number) {
    const root = track.current
    if (!root) return
    const target = root.querySelector<HTMLElement>('[data-panel="' + index + '"]')
    if (!target) return
    const top = target.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop
    root.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
  }

  const total = T.panels.length + 2

  return (
    <div className="relative bg-canvas pb-28">
      <style>{CSS_TEXT}</style>

      <div className="relative">
        <div ref={track} className="live-ss-track">
          <section
            data-panel={0}
            aria-label={pick(T.title, locale)}
            className="live-ss-panel flex flex-col justify-center gap-5 px-5 py-14 sm:px-8"
          >
            <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-5">
              <div className="flex items-baseline justify-between gap-4">
                <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
                <span className="font-mono text-[10px] text-muted">
                  {'01 / 0' + total}
                </span>
              </div>
              <h2 className="max-w-[20ch] font-display text-display font-semibold leading-[1.04] text-ink">
                {pick(T.title, locale)}
              </h2>
              <p className="max-w-[52ch] text-body text-ink-2">{pick(T.lede, locale)}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-line py-3">
                <span className="label-mono">{pick(T.hint, locale)}</span>
                <span className="font-mono text-[10px] text-muted">
                  scroll-snap-type: y mandatory
                </span>
              </div>
              <p className="max-w-[56ch] border-l-2 border-accent pl-4 text-caption text-ink-2">
                {pick(T.heroNote, locale)}
              </p>
            </div>
          </section>

          {T.panels.map((panel, index) => (
            <section
              key={panel.id}
              data-panel={index + 1}
              aria-labelledby={'live-ss-panel-' + panel.id}
              className="live-ss-panel flex flex-col justify-center px-5 py-14 sm:px-8"
            >
              <div className="mx-auto grid w-full max-w-[88rem] gap-6 md:grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,15rem)] md:gap-10">
                <div className="flex items-baseline gap-3 md:flex-col md:gap-2">
                  <span aria-hidden="true" className="font-display text-h1 leading-none text-line-strong">
                    {'0' + (index + 2)}
                  </span>
                  <span className="label-mono text-muted">{pick(panel.label, locale)}</span>
                </div>
                <div className="flex max-w-[58ch] flex-col gap-3">
                  <h2 id={'live-ss-panel-' + panel.id} className="font-display text-h2 text-ink">
                    {pick(panel.title, locale)}
                  </h2>
                  <p className="text-body text-ink-2">{pick(panel.body, locale)}</p>
                </div>
                <pre className="self-start overflow-x-auto border-l-2 border-accent pl-3 font-mono text-[10px] leading-relaxed text-muted">
                  {panel.figure.join('\n')}
                </pre>
              </div>
            </section>
          ))}

          <section
            data-panel={total - 1}
            aria-label={pick(T.codeTitle, locale)}
            className="live-ss-panel flex flex-col justify-center px-5 py-14 sm:px-8"
          >
            <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-4">
              <div className="flex items-baseline justify-between gap-3 border-b-2 border-ink pb-3">
                <h2 className="font-display text-h2 text-ink">{pick(T.codeTitle, locale)}</h2>
                <span className="label-mono">L-05</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
                  {SNIPPET}
                </pre>
                <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
                  {JS_SNIPPET}
                </pre>
              </div>
              <p className="max-w-[62ch] text-caption text-ink-2">{pick(T.codeNote, locale)}</p>
              <p className="max-w-[62ch] text-caption text-muted">{pick(T.reducedNote, locale)}</p>
              <div className="grid gap-2 border-t border-line pt-4 sm:grid-cols-2">
                {T.params.map((row) => (
                  <div key={row.label.zh} className="flex items-baseline gap-3">
                    <span className="label-mono w-20 shrink-0">{pick(row.label, locale)}</span>
                    <span className="text-caption text-ink">
                      {typeof row.value === 'string' ? row.value : pick(row.value, locale)}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                to={entryPath('scroll-snap')}
                className="text-link self-start font-mono text-[11px] text-accent no-underline"
              >
                {pick(T.back, locale)} →
              </Link>
            </div>
          </section>
        </div>

        <nav
          aria-label={pick({ zh: '分节导航', en: 'Section navigation' }, locale)}
          className="absolute right-2 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-2 sm:flex"
        >
          {Array.from({ length: total }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-current={active === index ? 'true' : undefined}
              aria-label={pick({ zh: '跳到第 ' + (index + 1) + ' 节', en: 'Go to section ' + (index + 1) }, locale)}
              className={
                'flex items-center gap-2 font-mono text-[10px] transition-colors ' +
                (active === index ? 'text-accent' : 'text-muted hover:text-ink')
              }
            >
              <span className="hidden md:inline">{'0' + (index + 1)}</span>
              <span
                aria-hidden="true"
                className={
                  'h-[2px] transition-all ' +
                  (active === index ? 'w-8 bg-accent' : 'w-4 bg-line-strong')
                }
              />
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
