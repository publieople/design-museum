import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'scroll-driven',
  code: 'M-06',
  nameZh: '滚动驱动动画',
  nameEn: 'Scroll-Driven Animation',
  aliases: ['滚动时间线', '滚动进度动画', '滚动联动动画', 'scroll timeline', 'scroll-driven animations', 'animation-timeline'],
  category: 'motion',
  oneLiner: '滚动条就是进度条：滚到哪一帧由滚动位置决定。',
  whenToUse: [
    '阅读进度条、章节指示条，天然就是「滚多少走多少」',
    '卡片滚进画面时同时旋转、放大、改变饱和度',
    '希望动画跟手指位置严格对应，来回滚也要能正反播',
  ],
  confusions: [
    {
      with: '滚动揭示 scroll reveal',
      diff: '揭示是进视口触发一次就播完，之后和滚动位置无关；滚动驱动动画的每一帧都绑在滚动位置，同一个位置永远是同一帧，往回滚会倒着播。',
    },
    {
      with: '用 scroll 事件写 JS 动画',
      diff: 'scroll 事件在合成线程之外触发，滚快了会掉帧；animation-timeline 由合成器驱动，不占主线程，但要现代浏览器（Chrome 115+）才支持。',
    },
  ],
  pitfalls: [
    'animation-range 不写就用默认值，动画可能在元素刚露头时就播完，看着像没生效',
    '用 JS 在 scroll 事件里读 scrollTop 再写样式，每帧同步读写会掉帧，交给 CSS 或 rAF 节流',
    'animation-timeline 在 Safari 和 Firefox 上的支持还不完整，必须准备不用动画也能看的静态版本（本 demo 里有降级指示）',
    '进度条用 scaleX 做，别改 width，后者每帧都要重排',
  ],
  keywords: [
    'animation-timeline',
    'scroll()',
    'view()',
    'animation-range',
    'scroll-driven animations',
    'scroll progress',
    'requestAnimationFrame fallback',
  ],
  spec: [
    { label: '时间线函数', value: 'animation-timeline: scroll() 或 view()' },
    { label: '动画区间', value: 'animation-range: entry 0% cover 40%' },
    { label: '进度条实现', value: 'transform: scaleX()，不用 width' },
    { label: '旋转幅度', value: '15–45deg，超过就喧宾夺主' },
  ],
  reducedMotion:
    'prefers-reduced-motion: reduce 时把时间线换成普通的固定时长动画，或让元素直接停在进度终点，进度条这类指示物保留但不跟着滚。',
  refs: [
    { label: 'Chrome for Developers · 滚动驱动动画', url: 'https://developer.chrome.com/docs/css-ui/scroll-driven-animations' },
    { label: 'MDN · animation-timeline', url: 'https://developer.mozilla.org/docs/Web/CSS/animation-timeline' },
  ],
  related: ['scroll-reveal', 'parallax', 'sticky-header'],
  scenes: ['scroll', 'page', 'nav'],
  feel: ['crisp', 'calm'],
  intent: ['attention', 'affordance'],
  controls: [
    { kind: 'range', id: 'rotate', label: '最大旋转', min: 0, max: 90, step: 5, def: 30, unit: 'deg' },
    {
      kind: 'range',
      id: 'range',
      label: '动画区间',
      min: 20,
      max: 100,
      step: 5,
      def: 60,
      unit: '%',
      hint: '相当于 animation-range 里的 entry 0% cover 60%；调小会在元素刚露头时就播完',
    },
    { kind: 'range', id: 'duration', label: '降级时长', min: 200, max: 1200, step: 50, def: 600, unit: 'ms' },
  ],
  prompt: (values: ControlValues) => {
    const rotate = Number(values.rotate)
    const cover = Number(values.range)
    const duration = Number(values.duration)
    return {
      zh: `用 CSS 滚动驱动动画（scroll-driven animations）做这个效果：卡片用 animation-timeline: view()、animation-range: entry 0% cover ${cover}%，把滚动进度映射到 rotateZ(${rotate}deg) 和 opacity 上；顶部进度条用 animation-timeline: scroll() 配 transform: scaleX()。滚动事件里不要写 JS。Safari / Firefox 不支持时，用 intersection 触发一段 ${duration}ms 的普通动画兜底，并给出「不支持」的提示。`,
      en: `scroll-driven animations, animation-timeline: view(), animation-range: entry 0% cover ${cover}%, keyframes on rotateZ(${rotate}deg) and opacity, scroll progress bar via animation-timeline: scroll() with transform: scaleX(), no scroll event listeners, feature-detect with CSS.supports('animation-timeline: scroll()'), fallback to a ${duration}ms reveal with IntersectionObserver, respect prefers-reduced-motion`,
    }
  },
  en: {
    oneLiner: 'The scrollbar is the timeline: the scroll position decides exactly which frame is shown.',
    whenToUse: [
      'Reading progress bars and chapter indicators, which are naturally as much as you have scrolled',
      'A card that rotates, scales, and shifts saturation as it scrolls into view',
      'You want the animation locked to the scroll position and playable in both directions',
    ],
    confusions: [
      {
        with: 'scroll reveal',
        diff: 'A reveal fires once as the element enters the viewport and is tied to nothing afterwards. A scroll-driven animation binds every frame to the scroll position, so the same offset always shows the same frame and scrolling back plays it in reverse.',
      },
      {
        with: 'driving the animation from a scroll event',
        diff: 'Scroll events fire off the compositor thread and drop frames when you scroll fast. animation-timeline runs on the compositor and keeps the main thread free, but needs a modern browser (Chrome 115+).',
      },
    ],
    pitfalls: [
      'Leave animation-range at its default and the animation can finish as soon as the element appears, which looks like it did nothing',
      'Reading scrollTop and writing styles in the same scroll handler forces a synchronous loop every frame; let CSS do it or throttle with requestAnimationFrame',
      'animation-timeline support in Safari and Firefox is still incomplete, so ship a static version that reads fine without it (this demo shows a fallback badge)',
      'Build the progress bar with scaleX, not width, which forces a layout every frame',
    ],
    spec: [
      { label: 'Timeline function' },
      { label: 'Animation range' },
      { label: 'Progress bar implementation' },
      { label: 'Rotation amount' },
    ],
    reducedMotion:
      'Under prefers-reduced-motion: reduce, swap the timeline for a normal fixed-duration animation, or park elements at the end of the progress; indicators like the progress bar stay but stop tracking scroll.',
    controls: [
      { label: 'Max rotation' },
      { label: 'Animation range', hint: 'Stands for entry 0% cover 60% in animation-range; lower values finish the animation as soon as the element appears' },
      { label: 'Fallback duration' },
    ],
  },
}

export default entry
