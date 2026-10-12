import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'aurora-gradient',
  code: 'V-07',
  nameZh: '极光渐变',
  nameEn: 'Aurora Gradient',
  aliases: ['极光背景', '流动渐变', '光晕背景', 'aurora background', 'aurora gradient', 'animated gradient background'],
  category: 'visual',
  oneLiner: '几团彩色光斑在底色上慢慢游动，像极光一样铺满整屏。',
  whenToUse: [
    '落地页、产品首屏的大背景，要氛围但不要具体图形',
    '深色界面想要一块会呼吸的底色',
    '发布页、活动页需要持续流动感，又不想用视频或图片',
  ],
  confusions: [
    {
      with: '网格渐变',
      diff: '网格渐变是多个径向渐变叠出来的静态柔光；极光是这些光团在位移（translate + blur + 饱和度），重点在「慢慢游动」。',
    },
    {
      with: '聚光卡片',
      diff: '聚光跟着指针走，是人给的反馈；极光自己漂，有没有人都一样。',
    },
  ],
  pitfalls: [
    '大面积模糊很贵：光斑要放在独立图层里用 transform 位移，别每帧改 background-position',
    '光斑 3–5 团就够，堆多了只会糊成一片，看不出「极光」',
    '动画要慢（一轮 20–40s），快了像故障闪烁',
    '深色底效果好；浅色底上要压低饱和度，否则显脏',
    '文字压在上面要留对比度兜底（暗罩或压到暗部），别让正文落在最亮的光上',
    'prefers-reduced-motion 下停住动画，静态渐变仍然好看',
  ],
  keywords: [
    'aurora gradient',
    'animated gradient',
    'radial-gradient',
    'filter: blur()',
    'mix-blend-mode: screen',
    'transform: translate3d',
    'hue-rotate()',
    'saturate()',
  ],
  spec: [
    { label: '光斑数量', value: '3–5 团' },
    { label: '模糊半径', value: '60–100px' },
    { label: '一轮时长', value: '20–40s' },
    { label: '混合模式', value: 'mix-blend-mode: screen（深色底）' },
    { label: '对比度', value: '正文 ≥ 4.5:1，必要时加暗罩' },
  ],
  reducedMotion: 'prefers-reduced-motion 下把光斑的位移动画停掉，保留静态渐变，氛围还在但不再动。',
  refs: [
    { label: 'MDN · radial-gradient()', url: 'https://developer.mozilla.org/docs/Web/CSS/gradient/radial-gradient' },
    { label: 'MDN · filter: blur()', url: 'https://developer.mozilla.org/docs/Web/CSS/filter-function/blur' },
  ],
  related: ['mesh-gradient', 'spotlight-glow'],
  scenes: ['page', 'card'],
  feel: ['soft', 'playful'],
  intent: ['attention', 'hierarchy'],
  tags: ['css-only', 'gradient', 'filter-blend', 'paint-heavy', 'motion-heavy', 'stable'],
  demo: { shape: 'stage', minHeight: 320 },
  controls: [
    { kind: 'range', id: 'blobs', label: '光斑数量', min: 2, max: 6, step: 1, def: 4 },
    { kind: 'range', id: 'blur', label: '模糊半径', min: 40, max: 120, step: 10, def: 80, unit: 'px' },
    { kind: 'range', id: 'duration', label: '一轮时长', min: 10, max: 60, step: 5, def: 30, unit: 's' },
    {
      kind: 'select',
      id: 'palette',
      label: '配色',
      options: [
        { value: 'aurora', label: '极光（绿紫）' },
        { value: 'sunset', label: '晚霞（橙粉）' },
      ],
      def: 'aurora',
    },
  ],
  prompt: (values: ControlValues) => {
    const blobs = Number(values.blobs)
    const blur = Number(values.blur)
    const duration = Number(values.duration)
    const palette = String(values.palette)
    return {
      zh: `做一个极光渐变背景（aurora gradient）：深色底上放 ${blobs} 团大的 radial-gradient 光斑（配色 ${palette}），每团 filter: blur(${blur}px)、mix-blend-mode: screen，用 transform: translate3d 让它们以各自不同的速度慢慢漂移，一轮约 ${duration}s、linear 循环。光斑放独立图层，不要每帧改 background-position；正文压在上面时留暗罩保证对比度。prefers-reduced-motion 下停住动画，只留静态渐变。`,
      en: `aurora gradient background, ${blobs} large radial-gradient blobs (${palette} palette) on a dark base, each with filter: blur(${blur}px) and mix-blend-mode: screen, drifting at slightly different speeds with transform: translate3d in a ${duration}s linear loop, kept on their own layers instead of animating background-position, dark scrim behind body text for contrast, animation paused under prefers-reduced-motion`,
    }
  },
  loop: 'continuous',
  en: {
    oneLiner: 'A few coloured blobs drift slowly across the background, like an aurora spread over the screen.',
    whenToUse: [
      'Hero and landing backgrounds that need atmosphere without shapes',
      'Dark interfaces that want a base that breathes',
      'Launch and event pages that need constant motion without video or images',
    ],
    confusions: [
      {
        with: 'mesh gradient',
        diff: 'A mesh gradient stacks radial gradients into a still, soft glow. An aurora gradient adds the movement: translate, blur and saturation, so the blobs travel.',
      },
      {
        with: 'spotlight card',
        diff: 'A spotlight follows the pointer, so it is feedback. An aurora drifts on its own, with or without a user.',
      },
    ],
    pitfalls: [
      'Large blurs are expensive: drift the blob layers with transform instead of animating background-position every frame',
      'Three to five blobs is enough; more just smears into one wash',
      'Keep the loop slow (20–40s) or it reads as a glitch',
      'It works best on dark bases; on light ones lower the saturation or it looks muddy',
      'Give body text a contrast guarantee (a scrim or a darker area), never the brightest part of the glow',
      'Under prefers-reduced-motion freeze the drift and keep the still gradient',
    ],
    spec: [
      { label: 'Blob count' },
      { label: 'Blur radius' },
      { label: 'Loop length' },
      { label: 'Blend mode' },
      { label: 'Contrast' },
    ],
    reducedMotion:
      'Under prefers-reduced-motion stop the drift animation and keep the still gradient: the atmosphere survives without movement.',
    controls: [{ label: 'Blob count' }, { label: 'Blur radius' }, { label: 'Loop length' }, { label: 'Palette' }],
  },
}

export default entry
