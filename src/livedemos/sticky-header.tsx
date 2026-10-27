import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { usePrefersReducedMotion } from '../lib/motion'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * 整页版「粘性头部」：这一页自己就是那条长页面。
 *
 * 演示里的三个决定都在真实代码里：方向靠比较这一帧与上一帧的 scrollY；
 * 阈值取头部高度再加 48px，刚滚几像素不会藏；高度在挂载时读一次、
 * 变化交给 ResizeObserver，滚动回调里只读 scrollY，不读布局。
 * 减少动态时头部常驻——「藏起来」本身就是位移。
 */

const T = {
  eyebrow: { zh: '现场 · 粘性头部', en: 'LIVE · STICKY HEADER' },
  title: { zh: '它只在你往回滚的时候回来', en: 'It comes back only when you scroll up' },
  lede: {
    zh: '这一页没有演示框。顶部那条栏就是演示：往下滚过头部高度加 48px，它让位给内容；往回滚，它立刻回来；滚回页首，它一定在。',
    en: 'There is no demo box on this page. The bar at the top is the demo: scroll down past the header height plus 48px and it yields to the content; scroll back up and it returns; back at the top, it is always there.',
  },
  hint: { zh: '往下滚一段，再往回滚', en: 'Scroll down a while, then reverse' },
  statusTitle: { zh: '这条栏的读数', en: 'Readout of the bar' },
  statusTop: { zh: '页首', en: 'At top' },
  statusStuck: { zh: '吸顶', en: 'Pinned' },
  statusHidden: { zh: '已隐藏', en: 'Hidden' },
  statusReduced: { zh: '常驻（减少动态）', en: 'Resident (reduced motion)' },
  labelY: { zh: 'scrollY', en: 'scrollY' },
  labelDir: { zh: '方向', en: 'Direction' },
  labelState: { zh: '状态', en: 'State' },
  labelThreshold: { zh: '隐藏阈值', en: 'Hide threshold' },
  labelHeight: { zh: '头部高度', en: 'Header height' },
  dirDown: { zh: '向下', en: 'Down' },
  dirUp: { zh: '向上', en: 'Up' },
  dirStill: { zh: '静止', en: 'Still' },
  thresholdNote: { zh: '头部高度 + 48px', en: 'header height + 48px' },
  readoutNote: {
    zh: '读数每帧更新，但滚动回调里只读 scrollY 和一个缓存的高度。隐藏只写 transform，不写 display。',
    en: 'The readout updates every frame, but the scroll callback reads only scrollY and one cached height. Hiding writes transform, never display.',
  },
  reducedNote: {
    zh: '已按系统设置减少动态：头部常驻，只保留吸顶后的底色与边框。',
    en: 'Reduced motion is on: the bar stays resident, keeping only the background and border it gains after sticking.',
  },
  anchorsLabel: { zh: '页内章节', en: 'Sections on this page' },
  chapters: { zh: '第 {n} 节', en: 'Section {n}' },
  sections: [
    {
      title: { zh: '吸顶不是固定', en: 'Sticky is not fixed' },
      figure: { zh: ['position: sticky;', 'top: 0;', '（仍占文档流）'], en: ['position: sticky;', 'top: 0;', '(still in flow)'] },
      body: {
        zh: 'position: fixed 把头部从文档流里拿走，下面的内容会顶上来，你得手动补一段 padding；position: sticky 还占着原来的位置，滚过 top 的值才吸附，父容器一结束就跟着离开。导航栏要的是后者：先跟着内容走，到了顶部才停住。',
        en: 'position: fixed takes the header out of flow, so the content underneath jumps up and you have to pad it back. position: sticky keeps its place in flow, sticks only after the scroll crosses the top offset, and leaves as soon as its container ends. A nav bar wants the latter: it travels with the content first and only stops at the top.',
      },
    },
    {
      title: { zh: '方向靠比较，不靠猜', en: 'Direction is a comparison, not a guess' },
      figure: { zh: ['goingDown = y > lastY', 'y > headerHeight + 48', '只在状态变化时 setState'], en: ['goingDown = y > lastY', 'y > headerHeight + 48', 'setState only on change'] },
      body: {
        zh: '判断「在往下滚」只要比较这一帧和上一帧的 scrollY，不读速度，也不猜惯性。再叠两个门槛：方向成立、且位置超过头部高度加 48px，才允许隐藏。刚滚一两个像素就藏，页面会像在抖。',
        en: 'Detecting "scrolling down" only compares this frame scrollY with the previous one; no velocity, no inertia guess. Two gates sit on top: the direction must hold, and the position must exceed the header height plus 48px before hiding is allowed. Hiding after a pixel or two makes the page look like it is twitching.',
      },
    },
    {
      title: { zh: '高度缓存起来，滚动里不读布局', en: 'Cache the height, never measure while scrolling' },
      figure: { zh: ['offsetHeight（挂载时一次）', 'ResizeObserver（尺寸变化时）', 'scroll 回调里只读 scrollY'], en: ['offsetHeight (once on mount)', 'ResizeObserver (on resize)', 'scroll callback reads scrollY only'] },
      body: {
        zh: '阈值要用头部的真实高度，而 offsetHeight 是一次强制布局。挂载时读一次存进 ref，之后的尺寸变化交给 ResizeObserver；滚动回调里只读 scrollY 与缓存值，一帧最多写一次 transform。',
        en: 'The threshold needs the real header height, and offsetHeight forces a layout. Read it once on mount into a ref, hand later size changes to ResizeObserver, and let the scroll callback read only scrollY and the cached value: at most one transform write per frame.',
      },
    },
    {
      title: { zh: '该停手的时候', en: 'When to leave it alone' },
      figure: { zh: ['减少动态', '键盘聚焦', '短页'], en: ['reduced motion', 'keyboard focus', 'short pages'] },
      body: {
        zh: '这一条栏有三个不该动的时刻，下面三块各自说明。它们的共同点是：隐藏是给阅读让位，不是给页面加戏；一旦让位伤害了可用性，就该退回常驻。',
        en: 'This bar has three moments when it should not move, covered by the three panels below. They share one reason: hiding yields space to reading rather than adding drama, and once that yield hurts usability the bar should fall back to resident.',
      },
    },
    {
      title: { zh: '和别的 sticky 效果分界', en: 'Where it borders other sticky effects' },
      figure: { zh: ['导航：藏不藏', '内容：堆不堆', '进度：读多少'], en: ['navigation: hide?', 'content: stack?', 'progress: read?'] },
      body: {
        zh: '同一个 position: sticky 能做出几种完全不同的东西，区别不在属性，在它管什么。这条栏管导航是否让位；别的效果管内容怎么叠、进度怎么读。',
        en: 'One position: sticky can produce several different things; the difference is not the property but what the element governs. This bar governs whether navigation yields; other effects govern how content stacks or how progress is read.',
      },
    },
  ],
  guards: [
    {
      code: 'R-01',
      title: { zh: '减少动态：不做隐藏', en: 'Reduced motion: no hiding' },
      body: {
        zh: '「藏起来」本身就是位移。prefers-reduced-motion 下让它常驻：吸顶后的底色和边框照旧，位移取消，导航仍然可用。',
        en: 'Hiding is itself a translation. Under prefers-reduced-motion keep it resident: the background and border after sticking stay, the translation goes, and navigation still works.',
      },
    },
    {
      code: 'R-02',
      title: { zh: '键盘聚焦要强制露出', en: 'Keyboard focus forces a reveal' },
      body: {
        zh: '如果头部正好藏着，Tab 进来的焦点会落在看不见的地方。监听 focusin 立刻展开，并且在焦点离开之前不要再藏。',
        en: 'If the bar happens to be hidden, Tab lands its focus somewhere invisible. Listen for focusin, reveal immediately, and do not hide again while focus is inside.',
      },
    },
    {
      code: 'R-03',
      title: { zh: '短页就别用', en: 'Do not use it on short pages' },
      body: {
        zh: '隐藏换来的阅读空间只在长文里成立。撑不满两屏的页面里头部一直在，藏了又马上回，只会让页面闪一下。',
        en: 'The reading space won by hiding only exists on long pages. On a page shorter than two screens the bar is always there; hiding and instantly returning just makes it flicker.',
      },
    },
  ],
  compareTitle: { zh: '同为 sticky，管的事不同', en: 'Same property, different job' },
  compareRows: [
    {
      name: 'sticky-header',
      does: { zh: '导航：按滚动方向决定藏不藏', en: 'Navigation: hide or reveal by scroll direction' },
    },
    {
      name: 'sticky-stack',
      does: { zh: '内容：一块块叠在视口里', en: 'Content: panels stacking inside the viewport' },
    },
    {
      name: 'scroll-driven',
      does: { zh: '内容：形态由滚动进度决定', en: 'Content: shape driven by scroll progress' },
    },
    {
      name: 'scroll-progress',
      does: { zh: '读数：顶部一条进度线', en: 'Readout: a progress line at the top' },
    },
  ],
  paramsTitle: { zh: '推荐取值', en: 'Recommended values' },
  params: [
    { label: { zh: '隐藏阈值', en: 'Hide threshold' }, value: 'header + 24–48px' },
    { label: { zh: '隐藏时长', en: 'Hide duration' }, value: '200–300ms ease-out' },
    { label: { zh: '隐藏方式', en: 'Hide mechanism' }, value: 'transform: translateY(-100%)' },
    { label: { zh: '方向判定', en: 'Direction test' }, value: { zh: '当前与上一次次 scrollY 比较', en: 'current vs previous scrollY' } },
    { label: { zh: '吸顶底色', en: 'Stuck background' }, value: { zh: '半透明 canvas + 模糊 + 下边框', en: 'translucent canvas + blur + bottom border' } },
  ],
  codeTitle: { zh: '这一页实际在用的', en: 'What this page actually uses' },
  codeNote: {
    zh: '两段合起来才是完整的：JS 只决定 hidden 这个状态，位移交给 CSS。减少动态的那条规则让状态还在、位移消失。',
    en: 'The two halves only work together: the JS decides the hidden state, CSS owns the translation. The reduced-motion rule keeps the state while dropping the motion.',
  },
  back: { zh: '回到词条：粘性头部', en: 'Back to the entry: Sticky Header' },
  hiddenChip: { zh: '已隐藏', en: 'hidden' },
} as const

