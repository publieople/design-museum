import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'parallax',
  code: 'M-05',
  nameZh: '视差滚动',
  nameEn: 'Parallax',
  aliases: ['视差', '层叠滚动', '分层滚动', '视差效果', 'parallax scrolling', 'multi-layer scroll', 'scroll depth'],
  category: 'motion',
  oneLiner: '滚动时前景和后景走不同速度，画面因此有了纵深。',
  whenToUse: [
    '首屏头图想比正文走得慢一点，制造「往里走」的感觉',
    '多图层插画、品牌页、活动页，想用层次代替真 3D',
    '卡片列表滚过时让背景或图片轻微错位，增加质感',
  ],
  confusions: [
    {
      with: 'fixed 背景',
      diff: 'background-attachment: fixed 是背景相对视口钉住不动，只有一层；视差是每一层用各自的 transform 速度移动，可以有三四层，而且能被 JS 控制。',
    },
    {
      with: '滚动驱动动画 scroll-driven',
      diff: '视差只管「位移随滚动线性变化」；滚动驱动动画可以把滚动进度映射到任意属性（旋转、缩放、颜色），还能用 animation-range 控制起止区间。',
    },
  ],
  pitfalls: [
    '位移距离给太大会让人晕，前后景速度差控制在 20%–50% 就够，超过就没法读内容',
    'scroll 监听里直接读 scrollY 会抖动，用 requestAnimationFrame 节流或 CSS 的 animation-timeline: scroll()',
    '移动端和 prefers-reduced-motion 下最好直接关掉，iOS 的滚动回弹会让视差明显跳一下',
    '给它加 will-change: transform 只在动画期间加，常驻会一直占着合成层显存',
  ],
  keywords: [
    'parallax scrolling',
    'transform: translate3d',
    'will-change: transform',
    'animation-timeline: scroll()',
    'background-attachment: fixed',
    'scroll-linked',
  ],
  spec: [
    { label: '前后景速度比', value: '0.3–0.6（背景慢、前景快）' },
    { label: '单层最大位移', value: '不超过容器高度的 50%' },
    { label: '层级数量', value: '2–4 层，再多看不出区别' },
    { label: '驱动方式', value: 'requestAnimationFrame 或 animation-timeline: scroll()' },
  ],
  reducedMotion:
    'prefers-reduced-motion: reduce 时把位移速度全部置 0，让所有图层停在原位，页面照常可读。',
  refs: [
    { label: 'MDN · translate3d()', url: 'https://developer.mozilla.org/docs/Web/CSS/transform-function/translate3d' },
    { label: 'MDN · animation-timeline', url: 'https://developer.mozilla.org/docs/Web/CSS/animation-timeline' },
  ],
  related: ['scroll-driven', 'scroll-reveal', 'frosted-glass'],
  scenes: ['scroll', 'page', 'card'],
  feel: ['calm', 'soft'],
  intent: ['attention', 'hierarchy'],
  controls: [
    {
      kind: 'range',
      id: 'speed',
      label: '视差强度',
      min: 0,
      max: 1,
      step: 0.05,
      def: 0.45,
      unit: 'x',
      hint: '指每滚 100px 时各层额外偏移的比例；0 就是普通滚动',
    },
    { kind: 'range', id: 'distance', label: '基准位移', min: 0, max: 120, step: 5, def: 60, unit: 'px' },
    { kind: 'toggle', id: 'reverse', label: '反方向', def: false },
  ],
  prompt: (values: ControlValues) => {
    const speed = Number(values.speed)
    const distance = Number(values.distance)
    const reverse = Boolean(values.reverse)
    return {
      zh: `给这个滚动容器做视差滚动（parallax）：背景层按滚动距离乘 ${speed} 偏移，中景和前景各按不同系数偏移，基准位移 ${distance}px${reverse ? '，方向和滚动相反' : ''}。用 transform: translate3d 实现，scroll 里用 requestAnimationFrame 节流，只在滚动期间加 will-change: transform。prefers-reduced-motion 下把系数归零。`,
      en: `parallax scrolling, multi-layer scroll depth, each layer translate3d(0, scrollY * ${speed} + ${distance}px, 0), background slower than foreground${reverse ? ', inverted direction' : ''}, driven by requestAnimationFrame inside a passive scroll listener, will-change: transform only while scrolling, respect prefers-reduced-motion`,
    }
  },
  en: {
    oneLiner: 'Foreground and background move at different speeds as you scroll, which gives the scene depth.',
    whenToUse: [
      'A hero image that should travel slower than the body text, to feel like moving inward',
      'Multi-layer illustrations, brand pages, and campaign pages where layers stand in for real 3D',
      'A card list where the background or image shifts slightly as it passes, adding texture',
    ],
    confusions: [
      {
        with: 'background-attachment: fixed',
        diff: 'background-attachment: fixed pins the background to the viewport and gives you a single layer. Parallax moves each layer with its own transform speed, can stack three or four of them, and can be driven by JS.',
      },
      {
        with: 'scroll-driven animation',
        diff: 'Parallax only shifts position as a function of scroll. Scroll-driven animation can map progress onto any property (rotation, scale, color) and bound it with animation-range.',
      },
    ],
    pitfalls: [
      'Too much travel causes motion sickness; keep the speed difference between layers in the 20-50% range or the content stops being readable',
      'Reading scrollY directly in a scroll listener stutters; throttle with requestAnimationFrame or use animation-timeline: scroll()',
      'Turn it off on mobile and under prefers-reduced-motion; the iOS scroll bounce makes the parallax jump',
      'Add will-change: transform only while scrolling; leaving it on permanently keeps a compositor layer alive',
    ],
    spec: [
      { label: 'Foreground/background speed ratio' },
      { label: 'Max travel per layer' },
      { label: 'Number of layers' },
      { label: 'Drive method' },
    ],
    reducedMotion:
      'Under prefers-reduced-motion: reduce, set every layer speed to 0, leaving all layers in place and the page fully readable.',
    controls: [
      { label: 'Parallax strength', hint: 'The extra offset per layer for every 100px scrolled; 0 is ordinary scrolling' },
      { label: 'Base offset' },
      { label: 'Reverse direction' },
    ],
  },
}

export default entry
