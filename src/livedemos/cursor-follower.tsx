import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { usePrefersReducedMotion } from '../lib/motion'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * 整页版「光标跟随」。
 *
 * 页面本身就是场：一个朱红圆环用指数平滑滞后跟随系统指针，一个实心小点标出
 * 指针的真实位置；靠近下方四个热点时圆环放大、标签展开。系统光标保留。
 *
 * 降级三条线：
 * - 粗指针 / 触屏：不挂 pointermove，不渲染圆环，热点仍是普通链接；
 * - prefers-reduced-motion：跟随关闭，内容静态可读；
 * - 键盘：Tab 到热点时 :focus-visible 边框与标签展开，反馈与指针状态一致。
 *
 * 性能：pointermove passive + rAF；坐标与热点矩形缓存在 ref 里，事件里不读布局。
 */

const T = {
  eyebrow: { zh: '现场演示 · 指针', en: 'Live demo · Pointer' },
  title: { zh: '指针走了，第二层还在路上', en: 'The pointer moves; a second layer arrives late' },
  lede: {
    zh: '整页都是场：朱红圆环以约 90ms 的滞后跟着系统指针，靠近下面四个热点时放大；一个小实心点标出指针此刻的真实位置，所以你不会失去准头。',
    en: 'The whole page is the field: an accent ring trails the native pointer by about 90ms and scales up near the four hotspots below, while a small solid dot marks where the pointer actually is so you never lose aim.',
  },
  lede2: {
    zh: '系统光标保留。这一页不拿可读性和点得准去换一个更大的指针。',
    en: 'The native cursor stays. This page does not trade readability or click accuracy for a bigger pointer.',
  },
  statusFine: { zh: '跟随开启 · 系统光标保留 · 只写 transform', en: 'Following · native cursor kept · transform only' },
  statusCoarse: { zh: '粗指针或触屏：不挂跟随监听，下面是静态说明', en: 'Coarse pointer or touch: no follow listener installed; static notes below' },
  statusReduced: { zh: '减少动态：跟随关闭，内容静态可读', en: 'Reduced motion: follower off; everything static and readable' },
  statusPending: { zh: '正在检测指针能力', en: 'Checking pointer capabilities' },
  hintMove: { zh: '移动指针试试', en: 'Move the pointer' },
  hintFollowing: { zh: '跟随中 · 靠近热点会放大', en: 'Following · hotspots scale on approach' },
  layersLabel: { zh: '两层指针', en: 'Two layers' },
  diagramNote: {
    zh: '虚线是指针现在的位置，朱红圆环还在路上。',
    en: 'The dashed circle is where the pointer is now; the accent ring is still catching up.',
  },
  layerNative: { zh: '系统光标', en: 'Native cursor' },
  layerRing: { zh: '跟随圆环', en: 'Follower ring' },
  fieldTitle: { zh: '热点', en: 'Hotspots' },
  fieldNote: {
    zh: '指针靠近，圆环放大、标签展开；键盘用户按 Tab 到热点，也有同样的展开。热点之外的空白同样属于场。',
    en: 'Approach a hotspot and the ring scales up while its label opens; keyboard users get the same label when Tab reaches it. The empty space between hotspots is part of the field too.',
  },
  hotspotTag: { zh: '可观测对象', en: 'Observable' },
  openEntry: { zh: '打开词条', en: 'Open entry' },
  whyTitle: { zh: '指针是页面的，不是盒子的', en: 'The pointer belongs to the page, not a box' },
  whyBody: {
    zh: '把光标跟随放进 300px 演示框，指针一出框圆环就停在边上，再往里就看不见了。这个效果的比例尺是整页：指针在哪，第二层就跟到哪。',
    en: 'Put a cursor follower inside a 300px demo box and the ring freezes on the edge as soon as the pointer leaves; push further and it is gone. The scale of this effect is the page: wherever the pointer goes, the second layer follows.',
  },
  whenTitle: { zh: '值得用', en: 'Worth it' },
  whenList: [
    { zh: '作品集、品牌页、发布页这类「看」的页面：指针本身可以成为设计的一部分。', en: 'Portfolios, brand pages and launches, the kind of page people look at: the pointer itself can be part of the design.' },
    { zh: '画布、画廊、地图：需要一个比系统箭头更大的当前位置指示。', en: 'Canvas, galleries and maps: you need a current-position indicator larger than the system arrow.' },
    { zh: '已经有一套指针驱动的效果（磁吸、聚光）：用同一个圆环把它们统一起来。', en: 'There is already a pointer-driven set of effects (magnetic, spotlight): one ring can unify them.' },
  ],
  whenNotTitle: { zh: '不要用', en: 'Not worth it' },
  whenNotList: [
    { zh: '表单、后台、密集操作：任何遮挡与额外运动都是干扰。', en: 'Forms, admin panels and dense operations: any occlusion or extra motion is interference.' },
    { zh: '以阅读、文本框选为主的页面：圆环会挡字，也会误触。', en: 'Pages built for reading and selecting text: the ring covers glyphs and invites mis-clicks.' },
    { zh: '触屏或混合设备为主：没有精细指针，跟随无从谈起。', en: 'Mostly touch or hybrid devices: without a fine pointer there is nothing to follow.' },
    { zh: '把系统光标藏掉却没做 :focus-visible：键盘用户会失去位置感。', en: 'The native cursor is hidden without :focus-visible: keyboard users lose their place.' },
  ],
  perfTitle: { zh: '性能与降级', en: 'Performance and fallback' },
  perfBody1: {
    zh: 'pointermove 用 passive 监听，事件里只更新一个坐标对象；所有 transform 写入都放进 requestAnimationFrame，并且指针停下后循环自动停。热点矩形的测量只发生在挂载、resize 和字体加载之后——pointermove 里不做任何布局读取。',
    en: 'The pointermove listener is passive and only writes a coordinate object; every transform write happens inside requestAnimationFrame, and the loop stops once the pointer settles. Hotspot rectangles are measured on mount, on resize and after fonts load; pointermove never reads layout.',
  },
  perfBody2: {
    zh: '这台设备的主指针不是精细指针时（触屏、电视遥控、部分平板），页面不挂监听，也不假装有跟随：热点仍然是正常的链接，可以用 Tab 走。开启减少动态时同理，跟随关闭，所有内容静止可读。',
    en: 'When the primary pointer is not fine (touch, TV remote, some tablets) the page installs no listener and does not pretend to follow: hotspots remain ordinary links reachable with Tab. The same applies under reduced motion: the follower is off and everything stays static and readable.',
  },
  perfBody3: {
    zh: '系统光标保留。隐藏它只有在展示型页面、且焦点样式被认真处理过时才值得；这一页不做这个交换。',
    en: 'The native cursor is kept. Hiding it is only worth it on showcase pages with carefully handled focus styles; this page does not make that trade.',
  },
  perfSpec: [
    { label: { zh: '监听', en: 'Listener' }, value: { zh: 'pointermove · passive · window', en: 'pointermove, passive, window' } },
    { label: { zh: '帧', en: 'Frame' }, value: { zh: 'rAF，指针停下即停', en: 'rAF, stops when the pointer settles' } },
    { label: { zh: '位移', en: 'Motion' }, value: { zh: '只写 transform: translate3d', en: 'transform: translate3d only' } },
    { label: { zh: '布局读取', en: 'Layout reads' }, value: { zh: 'pointermove 中为零', en: 'none inside pointermove' } },
    { label: { zh: '滞后', en: 'Lag' }, value: { zh: '约 90ms 指数平滑', en: 'about 90ms exponential smoothing' } },
    { label: { zh: '系统光标', en: 'Native cursor' }, value: { zh: '保留', en: 'kept' } },
    { label: { zh: '粗指针', en: 'Coarse pointer' }, value: { zh: '关闭跟随，链接照旧', en: 'follower off, links unchanged' } },
    { label: { zh: '减少动态', en: 'Reduced motion' }, value: { zh: '关闭跟随，静态可读', en: 'follower off, static and readable' } },
  ],
  codeTitle: { zh: '这一页实际在用的', en: 'What this page actually uses' },
  codeNote: {
    zh: '事件里只存坐标；圆环位置在 rAF 里靠近目标；位移只碰 transform。',
    en: 'The event only stores coordinates; the ring chases the target inside rAF; motion only touches transform.',
  },
  back: { zh: '回到词条：光标跟随', en: 'Back to the entry: Cursor Follower' },
} as const

