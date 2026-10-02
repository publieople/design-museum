import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'bento-grid',
  code: 'L-04',
  nameZh: 'Bento 网格',
  nameEn: 'Bento Grid',
  aliases: ['便当盒布局', '便当网格', '大小格拼贴', 'bento layout', 'bento box grid', 'feature grid'],
  category: 'layout',
  oneLiner: '大小不一的方块拼成一整块，边线对齐，主次一眼分得清。',
  whenToUse: [
    '首页或仪表盘，几块功能有大小之分，想用版式直接排出主次',
    '一屏里同时要塞下一张主图、几个指标和若干快捷入口',
    '产品介绍页用一块拼贴代替一长串等大的卡片列表',
  ],
  confusions: [
    {
      with: '瀑布流',
      diff: '瀑布流每列各自独立、卡片高度随便，列与列不共享行线；bento 网格有统一的行高和列线，每块只是跨几格，所有边缘必须对齐。',
    },
    {
      with: '等分网格',
      diff: '等分网格每块一样大，没有主次；bento 靠 2×2、2×1 这类跨格把视觉重量拉开。',
    },
  ],
  pitfalls: [
    '跨格数量要和列数匹配：4 列的网格里放 span 3 会留出一条尴尬的空边，改列数时跨格要跟着重算',
    '所有格子一样大就退化成普通网格，bento 的看点就是有大有小',
    '自动排布默认不回头填空洞（grid-auto-flow: row），想要紧凑可以设 dense，但那会打乱视觉顺序',
    '行高写死后，格子里文字一多就溢出，宁可加行高也别裁字',
  ],
  keywords: ['CSS grid', 'grid-column: span', 'grid-row: span', 'grid-auto-rows', 'grid-template-areas', 'dashboard layout'],
  spec: [
    { label: '列数', value: '4 列（桌面）/ 2 列（移动）' },
    { label: '行高', value: '48–72px' },
    { label: '格子间距', value: '8–16px' },
    { label: '跨格', value: '1×1 / 2×1 / 2×2 三种就够' },
    { label: '圆角', value: '14–20px' },
  ],
  reducedMotion:
    'bento 是静态版式，本身不播动画；给格子加入场或 hover 效果时，prefers-reduced-motion: reduce 下只保留透明度变化。',
  refs: [
    { label: 'MDN · CSS grid 布局', url: 'https://developer.mozilla.org/docs/Web/CSS/CSS_grid_layout' },
    { label: 'MDN · grid-template-areas', url: 'https://developer.mozilla.org/docs/Web/CSS/grid-template-areas' },
  ],
  related: ['masonry', 'gradient-border', 'spotlight-glow'],
  scenes: ['page', 'card'],
  feel: ['crisp', 'calm'],
  intent: ['hierarchy', 'attention'],
  controls: [
    { kind: 'range', id: 'columns', label: '列数', min: 3, max: 5, step: 1, def: 4, unit: '列' },
    { kind: 'range', id: 'gap', label: '格子间距', min: 0, max: 16, step: 1, def: 8, unit: 'px' },
    { kind: 'range', id: 'rowHeight', label: '行高', min: 40, max: 64, step: 2, def: 46, unit: 'px' },
    { kind: 'range', id: 'radius', label: '圆角', min: 0, max: 24, step: 1, def: 14, unit: 'px' },
  ],
  prompt: (values: ControlValues) => {
    const columns = Math.round(Number(values.columns))
    const gap = Number(values.gap)
    const rowHeight = Number(values.rowHeight)
    const radius = Number(values.radius)
    return {
      zh: `做一个 Bento 网格首页：CSS grid，${columns} 列，grid-auto-rows: ${rowHeight}px，gap: ${gap}px，格子圆角 ${radius}px。用 grid-column: span 与 grid-row: span 混排 1×1、2×1、2×2 三种尺寸，让主图占 2×2、指标和快捷入口占小格，所有边缘对齐同一条列线。窄屏降到 2 列，跨格跟着重算，别留空边。`,
      en: `bento grid layout, CSS grid, grid-template-columns: repeat(${columns}, minmax(0, 1fr)), grid-auto-rows: ${rowHeight}px, gap: ${gap}px, tiles with grid-column: span / grid-row: span mixing 1x1 2x1 2x2 sizes, border-radius: ${radius}px, all edges aligned to the same column lines, collapse to 2 columns on mobile`,
    }
  },
  en: {
    oneLiner: 'Tiles of different sizes lock into one block with aligned edges, so the hierarchy reads at a glance.',
    whenToUse: [
      'Homepages and dashboards where a few features differ in weight and the layout should say so',
      'Fitting a hero image, several metrics, and a few shortcuts into one screen',
      'Product pages that use one collage instead of a long list of equal cards',
    ],
    confusions: [
      {
        with: 'masonry',
        diff: 'Masonry columns are independent, heights are free, and no row lines are shared. A bento grid has fixed row and column tracks; each tile only spans a few of them and every edge lines up.',
      },
      {
        with: 'an equal-split grid',
        diff: 'An equal grid gives every cell the same size and no hierarchy. Bento pulls the visual weight apart with spans like 2x2 and 2x1.',
      },
    ],
    pitfalls: [
      'Spans have to match the column count: a span of 3 in a 4-column grid leaves an awkward empty edge, and changing the count means recomputing every span',
      'If every tile is the same size it is just a grid; the point of bento is the mix of sizes',
      'Auto-placement does not backfill holes by default (grid-auto-flow: row). dense fills them but scrambles the visual order.',
      'With a fixed row height, text overflows as soon as it grows; add rows instead of clipping the text',
    ],
    spec: [
      { label: 'Columns' },
      { label: 'Row height' },
      { label: 'Tile gap' },
      { label: 'Spans' },
      { label: 'Radius' },
    ],
    reducedMotion:
      'Bento is static layout and plays no animation by itself. If tiles animate in or react on hover, keep only the opacity change under prefers-reduced-motion: reduce.',
    controls: [
      { label: 'Columns' },
      { label: 'Tile gap' },
      { label: 'Row height' },
      { label: 'Radius' },
    ],
  },
}

export default entry