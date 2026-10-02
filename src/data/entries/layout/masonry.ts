import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'masonry',
  code: 'L-03',
  nameZh: '瀑布流',
  nameEn: 'Masonry',
  aliases: ['瀑布流布局', '瀑布流排版', '长短卡片错落', 'masonry layout', 'pinterest layout', 'waterfall layout'],
  category: 'layout',
  oneLiner: '卡片高度不齐，自动落进最短的那一列，底部不留大洞。',
  whenToUse: [
    '图片墙、作品集、商品流，每个条目高度参差不齐',
    '想在一屏里多塞几条内容，又不想把每张图都裁成同一高度',
    '信息流按列填充比按行排列更省竖向空间',
  ],
  confusions: [
    {
      with: '普通网格 grid',
      diff: 'grid 的行是所有列共享的，同一行的卡片从同一条水平线开始，矮卡片下方留空；瀑布流每列各自堆叠，下一张紧接上一张下面，列与列之间不共享行线。',
    },
    {
      with: '等高等宽卡片墙',
      diff: '那种是规则网格，看上去整整齐齐；瀑布流的看点恰恰是高度参差、按列填充。',
    },
  ],
  pitfalls: [
    'CSS 多列（column-count）是列优先填充：内容先填满第一列再进第二列，做无限滚动时新内容会全挤在最后一列，需要改成用 JS 每次插入当前最短的那一列',
    '多列布局里每个条目要写 break-inside: avoid，否则卡片会被从中间劈开、跨到下一列去',
    '不要为了对齐给卡片固定高度，那样就退化成普通网格了',
    '列数只在断点处切换，不要跟着容器宽度实时变，否则拖动窗口时卡片会来回跳',
  ],
  keywords: ['CSS multi-column', 'column-count', 'break-inside: avoid', 'masonry layout', 'shortest column', 'grid-auto-rows'],
  spec: [
    { label: '列数', value: '2 列（窄屏）/ 3 列（≥1024px）' },
    { label: '列间距', value: '12–24px' },
    { label: '条目下间距', value: '与列间距保持一致' },
    { label: '防止跨列', value: 'break-inside: avoid' },
  ],
  reducedMotion:
    '瀑布流是静态排版，不产生动效；若条目带入场动画，prefers-reduced-motion: reduce 时直接以最终排布出现。',
  refs: [
    { label: 'MDN · CSS 多列布局', url: 'https://developer.mozilla.org/docs/Web/CSS/CSS_multicol_layout' },
    { label: 'MDN · break-inside', url: 'https://developer.mozilla.org/docs/Web/CSS/break-inside' },
  ],
  related: ['bento-grid', 'scroll-reveal', 'skeleton-shimmer'],
  scenes: ['list', 'card', 'page'],
  feel: ['calm', 'soft'],
  intent: ['hierarchy', 'attention'],
  controls: [
    { kind: 'range', id: 'columns', label: '列数', min: 2, max: 4, step: 1, def: 3, unit: '列' },
    { kind: 'range', id: 'gap', label: '间距', min: 0, max: 20, step: 1, def: 10, unit: 'px' },
    {
      kind: 'range',
      id: 'base',
      label: '卡片基准高度',
      min: 44,
      max: 120,
      step: 2,
      def: 64,
      unit: 'px',
      hint: '数值越大高度差越明显，错落感越强',
    },
    {
      kind: 'select',
      id: 'mode',
      label: '布局方式',
      def: 'masonry',
      options: [
        { value: 'masonry', label: '瀑布流（按列填充）' },
        { value: 'grid', label: '普通网格（按行对齐）' },
      ],
    },
  ],
  prompt: (values: ControlValues) => {
    const columns = Number(values.columns)
    const gap = Number(values.gap)
    const base = Number(values.base)
    const mode = String(values.mode)
    return {
      zh: `做一个瀑布流（masonry）列表：${columns} 列，列间距 ${gap}px，条目高度围绕 ${base}px 参差排布，每个条目加 break-inside: avoid，别让卡片被从中间劈开跨列；顺序按列从上往下填，窄屏自动降到 2 列。不要用固定高度把每格拉齐，那就不是瀑布流了。${mode === 'grid' ? '先按普通 grid 行对齐排一版做对比。' : ''}`,
      en: `masonry layout, CSS multi-column with column-count: ${columns}, column-gap: ${gap}px, items of varying height around ${base}px with break-inside: avoid, fill columns top-to-bottom, collapse to 2 columns on narrow screens, do not equalize item heights`,
    }
  },
}

export default entry