import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'cursor-follower',
  code: 'M-08',
  nameZh: '光标跟随',
  nameEn: 'Cursor Follower',
  aliases: ['跟随鼠标', '指针跟随', '鼠标尾巴', 'custom cursor', 'cursor follower', 'mouse follower', 'pointer follower'],
  category: 'motion',
  oneLiner: '一个圆点慢半拍地跟在指针后面，把系统鼠标指针换掉。',
  whenToUse: [
    '作品集、品牌页这类要「有手感」的页面，想让指针变成设计的一部分',
    '需要一个大一点的指针指示当前可交互区域（比如画布、画廊）',
    '配合聚光、磁吸这类指针驱动的效果，做统一的指针语言',
  ],
  confusions: [
    {
      with: '磁吸按钮',
      diff: '磁吸按钮是按钮朝指针靠过来，指针本身不动；光标跟随是替代指针的位置，元素永远慢半拍追着指针跑。',
    },
    {
      with: '光标拖尾',
      diff: '拖尾会在后面留一串残影（几十个点或一条流线）；跟随只有一到两个点，重点是「滞后感」而不是「痕迹」。',
    },
  ],
  pitfalls: [
    '把系统光标藏了，就必须保证键盘用户还能看清焦点：:focus-visible 的样式不能省',
    'pointermove 里每帧 setState 会掉帧，用 requestAnimationFrame 或直接改元素的 transform',
    '跟随元素要 pointer-events: none，否则它会挡住底下的点击',
    '触屏没有指针，要在触屏或粗指针设备上直接关掉跟随',
    '指针移出窗口时要归位或淡出，别让圆点卡在角落不动',
  ],
  keywords: [
    'cursor follower',
    'custom cursor',
    'pointermove',
    'transform: translate3d',
    'requestAnimationFrame',
    'mix-blend-mode: difference',
    'pointer-events: none',
    'cursor: none',
  ],
  spec: [
    { label: '跟随延迟', value: '60–150ms（越小越跟手，越大越飘）' },
    { label: '圆点直径', value: '12–32px' },
    { label: '混合模式', value: 'mix-blend-mode: difference（深浅背景都看得见）' },
    { label: '跟随元素', value: 'pointer-events: none; position: fixed' },
    { label: '触屏与降级', value: '粗指针设备直接关掉，保留系统光标' },
  ],
  reducedMotion: 'prefers-reduced-motion 下不要藏系统光标、也不要做跟随（跟随本身就是持续运动），直接保留默认指针。',
  refs: [
    {
      label: 'MDN · pointermove 事件',
      url: 'https://developer.mozilla.org/docs/Web/API/Element/pointermove_event',
    },
    { label: 'MDN · mix-blend-mode', url: 'https://developer.mozilla.org/docs/Web/CSS/mix-blend-mode' },
  ],
  related: ['magnetic-button', 'spotlight-glow'],
  scenes: ['page', 'button', 'card'],
  feel: ['playful', 'crisp'],
  intent: ['attention', 'affordance'],
  tags: ['js', 'browser-api', 'composited', 'main-thread', 'pointer-dependent'],
  demo: { shape: 'interactive', minHeight: 320, thumb: 'still' },
  controls: [
    { kind: 'range', id: 'lag', label: '跟随延迟', min: 0, max: 300, step: 10, def: 90, unit: 'ms' },
    { kind: 'range', id: 'size', label: '圆点直径', min: 8, max: 48, step: 2, def: 20, unit: 'px' },
    {
      kind: 'select',
      id: 'blend',
      label: '混合模式',
      options: [
        { value: 'difference', label: '差值（深浅都可见）' },
        { value: 'screen', label: '滤色（只适合深色底）' },
        { value: 'normal', label: '正常' },
      ],
      def: 'difference',
    },
    { kind: 'toggle', id: 'hideNative', label: '隐藏系统光标', def: true },
  ],
  prompt: (values: ControlValues) => {
    const lag = Number(values.lag)
    const size = Number(values.size)
    const blend = String(values.blend)
    const hideNative = values.hideNative !== false
    return {
      zh: `做一个光标跟随（cursor follower）：用一个 ${size}px 的圆点代替鼠标指针，${hideNative ? '在容器上设 cursor: none 把系统光标藏掉，' : '保留系统光标，'}圆点用 requestAnimationFrame 平滑追向 pointermove 的位置，延迟约 ${lag}ms，mix-blend-mode: ${blend}，pointer-events: none；指针移出容器就淡出。触屏和 prefers-reduced-motion 下关掉跟随，保留系统光标，并保证键盘焦点可见。`,
      en: `custom cursor follower, ${size}px dot, ${hideNative ? 'cursor: none on the container, ' : 'keep the native cursor, '}pointermove + requestAnimationFrame smooth follow with ${lag}ms lag, transform: translate3d, mix-blend-mode: ${blend}, pointer-events: none, fade out on pointer leave, disabled on touch and under prefers-reduced-motion, keep focus-visible styles`,
    }
  },
  loop: 'manual',
  en: {
    oneLiner: 'A dot trails the pointer with a slight delay, replacing the system cursor.',
    whenToUse: [
      'Portfolio or brand pages where the pointer itself should feel designed',
      'A canvas or gallery where you want a bigger indicator of what is interactive',
      'Alongside spotlight or magnetic effects, to keep one pointer language across the page',
    ],
    confusions: [
      {
        with: 'magnetic button',
        diff: 'A magnetic button moves toward the pointer while the pointer stays put. A cursor follower replaces the pointer and its element lags behind it.',
      },
      {
        with: 'cursor trail',
        diff: 'A trail leaves a string of ghosts behind the pointer. A follower is one or two dots; the point is the lag, not the marks left behind.',
      },
    ],
    pitfalls: [
      'If you hide the native cursor, keyboard users still need a visible focus ring: keep :focus-visible styles',
      'Setting state on every pointermove drops frames — use requestAnimationFrame or write the transform directly',
      'Give the follower pointer-events: none, otherwise it swallows clicks underneath',
      'Touch screens have no pointer, so disable the follower on coarse pointers',
      'Fade or recenter the dot when the pointer leaves the window, or it freezes in a corner',
    ],
    spec: [
      { label: 'Follow lag' },
      { label: 'Dot size' },
      { label: 'Blend mode' },
      { label: 'Follower element' },
      { label: 'Touch and fallback' },
    ],
    reducedMotion:
      'Under prefers-reduced-motion keep the native cursor and skip the follower: the lag itself is continuous motion. Everything stays usable without it.',
    controls: [
      { label: 'Follow lag' },
      { label: 'Dot size' },
      { label: 'Blend mode' },
      { label: 'Hide the native cursor' },
    ],
  },
}

export default entry
