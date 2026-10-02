import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'skeleton-shimmer',
  code: 'F-04',
  nameZh: '骨架屏微光',
  nameEn: 'Skeleton Shimmer',
  aliases: ['骨架屏', '微光扫过', '加载占位', 'shimmer loading', 'skeleton screen', 'content placeholder'],
  category: 'feedback',
  oneLiner: '灰色占位块上有一道亮光反复扫过，表示内容还在加载。',
  whenToUse: [
    '列表或卡片的数据还没到，先用占位块把布局占住',
    '图片加载前的占位，避免内容一到位整页跳动',
    '想比转圈更明确地预告「这里马上会出现什么」',
  ],
  confusions: [
    {
      with: '转圈 loading（spinner）',
      diff: 'spinner 不透露内容形状，只表示忙；骨架屏按最终布局摆好占位块，内容换了位置也不跳。',
    },
    {
      with: '进度条（progress bar）',
      diff: '进度条表示可量化的进度（比如 30%）；骨架屏表示时长未知的等待，只能靠反复扫光暗示还在动。',
    },
  ],
  pitfalls: [
    '扫光用 background-position 或 width 动画会不停重绘，用覆盖层做 transform: translateX 更省',
    '骨架停留超过 5–8 秒还没内容，用户会以为坏了，要有超时文案或兜底',
    '骨架的圆角、间距、行数和真实内容差太远，内容一进来整页会跳',
    '高光带太宽或对比太强会很吵，宽度取容器的 20%–40%，多条骨架共用同一个 animation 保持同步',
  ],
  keywords: ['skeleton screen', '@keyframes shimmer', 'linear-gradient', 'transform: translateX', 'content placeholder', 'CLS'],
  spec: [
    { label: '单次扫过', value: '1.2–1.8s' },
    { label: '高光带宽', value: '容器的 20%–40%' },
    { label: '骨架底色', value: '当前文字色 8%–12%' },
    { label: '高光', value: '当前文字色 40%–55%' },
    { label: '占位圆角', value: '与真实内容一致' },
  ],
  reducedMotion: 'prefers-reduced-motion: reduce 下去掉扫光动画，只留静态占位块；如果要保留一点动静，改成不移动的透明度呼吸并拉长周期。',
  refs: [
    { label: 'MDN · linear-gradient', url: 'https://developer.mozilla.org/docs/Web/CSS/gradient/linear-gradient' },
    { label: 'MDN · @keyframes', url: 'https://developer.mozilla.org/docs/Web/CSS/@keyframes' },
    { label: 'web.dev · 累计布局偏移 CLS', url: 'https://web.dev/articles/cls' },
  ],
  related: ['optimistic-ui', 'toast', 'stagger'],
  scenes: ['list', 'card', 'page'],
  feel: ['calm', 'soft'],
  intent: ['waiting'],
  controls: [
    { kind: 'range', id: 'duration', label: '扫过一次的时长', min: 800, max: 2600, step: 100, def: 1400, unit: 'ms' },
    { kind: 'range', id: 'highlight', label: '高光带宽', min: 10, max: 60, step: 5, def: 32, unit: '%' },
    { kind: 'range', id: 'rows', label: '文本占位行数', min: 2, max: 6, step: 1, def: 3, unit: '条' },
  ],
  prompt: (values: ControlValues) => {
    const duration = Number(values.duration)
    const highlight = Number(values.highlight)
    const rows = Number(values.rows)
    return {
      zh: '做一个骨架屏微光（skeleton shimmer）：按最终布局摆好占位块，灰色底用 color-mix(in srgb, currentColor 12%, transparent)。再加一层覆盖的 linear-gradient 高光带，宽度约 ' + highlight + '%，用 transform: translateX 从 -100% 平移到 100%，' + duration + 'ms linear infinite 循环，不要动 width 或 background-position。头像圆加 ' + rows + ' 行文本占位。系统减少动态效果时去掉扫光，只留静态占位。',
      en: 'skeleton screen with shimmer, placeholder blocks at currentColor 8-12%, overlay linear-gradient highlight band ' + highlight + '% wide, @keyframes shimmer { from { transform: translateX(-100%) } to { transform: translateX(100%) } }, ' + duration + 'ms linear infinite, ' + rows + ' text rows + avatar circle, animate transform only (never width/background-position), static under prefers-reduced-motion',
    }
  },
  en: {
    oneLiner: 'A grey placeholder block with a light band sweeping across it, showing that the content is still loading.',
    whenToUse: [
      'List or card data has not arrived yet, so placeholder blocks hold the layout in place',
      'An image placeholder that keeps the page from jumping when the content lands',
      'When you want to preview what will appear here more clearly than a spinner does',
    ],
    confusions: [
      { with: 'Spinner', diff: 'A spinner says nothing about the shape of the content, only that something is busy; a skeleton lays out placeholder blocks in the final layout, so nothing jumps when the content swaps in.' },
      { with: 'Progress bar', diff: 'A progress bar shows a measurable amount, such as 30 percent; a skeleton stands for a wait of unknown length and can only suggest that work continues by sweeping again and again.' },
    ],
    pitfalls: [
      'Animating the shimmer with background-position or width repaints constantly; an overlay moving with transform: translateX is cheaper',
      'If the skeleton sits for more than 5-8 seconds with no content, people assume it broke, so provide a timeout message or a fallback',
      'When the skeleton radius, spacing, or row count differs from the real content, the page jumps the moment it arrives',
      'A very wide or high-contrast highlight band is noisy; use 20%-40% of the container width and share one animation across all skeletons so they stay in sync',
    ],
    spec: [
      { label: 'Sweep duration' },
      { label: 'Highlight width' },
      { label: 'Skeleton base' },
      { label: 'Highlight' },
      { label: 'Placeholder radius' },
    ],
    reducedMotion: 'Under prefers-reduced-motion: reduce, remove the sweep and leave a static placeholder; if some motion is wanted, switch to a non-moving opacity pulse with a longer cycle.',
    controls: [
      { label: 'Sweep duration' },
      { label: 'Highlight width' },
      { label: 'Text placeholder rows' },
    ],
  },
}

export default entry
