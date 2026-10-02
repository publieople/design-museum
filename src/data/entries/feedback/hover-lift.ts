import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'hover-lift',
  code: 'F-01',
  nameZh: '悬停抬升',
  nameEn: 'Hover Lift',
  aliases: ['悬停浮起', '鼠标移上去抬起来', '卡片上浮', 'hover 抬高', 'hover lift', 'card hover elevation'],
  category: 'feedback',
  oneLiner: '指针移到卡片上，它轻轻上浮、阴影变大，暗示这块可以点。',
  whenToUse: [
    '可点击的卡片、商品卡、文章列表项，需要让指针的位置得到回应',
    '一排并列的卡片里，想突出当前指到的那一张',
    '按钮或图标已经够清楚，只差一点「它活着」的暗示',
  ],
  confusions: [
    {
      with: '按压反馈（press feedback）',
      diff: '悬停抬升是指针停留在上面期间持续存在的状态，用 :hover；按压反馈是按下和松开那一瞬的反馈，用 :active。两者经常叠着用，但触发时机完全不同。',
    },
    {
      with: '滚动视差（parallax）',
      diff: '悬停抬升只由指针驱动，鼠标进出才动；视差由滚动驱动，鼠标不动、只滚页面它也会移动。',
    },
  ],
  pitfalls: [
    '只加位移不加阴影，元素会像一张贴纸飘起来，没有重量感；位移和阴影要一起变',
    '触摸设备没有 hover，点完 :hover 可能粘住不消失，所以静止态本身必须完整可读',
    '位移超过 8px 会显得轻浮、像在跳，2–6px 通常刚好',
    '用 top 或 margin 做位移会触发重排，要用 transform: translateY()；也不要改 width/height',
  ],
  keywords: ['transform: translateY', 'box-shadow', 'transition', ':hover', 'elevation', 'will-change: transform'],
  spec: [
    { label: '抬升距离', value: '2–6px' },
    { label: '过渡时长', value: '150–250ms' },
    { label: '缓动', value: 'ease-out / cubic-bezier(0.22, 1, 0.36, 1)' },
    { label: '阴影', value: '0 8px 24px rgba(0, 0, 0, 0.14)' },
    { label: '缩放', value: '1.01–1.03（可选）' },
  ],
  reducedMotion: 'prefers-reduced-motion: reduce 下去掉位移和缩放，只保留阴影加深或底色变化来表示悬停，过渡时长可以直接设为 0ms。',
  refs: [
    { label: 'MDN · :hover', url: 'https://developer.mozilla.org/docs/Web/CSS/:hover' },
    { label: 'MDN · box-shadow', url: 'https://developer.mozilla.org/docs/Web/CSS/box-shadow' },
    { label: 'MDN · transition', url: 'https://developer.mozilla.org/docs/Web/CSS/transition' },
  ],
  related: ['press-feedback', 'magnetic-button', 'spotlight-glow'],
  scenes: ['card', 'list', 'button'],
  feel: ['soft', 'crisp'],
  intent: ['affordance', 'attention'],
  controls: [
    {
      kind: 'range',
      id: 'lift',
      label: '抬升距离',
      min: 0,
      max: 16,
      step: 1,
      def: 6,
      unit: 'px',
      hint: '调到 0px 只剩阴影变化，能看出位移在做什么',
    },
    { kind: 'range', id: 'duration', label: '过渡时长', min: 100, max: 500, step: 20, def: 200, unit: 'ms' },
    { kind: 'range', id: 'shadow', label: '阴影强度', min: 0, max: 100, step: 5, def: 45, unit: '%', hint: '0% 时卡片像贴在墙上' },
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
    const lift = Number(values.lift)
    const duration = Number(values.duration)
    const shadow = Number(values.shadow)
    const easing = String(values.easing)
    const shadowAlpha = ((shadow / 100) * 0.22).toFixed(2)
    return {
      zh: '给卡片加悬停抬升（hover lift）：指针移上去时用 transform: translateY(-' + lift + 'px) scale(1.02) 抬起，阴影加深到约 ' + shadow + '% 的强度（如 0 10px 28px rgba(0,0,0,' + shadowAlpha + ')），过渡 ' + duration + 'ms、缓动 ' + easing + '；指针移开立刻回到原位。位移只用 transform，不要改 top 或 margin。触摸设备没有 hover，静止态必须完整可读。',
      en: 'hover lift micro-interaction, :hover { transform: translateY(-' + lift + 'px) scale(1.02); box-shadow: 0 10px 28px rgba(0,0,0,' + shadowAlpha + '); transition: transform ' + duration + 'ms ' + easing + ' }, transform-only, no top/margin, reset on pointer leave, touch devices keep a static readable state',
    }
  },
  en: {
    oneLiner: 'When the pointer moves onto a card, it rises slightly and the shadow deepens, hinting that it is clickable.',
    whenToUse: [
      'Clickable cards, product tiles, and list rows where the pointer position should get an answer',
      'A row of side-by-side cards where the one under the pointer should stand out',
      'Buttons or icons that already read clearly and just need a hint that they are alive',
    ],
    confusions: [
      { with: 'Press feedback', diff: 'Hover lift is a state that lasts the whole time the pointer rests on the element, driven by :hover; press feedback answers the press and the release, driven by :active. They are often stacked, but they fire at completely different moments.' },
      { with: 'Scroll parallax', diff: 'Hover lift is driven only by the pointer, so it moves as the cursor enters and leaves; parallax is driven by scroll, so it moves when you scroll the page even with the mouse still.' },
    ],
    pitfalls: [
      'Shifting the element without deepening the shadow makes it float like a sticker with no weight; offset and shadow have to change together',
      'Touch devices have no hover, and :hover can stick after a tap, so the resting state must be complete and readable on its own',
      'A shift beyond 8px looks giddy and jumpy; 2-6px is usually the sweet spot',
      'Animating top or margin triggers layout, so use transform: translateY(); do not animate width or height either',
    ],
    spec: [
      { label: 'Lift distance' },
      { label: 'Transition duration' },
      { label: 'Easing' },
      { label: 'Shadow' },
      { label: 'Scale' },
    ],
    reducedMotion: 'Under prefers-reduced-motion: reduce, drop the offset and scale and signal hover with a deeper shadow or a background change instead; the transition duration can go to 0ms.',
    controls: [
      { label: 'Lift distance', hint: 'Set it to 0px and only the shadow changes, which shows what the offset is doing' },
      { label: 'Transition duration' },
      { label: 'Shadow strength', hint: 'At 0% the card looks glued to the wall' },
      { label: 'Easing' },
    ],
  },
}

export default entry
