import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'count-up',
  code: 'T-06',
  nameZh: '数字滚动',
  nameEn: 'Count Up',
  aliases: ['数字递增', '数值动画', '计数动画', 'count up', 'number counter', 'animated counter'],
  category: 'type',
  oneLiner: '数字从 0 快速滚到目标值，然后停住。',
  whenToUse: [
    '数据面板的关键指标第一次出现，想让数字有涨上去的感觉',
    '首屏用一两个大数字当主角，给一个短促的入场',
    '想让数字滚动在进入视口后再开始，而不是页面一打开就已经跳完',
  ],
  confusions: [
    {
      with: '机械翻牌 odometer',
      diff: 'odometer 是每一位数字上下滚动或翻页，位与位之间有物理位移；数字滚动只是数值在变，字形本身不动。',
    },
    {
      with: 'CSS @property 数值动画',
      diff: '@property 可以注册一个整数自定义属性再交给 counter() 渲染，纯 CSS 就能跑，但插值交给浏览器，格式和缓动不好控；要精确控制格式、缓动和重播，用 requestAnimationFrame 手写更稳。',
    },
  ],
  pitfalls: [
    '位数变化会撑动布局（9 变 10、99 变 100），给容器预留宽度，并用 font-variant-numeric: tabular-nums 让每位数字等宽。',
    'requestAnimationFrame 循环要在组件卸载时 cancel，否则组件没了还在 setState。',
    'rAF 回调拿到的是高精度时间戳，用它减去开始时间；不要和 Date.now() 混算，也不要拿 setInterval 每帧加固定值，掉帧时会越走越慢。',
    '服务端渲染和首次客户端渲染必须渲染同一个值（通常是 0），否则 hydration 对不上；挂载之后再开始跑。',
    'prefers-reduced-motion 下直接显示最终值，别让数字再滚一遍。',
  ],
  keywords: ['requestAnimationFrame', 'tabular-nums', 'font-variant-numeric', 'easeOutExpo', 'count up animation', 'IntersectionObserver'],
  spec: [
    { label: '时长', value: '800–1500ms' },
    { label: '缓动', value: 'easeOutExpo / easeOutCubic' },
    { label: '数字排版', value: 'font-variant-numeric: tabular-nums' },
    { label: '触发', value: 'IntersectionObserver，threshold 0.3' },
    { label: '终值停留', value: '滚完至少 300ms 不再变化' },
  ],
  reducedMotion: 'prefers-reduced-motion: reduce 时不跑帧循环，直接把目标值一次性渲染出来。',
  refs: [
    { label: 'MDN · requestAnimationFrame', url: 'https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame' },
    { label: 'MDN · font-variant-numeric', url: 'https://developer.mozilla.org/docs/Web/CSS/font-variant-numeric' },
  ],
  related: ['stagger', 'scroll-reveal', 'skeleton-shimmer'],
  scenes: ['page', 'card', 'list'],
  feel: ['crisp', 'playful'],
  intent: ['attention', 'waiting'],
  controls: [
    { kind: 'range', id: 'target', label: '目标值', min: 100, max: 100000, step: 100, def: 12800, unit: '人', hint: '数字越大，位数变化带来的布局抖动越明显' },
    { kind: 'range', id: 'duration', label: '时长', min: 300, max: 3000, step: 100, def: 1200, unit: 'ms', hint: '整段滚完要多久' },
    {
      kind: 'select',
      id: 'easing',
      label: '缓动',
      def: 'easeOutExpo',
      options: [
        { value: 'linear', label: 'linear（匀速）' },
        { value: 'easeOutCubic', label: 'easeOutCubic' },
        { value: 'easeOutExpo', label: 'easeOutExpo（前快后慢，推荐）' },
      ],
    },
    { kind: 'toggle', id: 'grouping', label: '千分位', def: true },
  ],
  prompt: (values: ControlValues) => {
    const target = Number(values.target)
    const duration = Number(values.duration)
    const easing = String(values.easing)
    const grouping = Boolean(values.grouping)
    return {
      zh:
        '做一个数字滚动（count up）：数字在 ' +
        duration +
        'ms 内用 ' +
        easing +
        ' 缓动从 0 滚到 ' +
        target +
        '，' +
        (grouping ? '每三位加千分位，' : '不加千分位，') +
        '用 requestAnimationFrame 按时间戳算进度，不要用 setInterval。容器用 font-variant-numeric: tabular-nums 并预留宽度，避免位数变化时抖动；系统开启减少动态效果时直接显示 ' +
        target +
        '。',
      en:
        'count up animation, animate number from 0 to ' +
        target +
        ' in ' +
        duration +
        'ms with ' +
        easing +
        ' easing, requestAnimationFrame with timestamp-based progress, font-variant-numeric: tabular-nums, ' +
        (grouping ? 'thousands separator, ' : '') +
        'reserve width to avoid layout shift, respect prefers-reduced-motion (render final value)',
    }
  },
}

export default entry
