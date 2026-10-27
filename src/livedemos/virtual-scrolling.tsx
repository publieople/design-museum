import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { usePrefersReducedMotion } from '../lib/motion'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * Live version of virtual scrolling: the whole page is that 10,000-row archive.
 *
 * Window scrolling is the exception granted to /live/ pages: the page itself is
 * the scroll container, so the window is computed from window.scrollY instead of
 * a div's scrollTop. A fixed row height, one full-height spacer and a small
 * overscan keep the DOM at a few dozen rows while the scrollbar still measures
 * all 10,000.
 */

const ROW_HEIGHT = 44
const OVERSCAN = 8
const TOTAL = 10000
const COMPARE_COUNT = 2000
const DEFAULT_VIEWPORT = 720

/** Group digits so a readout like 37000 still reads as 37,000 at a glance. */
function formatInt(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function rowCode(index: number): string {
  return 'ARC-' + String(index + 1).padStart(5, '0')
}

const T = {
  eyebrow: { zh: '现场 · 虚拟滚动', en: 'LIVE · VIRTUAL SCROLLING' },
  title: { zh: '一万行，只画几十行', en: 'Ten thousand rows, a few dozen in the DOM' },
  lede: {
    zh: '这一页没有演示框：往下滚就是那份 10,000 行的档案。页面只渲染视口附近的三十来行，滚动条却量得到第 10,000 行。右上角的读数在告诉你，DOM 里到底有几行。',
    en: 'There is no demo box on this page: scrolling down is that 10,000-row archive. Only the thirty-odd rows near the viewport are rendered, yet the scrollbar measures all 10,000. The readout tells you how many rows are actually in the DOM.',
  },
  hint: { zh: '向下滚动：整页就是列表', en: 'Scroll down: the page is the list' },
  cardLabel: { zh: '抽样 · 三行', en: 'Sample · three rows' },
  cardRows: { zh: '总行数', en: 'Total rows' },
  cardDom: { zh: '窗口行', en: 'Window rows' },
  cardNote: {
    zh: '滚动条按 10,000 行撑开，DOM 里只留视口附近那几十行。',
    en: 'The scrollbar is sized for 10,000 rows; the DOM only keeps the few dozen near the viewport.',
  },
  liveTag: { zh: '实时读数', en: 'Live readout' },
  archiveTitle: { zh: '10,000 行档案', en: 'The 10,000-row archive' },
  archiveLede: {
    zh: '总行数不会变；实际渲染与可见区间随滚动窗口移动。缓冲行让快速滚动不留白，所以「实际渲染」比「可见区间」多十几行。',
    en: 'The total never changes; the rendered count and window move with the scroll position. Overscan rows keep fast scrolling from showing blanks, which is why “rendered” is a dozen rows larger than the window.',
  },
  metricTotal: { zh: '总行数', en: 'Rows' },
  metricRendered: { zh: '实际渲染', en: 'Rendered' },
  metricWindow: { zh: '可见区间', en: 'Window' },
  metricScroll: { zh: 'scrollTop', en: 'scrollTop' },
  jumpTop: { zh: '跳到顶部', en: 'Jump to top' },
  jumpEnd: { zh: '跳到末尾', en: 'Jump to end' },
  disable: { zh: '关闭虚拟化对比', en: 'Render 2,000 rows' },
  enable: { zh: '恢复虚拟化', en: 'Restore virtualisation' },
  modeVirtual: { zh: '虚拟化开启：DOM 里只有窗口行', en: 'Virtualised: only the window is in the DOM' },
  modeCompare: { zh: '对照：一次渲染 2,000 行', en: 'Compare: all 2,000 rows rendered' },
  compareWarning: {
    zh: '现在 DOM 里有 2,000 行，滚动与选中都开始变沉。真实场景的 10,000 行只会更卡：滚动、读屏、内存一起变差。看完点「恢复虚拟化」。',
    en: 'There are 2,000 rows in the DOM right now, and scrolling and selection already feel heavier. The real 10,000 would be worse: scrolling, screen readers and memory all suffer. Hit “Restore virtualisation” when you are done.',
  },
  listAria: { zh: '10,000 行档案列表', en: '10,000-row archive list' },
  domVirtual: {
    zh: 'DOM 里的 li 只有 {n} 个；滚动条按 10,000 行计算。',
    en: 'The DOM holds only {n} li nodes; the scrollbar is sized for 10,000 rows.',
  },
  domCompare: {
    zh: 'DOM 里有 {n} 个 li；10,000 行会让这个数字再涨五倍。',
    en: 'The DOM holds {n} li nodes; 10,000 rows would multiply that by five.',
  },
  chapter: { zh: '第 {n} 节', en: 'Section {n}' },
  sections: [
    {
      title: { zh: '为什么只有整页才成立', en: 'Why the whole page has to be the list' },
      figure: [
        'window scroll',
        '10,000 × 44px = 440,000px',
        'DOM ≈ 33 rows',
      ],
      body: {
        zh: '演示框里也能做虚拟滚动，但盒子的滚动距离有限，「省掉了多少」根本看不出来。一整页 10,000 行才让滚动条变成一把真正的长尺。要分清两件事：虚拟滚动省的是 DOM 节点，不是数据——数据可以一次全拿到，页面只画视口附近。整页滚动时滚动容器是 document，窗口要拿 window.scrollY 来算，而不是某个 div 的 scrollTop；这就是现场页相对展台 demo 多出来的那一点真实感。',
        en: 'Virtual scrolling works inside a box too, but a box has too little scroll distance to show what is being saved. Ten thousand rows across a whole page turn the scrollbar into an actual long ruler. Keep two things apart: virtual scrolling saves DOM nodes, not data — the data can all be there, while the page only paints what is near the viewport. When the page scrolls, the scroll container is document, so the window comes from window.scrollY instead of a div’s scrollTop; that is the bit of realism the live page adds over the staged demo.',
      },
    },
    {
      title: { zh: '窗口就是三个数字', en: 'The window is three numbers' },
      figure: [
        'first = floor(scrollTop / rowHeight)',
        'end = first + visible + 2 × overscan',
        'spacer = total × rowHeight',
      ],
      body: {
        zh: '行高固定时，窗口计算是纯算术：scrollTop 除以行高得到第一行，视口高度除以行高得到行数，前后再各留 8 行缓冲。缓冲是为了快速滚动时不留白，代价是每帧多渲染十几行——读数里的「实际渲染」含缓冲，「可见区间」不含。spacer（总行数 × 行高）把滚动条撑到真实长度，渲染块再用 transform: translateY(start × 行高) 挪到该在的位置；别用改 padding 的方式做这件事，transform 不触发布局。',
        en: 'With a fixed row height the window is pure arithmetic: scrollTop divided by row height gives the first row, viewport height divided by row height gives how many fit, and eight extra rows of overscan sit on each side. Overscan keeps fast scrolling from showing blanks at the cost of a dozen more rows per frame — “rendered” in the readout includes it, “window” does not. The spacer (total × row height) makes the scrollbar honest, and the rendered block is moved into place with transform: translateY(start × row height); do not do this by changing padding, because transform does not trigger layout.',
      },
    },
    {
      title: { zh: '固定行高才简单', en: 'Fixed height is the simple version' },
      figure: [
        'fixed: start = floor(scrollTop / h)',
        'variable: measure every row',
        '+ cache offsets + anchor index',
      ],
      body: {
        zh: '行高固定时上面两个式子才成立，spacer 高度也是精确的 total × h。行高不定就要逐行测量、缓存每行的偏移量（或前缀和），滚动时还得做锚定：用当前行 index 反推 scrollTop，否则窗口一更新内容就会跳。真实产品里的常见折中是列表行固定高、正文里的长引用单独处理。这一页故意用 44px 固定行高，把每次滚动的成本压到一次除法，浏览器该做的布局工作只剩几十行。',
        en: 'The formulas above only hold when the row height is fixed, and the spacer height is exactly total × h. Variable heights mean measuring every row and caching each offset (or a prefix sum), plus anchoring while scrolling: derive scrollTop from the current row index, or the content jumps whenever the window updates. A common compromise in real products is fixed-height list rows with long quotes handled separately. This page deliberately uses a fixed 44px row, so each scroll costs one division and the browser only lays out a few dozen rows.',
      },
    },
    {
      title: { zh: '和相近做法的区别', en: 'Not content-visibility, not pagination' },
      figure: [
        'content-visibility: auto',
        '→ stays in the DOM, skips paint',
        'infinite scroll → fetch more data',
        'pagination → slice data',
      ],
      body: {
        zh: 'content-visibility: auto 让浏览器跳过屏外内容的渲染，但节点还在 DOM 里：10,000 行就有 10,000 个节点和对应内存。虚拟滚动是按窗口真正增删节点。无限滚动决定「什么时候再取一批数据」，解决数据量；分页把数据切成页让用户翻；虚拟滚动数据一次拿全，只控制画多少行。三者可以叠加，判断标准也不同：DOM 节点数是不是瓶颈，而不是请求数是不是瓶颈。',
        en: 'content-visibility: auto lets the browser skip rendering off-screen content, but the nodes stay in the DOM: 10,000 rows mean 10,000 nodes and their memory. Virtual scrolling actually adds and removes nodes per window. Infinite scroll decides when to fetch another batch, solving data volume; pagination slices data into pages the user walks through; virtual scrolling takes all the data and only controls how many rows are painted. They stack, and the deciding question is different: are DOM nodes the bottleneck, not requests.',
      },
    },
    {
      title: { zh: '可访问性与首屏', en: 'Accessibility and the first paint' },
      figure: [
        'aria-setsize="10000"',
        'aria-posinset={index + 1}',
        'role="grid" → aria-rowcount',
        'SSR: window rows only',
      ],
      body: {
        zh: '没渲染的行，读屏软件也看不到，所以要主动报出规模：列表项上用 aria-setsize 报总数、aria-posinset 报位置；表格或网格语义则用 aria-rowcount 与 aria-rowindex。行被卸载时焦点会丢，因此键盘操作放在列表容器上：Home 跳到顶、End 跳到尾（这一页已经实现），不要依赖每一行自己的 tabindex。SSR 首屏只输出窗口那几十行——这正好也是虚拟滚动的默认行为；页面 HTML 里没有 10,000 行，hydrate 之后再按真实视口重算一次。',
        en: 'Screen readers cannot see rows that were never rendered, so state the scale explicitly: aria-setsize for the total and aria-posinset for the position on list items; table or grid semantics use aria-rowcount and aria-rowindex. Focus is lost when a row unmounts, so keyboard handling belongs on the list container: Home jumps to the top and End to the bottom (implemented on this page) instead of relying on per-row tabindex. The SSR first paint only ships the window rows — which is exactly what virtual scrolling does anyway; the HTML has no 10,000 rows, and after hydration the window is measured against the real viewport.',
      },
    },
  ],
  paramsTitle: { zh: '这一页的参数', en: 'Parameters on this page' },
  params: [
    { label: { zh: '总行数', en: 'Rows' }, value: { zh: '10,000（确定性生成）', en: '10,000 (deterministic)' } },
    { label: { zh: '行高', en: 'Row height' }, value: '44px' },
    { label: { zh: '缓冲', en: 'Overscan' }, value: { zh: '前后各 8 行', en: '8 rows each side' } },
    { label: { zh: '总占位', en: 'Spacer' }, value: '440,000px' },
    { label: { zh: '滚动来源', en: 'Scroll source' }, value: 'window.scrollY' },
    { label: { zh: '对照模式', en: 'Compare mode' }, value: { zh: '2,000 行全渲染', en: '2,000 rows, all rendered' } },
    { label: { zh: '跳转', en: 'Jump' }, value: { zh: '减少动态时 instant', en: 'instant under reduced motion' } },
  ],
  codeTitle: { zh: '这一页实际在用的', en: 'What this page actually uses' },
  codeNote: {
    zh: '两段都来自这一页：窗口计算与 spacer 定位；resize 时重新量视口与列表偏移量。跳转用 window.scrollTo，减少动态时 behavior 换成 instant。',
    en: 'Both snippets come from this page: the window math and the spacer positioning; resize re-measures the viewport and the list offset. Jumps use window.scrollTo, with behavior switched to instant under reduced motion.',
  },
  reducedNote: {
    zh: '开启减少动态时，滚到第 N 行不再平滑滚动，改为瞬间定位；虚拟滚动本身不播动画。',
    en: 'When reduced motion is on, scroll-to-row becomes an instant jump instead of a smooth one; virtual scrolling itself animates nothing.',
  },
  back: { zh: '回到词条：虚拟滚动', en: 'Back to the entry: Virtual Scrolling' },
  names: [
    { zh: '雾面玻璃', en: 'Frosted pane' },
    { zh: '活动梯', en: 'Rolling ladder' },
    { zh: '展签', en: 'Wall label' },
    { zh: '射灯', en: 'Spotlight' },
    { zh: '恒湿柜', en: 'Humidity case' },
    { zh: '木托盘', en: 'Timber pallet' },
    { zh: '修复台', en: 'Conservation bench' },
    { zh: '卷轴盒', en: 'Scroll box' },
    { zh: '亚克力罩', en: 'Acrylic cover' },
    { zh: '库房卡', en: 'Storage card' },
  ],
  categories: [
    { zh: '展厅', en: 'Hall' },
    { zh: '档案', en: 'Archive' },
    { zh: '照明', en: 'Lighting' },
    { zh: '展具', en: 'Furniture' },
    { zh: '修复', en: 'Conservation' },
    { zh: '库房', en: 'Storage' },
  ],
  notes: [
    { zh: '入库 2019 · 状态稳定', en: 'Accessioned 2019 · stable' },
    { zh: '玻璃边缘有细裂，未修复', en: 'Hairline crack at the edge, untreated' },
    { zh: '轮换展出，每季度一次', en: 'Rotates once a quarter' },
    { zh: '需恒湿，45–55% RH', en: 'Needs 45–55% RH' },
    { zh: '底座另存，编号对不上', en: 'Base stored separately, numbers do not match' },
    { zh: '灯光 3000K，照度 50 lux', en: '3000K light, 50 lux' },
    { zh: '借展记录三份，待归档', en: 'Three loan records, pending filing' },
  ],
} as const

const WINDOW_SNIPPET = [
  '// fixed row height: the window is arithmetic',
  'const viewport = window.innerHeight',
  'const top = list.getBoundingClientRect().top + scrollY',
  'const local = clamp(scrollY - top, 0, TOTAL * ROW - viewport)',
  'const first = Math.floor(local / ROW)',
  'const visible = Math.ceil(viewport / ROW)',
  'const start = Math.max(0, first - OVERSCAN)',
  'const end = Math.min(TOTAL, first + visible + OVERSCAN)',
  '',
  '// one rAF per scroll burst; setState only when the window moved',
  'if (!frame) frame = requestAnimationFrame(update)',
].join('\n')

const SPACER_SNIPPET = [
  '// spacer keeps the scrollbar honest: total x row height',
  '<ul style={{ height: TOTAL * ROW }}>',
  '  <li',
  '    style={{',
  '      position: "absolute",',
  '      top: index * ROW,',
  '      height: ROW,',
  '    }}',
  '    aria-setsize={TOTAL}',
  '    aria-posinset={index + 1}',
  '  />',
  '</ul>',
  '',
  '// resize: measure the viewport and the list offset again',
  'addEventListener("resize", schedule)',
].join('\n')

type Range = { start: number; end: number }

const INITIAL_RANGE: Range = {
  start: 0,
  end: Math.min(TOTAL, Math.ceil(DEFAULT_VIEWPORT / ROW_HEIGHT) + OVERSCAN * 2),
}

const INITIAL_RENDERED = INITIAL_RANGE.end - INITIAL_RANGE.start

const BTN =
  'border border-line px-2 py-1 font-mono text-[10px] text-ink-2 transition-colors hover:border-ink hover:text-ink'
const INITIAL_VISIBLE = Math.ceil(DEFAULT_VIEWPORT / ROW_HEIGHT)
const WINDOW_ROWS_IN_CARD = INITIAL_RENDERED

export default function VirtualScrollingLive() {
  const locale = useLocale()
  const reduced = usePrefersReducedMotion()
  const [virtual, setVirtual] = useState(true)
  const [range, setRange] = useState<Range>(INITIAL_RANGE)
  const listRef = useRef<HTMLUListElement | null>(null)
  const renderedRef = useRef<HTMLSpanElement | null>(null)
  const windowRef = useRef<HTMLSpanElement | null>(null)
  const scrollRef = useRef<HTMLSpanElement | null>(null)

  const totalRows = virtual ? TOTAL : COMPARE_COUNT
  const totalHeight = totalRows * ROW_HEIGHT
  const indices = virtual
    ? Array.from({ length: Math.max(0, range.end - range.start) }, (_, offset) => range.start + offset)
    : Array.from({ length: COMPARE_COUNT }, (_, index) => index)

  // Page-level scroll: the window and the readout are computed here, and state
  // only changes when the window actually moves.
  useEffect(() => {
    const list = listRef.current
    const rendered = renderedRef.current
    const windowNode = windowRef.current
    const scrollNode = scrollRef.current
    if (!list || !rendered || !windowNode || !scrollNode) return

    let frame = 0
    const update = () => {
      frame = 0
      const viewport = window.innerHeight
      const rect = list.getBoundingClientRect()
      const listTop = rect.top + window.scrollY
      const renderedTotal = virtual ? TOTAL : COMPARE_COUNT
      const maxScroll = Math.max(0, renderedTotal * ROW_HEIGHT - viewport)
      const local = Math.min(maxScroll, Math.max(0, window.scrollY - listTop))

      const firstVisible = Math.min(
        renderedTotal,
        Math.max(1, Math.floor(local / ROW_HEIGHT) + 1),
      )
      const lastVisible = Math.min(
        renderedTotal,
        Math.max(firstVisible, Math.ceil((local + viewport) / ROW_HEIGHT)),
      )
      const start = virtual ? Math.max(0, firstVisible - 1 - OVERSCAN) : 0
      const end = virtual ? Math.min(TOTAL, lastVisible + OVERSCAN) : COMPARE_COUNT

      setRange((current) =>
        current.start === start && current.end === end ? current : { start, end },
      )

      rendered.textContent = formatInt(virtual ? end - start : COMPARE_COUNT)
      windowNode.textContent = formatInt(firstVisible) + '–' + formatInt(lastVisible)
      scrollNode.textContent = formatInt(Math.round(local)) + 'px'
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [virtual])

  const jumpToRow = (row: number) => {
    const list = listRef.current
    if (!list) return
    const listTop = list.getBoundingClientRect().top + window.scrollY
    const renderedTotal = virtual ? TOTAL : COMPARE_COUNT
    const lastRowTop = renderedTotal * ROW_HEIGHT - window.innerHeight
    const target = row <= 0 ? listTop : listTop + Math.min(row * ROW_HEIGHT, lastRowTop)
    window.scrollTo({ top: Math.max(0, target), behavior: reduced ? 'auto' : 'smooth' })
  }

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === 'Home') {
      event.preventDefault()
      jumpToRow(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      jumpToRow(totalRows)
    }
  }

  const row = (index: number) => (
    <li
      key={index}
      aria-setsize={totalRows}
      aria-posinset={index + 1}
      className={
        'flex items-center gap-2 border-b border-line px-2 font-mono text-[10px] text-ink-2 sm:gap-3 sm:px-3 sm:text-[11px]' +
        (virtual ? ' absolute inset-x-0' : '')
      }
      style={virtual ? { top: index * ROW_HEIGHT, height: ROW_HEIGHT } : { height: ROW_HEIGHT }}
    >
      <span className="w-[5.2rem] shrink-0 text-muted sm:w-[6rem]">{rowCode(index)}</span>
      <span className="min-w-0 flex-1 truncate text-ink">
        {pick(T.names[index % T.names.length], locale)}
      </span>
      <span className="hidden w-20 shrink-0 text-muted sm:block">
        {pick(T.categories[(index * 5) % T.categories.length], locale)}
      </span>
      <span className="hidden min-w-0 flex-1 truncate text-muted md:block">
        {pick(T.notes[(index * 3) % T.notes.length], locale)}
      </span>
    </li>
  )

  return (
    <div className="relative bg-canvas pb-28">
      <section
        aria-label={pick(T.title, locale)}
        className="flex min-h-[92svh] items-center px-5 py-16 sm:px-8"
      >
        <div className="mx-auto grid w-full max-w-[88rem] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-center">
          <div className="flex flex-col gap-5">
            <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
            <h2 className="max-w-[15ch] font-display text-display font-semibold leading-[1.05] text-ink">
              {pick(T.title, locale)}
            </h2>
            <p className="max-w-[56ch] text-body text-ink-2">{pick(T.lede, locale)}</p>
            <p className="mt-2 flex items-center gap-2 font-mono text-[11px] text-muted">
              <span aria-hidden="true" className="inline-block h-2 w-2 bg-accent" />
              {pick(T.hint, locale)} ↓
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm border border-line-strong bg-raised">
              <div className="flex items-center justify-between px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                <span>{pick(T.cardLabel, locale)}</span>
                <span className="stamp">L-07</span>
              </div>
              <ul className="m-0 list-none border-t border-line p-0">
                {[0, 1, 2].map((index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 border-b border-line px-4 font-mono text-[10px] text-ink-2"
                    style={{ height: ROW_HEIGHT }}
                  >
                    <span className="w-[5.2rem] shrink-0 text-muted">{rowCode(index)}</span>
                    <span className="min-w-0 flex-1 truncate text-ink">
                      {pick(T.names[index % T.names.length], locale)}
                    </span>
                    <span className="hidden shrink-0 text-muted sm:block">
                      {pick(T.categories[(index * 5) % T.categories.length], locale)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex items-baseline justify-between px-4 py-3">
                <span className="label-mono">{pick(T.cardRows, locale)}</span>
                <span className="font-mono text-[13px] text-ink">{formatInt(TOTAL)}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-line px-4 py-3">
                <span className="label-mono">{pick(T.cardDom, locale)}</span>
                <span className="font-mono text-[13px] text-accent">≈ {WINDOW_ROWS_IN_CARD}</span>
              </div>
              <p className="border-t border-line px-4 py-3 text-caption text-muted">
                {pick(T.cardNote, locale)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="live-vs-archive" className="px-5 pb-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col">
          <div className="sticky top-3 z-30 flex flex-col gap-3 border border-line-strong bg-raised p-3 shadow-[var(--shadow-overlay)] sm:p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <div className="flex items-baseline gap-3">
                <span className="label-mono text-accent">{pick(T.liveTag, locale)}</span>
                <h2 id="live-vs-archive" className="font-display text-h3 text-ink">
                  {pick(T.archiveTitle, locale)}
                </h2>
              </div>
              <p className="font-mono text-[10px] text-muted">
                {virtual ? pick(T.modeVirtual, locale) : pick(T.modeCompare, locale)}
              </p>
            </div>

            <dl className="m-0 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] leading-relaxed text-muted">
              <div className="flex items-baseline gap-1.5">
                <dt>{pick(T.metricTotal, locale)}</dt>
                <dd className="m-0 text-ink">{formatInt(totalRows)}</dd>
              </div>
              <div className="flex items-baseline gap-1.5">
                <dt>{pick(T.metricRendered, locale)}</dt>
                <dd ref={renderedRef} className="m-0 text-accent">
                  {formatInt(virtual ? INITIAL_RENDERED : COMPARE_COUNT)}
                </dd>
              </div>
              <div className="flex items-baseline gap-1.5">
                <dt>{pick(T.metricWindow, locale)}</dt>
                <dd ref={windowRef} className="m-0 text-ink">
                  1–{formatInt(INITIAL_VISIBLE)}
                </dd>
              </div>
              <div className="flex items-baseline gap-1.5">
                <dt>{pick(T.metricScroll, locale)}</dt>
                <dd ref={scrollRef} className="m-0 text-ink">
                  0px
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => jumpToRow(0)} className={BTN}>
                {pick(T.jumpTop, locale)}
              </button>
              <button type="button" onClick={() => jumpToRow(totalRows)} className={BTN}>
                {pick(T.jumpEnd, locale)}
              </button>
              {virtual ? (
                <button type="button" onClick={() => setVirtual(false)} className={BTN}>
                  {pick(T.disable, locale)}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setVirtual(true)}
                  className={BTN + ' border-accent text-accent hover:bg-accent-soft'}
                >
                  {pick(T.enable, locale)}
                </button>
              )}
              <span className="font-mono text-[10px] text-muted">
                {pick(T.archiveLede, locale)}
              </span>
            </div>

            {virtual ? null : (
              <p className="m-0 border-l-2 border-accent bg-surface px-3 py-2 text-caption text-ink-2">
                {pick(T.compareWarning, locale)}
              </p>
            )}
          </div>

          <ul
            ref={listRef}
            aria-label={pick(T.listAria, locale)}
            tabIndex={0}
            onKeyDown={onListKeyDown}
            className="relative m-0 mt-3 list-none p-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            style={{ height: totalHeight }}
          >
            {indices.map((index) => row(index))}
          </ul>

          <p className="mt-3 font-mono text-[10px] text-muted">
            {pick(virtual ? T.domVirtual : T.domCompare, locale).replace(
              '{n}',
              formatInt(virtual ? range.end - range.start : COMPARE_COUNT),
            )}
          </p>
        </div>
      </section>

      {T.sections.map((section, index) => (
        <section
          key={section.title.zh}
          aria-labelledby={'live-vs-section-' + index}
          className="flex min-h-[62vh] items-center px-5 py-16 sm:px-8"
        >
          <div className="mx-auto grid w-full max-w-[88rem] gap-6 border-t border-line pt-6 md:grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,15rem)] md:gap-10">
            <div className="flex items-baseline gap-3 md:flex-col md:gap-2">
              <span aria-hidden="true" className="font-display text-h1 leading-none text-line-strong">
                {'0' + (index + 1)}
              </span>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                {pick(T.chapter, locale).replace('{n}', '0' + (index + 1))}
              </p>
            </div>
            <div className="flex max-w-[58ch] flex-col gap-3">
              <h2 id={'live-vs-section-' + index} className="font-display text-h2 text-ink">
                {pick(section.title, locale)}
              </h2>
              <p className="text-body text-ink-2">{pick(section.body, locale)}</p>
            </div>
            <pre className="self-start overflow-x-auto border-l-2 border-accent pl-3 font-mono text-[10px] leading-relaxed text-muted">
              {section.figure.join('\n')}
            </pre>
          </div>
        </section>
      ))}

      <section aria-label={pick(T.paramsTitle, locale)} className="px-5 py-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-[88rem] gap-6 border-t border-line pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-h2 text-ink">{pick(T.paramsTitle, locale)}</h2>
            <dl className="m-0 flex flex-col">
              {T.params.map((param) => (
                <div
                  key={param.label.zh}
                  className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-line py-2.5"
                >
                  <dt className="label-mono">{pick(param.label, locale)}</dt>
                  <dd className="m-0 text-caption text-ink">
                    {typeof param.value === 'string' ? param.value : pick(param.value, locale)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <pre className="well self-start overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
            {WINDOW_SNIPPET}
          </pre>
        </div>
      </section>

      <section aria-label={pick(T.codeTitle, locale)} className="px-5 py-20 pb-28 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-5">
          <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
            <h2 className="font-display text-h3 text-ink">{pick(T.codeTitle, locale)}</h2>
            <span className="label-mono">2</span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
              {SPACER_SNIPPET}
            </pre>
            <div className="flex flex-col gap-3">
              <p className="text-caption text-ink-2">{pick(T.codeNote, locale)}</p>
              <p className="text-caption text-muted">{pick(T.reducedNote, locale)}</p>
              <Link
                to={entryPath('virtual-scrolling')}
                className="text-link self-start font-mono text-[11px] text-accent no-underline"
              >
                {pick(T.back, locale)} →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
