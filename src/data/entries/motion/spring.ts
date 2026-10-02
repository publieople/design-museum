import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'spring',
  code: 'M-03',
  nameZh: '弹簧动画',
  nameEn: 'Spring Physics',
  aliases: ['弹性动画', '回弹', '物理动画', '弹性缓动', 'spring animation', 'overshoot', 'bouncy'],
  category: 'motion',
  oneLiner: '元素像挂了弹簧一样冲向目标：可能冲过头，再弹回来停住。',
  whenToUse: [
    '拖拽松手、开关切换、卡片滑出，想让收尾自然而不是硬停',
    '想要一点「有性格」的反馈，但又不能拖慢操作',
    '弹出层、气泡、跟随手指的元素，需要「被拉住再放开」的手感',
  ],
  confusions: [
    {
      with: '回弹缓动 back-out',
      diff: '回弹缓动是一条固定的三次贝塞尔曲线，只负责冲过头再回来；弹簧是「刚度 + 阻尼 + 质量」三个参数算出来的运动轨迹，冲几次、冲多远都能调。',
    },
    {
      with: '兜底动画 keyframes',
      diff: '关键帧是写死的路径，改速度就得重写一堆关键帧；弹簧是每次运行现算，被拖拽打断（中断后也说得通）也能接着算下去。',
    },
  ],
  pitfalls: [
    '参数调软了（刚度低、阻尼小）会左右晃好几秒，用户只想点一下却要等它停下来',
    '弹簧靠不断重算数值驱动，别在每一帧里改 width/height 或触发 React 状态更新，用 transform 和 requestAnimationFrame 或动画库做',
    '不同库的参数互不通用：Framer Motion 的 stiffness/damping/mass 和 react-spring 的 tension/friction 量纲不一样，不能照抄数值',
    'prefers-reduced-motion 下要直接落到终点、删掉回弹，别让晕动的用户看它弹三下',
  ],
  keywords: [
    'spring physics',
    'stiffness',
    'damping',
    'mass',
    'overshoot',
    'requestAnimationFrame',
    'linear() easing approximation',
  ],
  spec: [
    { label: '刚度 stiffness', value: '170–300（越高越快）' },
    { label: '阻尼 damping', value: '20–35（临界阻尼附近最稳）' },
    { label: '质量 mass', value: '1' },
    { label: '超调量', value: '不超过 8%–10%' },
    { label: '稳定时间', value: '200–400ms 内停稳' },
  ],
  reducedMotion:
    'prefers-reduced-motion: reduce 时把弹簧换成 150ms 的线性或用 opacity 淡入，直接跳到最终位置，不播回弹。',
  refs: [
    { label: 'MDN · CSS 缓动函数（spring 近似写法）', url: 'https://developer.mozilla.org/docs/Web/CSS/easing-function' },
    { label: 'Chrome for Developers · CSS 动画', url: 'https://developer.chrome.com/docs/css-ui/animation' },
  ],
  related: ['easing', 'hover-lift', 'press-feedback'],
  scenes: ['button', 'card', 'page'],
  feel: ['playful', 'soft'],
  intent: ['affordance', 'attention'],
  controls: [
    {
      kind: 'range',
      id: 'stiffness',
      label: '刚度',
      min: 60,
      max: 600,
      step: 10,
      def: 260,
      unit: '',
      hint: '刚度越高，越早冲到目标位置',
    },
    {
      kind: 'range',
      id: 'damping',
      label: '阻尼',
      min: 4,
      max: 60,
      step: 1,
      def: 18,
      unit: '',
      hint: '调到 4 会来回弹好几下；调到 60 几乎不弹',
    },
    { kind: 'range', id: 'mass', label: '质量', min: 0.5, max: 4, step: 0.5, def: 1, unit: 'x' },
  ],
  prompt: (values: ControlValues) => {
    const stiffness = Number(values.stiffness)
    const damping = Number(values.damping)
    const mass = Number(values.mass)
    return {
      zh: `给这个元素做弹簧动画（spring physics）：用 stiffness ${stiffness}、damping ${damping}、mass ${mass} 三个参数驱动，目标位置是右侧终点，允许轻微超调但不能晃超过两下，300ms 内停稳。只动 transform，用 requestAnimationFrame 或动画库的 spring 实现，不要每帧改 width/height。prefers-reduced-motion 下直接落到终点。`,
      en: `spring animation, stiffness ${stiffness}, damping ${damping}, mass ${mass}, overshoot allowed but settle within ~300ms, animate transform: translateX only, driven by requestAnimationFrame or a spring library (Framer Motion / react-spring), no layout-thrashing properties, respect prefers-reduced-motion`,
    }
  },
}

export default entry
