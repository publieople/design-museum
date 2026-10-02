import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'gradient-text',
  code: 'T-03',
  nameZh: '渐变文字',
  nameEn: 'Gradient Text',
  aliases: ['渐变字体', '文字渐变', '彩色文字', 'gradient text', 'background-clip text', 'text gradient'],
  category: 'type',
  oneLiner: '把文字当成蒙版，露出来的不是单色而是背后的渐变。',
  whenToUse: [
    '首屏大标题想有一点彩色，又不想引入图片或 SVG',
    '强调品牌名、数字、少量关键词，不覆盖整段正文',
    '深色页面上做霓虹或金属质感的标题',
  ],
  confusions: [
    {
      with: '逐字上色',
      diff: '用 span 给每个字单独设色，颜色是一段一段拼出来的；background-clip: text 是一整条渐变连续铺满整个文字盒子，每个字落在渐变的哪一段由盒子的宽度和字的位置决定。',
    },
    {
      with: 'text-shadow 外发光',
      diff: 'text-shadow 只在字形外面加一层光，字身仍然是单色；渐变文字是把背景裁进字形里面，颜色出现在字的内部。',
    },
  ],
  pitfalls: [
    '一定要同时写 background-clip: text（配 -webkit- 前缀）和 color: transparent，否则会看到文字后面压着一整块背景色。',
    'color: transparent 在 Windows 高对比度（forced-colors）模式下会让文字整体消失，要加 @media (forced-colors: active) 退回实色。',
    '渐变两端都要和背景有足够对比：浅色那一端压在浅背景上会直接糊掉，正文级别至少保证 4.5:1。',
    '背景是铺在元素盒子上的，文字换行以后渐变会跨整个盒子，不是每一行重来一遍。',
    '整段正文都上渐变会明显掉可读性，一般只给一到两行标题用。',
  ],
  keywords: ['background-clip: text', '-webkit-background-clip', 'color: transparent', '-webkit-text-fill-color', 'linear-gradient', 'forced-colors', 'background-size'],
  spec: [
    { label: '渐变角度', value: '90–135deg' },
    { label: '色标数量', value: '2–3 个' },
    { label: '对比度', value: '正文至少 4.5:1' },
    { label: '降级', value: '@supports 不支持时退回实色' },
  ],
  reducedMotion: '渐变本身是静态的；如果加了背景流动或者色相旋转这类动效，prefers-reduced-motion 下要停掉动画，只保留静态渐变。',
  refs: [
    { label: 'MDN · background-clip', url: 'https://developer.mozilla.org/docs/Web/CSS/background-clip' },
    { label: 'MDN · linear-gradient()', url: 'https://developer.mozilla.org/docs/Web/CSS/gradient/linear-gradient' },
  ],
  related: ['mesh-gradient', 'gradient-border', 'variable-font'],
  scenes: ['text', 'page', 'card'],
  feel: ['playful', 'crisp'],
  intent: ['attention', 'hierarchy'],
  controls: [
    { kind: 'range', id: 'angle', label: '渐变角度', min: 0, max: 360, step: 5, def: 120, unit: 'deg', hint: '角度一转，每个字落在渐变里的颜色全变' },
    {
      kind: 'select',
      id: 'palette',
      label: '配色',
      def: 'sunset',
      options: [
        { value: 'sunset', label: '暖霞（红紫）' },
        { value: 'ocean', label: '冷光（青蓝）' },
        { value: 'acid', label: '酸性（绿粉）' },
      ],
    },
    { kind: 'range', id: 'startStop', label: '首色位置', min: 0, max: 100, step: 5, def: 0, unit: '%', hint: '把第一种颜色往后推，渐变会挤向另一头' },
    { kind: 'toggle', id: 'hue', label: '色相缓慢流动', def: false },
  ],
  prompt: (values: ControlValues) => {
    const angle = Number(values.angle)
    const palette = String(values.palette)
    const start = Number(values.startStop)
    const hue = Boolean(values.hue)
    const pairs: Record<string, string> = {
      sunset: '#e5484d → #7c3aed',
      ocean: '#0ea5e9 → #6366f1',
      acid: '#4d7c0f → #db2777',
    }
    const pair = pairs[palette] ?? pairs.sunset
    return {
      zh:
        '做一个渐变文字（gradient text）标题：background-image 用 linear-gradient(' +
        angle +
        'deg, 首色停在 ' +
        start +
        '%，' +
        pair +
        ')，再写 background-clip: text 和 color: transparent，Safari 补 -webkit-background-clip: text。' +
        (hue ? '再让它缓慢做 filter: hue-rotate(360deg) 循环，' : '') +
        '记得给 forced-colors 模式退回实色，保证高对比度下文字不会消失。',
      en:
        'gradient text, background-image: linear-gradient(' +
        angle +
        'deg, ' +
        pair +
        '), background-clip: text, -webkit-background-clip: text, color: transparent, -webkit-text-fill-color: transparent' +
        (hue ? ', animated filter: hue-rotate(360deg)' : '') +
        ', forced-colors fallback, contrast at least 4.5:1',
    }
  },
  loop: 'continuous',
  en: {
    oneLiner: 'The text acts as a mask, so what shows through is the gradient behind it instead of a single color.',
    whenToUse: [
      'A hero headline needs a bit of color without pulling in an image or an SVG',
      'You want to highlight a brand name, a number, or a few keywords rather than a whole paragraph',
      'A dark page calls for a neon or metallic headline',
    ],
    confusions: [
      {
        with: 'per-character coloring',
        diff: 'Coloring each character with its own span builds the color piece by piece. background-clip: text lays one continuous gradient across the whole text box, and which slice a character lands on depends on the box width and where that character sits.',
      },
      {
        with: 'text-shadow glow',
        diff: 'text-shadow adds a glow around the glyph while the glyph itself stays one solid color. Gradient text clips the background into the glyph, so the color sits inside the letters.',
      },
    ],
    pitfalls: [
      'You have to write background-clip: text (with the -webkit- prefix) together with color: transparent, or the full background color shows behind the text.',
      'color: transparent makes the text disappear entirely in Windows High Contrast (forced-colors) mode. Add @media (forced-colors: active) and fall back to a solid color.',
      'Both ends of the gradient need enough contrast against the background: a light end over a light background washes out, and body-level text still needs 4.5:1.',
      'The background paints across the element box, so once the text wraps the gradient runs across the whole box instead of restarting on each line.',
      'A gradient over a full paragraph costs a lot of readability, so it is normally limited to one or two headline lines.',
    ],
    spec: [
      { label: 'Gradient angle' },
      { label: 'Color stops' },
      { label: 'Contrast' },
      { label: 'Fallback' },
    ],
    reducedMotion: 'The gradient itself is static. If you animate the background position or rotate the hue, prefers-reduced-motion should stop the animation and leave the static gradient.',
    controls: [
      { label: 'Gradient angle', hint: 'Turn the angle and every character lands on a different color in the gradient' },
      { label: 'Palette' },
      { label: 'First stop position', hint: 'Push the first color later and the gradient squeezes toward the other end' },
      { label: 'Slow hue rotation' },
    ],
  },
}

export default entry