const HOTSPOTS = [
  {
    slug: 'magnetic-button',
    code: 'F-03',
    name: { zh: '磁吸按钮', en: 'Magnetic Button' },
    note: {
      zh: '按钮被指针轻轻吸过去：同一套「指针在附近」的逻辑，换成实体元素来回应。',
      en: 'The button leans toward the pointer: the same logic of the pointer being nearby, answered by a physical element.',
    },
  },
  {
    slug: 'spotlight-glow',
    code: 'V-05',
    name: { zh: '光晕聚光', en: 'Spotlight Glow' },
    note: {
      zh: '光斑跟着指针走，用亮度而不是形状提醒「你在这里」。',
      en: 'A glow follows the pointer and signals where you are with brightness rather than shape.',
    },
  },
  {
    slug: 'spring',
    code: 'M-03',
    name: { zh: '弹簧动画', en: 'Spring Physics' },
    note: {
      zh: '滞后不一定是缺点：弹簧给这段跟随后一个可解释的落点。',
      en: 'Lag is not automatically a flaw: a spring gives the follow a landing point you can reason about.',
    },
  },
  {
    slug: 'hover-lift',
    code: 'F-01',
    name: { zh: '悬停抬升', en: 'Hover Lift' },
    note: {
      zh: '最省事的指针反馈，和跟随圆环叠加时要注意别让两层位移互相打架。',
      en: 'The cheapest pointer feedback; when layered under a follower ring, make sure the two displacements do not fight.',
    },
  },
] as const

