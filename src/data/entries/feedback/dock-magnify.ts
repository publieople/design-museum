import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'dock-magnify',
  code: 'F-09',
  nameZh: '停靠栏放大',
  nameEn: 'Dock Magnification',
  aliases: ['Dock 放大', '图标放大', '靠近放大', 'dock magnification', 'icon magnification', 'proximity scale', 'magnify on hover'],
  category: 'feedback',
  oneLiner: '指针越靠近图标，图标放得越大，像 macOS 的 Dock。',
  whenToUse: [
    '底部或侧边的图标导航，想让「现在指着哪个」一眼可见',
    '工具条、表情选择器这类图标密集、放不下文字标签的地方',
    '想要一点活泼的手感，又不想让整排图标一起跳舞',
  ],
  confusions: [
    {
      with: '悬停抬升',
      diff: '悬停抬升只判断指针进没进去，一个元素整体上浮加阴影，邻居完全不动；停靠栏放大是按指针到每个图标中心的距离连续算缩放，越近越大，还会把左右邻居一起带起来。',
    },
    {
      with: '磁吸按钮',
      diff: '磁吸按钮是元素朝指针方向位移，像被吸过去；停靠栏放大的图标位置不动，只是围绕自己的底边变大，指针不需要按下去。',
    },
    {
      with: '光标跟随',
      diff: '光标跟随有一个独立的光斑或自定义光标跟着指针跑；停靠栏放大没有跟随物，只有一排固定位置的图标按距离改变尺寸。',
    },
  ],
  pitfalls: [
    '别用 width/height 做放大，那是在每帧触发布局；用 transform: scale()，并把 transform-origin 设成底边中心，图标才像从托盘里长出来。',
    '缩放过渡超过 200ms 时，指针快速划过会拖出一串跟不上手的「果冻」；控制在 60–120ms，或干脆按帧直接写 transform。',
    '放大后的图标会盖住邻居或顶出容器，给整排留出上方空间（padding-top 或 overflow: visible），别让最大的那颗被裁掉。',
    '最大缩放别超过 2 倍、影响半径别超过整排宽度的一半，否则一次只看得清一个图标，导航反而变慢。',
    '触屏没有 hover；粗指针设备或 prefers-reduced-motion 下保持原始大小，不要用点击去模拟悬停。',
  ],
  keywords: ['dock magnification', 'pointer distance', 'scale()', 'transform-origin', 'pointermove', 'getBoundingClientRect', 'falloff'],
  spec: [
    { label: '最大缩放', value: '1.5–1.8 倍' },
    { label: '影响半径', value: '100–160px' },
    { label: '相邻缩放差', value: '不超过 0.35 倍' },
    { label: '缩放过渡', value: '60–120ms' },
  ],
  reducedMotion: 'prefers-reduced-motion: reduce 时整排图标保持原始尺寸，不做缩放和上浮，只用文字说明指针在哪一颗上。',
  refs: [
    { label: 'MDN · Pointer events', url: 'https://developer.mozilla.org/docs/Web/API/Pointer_events' },
    { label: 'MDN · scale()', url: 'https://developer.mozilla.org/docs/Web/CSS/scale' },
    { label: 'web.dev · 用 transform 和 opacity 做动画', url: 'https://web.dev/articles/animations-guide' },
  ],
  related: ['magnetic-button', 'hover-lift', 'cursor-follower'],
  scenes: ['nav', 'button'],
  feel: ['playful', 'soft'],
  intent: ['affordance', 'attention'],
  tags: ['js', 'composited', 'pointer-dependent', 'motion-heavy'],
  demo: { shape: 'stage', minHeight: 240 },
  controls: [
    { kind: 'range', id: 'maxScale', label: '最大缩放', min: 1.2, max: 2.2, step: 0.05, def: 1.55, unit: 'x', hint: '指针正对时图标放大的倍数' },
    { kind: 'range', id: 'radius', label: '影响半径', min: 40, max: 220, step: 10, def: 120, unit: 'px', hint: '离指针超过这个距离的图标完全不动' },
    { kind: 'toggle', id: 'labels', label: '显示名称', def: true },
  ],
  prompt: (values: ControlValues) => {
    const maxScale = Number(values.maxScale)
    const radius = Number(values.radius)
    const labels = Boolean(values.labels)
    return {
      zh:
        '做一个停靠栏放大（dock magnification）的图标条：一排同尺寸图标，监听 pointermove，用 getBoundingClientRect 算出指针到每个图标中心的水平距离 d，缩放 = 1 + (' +
        maxScale +
        ' - 1) × max(0, 1 - d / ' +
        radius +
        ')²，transform-origin 设为 bottom center，过渡 80ms 线性，只动 transform；指针离开后回到 1 倍。' +
        (labels ? '图标下方保留名称标签。' : '只显示图标，名称用 sr-only 留给读屏。') +
        'prefers-reduced-motion 时不做缩放，粗指针设备保持原始大小。',
      en:
        'dock magnification icon bar: a row of equally sized icons, listen to pointermove, measure the horizontal distance d from the pointer to each icon centre with getBoundingClientRect, scale = 1 + (' +
        maxScale +
        ' - 1) * max(0, 1 - d / ' +
        radius +
        ') squared, transform-origin bottom center, transition transform 80ms linear, animate transform only, reset to 1x on pointer leave. ' +
        (labels ? 'Keep a visible label under each icon.' : 'Icons only, expose the names to screen readers with sr-only text.') +
        ' Keep icons at their natural size under prefers-reduced-motion and on coarse pointers.',
    }
  },
  loop: 'manual',
  en: {
    oneLiner: 'Icons grow as the pointer gets closer, the way a macOS Dock does.',
    whenToUse: [
      'Icon navigation at the bottom or side of the screen where you want the pointed-at item to be obvious',
      'Toolbars and emoji pickers with dense icons but no room for text labels',
      'You want a lively hand feel without making the whole row jump around',
    ],
    confusions: [
      {
        with: 'hover lift',
        diff: 'Hover lift only asks whether the pointer entered, then floats one element up with a shadow while its neighbours stay put. Dock magnification measures the continuous distance from the pointer to each icon centre, so closer icons grow more and the neighbours rise with them.',
      },
      {
        with: 'magnetic button',
        diff: 'A magnetic button translates toward the pointer, as if pulled. Dock magnification keeps each icon anchored and only grows it from its bottom edge, and the pointer never has to press.',
      },
      {
        with: 'cursor follower',
        diff: 'A cursor follower is a separate dot, blob, or custom cursor that chases the pointer. Dock magnification has no follower at all: a fixed row of icons changes size according to distance.',
      },
    ],
    pitfalls: [
      'Do not animate width or height to grow an icon, because that triggers layout every frame. Use transform: scale() with transform-origin at the bottom centre so it grows out of the tray.',
      'Once the scale transition runs longer than 200ms, sweeping the pointer drags a jelly-like trail that lags behind the hand. Keep it at 60 to 120ms or write the transform straight from the frame loop.',
      'Enlarged icons overlap their neighbours or get clipped by the container. Reserve headroom above the row with padding-top or overflow: visible so the tallest icon is never cut off.',
      'Keep the maximum scale under 2x and the radius under half the row width, otherwise only one icon is legible at a time and navigation gets slower.',
      'Touch screens have no hover. Coarse pointers and prefers-reduced-motion should keep the natural size instead of faking hover on tap.',
    ],
    spec: [
      { label: 'Maximum scale' },
      { label: 'Influence radius' },
      { label: 'Neighbour scale gap' },
      { label: 'Scale transition' },
    ],
    reducedMotion:
      'Under prefers-reduced-motion: reduce keep every icon at its natural size with no scaling and no rise, and only describe which icon the pointer is on in text.',
    controls: [
      { label: 'Maximum scale', hint: 'How large an icon grows when the pointer points right at it' },
      { label: 'Influence radius', hint: 'Icons farther than this from the pointer do not move at all' },
      { label: 'Show labels' },
    ],
  },
}

export default entry
