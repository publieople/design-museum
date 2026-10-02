import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'frosted-glass',
  code: 'V-01',
  nameZh: '毛玻璃',
  nameEn: 'Frosted Glass',
  aliases: ['磨砂玻璃', '磨砂', '毛玻璃效果', 'backdrop blur', 'backdrop-filter', 'glass blur'],
  category: 'visual',
  oneLiner: '面板背后的内容被真的模糊掉，像隔着一层磨砂玻璃看过去。',
  whenToUse: [
    '导航栏、浮层压在滚动内容或照片上，既要有层次又要透出底下',
    '卡片叠在图片或彩色背景上，希望它属于这个画面而不是贴上去',
    '需要让人一眼看出「这块浮在上面」，又不想用实心色块把背景挡死',
  ],
  confusions: [
    {
      with: '半透明',
      diff: '半透明只是让面板变淡，背后内容依然清晰；毛玻璃会把背后内容真的糊掉。只调 opacity 或 rgba 做不出毛玻璃。',
    },
    {
      with: '模糊滤镜 blur()',
      diff: 'filter: blur() 模糊的是元素自己（连它的文字一起糊）；backdrop-filter: blur() 模糊的是它背后的东西，元素自身内容保持清晰。',
    },
  ],
  pitfalls: [
    '背后必须有内容：纯色背景上加 backdrop-filter 看不出任何变化',
    '父级带 overflow: hidden 或 transform 时，部分浏览器会失效或裁切异常',
    '模糊半径超过 20px 就会糊成一片，文字对比度下降，8–16px 通常够用',
    'Safari 需要 -webkit-backdrop-filter 前缀，且要给不支持的浏览器留可读底色',
  ],
  keywords: [
    'backdrop-filter',
    'blur()',
    'saturate()',
    'frosted glass',
    'backdrop blur',
    'translucent panel',
  ],
  spec: [
    { label: '模糊半径', value: '8–16px' },
    { label: '饱和度', value: '140%–200%' },
    { label: '面板底色', value: 'rgba(255,255,255,0.06–0.12)' },
    { label: '描边', value: '1px rgba(255,255,255,0.18)' },
  ],
  reducedMotion:
    '毛玻璃是静态效果，本身不需要降级；如果配合入场动画，在 prefers-reduced-motion 下应直接呈现最终状态。',
  refs: [
    {
      label: 'MDN · backdrop-filter',
      url: 'https://developer.mozilla.org/docs/Web/CSS/backdrop-filter',
    },
    { label: 'web.dev · backdrop-filter', url: 'https://web.dev/articles/backdrop-filter' },
  ],
  related: ['glassmorphism', 'gradient-border', 'grain-noise'],
  scenes: ['card', 'nav', 'page'],
  feel: ['soft', 'calm'],
  intent: ['hierarchy'],
  controls: [
    {
      kind: 'range',
      id: 'blur',
      label: '模糊半径',
      min: 0,
      max: 30,
      step: 1,
      def: 12,
      unit: 'px',
      hint: '拖到 0px 能直观看出「模糊」和「透明」不是一回事',
    },
    { kind: 'range', id: 'saturate', label: '饱和度', min: 100, max: 250, step: 5, def: 180, unit: '%' },
    { kind: 'range', id: 'alpha', label: '面板底色不透明度', min: 0, max: 40, step: 1, def: 8, unit: '%' },
    { kind: 'range', id: 'radius', label: '圆角', min: 0, max: 28, step: 1, def: 14, unit: 'px' },
  ],
  prompt: (values: ControlValues) => {
    const blur = Number(values.blur)
    const saturate = Number(values.saturate)
    const alpha = Number(values.alpha) / 100
    const radius = Number(values.radius)
    return {
      zh: `做一个毛玻璃（Frosted Glass）面板：用 backdrop-filter: blur(${blur}px) saturate(${saturate}%) 把面板背后的内容模糊掉，面板底色 rgba(255,255,255,${alpha.toFixed(2)})，圆角 ${radius}px，1px rgba(255,255,255,0.18) 描边勾出玻璃边缘。面板必须叠在有内容的背景上（照片或彩色渐变），不要用半透明纯色糊弄，那不是毛玻璃。`,
      en: `frosted glass panel, backdrop-filter: blur(${blur}px) saturate(${saturate}%), -webkit-backdrop-filter fallback, background: rgba(255,255,255,${alpha.toFixed(2)}), border: 1px solid rgba(255,255,255,0.18), border-radius: ${radius}px, must sit over visible content behind`,
    }
  },
  en: {
    oneLiner: 'A panel blurs the content behind it, like looking through ground glass.',
    whenToUse: [
      'A nav bar or floating panel over scrolling content or a photo that should stay readable while showing what is underneath',
      'A card on top of an image or a colorful background that should feel part of the scene instead of pasted on',
      'You want it obvious that this block floats above the rest without a solid fill covering the background',
    ],
    confusions: [
      {
        with: 'translucency',
        diff: 'Translucency only fades the panel and the content behind stays sharp. Frosted glass actually blurs what is behind it. Lowering opacity or using rgba gets you translucency, never frost.',
      },
      {
        with: 'filter: blur()',
        diff: 'filter: blur() blurs the element itself, text included. backdrop-filter: blur() blurs whatever sits behind the element while the panel content stays sharp.',
      },
    ],
    pitfalls: [
      'There has to be content behind it: backdrop-filter over a flat color shows no change at all',
      'When an ancestor has overflow: hidden or transform, some browsers drop the effect or clip it oddly',
      'Past a 20px blur radius everything smears together and text contrast drops; 8px to 16px is usually enough',
      'Safari needs the -webkit-backdrop-filter prefix, and browsers without support still need a readable base color',
    ],
    spec: [
      { label: 'Blur radius' },
      { label: 'Saturation' },
      { label: 'Panel background' },
      { label: 'Border' },
    ],
    reducedMotion:
      'Frosted glass is static, so it needs no fallback on its own. If you pair it with an entrance animation, prefers-reduced-motion should jump straight to the final state.',
    controls: [
      { label: 'Blur radius', hint: 'At 0px you can see that blur and transparency are not the same thing' },
      { label: 'Saturation' },
      { label: 'Panel background opacity' },
      { label: 'Corner radius' },
    ],
  },
}

export default entry