const SNIPPET = [
  "const ring = document.querySelector('.follower')",
  'let cur = { x: 0, y: 0 }',
  'let aim = { x: 0, y: 0 }',
  'let frame = 0',
  '',
  "window.addEventListener('pointermove', (event) => {",
  '  aim = { x: event.clientX, y: event.clientY }',
  '  if (frame) return',
  '  frame = requestAnimationFrame(tick)',
  '}, { passive: true })',
  '',
  'function tick(now) {',
  '  const k = 1 - Math.exp(-(now - last) / 90)',
  '  cur.x += (aim.x - cur.x) * k',
  '  cur.y += (aim.y - cur.y) * k',
  "  ring.style.transform = 'translate3d(' + cur.x + 'px, ' + cur.y + 'px, 0)'",
  '  frame = settled() ? 0 : requestAnimationFrame(tick)',
  '}',
].join('\n')

interface HotspotRect {
  id: string
  left: number
  top: number
  right: number
  bottom: number
}

export default function CursorFollowerLive() {
  const locale = useLocale()
  const reduced = usePrefersReducedMotion()
  const [mode, setMode] = useState<'pending' | 'fine' | 'coarse'>('pending')
  const [engaged, setEngaged] = useState(false)
  const [nearId, setNearId] = useState<string | null>(null)

  const follow = mode === 'fine' && !reduced

  const ringRef = useRef<HTMLSpanElement | null>(null)
  const dotRef = useRef<HTMLSpanElement | null>(null)
  const rectsRef = useRef<HotspotRect[]>([])
  const scrollRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const lastRef = useRef(0)
  const frameRef = useRef(0)
  const runningRef = useRef(false)
  const nearRef = useRef<string | null>(null)
  const engagedRef = useRef(false)

  // 指针能力只在挂载后检测：SSR 与首帧的渲染结果保持一致
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      // oxlint-disable-next-line react/set-state-in-effect -- capability detection has to happen after mount
      setMode('coarse')
      return
    }
    const media = window.matchMedia('(hover: hover) and (pointer: fine)')
    const apply = () => setMode(media.matches ? 'fine' : 'coarse')
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (!follow) return

    let disposed = false
    let resizeFrame = 0
    let scrollFrame = 0

    // 只在布局真的变化时量矩形；pointermove 里不读 DOM
    const measure = () => {
      const sx = window.scrollX
      const sy = window.scrollY
      scrollRef.current = { x: sx, y: sy }
      const rects: HotspotRect[] = []
      const nodes = document.querySelectorAll<HTMLElement>('[data-hotspot]')
      nodes.forEach((node) => {
        const id = node.dataset.hotspot
        if (!id) return
        const rect = node.getBoundingClientRect()
        rects.push({
          id,
          left: rect.left + sx,
          top: rect.top + sy,
          right: rect.right + sx,
          bottom: rect.bottom + sy,
        })
      })
      rectsRef.current = rects
    }

    const onResize = () => {
      if (resizeFrame) return
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0
        measure()
      })
    }

    // 滚动只同步缓存并让热点判定失效，不做任何连续计算
    const onScroll = () => {
      if (scrollFrame) return
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0
        scrollRef.current = { x: window.scrollX, y: window.scrollY }
        if (nearRef.current !== null) {
          nearRef.current = null
          setNearId(null)
        }
      })
    }

    const step = (now: number) => {
      if (disposed) return
      const elapsed = Math.min(now - lastRef.current, 64)
      lastRef.current = now
      const k = 1 - Math.exp(-elapsed / 90)
      const current = currentRef.current
      const target = targetRef.current
      current.x += (target.x - current.x) * k
      current.y += (target.y - current.y) * k
      if (ringRef.current) {
        ringRef.current.style.transform =
          'translate3d(' + current.x.toFixed(2) + 'px, ' + current.y.toFixed(2) + 'px, 0)'
      }
      if (dotRef.current) {
        dotRef.current.style.transform =
          'translate3d(' + target.x.toFixed(2) + 'px, ' + target.y.toFixed(2) + 'px, 0)'
      }
      if (Math.abs(target.x - current.x) < 0.25 && Math.abs(target.y - current.y) < 0.25) {
        runningRef.current = false
        frameRef.current = 0
        return
      }
      frameRef.current = requestAnimationFrame(step)
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const target = targetRef.current
      target.x = event.clientX
      target.y = event.clientY
      if (!engagedRef.current) {
        engagedRef.current = true
        currentRef.current = { x: event.clientX, y: event.clientY }
        setEngaged(true)
      }

      const docX = event.clientX + scrollRef.current.x
      const docY = event.clientY + scrollRef.current.y
      const pad = 32
      let next: string | null = null
      for (const rect of rectsRef.current) {
        if (
          docX >= rect.left - pad &&
          docX <= rect.right + pad &&
          docY >= rect.top - pad &&
          docY <= rect.bottom + pad
        ) {
          next = rect.id
          break
        }
      }
      if (next !== nearRef.current) {
        nearRef.current = next
        setNearId(next)
      }

      if (!runningRef.current) {
        runningRef.current = true
        lastRef.current = performance.now()
        frameRef.current = requestAnimationFrame(step)
      }
    }

    const hide = () => {
      engagedRef.current = false
      nearRef.current = null
      runningRef.current = false
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
      setEngaged(false)
      setNearId(null)
    }

    measure()
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('blur', hide)
    document.documentElement.addEventListener('pointerleave', hide)

    // 字体就绪会改变卡片高度，补量一次；不支持该 API 就跳过
    const fonts = document.fonts
    if (fonts && typeof fonts.ready.then === 'function') {
      fonts.ready.then(
        () => {
          if (!disposed) measure()
        },
        () => {},
      )
    }

    return () => {
      disposed = true
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('blur', hide)
      document.documentElement.removeEventListener('pointerleave', hide)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      if (resizeFrame) cancelAnimationFrame(resizeFrame)
      if (scrollFrame) cancelAnimationFrame(scrollFrame)
      frameRef.current = 0
      runningRef.current = false
    }
  }, [follow])

  const status = reduced
    ? T.statusReduced
    : mode === 'coarse'
      ? T.statusCoarse
      : mode === 'fine'
        ? T.statusFine
        : T.statusPending

  return (
    <div className="min-h-svh bg-canvas pb-28">
      {follow ? (
        <>
          <span
            ref={ringRef}
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-30 will-change-transform"
            style={{ opacity: engaged ? 1 : 0, transition: 'opacity 180ms ease' }}
          >
            <span
              className={
                'block h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-transform duration-200 ease-out ' +
                (nearId ? 'scale-[1.65] border-accent bg-accent-soft' : 'scale-100 border-accent bg-transparent')
              }
            />
          </span>
          <span
            ref={dotRef}
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-30 will-change-transform"
            style={{ opacity: engaged ? 1 : 0, transition: 'opacity 180ms ease' }}
          >
            <span className="block h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
          </span>
        </>
      ) : null}

      <section className="flex min-h-svh items-center px-5 pb-10 pt-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-[88rem] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] lg:items-end">
          <div className="max-w-4xl">
            <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
            <h2 className="mt-4 font-display text-display leading-[0.98] text-ink">{pick(T.title, locale)}</h2>
            <p className="mt-6 max-w-[58ch] text-body text-ink-2">{pick(T.lede, locale)}</p>
            <p className="mt-3 max-w-[58ch] text-caption text-muted">{pick(T.lede2, locale)}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] text-muted">
              <span className={'inline-flex items-center gap-2 ' + (follow ? 'text-ink-2' : 'text-accent')}>
                <span aria-hidden="true" className={'inline-block h-2 w-2 ' + (follow ? 'bg-accent' : 'bg-line-strong')} />
                {pick(status, locale)}
              </span>
              {follow ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{engaged ? pick(T.hintFollowing, locale) : pick(T.hintMove, locale)}</span>
                </>
              ) : null}
            </div>
          </div>

          <div className="w-full max-w-sm border border-line bg-raised p-5">
            <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2.5">
              <span className="label-mono">{pick(T.layersLabel, locale)}</span>
              <span className="stamp">M-08</span>
            </div>
            <div aria-hidden="true" className="relative mt-5 h-36">
              <span className="absolute left-[38%] top-[46%] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-line-strong" />
              <span className="absolute left-[60%] top-[60%] h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent" />
              <span className="absolute left-[38%] top-[46%] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
              <span className="absolute left-[60%] top-[60%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
            </div>
            <p className="mt-2 text-caption text-muted">{pick(T.diagramNote, locale)}</p>
            <dl className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3 font-mono text-[10px] text-muted">
              <div className="flex items-baseline justify-between gap-3">
                <dt>{pick(T.layerNative, locale)}</dt>
                <dd className="text-ink-2">cursor: auto</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt>{pick(T.layerRing, locale)}</dt>
                <dd className="text-accent">pointer-events: none</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[88rem] px-5 pb-16 sm:px-8">
        <div className="border-t border-line pt-4">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="label-mono text-accent">{pick(T.fieldTitle, locale)}</h2>
            <p className="max-w-[62ch] font-mono text-[11px] text-muted">{pick(T.fieldNote, locale)}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {HOTSPOTS.map((hotspot) => {
              const active = nearId === hotspot.slug
              return (
                <Link
                  key={hotspot.slug}
                  to={entryPath(hotspot.slug)}
                  data-hotspot={hotspot.slug}
                  className={
                    'group relative flex min-h-[11rem] flex-col justify-between gap-6 border bg-raised p-5 no-underline transition-colors duration-150 focus-visible:border-accent focus-visible:outline-accent ' +
                    (active ? 'border-accent' : 'border-line hover:border-line-strong')
                  }
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="label-mono">{pick(T.hotspotTag, locale)}</span>
                    <span className="stamp">{hotspot.code}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-h3 leading-tight text-ink">{pick(hotspot.name, locale)}</h3>
                    <p className="mt-2 max-w-[42ch] text-caption text-muted">{pick(hotspot.note, locale)}</p>
                  </div>
                  <span
                    aria-hidden="true"
                    className={
                      'font-mono text-[11px] text-accent transition-opacity duration-150 ' +
                      (active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100')
                    }
                  >
                    {pick(T.openEntry, locale)} →
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[88rem] px-5 pb-16 sm:px-8">
        <div className="border-t border-line-strong pt-6">
          <h2 className="font-display text-h2 text-ink">{pick(T.whyTitle, locale)}</h2>
          <p className="mt-4 max-w-[62ch] text-body text-ink-2">{pick(T.whyBody, locale)}</p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[88rem] px-5 pb-16 sm:px-8">
        <div className="grid gap-10 border-t border-line-strong pt-6 md:grid-cols-2">
          <div>
            <h2 className="font-display text-h3 text-ink">{pick(T.whenTitle, locale)}</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {T.whenList.map((item, index) => (
                <li key={item.zh} className="flex gap-3 text-body text-ink-2">
                  <span aria-hidden="true" className="mt-1 font-mono text-[11px] text-accent">
                    {'0' + (index + 1)}
                  </span>
                  <span className="max-w-[46ch]">{pick(item, locale)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-h3 text-ink">{pick(T.whenNotTitle, locale)}</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {T.whenNotList.map((item, index) => (
                <li key={item.zh} className="flex gap-3 text-body text-muted">
                  <span aria-hidden="true" className="mt-1 font-mono text-[11px] text-line-strong">
                    {'0' + (index + 1)}
                  </span>
                  <span className="max-w-[46ch]">{pick(item, locale)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[88rem] px-5 pb-16 sm:px-8">
        <div className="border-t border-line-strong pt-6">
          <h2 className="font-display text-h3 text-ink">{pick(T.perfTitle, locale)}</h2>
          <div className="mt-4 flex max-w-[62ch] flex-col gap-3">
            <p className="text-body text-ink-2">{pick(T.perfBody1, locale)}</p>
            <p className="text-body text-ink-2">{pick(T.perfBody2, locale)}</p>
            <p className="text-caption text-muted">{pick(T.perfBody3, locale)}</p>
          </div>
          <dl className="mt-8 grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {T.perfSpec.map((row) => (
              <div
                key={row.label.zh}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line pb-2"
              >
                <dt className="text-caption text-muted">{pick(row.label, locale)}</dt>
                <dd className="font-mono text-[11px] text-ink-2">{pick(row.value, locale)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-5">
          <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
            <h2 className="font-display text-h3 text-ink">{pick(T.codeTitle, locale)}</h2>
            <span className="label-mono">JS</span>
          </div>
          <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">{SNIPPET}</pre>
          <p className="max-w-[60ch] text-caption text-muted">{pick(T.codeNote, locale)}</p>
          <Link
            to={entryPath('cursor-follower')}
            className="text-link self-start font-mono text-[11px] text-accent no-underline"
          >
            {pick(T.back, locale)} →
          </Link>
        </div>
      </section>
    </div>
  )
}
