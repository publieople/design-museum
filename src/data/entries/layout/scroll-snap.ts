import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'scroll-snap',
  code: 'L-05',
  nameZh: '滚动捕捉',
  nameEn: 'Scroll Snap',
  aliases: ['滚动吸附', '滑动吸附', '对齐滚动', 'scroll snapping', 'snap scrolling', 'scroll-snap-type'],
  category: 'layout',
  oneLiner: '滚动停下来时自动对齐到某一张卡片，不会卡在半路上。',
  whenToUse: [
    '横向轮播、图片画廊，每次滑一张',
    '全屏分页的落地页，一屏一段内容',
    '移动端的步骤条、日期选择器、卡片选择器，要「滑到哪个就是哪个」',
  ],
  confusions: [
    {
      with: '轮播 carousel',
      diff: '轮播用 JS 定时切页，用户只能点箭头；scroll-snap 用的是原生滚动容器，惯性、拖动、触控板、键盘全都交给浏览器，代码只规定「停在哪」。',
    },
    {
      with: 'scroll-behavior: smooth',
      diff: 'smooth 管的是「跳转过程怎么滑过去」；snap 管的是「滑完最终停在哪里」，两者互不替代。',
    },
  ],
  pitfalls: [
    'scroll-snap-type 要写在滚动容器上，scroll-snap-align 写在子项上，写反了完全没反应',
    '容器必须有确定的尺寸和 overflow，内容比容器还短就没有可滚动的余量，自然也谈不上吸附',
    'mandatory 用在内容高于视口的纵向区域会「锁屏」，用户滚不到底部，长内容要用 proximity',
    '子项比容器还大时，align: start 会让尾部内容永远露不出来',
    '吸附位置的内边距靠容器的 scroll-padding，给子项加 margin 不算数',
  ],
  keywords: ['scroll-snap-type', 'scroll-snap-align', 'scroll-snap-stop', 'scroll-padding', 'overscroll-behavior', 'mandatory vs proximity'],
  spec: [
    { label: '容器', value: 'scroll-snap-type: x mandatory' },
    { label: '子项', value: 'scroll-snap-align: start' },
    { label: '内边距', value: 'scroll-padding-inline: 12–24px' },
    { label: '防止连跳', value: 'scroll-snap-stop: always' },
    { label: '子项宽度', value: '容器宽度的 75%–100%' },
  ],
  reducedMotion:
    '吸附本身不是动画，不用关；但用 scroll-behavior: smooth 滚到某一张时，prefers-reduced-motion: reduce 下应改回 auto，直接跳过去。',
  refs: [
    { label: 'MDN · CSS scroll snap', url: 'https://developer.mozilla.org/docs/Web/CSS/CSS_scroll_snap' },
    { label: 'MDN · scroll-snap-type', url: 'https://developer.mozilla.org/docs/Web/CSS/scroll-snap-type' },
  ],
  related: ['scroll-driven', 'sticky-header', 'masonry'],
  scenes: ['scroll', 'nav', 'card'],
  feel: ['crisp', 'calm'],
  intent: ['affordance', 'hierarchy'],
  controls: [
    {
      kind: 'select',
      id: 'snap',
      label: '吸附强度',
      def: 'x mandatory',
      options: [
        { value: 'x mandatory', label: 'x mandatory（强制对齐）' },
        { value: 'x proximity', label: 'x proximity（靠近才吸）' },
        { value: 'none', label: 'none（普通滚动）' },
      ],
    },
    { kind: 'range', id: 'padding', label: '吸附内边距', min: 0, max: 32, step: 2, def: 12, unit: 'px' },
    {
      kind: 'select',
      id: 'align',
      label: '对齐位置',
      def: 'start',
      options: [
        { value: 'start', label: 'start（对齐容器开头）' },
        { value: 'center', label: 'center（居中）' },
        { value: 'end', label: 'end（对齐容器末尾）' },
      ],
    },
    { kind: 'toggle', id: 'stop', label: '防止一次跳多张', def: true },
  ],
  prompt: (values: ControlValues) => {
    const snap = String(values.snap)
    const padding = Number(values.padding)
    const align = String(values.align)
    const stop = Boolean(values.stop)
    const snapZh = snap === 'none' ? 'scroll-snap-type: none（先关掉吸附做对比）' : `scroll-snap-type: ${snap}`
    return {
      zh: `做一个横向滚动的卡片选择器：滚动容器用 ${snapZh}，子项用 scroll-snap-align: ${align}，容器加 scroll-padding: ${padding}px${stop ? '，子项加 scroll-snap-stop: always，防止一次滑动跳过好几张' : ''}。容器自身要有固定高度和 overflow-x: auto，让原生惯性和键盘滚动都可用。系统开启「减少动态效果」时 scroll-behavior 用 auto。`,
      en: `horizontal snap slider, scroll container with scroll-snap-type: ${snap}, items with scroll-snap-align: ${align}, scroll-padding: ${padding}px${stop ? ', scroll-snap-stop: always to prevent skipping multiple slides' : ''}, overflow-x: auto container with fixed height, native momentum scrolling and keyboard support, scroll-behavior: auto under prefers-reduced-motion`,
    }
  },
  en: {
    oneLiner: 'Scrolling comes to rest on a card instead of stopping halfway between two of them.',
    whenToUse: [
      'Horizontal carousels and image galleries where each swipe shows one item',
      'Full-page landing pages built as one section per screen',
      'Mobile steppers, date pickers, and card pickers where whatever you land on is the selection',
    ],
    confusions: [
      {
        with: 'carousel',
        diff: 'A carousel cuts slides on a JS timer and often limits you to arrow buttons. scroll-snap uses a native scroll container, so inertia, drag, trackpads, and the keyboard all come from the browser; the CSS only says where scrolling may stop.',
      },
      {
        with: 'scroll-behavior: smooth',
        diff: 'smooth controls how a jump travels to its target; snap controls where the scroll finally rests. Neither one replaces the other.',
      },
    ],
    pitfalls: [
      'scroll-snap-type goes on the scroll container and scroll-snap-align on the children; swap them and nothing happens',
      'The container needs a definite size and overflow. When the content is shorter than the container there is nothing to scroll and nothing to snap.',
      'mandatory on a vertical area taller than the viewport traps the user and they cannot reach the bottom; use proximity for long content',
      'When an item is larger than the container, align: start hides the tail of that item for good',
      'Padding around the snap position comes from scroll-padding on the container; margins on the children do not count',
    ],
    spec: [
      { label: 'Container' },
      { label: 'Items' },
      { label: 'Padding' },
      { label: 'Skip prevention' },
      { label: 'Item width' },
    ],
    reducedMotion:
      'Snapping is not an animation and does not need to be turned off. But when you scroll to a slide with scroll-behavior: smooth, switch it back to auto under prefers-reduced-motion: reduce so the jump is instant.',
    controls: [
      { label: 'Snap strength' },
      { label: 'Snap padding' },
      { label: 'Alignment' },
      { label: 'Prevent skipping multiple items' },
    ],
  },
}

export default entry