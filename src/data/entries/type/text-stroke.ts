import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'text-stroke',
  code: 'T-07',
  nameZh: '描边文字',
  nameEn: 'Text Stroke',
  aliases: ['空心字', '描边字', '轮廓文字', 'text stroke', 'outlined text', 'hollow text', 'text outline'],
  category: 'type',
  oneLiner: '文字只留一圈轮廓、里面是空的，大标题一下就硬起来了。',
  whenToUse: [
    '首屏大标题、封面字，想要比实心字更轻的体量',
    '深色或图片背景上，需要文字有明确的轮廓边界',
    '做「描边 + 实心」两层排版，一虚一实叠出层次',
  ],
  confusions: [
    {
      with: '文字阴影',
      diff: 'text-shadow 画在字形外面，字本身的分量不变；text-stroke 是沿字形轮廓描一圈，笔画会被描边吃掉一半，字看起来更细。',
    },
    {
      with: '渐变文字',
      diff: '渐变文字填充的是字形内部；描边字内部是空的。想要「渐变填充 + 描边」就把两者叠加。',
    },
  ],
  pitfalls: [
    '-webkit-text-stroke 是非标准属性（三大引擎都支持），它从轮廓中线向两侧画：小字号加粗描边会把细笔画糊掉，所以只给大字号用',
    '描边宽度用 px 固定，别用 em 跟着字号放大，否则大标题上的笔画全被吃掉',
    '只描边不填充时必须保证对比度：空心字放在浅色底上几乎看不见',
    '加 paint-order: stroke fill 能让描边先画、填充后画，避免描边压住字面',
    '描边色和填充色相同时，效果等于把字加粗，容易显得脏',
    '不要为了描边去用 SVG path 假字：读屏和文本选择都会坏掉',
  ],
  keywords: [
    '-webkit-text-stroke',
    'text-stroke',
    'paint-order',
    'outlined text',
    'hollow text',
    'color: transparent',
    '@supports',
    'stroke-width',
  ],
  spec: [
    { label: '描边宽度', value: '1–3px（大字号）' },
    { label: '建议字号', value: '≥ 32px' },
    { label: '绘制顺序', value: 'paint-order: stroke fill' },
    { label: '空心写法', value: 'color: transparent + -webkit-text-stroke' },
    { label: '对比度', value: '正文级别的文字 ≥ 4.5:1' },
  ],
  reducedMotion: '描边文字是静态的，不需要降级；如果给它加了进出场描边动画，prefers-reduced-motion 下直接显示最终态。',
  refs: [
    { label: 'MDN · -webkit-text-stroke', url: 'https://developer.mozilla.org/docs/Web/CSS/-webkit-text-stroke' },
    { label: 'MDN · paint-order', url: 'https://developer.mozilla.org/docs/Web/CSS/paint-order' },
  ],
  related: ['gradient-text', 'fluid-type'],
  scenes: ['text', 'page', 'card'],
  feel: ['crisp', 'playful'],
  intent: ['attention', 'hierarchy'],
  tags: ['css-only', 'modern-css', 'stable'],
  demo: { shape: 'stage' },
  controls: [
    { kind: 'range', id: 'width', label: '描边宽度', min: 0.5, max: 4, step: 0.5, def: 2, unit: 'px' },
    { kind: 'range', id: 'size', label: '字号', min: 24, max: 96, step: 4, def: 56, unit: 'px' },
    { kind: 'toggle', id: 'fill', label: '实心填充', def: false },
  ],
  prompt: (values: ControlValues) => {
    const width = Number(values.width)
    const size = Number(values.size)
    const fill = values.fill === true
    return {
      zh: `做一个描边标题：字号 ${size}px，用 -webkit-text-stroke: ${width}px 描边，${fill ? '里面用本色填充（描边 + 实心）' : '填充设为 transparent，做成空心字'}，并加 paint-order: stroke fill 让描边先画。描边宽度用 px 固定别用 em；只描边不填充时保证对比度，小字号不要用这个效果。`,
      en: `outlined heading, font-size ${size}px, -webkit-text-stroke: ${width}px, ${fill ? 'solid fill inside the stroke' : 'color: transparent for a hollow face'}, paint-order: stroke fill, px stroke width instead of em, contrast kept when hollow, avoided at small sizes`,
    }
  },
  loop: 'continuous',
  en: {
    oneLiner: 'The glyphs keep only an outline with a hollow centre, which stiffens a big heading.',
    whenToUse: [
      'Hero headings and cover type that should weigh less than a solid face',
      'Dark or photographic backgrounds where type needs a clear boundary',
      'Layouts that stack an outlined line against a solid one for depth',
    ],
    confusions: [
      {
        with: 'text shadow',
        diff: 'A text shadow sits outside the glyph and leaves its weight alone. A stroke traces the outline and eats half the stroke width, so the type looks thinner.',
      },
      {
        with: 'gradient text',
        diff: 'Gradient text fills the inside of the glyph; outlined text leaves it empty. Combine them when you want a gradient fill inside a stroke.',
      },
    ],
    pitfalls: [
      '-webkit-text-stroke is non-standard (though all three engines support it) and paints from the outline centre outwards: thin strokes vanish at small sizes, so use it large',
      'Keep the stroke width in px rather than em, or a big heading loses its thin strokes',
      'Hollow type must still hit contrast: an outline on a light background is nearly invisible',
      'paint-order: stroke fill draws the stroke first so the fill is not covered',
      'A stroke colour matching the fill just looks like extra weight, and usually muddy',
      'Do not fake outlined type with SVG paths: screen readers and text selection break',
    ],
    spec: [
      { label: 'Stroke width' },
      { label: 'Suggested size' },
      { label: 'Paint order' },
      { label: 'Hollow recipe' },
      { label: 'Contrast' },
    ],
    reducedMotion:
      'Outlined type is static and needs no fallback. If you animate the stroke in, show the final state under prefers-reduced-motion.',
    controls: [{ label: 'Stroke width' }, { label: 'Font size' }, { label: 'Solid fill' }],
  },
}

export default entry
