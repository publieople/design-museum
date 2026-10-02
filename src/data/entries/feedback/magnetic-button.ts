import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'magnetic-button',
  code: 'F-03',
  nameZh: '磁吸按钮',
  nameEn: 'Magnetic Button',
  aliases: ['磁力按钮', '跟随鼠标的按钮', '吸附光标', 'magnetic hover', 'cursor-following button', 'magnetic pull'],
  category: 'feedback',
  oneLiner: '指针靠近时按钮被吸过去一点点，移开又弹回原位。',
  whenToUse: [
    '首屏主 CTA 想抓一下注意力，又不适合做大动效',
    '按钮数量很少的展示页或作品集，允许一个有个性的主操作',
    '想暗示「这个按钮在等你」，让指针和它产生关系',
  ],
  confusions: [
    {
      with: '悬停抬升（hover lift）',
      diff: '抬升的方向是固定的，永远垂直向上；磁吸会朝指针方向做二维偏移，指针在左下方就往左下方走。',
    },
    {
      with: '指针视差（pointer parallax）',
      diff: '视差是整个容器跟着指针大范围移动，几十像素起步；磁吸只在按钮附近的小范围内移动几像素到十几像素。',
    },
  ],
  pitfalls: [
    '触发半径开太大（超过按钮尺寸两倍）会满屏乱飘，1–1.5 倍按钮宽高就够',
    '位移不设上限会让按钮躲开指针、点不中，最多 6–16px',
    '每次 pointermove 都 setState 会掉帧，用 requestAnimationFrame 节流，或直接改 CSS 变量和 element.style',
    '触摸设备没有指针悬停，要直接给静止态；算中心点用 getBoundingClientRect，别忘了页面滚动的影响',
  ],
  keywords: ['pointermove', 'transform: translate3d', 'getBoundingClientRect', 'CSS custom property', 'requestAnimationFrame', 'magnetic hover'],
  spec: [
    { label: '触发半径', value: '按钮宽高的 1–1.5 倍' },
    { label: '最大位移', value: '6–16px' },
    { label: '跟随系数', value: '0.2–0.4' },
    { label: '复位时长', value: '300–500ms' },
    { label: '复位缓动', value: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  ],
  reducedMotion: 'prefers-reduced-motion: reduce 下完全关闭指针跟随，按钮原地不动，悬停反馈改成底色或描边变化。',
  refs: [
    { label: 'MDN · pointermove 事件', url: 'https://developer.mozilla.org/docs/Web/API/Element/pointermove_event' },
    { label: 'MDN · getBoundingClientRect', url: 'https://developer.mozilla.org/docs/Web/API/Element/getBoundingClientRect' },
    { label: 'MDN · transform', url: 'https://developer.mozilla.org/docs/Web/CSS/transform' },
  ],
  related: ['hover-lift', 'press-feedback', 'spotlight-glow'],
  scenes: ['button', 'nav', 'page'],
  feel: ['playful', 'crisp'],
  intent: ['attention', 'affordance'],
  controls: [
    { kind: 'range', id: 'strength', label: '跟随系数', min: 0, max: 0.6, step: 0.02, def: 0.3, hint: '0 就是完全不动' },
    { kind: 'range', id: 'maxDistance', label: '最大位移', min: 0, max: 24, step: 2, def: 12, unit: 'px' },
    { kind: 'range', id: 'radius', label: '触发半径', min: 1, max: 3, step: 0.1, def: 1.6, unit: '倍', hint: '相对按钮宽高的倍数' },
    { kind: 'range', id: 'duration', label: '复位时长', min: 150, max: 600, step: 25, def: 350, unit: 'ms' },
  ],
  prompt: (values: ControlValues) => {
    const strength = Number(values.strength)
    const maxDistance = Number(values.maxDistance)
    const radius = Number(values.radius)
    const duration = Number(values.duration)
    return {
      zh: '做一个磁吸按钮（magnetic button）：监听容器的 pointermove，用 getBoundingClientRect 算出按钮中心，指针进入按钮宽高 ' + radius.toFixed(1) + ' 倍范围内时，让按钮朝指针方向偏移，偏移量 = 指针到中心的距离 × ' + strength.toFixed(2) + '，并限制在 ' + maxDistance + 'px 以内；指针离开就复位，复位过渡 ' + duration + 'ms cubic-bezier(0.22, 1, 0.36, 1)。用 transform: translate3d 移动，pointermove 里用 requestAnimationFrame 节流。系统减少动态效果时完全不跟随。',
      en: 'magnetic button, pointermove + getBoundingClientRect, offset = (pointer - center) * ' + strength.toFixed(2) + ', clamp to ' + maxDistance + 'px, activation radius ' + radius.toFixed(1) + 'x button size, return with transition ' + duration + 'ms cubic-bezier(0.22, 1, 0.36, 1), transform: translate3d, throttle with requestAnimationFrame, disable under prefers-reduced-motion',
    }
  },
}

export default entry
