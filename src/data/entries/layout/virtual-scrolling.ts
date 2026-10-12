import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'virtual-scrolling',
  code: 'L-07',
  nameZh: '虚拟滚动',
  nameEn: 'Virtual Scrolling',
  aliases: ['虚拟列表', '长列表优化', '窗口化渲染', 'virtual list', 'windowing', 'virtualized list'],
  category: 'layout',
  oneLiner: '列表只渲染看得见的那几行，一万条也能滚得顺。',
  whenToUse: [
    '几百到几万行的列表、日志、表格，全渲染会让页面卡死',
    '聊天记录、时间线这类只往两头长的数据',
    '可视区高度固定的面板里展示很长的候选列表',
  ],
  confusions: [
    {
      with: '无限滚动',
      diff: '无限滚动管「什么时候再取一批数据」，虚拟滚动管「一屏只渲染几行」；一个解决数据量，一个解决 DOM 量，经常一起用。',
    },
    {
      with: '分页',
      diff: '分页把数据切成页、用户翻页；虚拟滚动数据一次拿全，只是把可视区外的行不渲染，滚动条仍然是连续的一整条。',
    },
  ],
  pitfalls: [
    '行高固定才好算区间；高度不定就得逐行测量并缓存，成本随之上升',
    '滚动容器要有撑满总高度的占位（spacer 或 padding），否则滚动条与位置全不对',
    'scroll 事件里直接 setState 会掉帧，用 requestAnimationFrame 节流，或者只在可视区间变化时才更新',
    '可视区外多渲染几行做缓冲（overscan），否则快速滚动会看到空白',
    '复用 DOM 时要清掉上一行的动画与展开状态，别让第 500 行的状态串到第 12 行',
    '读屏软件看不到没渲染的行：用 aria-setsize / aria-posinset 报出总数与位置，或提供「跳到第 N 条」',
  ],
  keywords: [
    'virtual scrolling',
    'windowing',
    'virtual list',
    'overscan',
    'item height',
    'scrollTop',
    'transform: translateY',
    'aria-setsize',
  ],
  spec: [
    { label: '行高', value: '固定 40–64px 最省事' },
    { label: '缓冲行数', value: '前后各 3–6 行' },
    { label: '滚动处理', value: 'requestAnimationFrame 节流，或只监听可视区间变化' },
    { label: '占位高度', value: '总行数 × 行高' },
    { label: '无障碍', value: 'aria-setsize / aria-posinset 报出总数与序号' },
  ],
  reducedMotion: '虚拟滚动本身不播动画；只有「滚到第 N 条」这类平滑滚动在 prefers-reduced-motion 下要改成瞬间定位。',
  refs: [
    { label: 'MDN · Element.scrollTop', url: 'https://developer.mozilla.org/docs/Web/API/Element/scrollTop' },
    { label: 'web.dev · Virtualize long lists', url: 'https://web.dev/articles/virtualize-long-lists-react-window' },
  ],
  related: ['marquee', 'masonry'],
  scenes: ['list', 'scroll', 'page'],
  feel: ['crisp', 'calm'],
  intent: ['affordance', 'hierarchy'],
  tags: ['js', 'browser-api', 'composited', 'layout-triggering', 'main-thread', 'stable'],
  demo: { shape: 'scroll', minHeight: 320, thumb: 'still' },
  controls: [
    { kind: 'range', id: 'itemHeight', label: '行高', min: 32, max: 80, step: 4, def: 44, unit: 'px' },
    { kind: 'range', id: 'total', label: '总条数', min: 1000, max: 50000, step: 500, def: 10000 },
    { kind: 'range', id: 'overscan', label: '缓冲行数', min: 0, max: 8, step: 1, def: 4 },
  ],
  prompt: (values: ControlValues) => {
    const itemHeight = Number(values.itemHeight)
    const total = Number(values.total)
    const overscan = Number(values.overscan)
    return {
      zh: `做一个虚拟滚动列表（virtual scrolling）：总条数 ${total}，每行固定 ${itemHeight}px，容器内放一个 ${total} × ${itemHeight}px 的占位撑出滚动条，只渲染可视区行数加上前后各 ${overscan} 行，用 transform: translateY 把渲染块定位到对应位置。scroll 里用 requestAnimationFrame 节流，只在可视区间变化时才更新；行用 aria-setsize / aria-posinset 报出总数与序号。`,
      en: `virtual scrolling list, ${total} rows of ${itemHeight}px fixed height, spacer of total x itemHeight to keep the scrollbar honest, render only the visible window plus ${overscan} overscan rows, position the window with transform: translateY, throttle scroll with requestAnimationFrame and only re-render when the window changes, aria-setsize / aria-posinset on rows`,
    }
  },
  loop: 'manual',
  en: {
    oneLiner: 'Only the rows you can see are rendered, so ten thousand items still scroll smoothly.',
    whenToUse: [
      'Feeds, logs and tables with hundreds to tens of thousands of rows',
      'Chat histories and timelines that only grow at both ends',
      'A long candidate list inside a panel with a fixed viewport height',
    ],
    confusions: [
      {
        with: 'infinite scroll',
        diff: 'Infinite scroll decides when to fetch another page; virtual scrolling decides how few rows to render. One solves data volume, the other DOM volume, and they often ship together.',
      },
      {
        with: 'pagination',
        diff: 'Pagination slices data into pages the user walks through. Virtual scrolling keeps one continuous scrollbar and simply does not render the rows outside the viewport.',
      },
    ],
    pitfalls: [
      'Fixed row height makes the window math trivial; variable heights need per-row measurement and a cache',
      'The scroll container needs a spacer of the full height, otherwise the scrollbar and position are wrong',
      'Setting state on every scroll event drops frames: throttle with requestAnimationFrame or update only when the window changes',
      'Render a few rows beyond the viewport (overscan), or fast scrolling shows blanks',
      'Clear per-row animation and expansion state when DOM nodes are recycled, or row 500 leaks into row 12',
      'Screen readers cannot see unrendered rows: report total and position with aria-setsize / aria-posinset, or offer jump-to-N',
    ],
    spec: [
      { label: 'Row height' },
      { label: 'Overscan' },
      { label: 'Scroll handling' },
      { label: 'Spacer height' },
      { label: 'Accessibility' },
    ],
    reducedMotion:
      'Virtual scrolling itself animates nothing. Only smooth scroll-to-row needs to become an instant jump under prefers-reduced-motion.',
    controls: [{ label: 'Row height' }, { label: 'Total rows' }, { label: 'Overscan rows' }],
  },
}

export default entry
