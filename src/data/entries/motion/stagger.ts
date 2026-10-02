import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'stagger',
  code: 'M-01',
  nameZh: '交错进场',
  nameEn: 'Stagger',
  aliases: ['错峰动画', '依次出现', '级联出现', '逐条入场', 'cascading entrance', 'staggered animation'],
  category: 'motion',
  oneLiner: '一组元素不是同时出现，而是按顺序一个接一个进来。',
  whenToUse: [
    '列表、卡片组、导航项首次出现时，想让视线按顺序扫过',
    '想让一组元素显得「有编排」而不是「啪一下全出来」',
    '页面初次加载，用一次统一的进场序列建立节奏',
  ],
  confusions: [
    {
      with: '延迟动画',
      diff: '单个元素延迟进场只是「晚点出现」；交错进场的重点是项与项之间的固定间隔（stagger），读者能数出顺序。',
    },
    {
      with: '逐个播放的轮播',
      diff: '轮播会一直循环；交错进场通常只在首次出现时播放一次，之后不再重复。',
    },
  ],
  pitfalls: [
    '间隔超过 120ms、元素又多，最后一项要等很久，页面像卡住',
    '列表很长时只给前 8–10 项加间隔，其余直接显示，否则总时长失控',
    '不要用 left/top/margin 做位移，用 transform + opacity，才不会触发重排',
    '进场动画属于非必要动效，prefers-reduced-motion 下要直接显示最终态',
  ],
  keywords: ['stagger', 'animation-delay', 'transition-delay', 'transform: translateY', 'cascading entrance'],
  spec: [
    { label: '单项时长', value: '300–500ms' },
    { label: '项间隔', value: '60–100ms' },
    { label: '位移距离', value: '8–24px' },
    { label: '缓动', value: 'ease-out / cubic-bezier(0.22, 1, 0.36, 1)' },
  ],
  reducedMotion: 'prefers-reduced-motion: reduce 时不播放位移与淡入，直接以最终状态渲染整组元素。',
  refs: [
    { label: 'MDN · animation-delay', url: 'https://developer.mozilla.org/docs/Web/CSS/animation-delay' },
    { label: 'web.dev · 用 transform 和 opacity 做动画', url: 'https://web.dev/articles/animations-guide' },
  ],
  related: ['scroll-reveal', 'easing', 'spring'],
  scenes: ['list', 'page', 'nav'],
  feel: ['crisp', 'playful'],
  intent: ['hierarchy', 'attention'],
  controls: [
    { kind: 'range', id: 'duration', label: '单项时长', min: 120, max: 900, step: 20, def: 420, unit: 'ms' },
    {
      kind: 'range',
      id: 'stagger',
      label: '项间隔',
      min: 0,
      max: 240,
      step: 10,
      def: 80,
      unit: 'ms',
      hint: '调到 0 就变成同时出现，对比很明显',
    },
    { kind: 'range', id: 'distance', label: '位移距离', min: 0, max: 48, step: 2, def: 16, unit: 'px' },
    {
      kind: 'select',
      id: 'easing',
      label: '缓动',
      def: 'cubic-bezier(0.22, 1, 0.36, 1)',
      options: [
        { value: 'linear', label: 'linear（匀速）' },
        { value: 'ease-out', label: 'ease-out' },
        { value: 'cubic-bezier(0.22, 1, 0.36, 1)', label: 'ease-out-expo（推荐）' },
        { value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', label: '轻微回弹' },
      ],
    },
  ],
  prompt: (values: ControlValues) => {
    const duration = Number(values.duration)
    const stagger = Number(values.stagger)
    const distance = Number(values.distance)
    const easing = String(values.easing)
    return {
      zh: `给这组列表项做交错进场（stagger）动画：每项从下方 ${distance}px、opacity 0 进入最终位置，单项时长 ${duration}ms，缓动 ${easing}，相邻两项间隔 ${stagger}ms。只在首次出现时播放一次，用 transform 和 opacity 实现。系统开启「减少动态效果」时直接显示最终状态。`,
      en: `staggered entrance, animation-delay: index * ${stagger}ms, each item fades in with opacity 0 → 1 and translateY(${distance}px) → 0, duration ${duration}ms, easing ${easing}, play once on first view, animate transform/opacity only, respect prefers-reduced-motion`,
    }
  },
}

export default entry
