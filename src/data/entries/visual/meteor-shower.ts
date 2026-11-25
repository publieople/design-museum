import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'meteor-shower',
  code: 'V-09',
  nameZh: '流星雨',
  nameEn: 'Meteor Shower',
  aliases: ['流星', '流星拖尾', '斜向流星', 'meteor shower', 'shooting stars', 'meteor effect', 'falling stars'],
  category: 'visual',
  oneLiner: '几条细长的光斜着划过，尾巴渐隐，像一场安静的流星雨。',
  whenToUse: [
    '暗色首屏或节日活动页，想要一点「夜空」的氛围而不是满屏动效',
    '加载等待、空状态的背景，让停顿不显得死',
    '发布成功、订阅完成这类庆祝时刻的轻量装饰，比礼花克制',
  ],
  confusions: [
    {
      with: '极光渐变',
      diff: '极光渐变是几团大面积色斑缓慢呼吸、互相叠加，没有方向也没有起点终点；流星雨是离散的细线沿固定倾角快速划过，一条结束才轮到下一条。',
    },
    {
      with: '光晕聚光',
      diff: '光晕聚光是跟着指针或某个焦点的圆形光斑，位置由交互决定；流星雨的位置和节奏由动画自己安排，用户不操作也会持续发生。',
    },
    {
      with: '颗粒噪点',
      diff: '颗粒噪点是整屏静态的随机纹理，用来去掉渐变的塑料感；流星雨是有明确运动方向和拖尾的动态元素，两者的目的是氛围与事件感。',
    },
  ],
  pitfalls: [
    '别对每条流星用大半径 blur 或 box-shadow，叠加十几条会直接掉帧；用 transform 位移加线性渐变的尾迹，必要时才加一层很轻的发光。',
    '流星太多会盖住正文：6–12 条、透明度压在 0.5 以下，并且整层 pointer-events: none、z-index 在内容之下。',
    '浅色舞台上白色流星几乎看不见，用 var(--stage-ink) 或强调色；要固定夜空底就自己垫一层深色，不要假设页面背景是深色。',
    '所有流星同时从同一点出发会像下雨而不是流星雨；用负的 animation-delay 和不同的起点、时长把它们打散。',
    'prefers-reduced-motion 下停掉位移和闪烁，只留几条静止的斜向光带或纯渐变底。',
  ],
  keywords: ['meteor shower', 'linear-gradient', '@keyframes', 'translate3d', 'animation-delay', 'opacity', 'will-change'],
  spec: [
    { label: '流星数量', value: '6–12 条' },
    { label: '单条时长', value: '2–4s' },
    { label: '倾角', value: '35–55°' },
    { label: '尾迹长度', value: '80–160px' },
  ],
  reducedMotion: 'prefers-reduced-motion: reduce 时停掉位移动画，只保留几条静止的斜向光带或纯渐变背景，不闪不划。',
  refs: [
    { label: 'MDN · @keyframes', url: 'https://developer.mozilla.org/docs/Web/CSS/@keyframes' },
    { label: 'MDN · linear-gradient()', url: 'https://developer.mozilla.org/docs/Web/CSS/gradient/linear-gradient' },
    { label: 'web.dev · 用 transform 和 opacity 做动画', url: 'https://web.dev/articles/animations-guide' },
  ],
  related: ['aurora-gradient', 'spotlight-glow', 'parallax'],
  scenes: ['page', 'card'],
  feel: ['calm', 'soft'],
  intent: ['attention'],
  tags: ['css-only', 'composited', 'motion-heavy', 'stable'],
  demo: { shape: 'stage', minHeight: 280 },
  controls: [
    { kind: 'range', id: 'count', label: '流星数量', min: 3, max: 16, step: 1, def: 8, unit: '条', hint: '超过 12 条就开始抢内容的注意力' },
    { kind: 'range', id: 'duration', label: '单条时长', min: 1, max: 6, step: 0.5, def: 3, unit: 's', hint: '越短越急，越长越安静' },
    {
      kind: 'select',
      id: 'angle',
      label: '倾角',
      def: '45',
      options: [
        { value: '30', label: '30°（更平）' },
        { value: '45', label: '45°（经典）' },
        { value: '60', label: '60°（更陡）' },
      ],
    },
  ],
  prompt: (values: ControlValues) => {
    const count = Number(values.count)
    const duration = Number(values.duration)
    const angle = Number(values.angle)
    return {
      zh:
        '做一个流星雨（meteor shower）背景：' +
        count +
        ' 条细长的流星从右上往左下以 ' +
        angle +
        '° 斜向划过，单条 ' +
        duration +
        's 走完，尾迹 80–160px 并用 linear-gradient 从透明渐到亮端，透明度最高 0.5。用 CSS @keyframes 只动 transform 和 opacity，每条用负 animation-delay 和不同起点、时长打散，整体 pointer-events: none 并压在内容层下面；颜色取 var(--stage-ink) 或强调色，不写死白色。prefers-reduced-motion 时停掉动画，只留静止光带。',
      en:
        'meteor shower background: ' +
        count +
        ' thin meteors cross from the top right toward the bottom left at ' +
        angle +
        ' degrees, each taking ' +
        duration +
        's, with an 80 to 160px tail drawn as a linear-gradient from transparent to a bright head and a peak opacity of 0.5. Animate transform and opacity only with CSS @keyframes, desynchronise them with negative animation-delay plus varied origins and durations, set pointer-events: none and keep the layer behind the content, and colour it with var(--stage-ink) or the accent colour instead of hard-coded white. Under prefers-reduced-motion stop the motion and keep only static diagonal streaks.',
    }
  },
  loop: 'continuous',
  en: {
    oneLiner: 'A few thin streaks of light cross the sky on a diagonal, tails fading as they go.',
    whenToUse: [
      'A dark hero or seasonal campaign page that wants a night-sky mood without a screen full of motion',
      'The backdrop of a loading or empty state so the pause does not feel dead',
      'A light celebration after a publish or a signup, more restrained than a confetti burst',
    ],
    confusions: [
      {
        with: 'aurora gradient',
        diff: 'An aurora gradient is a few large colour fields breathing slowly and blending together, with no direction, start, or end. A meteor shower is a set of discrete thin streaks that cross fast along a fixed angle, one after another.',
      },
      {
        with: 'spotlight glow',
        diff: 'A spotlight glow is a round pool of light tied to the pointer or some focal element, so its position is driven by interaction. Meteors choose their own positions and rhythm and keep happening with no input at all.',
      },
      {
        with: 'grain noise',
        diff: 'Grain noise is a static random texture across the whole surface, used to take the plastic edge off a gradient. Meteors are moving elements with a clear direction and a tail, and they signal an event rather than texture.',
      },
    ],
    pitfalls: [
      'Do not put a large blur or box-shadow on every meteor: a dozen stacked layers drops frames. Move with transform and draw the tail as a linear gradient, and add at most a very light glow.',
      'Too many meteors cover the copy. Keep it to 6 to 12, hold opacity under 0.5, set pointer-events: none on the layer, and keep it behind the content.',
      'White meteors are almost invisible on a light stage, so use var(--stage-ink) or the accent colour; if you need a night sky, paint your own dark layer instead of assuming a dark page.',
      'If every meteor leaves the same point at once it reads as rain, not a shower. Spread them with negative animation-delay plus different origins and durations.',
      'Under prefers-reduced-motion stop the movement and the flicker and keep only a few static diagonal streaks or a plain gradient.',
    ],
    spec: [
      { label: 'Meteor count' },
      { label: 'Per-meteor duration' },
      { label: 'Angle' },
      { label: 'Tail length' },
    ],
    reducedMotion:
      'Under prefers-reduced-motion: reduce stop the movement entirely and keep only a few static diagonal streaks or a plain gradient, with no flicker and nothing crossing the screen.',
    controls: [
      { label: 'Meteor count', hint: 'Past twelve meteors they start competing with the content' },
      { label: 'Per-meteor duration', hint: 'Shorter feels urgent, longer feels quiet' },
      { label: 'Angle' },
    ],
  },
}

export default entry
