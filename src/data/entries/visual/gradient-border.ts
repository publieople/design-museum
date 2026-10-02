import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'gradient-border',
  code: 'V-06',
  nameZh: '渐变描边',
  nameEn: 'Gradient Border',
  aliases: ['渐变边框', '彩色描边', '渐变边', 'border gradient', 'gradient stroke', 'rainbow border'],
  category: 'visual',
  oneLiner: '描边不是一种颜色，而是一条渐变沿着元素轮廓走一圈。',
  whenToUse: [
    '卡片、按钮要用品牌色勾一圈边，比纯色描边更有层次',
    '突出「当前选中」的那一项，一圈亮边比填满整块更克制',
    '深色背景上把元素边界画清楚，一条亮边就能顶替投影',
    '想要随主题换色的描边，改几个 hsl 值就行',
  ],
  confusions: [
    {
      with: 'border-image',
      diff: 'border-image 是最直觉的写法，但它不认 border-radius，圆角会被切成直角，而且 border-style 不能是 none。要圆角就得用两层 background 配 padding-box / border-box，或者 ::before 加 mask。',
    },
    {
      with: '外发光 box-shadow',
      diff: '外发光落在元素外面，边缘是糊的、没有明确边界；渐变描边是一条实线贴着边界，颜色沿线变化。',
    },
    {
      with: '渐变背景',
      diff: '渐变背景铺满整个面，渐变描边只画那一圈线；同一个渐变值，一个当底一个当边。',
    },
  ],
  pitfalls: [
    'border 必须设成 transparent 且有宽度，否则渐变没有地方画',
    '只写 background-clip: border-box 会把整块底色都铺满，必须两层：padding-box 一层实底，border-box 一层渐变',
    '长条元素上 45deg 的渐变两端颜色会不一样，因为角度按盒子尺寸算；两端想要同色就用 90deg 或 conic-gradient',
    '用 mask-composite 的写法在 Safari 要补 -webkit-mask-composite: xor，否则会变成一整块',
    '描边超过 2px、颜色又亮，就会盖过内容，1–2px 最稳',
    'border-image 和 border-radius 同时写不会报错，只是圆角静默失效，很难查',
  ],
  keywords: [
    'background-clip: padding-box',
    'background-clip: border-box',
    'border: transparent',
    'linear-gradient',
    'conic-gradient',
    '@property',
    'border-image',
  ],
  spec: [
    { label: '描边宽度', value: '1–2px' },
    { label: '渐变角度', value: '90–160deg' },
    { label: '圆角', value: '8–20px' },
    { label: '色标数量', value: '2–3 个' },
    { label: '流动周期', value: '4–8s 一圈' },
  ],
  reducedMotion: '渐变描边是静态装饰，不需要降级；如果让它用 @property 角度动画流动，prefers-reduced-motion: reduce 下停掉动画，固定在起始角度的渐变。',
  refs: [
    { label: 'MDN · border-image', url: 'https://developer.mozilla.org/docs/Web/CSS/border-image' },
    { label: 'MDN · background-clip', url: 'https://developer.mozilla.org/docs/Web/CSS/background-clip' },
    { label: 'MDN · @property', url: 'https://developer.mozilla.org/docs/Web/CSS/@property' },
  ],
  related: ['glassmorphism', 'mesh-gradient', 'spotlight-glow'],
  scenes: ['card', 'button', 'form'],
  feel: ['crisp', 'playful'],
  intent: ['attention', 'hierarchy'],
  controls: [
    {
      kind: 'range',
      id: 'width',
      label: '描边宽度',
      min: 1,
      max: 6,
      step: 1,
      def: 2,
      unit: 'px',
      hint: '1px 是细亮线，3px 以上开始抢内容',
    },
    {
      kind: 'range',
      id: 'angle',
      label: '渐变角度',
      min: 0,
      max: 360,
      step: 5,
      def: 135,
      unit: 'deg',
      hint: '长条元素上换角度，两端颜色会明显不一样',
    },
    {
      kind: 'range',
      id: 'hue',
      label: '起始色相',
      min: 0,
      max: 360,
      step: 5,
      def: 265,
      unit: 'deg',
      hint: '后两个色标自动 +90deg、+180deg',
    },
    {
      kind: 'range',
      id: 'radius',
      label: '圆角',
      min: 0,
      max: 28,
      step: 1,
      def: 14,
      unit: 'px',
      hint: '调到 20px 以上，再去试 border-image 写法的圆角失效',
    },
  ],
  prompt: (values: ControlValues) => {
    const width = Number(values.width)
    const angle = Number(values.angle)
    const hue = Number(values.hue)
    const radius = Number(values.radius)
    const second = (hue + 90) % 360
    const third = (hue + 180) % 360
    return {
      zh: `给卡片做渐变描边（gradient border）：不要用 border-image，它不支持圆角。写成 border: ${width}px solid transparent，再叠两层背景——padding-box 一层实底盖住内部，border-box 一层 linear-gradient(${angle}deg, hsl(${hue}, 90%, 62%), hsl(${second}, 92%, 55%), hsl(${third}, 88%, 60%))，配 border-radius: ${radius}px。再用 @property 注册一个角度变量，让描边 6s 线性无限慢慢转。`,
      en: `gradient border, border: ${width}px solid transparent, background: linear-gradient(...) padding-box, linear-gradient(${angle}deg, hsl(${hue}, 90%, 62%), hsl(${second}, 92%, 55%)) border-box, background-clip: padding-box / border-box, border-radius: ${radius}px, @property registered angle, 6s linear infinite rotation, avoid border-image since it ignores border-radius`,
    }
  },
  en: {
    oneLiner: 'The border is not one color but a gradient running once around the element outline.',
    whenToUse: [
      'A card or button that should be outlined in a brand color, with more depth than a flat border',
      'Marking the selected item, where a bright ring is more restrained than filling the whole block',
      'Defining an element edge on a dark background, where one bright line can replace a shadow',
      'A border that should recolor with the theme, by changing a couple of hsl values',
    ],
    confusions: [
      {
        with: 'border-image',
        diff: 'border-image is the obvious first try, but it ignores border-radius, so rounded corners get cut square, and border-style cannot be none. Rounding needs two background layers with padding-box and border-box, or a ::before plus a mask.',
      },
      {
        with: 'outer glow (box-shadow)',
        diff: 'An outer glow falls outside the element with a soft, undefined edge. A gradient border is a solid line along the boundary, with color changing as it travels.',
      },
      {
        with: 'gradient background',
        diff: 'A gradient background fills the whole surface; a gradient border paints only that ring. The same gradient value does two different jobs depending on which one you use.',
      },
    ],
    pitfalls: [
      'border has to be transparent and have a width, or the gradient has nowhere to paint',
      'background-clip: border-box alone fills the whole surface; you need two layers, a solid padding-box layer and a border-box gradient',
      'On a long element a 45deg gradient ends at a different color on each side because the angle follows the box dimensions; for matching ends use 90deg or a conic-gradient',
      'The mask-composite approach needs -webkit-mask-composite: xor on Safari, or it becomes one solid block',
      'A border past 2px in a bright color overpowers the content; 1px to 2px is the safe range',
      'border-image and border-radius together throw no error, the rounding just silently stops working, which is hard to track down',
    ],
    spec: [
      { label: 'Border width' },
      { label: 'Gradient angle' },
      { label: 'Corner radius' },
      { label: 'Color stops' },
      { label: 'Rotation period' },
    ],
    reducedMotion:
      'A gradient border is static decoration and needs no fallback. If you animate the angle with @property to make it flow, prefers-reduced-motion: reduce should stop the animation and hold the gradient at its starting angle.',
    controls: [
      { label: 'Border width', hint: '1px is a thin bright line; past 3px it starts fighting the content' },
      { label: 'Gradient angle', hint: 'Change the angle on a long element and the two ends clearly differ' },
      { label: 'Start hue', hint: 'The next two stops shift by +90deg and +180deg' },
      { label: 'Corner radius', hint: 'Push it past 20px, then try the border-image approach to watch the rounding fail' },
    ],
  },
}

export default entry
