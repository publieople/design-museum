import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'variable-font',
  code: 'T-05',
  nameZh: '可变字体',
  nameEn: 'Variable Font',
  aliases: ['可变字重', '轴字体', '可变字体动画', 'variable font', 'font-variation-settings', 'weight axis'],
  category: 'type',
  oneLiner: '一个字体文件里带着连续的字重轴，可以停在任意粗细。',
  whenToUse: [
    '标题需要在细和粗之间平滑过渡，而不是只有 400 和 700 两档',
    '想用同一套字体兼顾正文和超粗标题，少加载几个字体文件',
    '随交互或滚动慢慢改变字重，做一个不靠颜色和位移的强调',
  ],
  confusions: [
    {
      with: '多字重静态字体',
      diff: '静态字体每一档是一个独立文件，只加载了 400 和 700 时，font-weight: 550 会被四舍五入到其中一档；可变字体在轴范围内任意数值都能真正插值。',
    },
    {
      with: 'font-weight 和 font-variation-settings',
      diff: '两个都能调字重。font-weight 是标准属性，会正常继承，也能让不支持可变字体的 fallback 生效；font-variation-settings 是底层开关，用来访问 wdth、slnt 这些没有专门属性的轴，写 wght 时会盖过 font-weight，MDN 建议 wght 优先走 font-weight。',
    },
  ],
  pitfalls: [
    '字体里没有的轴，调了完全没反应。先用字体工具查清它有哪些轴、范围多少，超出范围的值会被夹到边界。',
    'font-variation-settings 的值是字符串，轴名必须带引号：font-variation-settings: "wght" 550, "wdth" 90。少写引号整条声明失效。',
    '改轴值会触发文字重新排版，不是 GPU 合成的，长时间无限循环容易掉帧，而且要尊重 prefers-reduced-motion。',
    'Web 字体还没下载完时会先落到系统字体，轴不生效还会跳一下；用 font-display: swap，并让 fallback 的字重尽量接近。',
  ],
  keywords: ['font-variation-settings', 'variable font', 'wght', 'wdth', 'opsz', 'slnt', '@font-face', 'font-weight'],
  spec: [
    { label: '字重范围', value: '300–800（以字体实际轴范围为准）' },
    { label: '常见轴', value: 'wght / wdth / opsz / slnt' },
    { label: '插值时长', value: '400–900ms' },
    { label: '缓动', value: 'ease-in-out' },
  ],
  reducedMotion: '可变字体本身是静态能力。如果用它做来回脉动的字重动画，prefers-reduced-motion 下应停在最终字重，不做插值。',
  refs: [
    { label: 'MDN · font-variation-settings', url: 'https://developer.mozilla.org/docs/Web/CSS/font-variation-settings' },
    { label: 'MDN · 可变字体指南', url: 'https://developer.mozilla.org/docs/Web/CSS/CSS_fonts/Variable_fonts_guide' },
  ],
  related: ['fluid-type', 'gradient-text', 'char-reveal'],
  scenes: ['text', 'page'],
  feel: ['crisp', 'calm'],
  intent: ['hierarchy', 'attention'],
  controls: [
    { kind: 'range', id: 'wght', label: '字重轴 wght', min: 300, max: 700, step: 1, def: 450, hint: '连续拖，看字真的跟着变粗变细，而不是只有几档' },
    { kind: 'range', id: 'steps', label: '档位数', min: 1, max: 9, step: 1, def: 1, unit: '档', hint: '大于 1 时把字重取整到最近的档，就像只加载了几个静态字重' },
    {
      kind: 'select',
      id: 'family',
      label: '字体',
      def: 'display',
      options: [
        { value: 'display', label: 'Space Grotesk（标题体）' },
        { value: 'mono', label: 'JetBrains Mono（等宽体）' },
      ],
    },
    { kind: 'toggle', id: 'ruler', label: '显示 300–700 对照尺', def: true },
  ],
  prompt: (values: ControlValues) => {
    const wght = Number(values.wght)
    const steps = Number(values.steps)
    const family = String(values.family)
    const ruler = Boolean(values.ruler)
    const fontName = family === 'mono' ? 'JetBrains Mono' : 'Space Grotesk'
    return {
      zh:
        '用可变字体（variable font）做一个字重可调的文字块，字体是 ' +
        fontName +
        '，轴范围大约 300–700。font-variation-settings 写成 "wght" ' +
        wght +
        '，' +
        (steps > 1
          ? '并且只允许取 ' + steps + ' 个档位，其余值就近取整，用来模拟只加载了几个静态字重的效果。'
          : '字重取连续值，任意数字都要真正插值，不是就近跳到某一档。') +
        (ruler ? '旁边放一行 300–700 的对照尺。' : '') +
        '给不支持可变字体的浏览器留一个接近的静态字重兜底。',
      en:
        'variable font, font-variation-settings: "wght" ' +
        wght +
        ', ' +
        (steps > 1 ? steps + ' discrete weight stops, ' : 'continuous weight interpolation, ') +
        'wght axis, @font-face font-weight range, font-display: swap fallback, ' +
        (ruler ? 'weight ruler 300-700, ' : '') +
        'respect prefers-reduced-motion',
    }
  },
  loop: 'continuous',
  en: {
    oneLiner: 'A single font file carries a continuous weight axis, so it can stop at any weight.',
    whenToUse: [
      'A headline needs to travel smoothly between thin and bold instead of only having 400 and 700',
      'One family should cover both body text and an extra-bold headline while you load fewer files',
      'The weight shifts slowly with interaction or scroll for emphasis that does not lean on color or movement',
    ],
    confusions: [
      {
        with: 'static multi-weight families',
        diff: 'Each static weight is its own file. With only 400 and 700 loaded, font-weight: 550 rounds to one of them, while a variable font truly interpolates any value inside the axis range.',
      },
      {
        with: 'font-weight vs font-variation-settings',
        diff: 'Both can set weight. font-weight is the standard property, inherits normally, and still applies to fallbacks without variable support. font-variation-settings is the low-level switch for axes that have no dedicated property, such as wdth and slnt; writing wght there overrides font-weight, and MDN recommends using font-weight for wght.',
      },
    ],
    pitfalls: [
      'An axis the font does not carry does nothing when you set it. Check which axes the font exposes and their ranges first; values outside the range are clamped to the edge.',
      'font-variation-settings takes string values and the axis name must be quoted: font-variation-settings: "wght" 550, "wdth" 90. Drop the quotes and the whole declaration is invalid.',
      'Changing an axis value triggers text re-layout rather than a GPU compositing step, so a long infinite loop drops frames, and it has to respect prefers-reduced-motion.',
      'Before the web font downloads, the system font renders first: the axis does nothing and the text jumps. Use font-display: swap and pick a fallback whose weight is close.',
    ],
    spec: [
      { label: 'Weight range' },
      { label: 'Common axes' },
      { label: 'Interpolation duration' },
      { label: 'Easing' },
    ],
    reducedMotion: 'A variable font is a static capability. If you animate the weight as a pulse, prefers-reduced-motion should rest on the final weight with no interpolation.',
    controls: [
      { label: 'Weight axis (wght)', hint: 'Drag continuously and watch the glyphs actually thicken and thin instead of snapping to a few stops' },
      { label: 'Number of steps', hint: 'Above 1 the weight rounds to the nearest step, like loading a handful of static weights' },
      { label: 'Typeface' },
      { label: 'Show 300-700 weight ruler' },
    ],
  },
}

export default entry
