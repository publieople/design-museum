import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'press-feedback',
  code: 'F-02',
  nameZh: '按压反馈',
  nameEn: 'Press Feedback',
  aliases: ['按下缩放', '点击回弹', '按压态', '按下反馈', 'button press effect', 'active state scale'],
  category: 'feedback',
  oneLiner: '手指按下的瞬间按钮缩小、变暗，松开立刻弹回，确认这一下点到了。',
  whenToUse: [
    '按钮、图标按钮需要即时确认，别让人怀疑刚才点没点到',
    '提交类按钮想减少连点，先用按下反馈把动作锁住一下',
    '移动端点击区域小，用触感替代的视觉反馈补足',
  ],
  confusions: [
    {
      with: '悬停抬升（hover lift）',
      diff: '悬停是移入之后一直保持的状态，用 :hover；按压只在按住那一瞬出现、松开就结束，用 :active。按住不放时两者会同时成立。',
    },
    {
      with: '加载状态（loading）',
      diff: '按压反馈是几十毫秒内的即时回应，请求还没发出去；loading 要持续到请求返回。正确的顺序是先按压、再 loading，而不是同时出现。',
    },
  ],
  pitfalls: [
    ':active 只在按住期间生效；键盘用空格或回车触发的是 click，不会走 :active，别把按压态当成键盘反馈',
    'iOS Safari 上 :active 需要元素可交互才会稳定触发，给按钮加 touch 事件监听或 cursor: pointer 更保险',
    '用 width/height 缩小会重排，要用 transform: scale()',
    '回弹过冲太大（明显超过 1.0）会显得廉价，回到 1.0 附近就够',
  ],
  keywords: [':active', 'transform: scale()', 'transition', 'touch-action', 'press state', ':focus-visible'],
  spec: [
    { label: '按下缩放', value: '0.94–0.97' },
    { label: '按下时长', value: '80–150ms' },
    { label: '回弹时长', value: '150–200ms' },
    { label: '缓动', value: 'ease-out；回弹用 cubic-bezier(0.34, 1.56, 0.64, 1)' },
  ],
  reducedMotion: 'prefers-reduced-motion: reduce 下去掉缩放过渡，按下时只改底色或亮度并瞬时切换，回弹取消。',
  refs: [
    { label: 'MDN · :active', url: 'https://developer.mozilla.org/docs/Web/CSS/:active' },
    { label: 'MDN · transform', url: 'https://developer.mozilla.org/docs/Web/CSS/transform' },
    { label: 'MDN · touch-action', url: 'https://developer.mozilla.org/docs/Web/CSS/touch-action' },
  ],
  related: ['hover-lift', 'spring', 'magnetic-button'],
  scenes: ['button', 'form', 'nav'],
  feel: ['crisp', 'playful'],
  intent: ['affordance', 'attention'],
  controls: [
    {
      kind: 'range',
      id: 'scale',
      label: '按下缩放',
      min: 0.85,
      max: 1,
      step: 0.01,
      def: 0.96,
      unit: 'x',
      hint: '调到 1.00 就没有按压感了',
    },
    { kind: 'range', id: 'duration', label: '按下/回弹时长', min: 60, max: 300, step: 10, def: 110, unit: 'ms' },
    { kind: 'toggle', id: 'spring', label: '松开时回弹', def: true },
  ],
  prompt: (values: ControlValues) => {
    const scale = Number(values.scale)
    const duration = Number(values.duration)
    const spring = Boolean(values.spring)
    const easing = spring ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' : 'ease-out'
    return {
      zh: '给按钮加按压反馈（press feedback）：按住时用 transform: scale(' + scale.toFixed(2) + ') 缩小，过渡 ' + duration + 'ms；松开回到 scale(1)，缓动 ' + easing + '。' + (spring ? '回弹可以轻微过冲，但别超过 1.0 太多。' : '不要回弹，匀速回到原位。') + '按下用 :active 或 pointerdown，同时给键盘用户保留 :focus-visible 描边。按钮不能因此改变尺寸。',
      en: 'button press feedback, :active { transform: scale(' + scale.toFixed(2) + '); transition: transform ' + duration + 'ms }, release back to scale(1) with ' + easing + ', ' + (spring ? 'slight overshoot spring' : 'no bounce') + ', transform-only, keep :focus-visible ring, touch-action: manipulation',
    }
  },
  // 这个演示必须按住才会动，自己不播——重播对它没有意义，标 manual 免得被循环重置
  loop: 'manual',
  en: {
    oneLiner: 'The moment a finger presses down the button shrinks and darkens, then snaps back on release to confirm the tap.',
    whenToUse: [
      'Buttons and icon buttons that need instant confirmation so nobody wonders whether the tap landed',
      'Submit buttons where the press response can briefly lock the action and discourage double taps',
      'Small tap targets on mobile, where visual feedback has to stand in for a physical click',
    ],
    confusions: [
      { with: 'Hover lift', diff: 'Hover is a state that stays as long as the pointer is over the element and uses :hover; press feedback exists only while the button is held down and ends on release, using :active. Hold the button down and both are true at once.' },
      { with: 'Loading state', diff: 'Press feedback is an immediate response within tens of milliseconds and fires before the request is even sent; loading lasts until the request comes back. The right order is press first, then loading, not both at once.' },
    ],
    pitfalls: [
      ':active applies only while the button is held down; keyboard activation with Space or Enter fires click and never :active, so do not treat the press state as keyboard feedback',
      'On iOS Safari :active only fires reliably on interactive elements, so add a touch listener or cursor: pointer to be safe',
      'Shrinking with width or height triggers layout; use transform: scale()',
      'A rebound that overshoots too far past 1.0 looks cheap; settling near 1.0 is enough',
    ],
    spec: [
      { label: 'Pressed scale' },
      { label: 'Press duration' },
      { label: 'Release duration' },
      { label: 'Easing' },
    ],
    reducedMotion: 'Under prefers-reduced-motion: reduce, drop the scale transition and change only the background or brightness instantly on press, with no bounce.',
    controls: [
      { label: 'Pressed scale', hint: 'At 1.00 the press feel disappears' },
      { label: 'Press / release duration' },
      { label: 'Bounce on release' },
    ],
  },
}

export default entry
