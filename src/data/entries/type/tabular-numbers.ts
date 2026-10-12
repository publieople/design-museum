import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'tabular-numbers',
  code: 'T-08',
  nameZh: '等宽数字',
  nameEn: 'Tabular Numbers',
  aliases: ['等宽数字', '数字不跳', '表格数字', 'tabular figures', 'tabular-nums', 'monospaced digits', 'lining figures'],
  category: 'type',
  oneLiner: '让每个数字占一样宽，数值变化时整行不会左右抖。',
  whenToUse: [
    '倒计时、计时器、播放进度这类数字一直在变的组件',
    '实时统计、价格、余额，数字跳动时会牵动整行宽度',
    '表格里要让小数点或个位对齐成一条竖线',
  ],
  confusions: [
    {
      with: '数字滚动',
      diff: '数字滚动管的是数值怎么从 A 变到 B；等宽数字管的是每个数字占多宽。两者经常一起用——滚动时行宽不变，看起来才稳。',
    },
    {
      with: '默认比例数字',
      diff: '默认是比例数字（proportional）：1 比 8 窄，正文里更好看；一旦数字要纵向对齐或持续变化，就该切成等宽。',
    },
  ],
  pitfalls: [
    'tabular-nums 需要字体支持这个 OpenType 特性，艺术字体可能没有，会悄悄退化成默认比例数字',
    '只加等宽还不够：位数变化（9 → 10）时整块仍会变宽，要给 min-width 或预留宽度并右对齐',
    '表格里要配合 text-align: right 且小数位数统一，否则照样对不齐',
    'font-feature-settings: "tnum" 是等价的旧写法，优先用 font-variant-numeric，可读性更好',
    '不要为了数字把整站换成等宽字体：只给需要的片段加这个特性',
  ],
  keywords: [
    'font-variant-numeric',
    'tabular-nums',
    'font-feature-settings tnum',
    'lining-nums',
    'tabular figures',
    'text-align: right',
    'min-width',
    'OpenType feature',
  ],
  spec: [
    { label: '现代写法', value: 'font-variant-numeric: tabular-nums' },
    { label: '旧写法', value: 'font-feature-settings: "tnum"' },
    { label: '对齐', value: '配合 text-align: right' },
    { label: '位宽变化', value: '给 min-width 或等宽容器，别让行宽跟着跳' },
    { label: '使用范围', value: '只给需要对齐的数字片段，正文保持默认比例数字' },
  ],
  reducedMotion: '等宽数字是静态特性，不需要降级；只有配合数字滚动时，prefers-reduced-motion 下直接显示终值。',
  refs: [
    { label: 'MDN · font-variant-numeric', url: 'https://developer.mozilla.org/docs/Web/CSS/font-variant-numeric' },
    { label: 'MDN · font-feature-settings', url: 'https://developer.mozilla.org/docs/Web/CSS/font-feature-settings' },
  ],
  related: ['count-up', 'variable-font'],
  scenes: ['text', 'list', 'page'],
  feel: ['crisp', 'calm'],
  intent: ['hierarchy', 'affordance'],
  tags: ['css-only', 'font-feature', 'stable'],
  demo: { shape: 'stage' },
  controls: [
    { kind: 'toggle', id: 'tabular', label: '启用等宽数字', def: true },
    { kind: 'toggle', id: 'compare', label: '对照：默认比例数字', def: true },
    { kind: 'range', id: 'interval', label: '数字变化间隔', min: 200, max: 2000, step: 100, def: 700, unit: 'ms' },
  ],
  prompt: (values: ControlValues) => {
    const tabular = values.tabular !== false
    const interval = Number(values.interval)
    const figures = tabular
      ? '加 font-variant-numeric: tabular-nums（等宽数字，旧写法 font-feature-settings: "tnum"）'
      : '保留默认的比例数字'
    return {
      zh:
        '给这个会变数字的组件' +
        figures +
        '，每 ' +
        interval +
        'ms 更新一次数值时整行宽度不要变。位数会变化的话（9 → 10）再给 min-width 或固定宽度容器并右对齐，表格里的数字统一 text-align: right。',
      en:
        'counter with ' +
        (tabular ? 'font-variant-numeric: tabular-nums (legacy font-feature-settings: "tnum")' : 'default proportional figures') +
        ', updated every ' +
        interval +
        'ms without the row width shifting, right-aligned inside a min-width column so 9 to 10 does not resize the block, numbers in tables aligned with text-align: right',
    }
  },
  loop: 'continuous',
  en: {
    oneLiner: 'Every digit takes the same width, so a changing number never shifts the line.',
    whenToUse: [
      'Countdowns, timers and playback progress where digits keep changing',
      'Live metrics, prices and balances where a jump would resize the row',
      'Tables whose decimal points should line up in a column',
    ],
    confusions: [
      {
        with: 'count up',
        diff: 'Count up is about how the value travels from A to B. Tabular numbers are about how much width each digit takes. They are usually paired so the row stops shivering.',
      },
      {
        with: 'proportional figures',
        diff: 'The default is proportional: a 1 is narrower than an 8, which reads better in prose. Switch to tabular as soon as digits need to align vertically or keep changing.',
      },
    ],
    pitfalls: [
      'tabular-nums needs the font to carry that OpenType feature; artistic fonts may silently fall back to proportional figures',
      'Tabular alone is not enough: 9 to 10 still widens the block, so add min-width or reserve space and right-align',
      'In tables pair it with text-align: right and a fixed number of decimals, or the column still looks ragged',
      'font-feature-settings: "tnum" is the legacy spelling; prefer font-variant-numeric for readability',
      'Do not switch the whole site to a monospaced font for this: apply the feature only where alignment matters',
    ],
    spec: [
      { label: 'Modern syntax' },
      { label: 'Legacy syntax' },
      { label: 'Alignment' },
      { label: 'Changing digits' },
      { label: 'Scope' },
    ],
    reducedMotion:
      'Tabular figures are static and need no fallback. Only a paired count-up animation should jump straight to the final value under prefers-reduced-motion.',
    controls: [{ label: 'Tabular figures' }, { label: 'Compare: proportional' }, { label: 'Update interval' }],
  },
}

export default entry
