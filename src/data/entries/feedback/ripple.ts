import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'ripple',
  code: 'F-07',
  nameZh: '涟漪反馈',
  nameEn: 'Ripple',
  aliases: ['水波纹', '点击涟漪', '波纹扩散', 'ripple effect', 'material ripple', 'touch ripple'],
  category: 'feedback',
  oneLiner: '点下去的地方荡开一圈水波，告诉用户这一下收到了。',
  whenToUse: [
    '按钮、列表项、开关这类要明确「点到了」的控件',
    '触屏上没有 hover，需要让人看出这一下点在哪、有没有生效',
    '整套界面想要统一的点击反馈语言（Material 风格的基础件）',
  ],
  confusions: [
    {
      with: '按压反馈',
      diff: '按压反馈让整个控件缩放或变暗，是「整体」的状态；涟漪从落点扩散，能看出点在哪一下，两者经常叠在一起用。',
    },
    {
      with: '进度条',
      diff: '涟漪只是「按下收到了」，不表示进度；别让它一直扩下去或循环，否则用户会以为在加载。',
    },
  ],
  pitfalls: [
    '波纹用 transform: scale() + opacity 扩散，别去改 width/height，否则每一帧都要重排',
    '每个波纹节点动画结束就要移除，手指长按会连着生成，不管就会堆出上百个节点',
    '要按落点扩散就得用 pointerdown 的坐标减去元素盒子的位置，写死从中心扩散会丢掉「点在哪」的信息',
    '控件要 overflow: hidden 才裁得出边界，否则波纹会溢出到外面',
    '键盘 Enter/Space 触发时没有坐标，退化成从中心扩散，别让它什么都不发生',
    'prefers-reduced-motion 下改成一个短促的底色变化，功能不变',
  ],
  keywords: [
    'ripple effect',
    'Material ripple',
    'pointerdown',
    'radial-gradient',
    'transform: scale()',
    'overflow: hidden',
    'animation-play-state',
    '::after',
  ],
  spec: [
    { label: '扩散时长', value: '300–600ms' },
    { label: '起始透明度', value: '0.25–0.4' },
    { label: '直径', value: '不小于元素对角线，从落点算起' },
    { label: '缓动', value: 'ease-out' },
    { label: '裁剪', value: 'overflow: hidden' },
  ],
  reducedMotion: 'prefers-reduced-motion 下不放涟漪，改成 80–150ms 的底色或描边变化，按下反馈依然存在。',
  refs: [
    { label: 'MDN · scale()', url: 'https://developer.mozilla.org/docs/Web/CSS/transform-function/scale' },
    { label: 'MDN · pointerdown 事件', url: 'https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event' },
  ],
  related: ['press-feedback', 'spotlight-glow'],
  scenes: ['button', 'list', 'card'],
  feel: ['crisp', 'playful'],
  intent: ['affordance', 'attention'],
  tags: ['js', 'gradient', 'composited', 'keyboard-operable', 'stable'],
  demo: { shape: 'stage' },
  controls: [
    { kind: 'range', id: 'duration', label: '扩散时长', min: 200, max: 800, step: 20, def: 450, unit: 'ms' },
    { kind: 'range', id: 'opacity', label: '起始透明度', min: 10, max: 50, step: 5, def: 30, unit: '%' },
    { kind: 'toggle', id: 'fromPoint', label: '从落点扩散', def: true },
  ],
  prompt: (values: ControlValues) => {
    const duration = Number(values.duration)
    const peak = Number(values.opacity)
    const fromPoint = values.fromPoint !== false
    return {
      zh: `做点击涟漪反馈（ripple）：在按钮 pointerdown 时${fromPoint ? '按落点坐标' : '从中心'}生成一个圆形波纹，直径覆盖整块按钮，用 transform: scale(0) → scale(1) 扩散、不透明度 ${peak}% 渐隐到 0，时长 ${duration}ms、ease-out，按钮 overflow: hidden 裁出边界，动画结束后把波纹节点移除。键盘 Enter/Space 触发时从中心扩散；prefers-reduced-motion 下改成短促的底色变化。`,
      en: `material ripple feedback, circle spawned at the ${fromPoint ? 'pointerdown coordinates' : 'center'}, scaled from 0 to 1 with opacity fading from ${peak}% to 0 over ${duration}ms ease-out, button has overflow: hidden, remove the ripple node on animationend, centered ripple for Enter/Space, short background-color change under prefers-reduced-motion`,
    }
  },
  loop: 'replay',
  en: {
    oneLiner: 'A ripple spreads from where you pressed, confirming that the tap registered.',
    whenToUse: [
      'Buttons, list rows and switches that must clearly confirm a press',
      'Touch screens, where there is no hover, so people can see where the tap landed',
      'Apps that want one shared press-feedback language (the base of Material-style controls)',
    ],
    confusions: [
      {
        with: 'press feedback',
        diff: 'Press feedback changes the whole control (scale or dim). A ripple spreads from the exact press point. They are often stacked.',
      },
      {
        with: 'progress bar',
        diff: 'A ripple only says the press registered. It never means progress, so do not let it loop or grow forever.',
      },
    ],
    pitfalls: [
      'Scale and fade the ripple with transform and opacity; animating width or height re-layouts every frame',
      'Remove each ripple node when its animation ends, or a long press piles up hundreds of nodes',
      'For origin-based ripples subtract the element box from the pointerdown coordinates; a hardcoded center throws away where the press landed',
      'The control needs overflow: hidden, otherwise the ripple spills outside its borders',
      'Keyboard Enter/Space has no coordinates: fall back to a centered ripple instead of doing nothing',
      'Under prefers-reduced-motion use a short background-color change so the feedback stays',
    ],
    spec: [
      { label: 'Duration' },
      { label: 'Peak opacity' },
      { label: 'Diameter' },
      { label: 'Easing' },
      { label: 'Clipping' },
    ],
    reducedMotion:
      'Under prefers-reduced-motion drop the ripple and change the background or border for 80–150ms, so the press still has feedback.',
    controls: [{ label: 'Spread duration' }, { label: 'Start opacity' }, { label: 'Spread from press point' }],
  },
}

export default entry
