import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'grain-noise',
  code: 'V-04',
  nameZh: '颗粒噪点',
  nameEn: 'Grain Noise',
  aliases: ['噪点', '颗粒感', '胶片颗粒', '杂色', 'film grain', 'noise texture', 'grain overlay'],
  category: 'visual',
  oneLiner: '在画面上撒一层随机像素，给纯色和渐变加质感，顺手压掉色带。',
  whenToUse: [
    '大面积渐变或深色背景出现一圈圈色带（banding）时，用噪点把它打散',
    '卡片、插画、缩略图想有一点胶片或纸张的颗粒，不再干净到发假',
    '不同来源的图片材质不统一，铺一层颗粒把它们拉进同一个世界',
    '深色界面里加一点质感，比再加一层投影更轻',
  ],
  confusions: [
    {
      with: '半透明黑色遮罩',
      diff: '蒙一层黑是整体压暗，亮度往下走；噪点让每个像素随机变亮或变暗，平均亮度不变，所以画面不黑，只是有了颗粒。',
    },
    {
      with: '重复纹理贴图',
      diff: '平铺一张 png 会看到重复单元和接缝，放大后尤其明显；feTurbulence 生成的是程序化噪声，配合 stitchTiles="stitch" 几乎看不出重复，颗粒粗细还能随参数调。',
    },
    {
      with: '抖动 dithering',
      diff: '抖动是渲染器为了压制色带自己做的，粒度跟像素对齐；颗粒噪点是你手动叠的一层材质，可以调大小、强度和混合模式。',
    },
  ],
  pitfalls: [
    'baseFrequency 低于 0.3 会变成大块云雾，不像颗粒；0.5–0.9 之间才是细砂',
    '噪点层必须 pointer-events: none，不然整块区域都点不动',
    '不透明度超过 15% 画面会发脏，文字对比度也跟着掉，3%–10% 通常刚好',
    '深色背景上用 overlay 混合几乎看不见，换 normal 或提高强度',
    'feTurbulence 是实时算的，SVG 尺寸给太大会拖慢首帧，用 120–200px 的小瓦片平铺',
    '给噪点层加抖动动画时用 steps() 而不是线性缓动，线性看起来像在飘',
  ],
  keywords: [
    'feTurbulence',
    'fractalNoise',
    'baseFrequency',
    'stitchTiles',
    'mix-blend-mode',
    'SVG filter',
    'data URI',
  ],
  spec: [
    { label: 'baseFrequency', value: '0.5–0.9' },
    { label: 'numOctaves', value: '2–4' },
    { label: '颗粒直径', value: '1–2px' },
    { label: '不透明度', value: '3%–10%' },
    { label: '混合模式', value: 'overlay / soft-light / normal' },
    { label: '瓦片尺寸', value: '120–200px' },
  ],
  reducedMotion: '颗粒是静态材质，不需要降级；如果做了模拟胶片跳动的逐帧位移，prefers-reduced-motion: reduce 下停掉抖动，只留静止的颗粒层。',
  refs: [
    { label: 'MDN · feTurbulence', url: 'https://developer.mozilla.org/docs/Web/SVG/Element/feTurbulence' },
    { label: 'MDN · mix-blend-mode', url: 'https://developer.mozilla.org/docs/Web/CSS/mix-blend-mode' },
  ],
  related: ['mesh-gradient', 'frosted-glass', 'gradient-border'],
  scenes: ['page', 'card'],
  feel: ['calm', 'soft'],
  intent: ['hierarchy'],
  controls: [
    {
      kind: 'range',
      id: 'grain',
      label: '颗粒大小',
      min: 1,
      max: 6,
      step: 0.25,
      def: 1.5,
      unit: 'px',
      hint: '换算成 baseFrequency = 1/直径；1–2px 最像胶片，4px 以上像砂纸',
    },
    {
      kind: 'range',
      id: 'opacity',
      label: '噪点不透明度',
      min: 0,
      max: 24,
      step: 1,
      def: 8,
      unit: '%',
      hint: '拖到 0 能对比出它在压色带上的作用',
    },
    {
      kind: 'select',
      id: 'blend',
      label: '混合模式',
      def: 'overlay',
      options: [
        { value: 'overlay', label: 'overlay（对比最强）' },
        { value: 'soft-light', label: 'soft-light（柔和）' },
        { value: 'normal', label: 'normal（直接盖上去）' },
      ],
    },
    { kind: 'toggle', id: 'flicker', label: '颗粒抖动', def: true },
  ],
  prompt: (values: ControlValues) => {
    const grain = Number(values.grain)
    const opacity = Number(values.opacity)
    const blend = String(values.blend)
    const flicker = Boolean(values.flicker)
    const frequency = (1 / grain).toFixed(2)
    return {
      zh: `给这块深色渐变面板加一层颗粒噪点（grain noise）：把一张 160x160 的 SVG feTurbulence data URI 当 background-image 平铺，baseFrequency="${frequency}"（约 ${grain}px 颗粒）、type="fractalNoise"、numOctaves="3"、stitchTiles="stitch"；噪点层 opacity: ${opacity}%、mix-blend-mode: ${blend}、pointer-events: none。${flicker ? '再用 steps() 的 transform 位移做胶片跳动，' : ''}目的是压住渐变色带，不是把画面搞脏。`,
      en: `film grain noise overlay, SVG feTurbulence fractalNoise baseFrequency="${frequency}" numOctaves="3" stitchTiles="stitch", data URI background-image repeated 160px tile, opacity: ${opacity}%, mix-blend-mode: ${blend}, pointer-events: none${flicker ? ', steps(6) transform jitter keyframes' : ''}, dithering to hide gradient banding`,
    }
  },
  en: {
    oneLiner: 'A layer of random pixels over the surface that adds texture and hides banding in gradients.',
    whenToUse: [
      'A large gradient or dark background shows banding in rings; the noise breaks it up',
      'Cards, illustrations, and thumbnails want a little film or paper grain so they stop looking too clean',
      'Images from different sources do not match in texture; one grain layer pulls them into the same world',
      'A dark interface wants a bit of texture, and grain is lighter than adding another shadow',
    ],
    confusions: [
      {
        with: 'translucent black overlay',
        diff: 'A black overlay darkens everything and pushes brightness down. Noise makes each pixel randomly lighter or darker while the average brightness stays the same, so the image does not go dark, it just gains grain.',
      },
      {
        with: 'repeating texture image',
        diff: 'Tiling a PNG shows the repeated unit and its seams, especially when zoomed. feTurbulence generates procedural noise, and with stitchTiles="stitch" the repeat is nearly invisible, while the grain size follows the parameters.',
      },
      {
        with: 'dithering',
        diff: 'Dithering is what the renderer does on its own to suppress banding, and its grain aligns with pixel boundaries. Grain noise is a material layer you add by hand, with control over scale, strength, and blend mode.',
      },
    ],
    pitfalls: [
      'A baseFrequency below 0.3 turns into large clouds, not grain; the fine sand look sits between 0.5 and 0.9',
      'The noise layer must have pointer-events: none, or the whole area stops responding to clicks',
      'Above 15% opacity the image turns dirty and text contrast drops with it; 3% to 10% usually lands right',
      'On dark backgrounds overlay blend is nearly invisible; switch to normal or raise the strength',
      'feTurbulence computes in real time, so a large SVG slows the first frame; tile a small 120px to 200px patch instead',
      'For grain jitter use steps() rather than a linear easing, which reads as drifting',
    ],
    spec: [
      { label: 'baseFrequency' },
      { label: 'numOctaves' },
      { label: 'Grain size' },
      { label: 'Opacity' },
      { label: 'Blend mode' },
      { label: 'Tile size' },
    ],
    reducedMotion:
      'Grain is a static material and needs no fallback. If you animate frame-by-frame displacement to mimic film, prefers-reduced-motion: reduce should stop the jitter and leave the still grain layer.',
    controls: [
      { label: 'Grain size', hint: 'Converted to baseFrequency = 1 / diameter; 1px to 2px looks most like film, past 4px it looks like sandpaper' },
      { label: 'Noise opacity', hint: 'Drag it to 0 to compare how much it is doing against banding' },
      { label: 'Blend mode' },
      { label: 'Grain jitter' },
    ],
  },
}

export default entry