const SNIPPET = [
  'const lastY = useRef(0)',
  'const onScroll = () => {',
  '  if (frame) return',
  '  frame = requestAnimationFrame(() => {',
  '    frame = 0',
  '    const y = window.scrollY',
  '    const down = y > lastY.current',
  '    setHidden(down && y > headerHeight + 48)',
  '    lastY.current = y',
  '  })',
  '}',
  '',
  '.site-header {',
  '  position: sticky;',
  '  top: 0;',
  '  transition: transform 250ms ease-out;',
  '}',
  '',
  '.site-header[data-hidden="true"] {',
  '  transform: translateY(-100%);',
  '}',
  '',
  '@media (prefers-reduced-motion: reduce) {',
  '  .site-header[data-hidden="true"] {',
  '    transform: none;',
  '  }',
  '}',
].join('\n')

const SECTION_IDS = T.sections.map((_, index) => 'live-sh-section-' + index)

export default function StickyHeaderLive() {
  const locale = useLocale()
  const reduced = usePrefersReducedMotion()
  const [hidden, setHidden] = useState(false)
  const [stuck, setStuck] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)
  const headerHeightRef = useRef(0)
  const lastYRef = useRef(0)
  const yRef = useRef<HTMLSpanElement | null>(null)
  const dirRef = useRef<HTMLSpanElement | null>(null)
  const stateRef = useRef<HTMLSpanElement | null>(null)
  const headerStateRef = useRef<HTMLSpanElement | null>(null)
  const heightRef = useRef<HTMLSpanElement | null>(null)
  const revealRef = useRef(0)

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const labelDown = pick(T.dirDown, locale)
    const labelUp = pick(T.dirUp, locale)
    const labelStill = pick(T.dirStill, locale)
    const labelTop = pick(T.statusTop, locale)
    const labelStuck = pick(T.statusStuck, locale)
    const labelHidden = pick(T.statusHidden, locale)
    const labelReduced = pick(T.statusReduced, locale)

    const syncHeight = () => {
      headerHeightRef.current = header.offsetHeight
      if (heightRef.current) heightRef.current.textContent = headerHeightRef.current + 'px'
    }
    syncHeight()

    let frame = 0
    const apply = () => {
      frame = 0
      const y = Math.round(window.scrollY)
      const lastY = lastYRef.current
      const threshold = headerHeightRef.current + 48
      const goingDown = y > lastY + 1
      const goingUp = y < lastY - 1
      const nextHidden = !reduced && y > 4 && goingDown && y > threshold && Date.now() >= revealRef.current
      const nextStuck = y > 4
      const dirLabel = goingDown ? labelDown : goingUp ? labelUp : labelStill

      setHidden((prev) => (prev === nextHidden ? prev : nextHidden))
      setStuck((prev) => (prev === nextStuck ? prev : nextStuck))

      const stateLabel = reduced ? labelReduced : y <= 4 ? labelTop : nextHidden ? labelHidden : labelStuck
      if (yRef.current) yRef.current.textContent = String(y)
      if (dirRef.current) dirRef.current.textContent = dirLabel
      if (stateRef.current) stateRef.current.textContent = stateLabel
      if (headerStateRef.current) headerStateRef.current.textContent = stateLabel
      lastYRef.current = y
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(apply)
    }
    const onFocusIn = () => {
      // 焦点进入头部时永远先露出，否则焦点会落在看不见的位置
      setHidden(false)
      revealRef.current = Date.now() + 600
      lastYRef.current = window.scrollY
    }

    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('focusin', onFocusIn)
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
      syncHeight()
      apply()
    }) : null
    observer?.observe(header)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('focusin', onFocusIn)
      observer?.disconnect()
    }
  }, [locale, reduced])

  // 点页内锚点是一次向下的跳转；跳完立刻藏起来会让人找不到刚用过的导航
  const onAnchorClick = () => {
    revealRef.current = Date.now() + 600
  }

  const headerStyle = {
    transform: reduced || !hidden ? 'translateY(0)' : 'translateY(-100%)',
    backgroundColor: stuck ? 'color-mix(in srgb, var(--canvas) 88%, transparent)' : 'transparent',
    borderBottomColor: stuck ? 'var(--line)' : 'transparent',
    backdropFilter: stuck ? 'blur(10px)' : 'none',
    WebkitBackdropFilter: stuck ? 'blur(10px)' : 'none',
  } as const

  return (
    <div className="relative bg-canvas pb-28">
      <header
        ref={headerRef}
        style={headerStyle}
        className="sticky top-0 z-40 border-b transition-[transform,background-color,border-color] duration-[250ms] ease-out motion-reduce:transition-none"
      >
        <div className="mx-auto flex w-full max-w-[88rem] items-center gap-3 px-5 py-3 sm:gap-6 sm:px-8">
          <p className="shrink-0 font-display text-h3 leading-none text-ink">
            Design Museum
          </p>
          <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-muted sm:inline">
            index
          </span>
          <nav
            aria-label={pick(T.anchorsLabel, locale)}
            className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto font-mono text-[11px] sm:justify-end sm:gap-5"
          >
            {T.sections.map((section, index) => (
              <a
                key={section.title.zh}
                href={'#' + SECTION_IDS[index]}
                onClick={onAnchorClick}
                className="shrink-0 text-ink-2 no-underline hover:text-accent"
              >
                {'0' + (index + 1)}
              </a>
            ))}
          </nav>
          <span
            ref={headerStateRef}
            className="hidden shrink-0 border border-line px-1.5 py-0.5 font-mono text-[10px] text-accent md:inline"
          >
            {reduced ? pick(T.statusReduced, locale) : pick(T.statusTop, locale)}
          </span>
        </div>
      </header>

      <section aria-label={pick(T.title, locale)} className="flex min-h-[92svh] items-center px-5 py-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-[88rem] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-center">
          <div className="flex flex-col gap-5">
            <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
            <h2 className="max-w-[16ch] font-display text-display font-semibold leading-[1.05] text-ink">
              {pick(T.title, locale)}
            </h2>
            <p className="max-w-[56ch] text-body text-ink-2">{pick(T.lede, locale)}</p>
            <p className="mt-2 flex items-center gap-2 font-mono text-[11px] text-muted">
              <span aria-hidden="true" className="inline-block h-2 w-2 bg-accent" />
              {pick(T.hint, locale)} ↓
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm border border-line-strong bg-raised p-6">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                <span>{pick(T.statusTitle, locale)}</span>
                <span className="stamp">L-01</span>
              </div>
              <dl className="mt-5 flex flex-col">
                <div className="flex items-baseline justify-between border-b border-line py-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {pick(T.labelY, locale)}
                  </dt>
                  <dd className="font-mono text-[13px] text-ink">
                    <span ref={yRef}>0</span>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-b border-line py-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {pick(T.labelDir, locale)}
                  </dt>
                  <dd ref={dirRef} className="font-mono text-[13px] text-ink">
                    {pick(T.dirStill, locale)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-b border-line py-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {pick(T.labelState, locale)}
                  </dt>
                  <dd ref={stateRef} className="font-mono text-[13px] text-accent">
                    {reduced ? pick(T.statusReduced, locale) : pick(T.statusTop, locale)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-b border-line py-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {pick(T.labelHeight, locale)}
                  </dt>
                  <dd className="font-mono text-[13px] text-ink">
                    <span ref={heightRef}>—</span>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between py-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {pick(T.labelThreshold, locale)}
                  </dt>
                  <dd className="font-mono text-[13px] text-ink">{pick(T.thresholdNote, locale)}</dd>
                </div>
              </dl>
              <p className="mt-4 border-t border-line pt-3 text-caption text-muted">
                {pick(T.readoutNote, locale)}
              </p>
              {reduced ? (
                <p className="mt-3 text-caption text-accent">{pick(T.reducedNote, locale)}</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {T.sections.map((section, index) => (
        <section
          key={section.title.zh}
          id={SECTION_IDS[index]}
          aria-labelledby={SECTION_IDS[index] + '-title'}
          className="flex min-h-[62vh] scroll-mt-20 items-center px-5 py-16 sm:px-8"
        >
          <div className="mx-auto grid w-full max-w-[88rem] gap-6 border-t border-line pt-6 md:grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,15rem)] md:gap-10">
            <div className="flex items-baseline gap-3 md:flex-col md:gap-2">
              <span aria-hidden="true" className="font-display text-h1 leading-none text-line-strong">
                {'0' + (index + 1)}
              </span>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                {pick(T.chapters, locale).replace('{n}', '0' + (index + 1))}
              </p>
            </div>
            <div className="flex max-w-[58ch] flex-col gap-3">
              <h2 id={SECTION_IDS[index] + '-title'} className="font-display text-h2 text-ink">
                {pick(section.title, locale)}
              </h2>
              <p className="text-body text-ink-2">{pick(section.body, locale)}</p>
            </div>
            <pre className="self-start overflow-x-auto border-l-2 border-accent pl-3 font-mono text-[10px] leading-relaxed text-muted">{(locale === 'en' ? section.figure.en : section.figure.zh).join('\n')}</pre>
            {index === 3 ? (
              <div className="grid gap-3 sm:grid-cols-3 md:col-span-2 md:col-start-2">
                {T.guards.map((guard) => (
                  <div key={guard.code} className="flex flex-col gap-2 border border-line bg-surface p-4">
                    <div className="flex items-center justify-between">
                      <span className="label-mono">{pick(guard.title, locale)}</span>
                      <span className="stamp">{guard.code}</span>
                    </div>
                    <p className="text-caption text-ink-2">{pick(guard.body, locale)}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ))}

      <section aria-label={pick(T.compareTitle, locale)} className="px-5 py-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-[88rem] gap-6 border-t border-line pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-h2 text-ink">{pick(T.compareTitle, locale)}</h2>
            <div className="flex flex-col">
              {T.compareRows.map((row) => (
                <div
                  key={row.name}
                  className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-4 border-b border-line py-3"
                >
                  <span className="font-mono text-[11px] text-ink">{row.name}</span>
                  <span className="text-caption text-ink-2">{pick(row.does, locale)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-h3 text-ink">{pick(T.paramsTitle, locale)}</h2>
            <dl className="flex flex-col">
              {T.params.map((row) => (
                <div
                  key={row.label.zh}
                  className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-line py-2.5"
                >
                  <dt className="label-mono">{pick(row.label, locale)}</dt>
                  <dd className="text-caption text-ink">
                    {typeof row.value === 'string' ? row.value : pick(row.value, locale)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section aria-label={pick(T.codeTitle, locale)} className="px-5 py-20 pb-28 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-5">
          <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
            <h2 className="font-display text-h3 text-ink">{pick(T.codeTitle, locale)}</h2>
            <span className="label-mono">
              {reduced ? 'reduced-motion' : hidden ? 'hidden 1' : 'hidden 0'}
            </span>
          </div>
          <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
            {SNIPPET}
          </pre>
          <div className="flex flex-col gap-3">
            <p className="max-w-[70ch] text-caption text-ink-2">{pick(T.codeNote, locale)}</p>
            <Link
              to={entryPath('sticky-header')}
              className="text-link self-start font-mono text-[11px] text-accent no-underline"
            >
              {pick(T.back, locale)} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
