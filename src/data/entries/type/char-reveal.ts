import type { ControlValues, Entry } from '../../types'

const SAMPLE = '把一句话拆成字再依次落位'

const entry: Entry = {
  slug: 'char-reveal',
  code: 'T-04',
  nameZh: '逐字显现',
  nameEn: 'Character Reveal',
  aliases: ['逐字动画', '字符入场', '逐字出现', 'character reveal', 'split text animation', 'per-character animation'],
  category: 'type',
  oneLiner: '标题里的字一个接一个落到位，像被逐字写出来。',
  whenToUse: [
    '首屏主标题第一次出现，想让目光按顺序读过去',
    '标语、口号、产品名这类二三十字以内的短文本',
    '想强调半句话，让前半句先出现，后半句再接上',
  ],
  confusions: [
    {
      with: '打字机',
      diff: '打字机是一个字符一个字符「被敲出来」，常配光标和等宽字体，文本长度在一点点变长；逐字显现是所有字已经站在排版位置上，只是依次从透明和偏移回到原位。',
    },
    {
      with: '交错进场 stagger',
      diff: 'stagger 作用在一组独立元素上（列表项、卡片），逐字显现是先把一句话拆成单字，再对这串字套用同样的错峰逻辑，而且要额外处理读屏。',
    },
  ],
  pitfalls: [
    '拆成单字 span 后读屏会一个字一个字念，必须给可视文字加 aria-hidden="true"，再放一份完整文本（sr-only 或 aria-label）给读屏。',
    '英文按字母拆会打断单词、连字和字偶距，英文应该按词拆，或者用 Intl.Segmenter 按 grapheme 或 word 切。',
    '每个字一个 DOM 节点，长文本会撑出上百个节点，总延迟也会拉到几秒；只给前 20–30 字加动画，其余直接显示。',
    '字间隔乘字数就是最后一个字的等待时间：40 字乘 50ms 已经两秒，别让读者干等。',
    'prefers-reduced-motion 下要跳过延迟和位移，整句一次显示。',
  ],
  keywords: ['split text', 'per-character animation', 'animation-delay', 'translateY', 'opacity', 'sr-only', 'prefers-reduced-motion'],
  spec: [
    { label: '单字时长', value: '300–600ms' },
    { label: '字间隔', value: '20–50ms' },
    { label: '位移', value: '0.4–0.8em' },
    { label: '缓动', value: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    { label: '字数上限', value: '20–30 字' },
  ],
  reducedMotion: 'prefers-reduced-motion: reduce 时去掉逐字延迟和位移，整句以最终状态一次渲染。',
  refs: [
    { label: 'MDN · animation-delay', url: 'https://developer.mozilla.org/docs/Web/CSS/animation-delay' },
    { label: 'web.dev · 用 transform 和 opacity 做动画', url: 'https://web.dev/articles/animations-guide' },
  ],
  related: ['stagger', 'scroll-reveal', 'fluid-type'],
  scenes: ['text', 'page'],
  feel: ['playful', 'crisp'],
  intent: ['attention', 'hierarchy'],
  controls: [
    { kind: 'range', id: 'duration', label: '单字时长', min: 200, max: 900, step: 20, def: 480, unit: 'ms', hint: '每个字自己走完这段时长' },
    { kind: 'range', id: 'stagger', label: '字间隔', min: 0, max: 120, step: 5, def: 45, unit: 'ms', hint: '调到 0 就变成整句一起出现' },
    { kind: 'range', id: 'distance', label: '位移距离', min: 0, max: 40, step: 2, def: 14, unit: 'px', hint: '字从下方多少像素浮上来' },
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
    const duration = Number(values.duration)
    const stagger = Number(values.stagger)
    const distance = Number(values.distance)
    const easing = String(values.easing)
    const total = Math.round(duration + (SAMPLE.length - 1) * stagger)
    return {
      zh:
        '做一个逐字显现（character reveal）的标题：把「' +
        SAMPLE +
        '」按字拆成 span，每个字从下方 ' +
        distance +
        'px、opacity 0 进入原位，单字时长 ' +
        duration +
        'ms，缓动 ' +
        easing +
        '，相邻两字间隔 ' +
        stagger +
        'ms，' +
        SAMPLE.length +
        ' 个字总时长约 ' +
        total +
        'ms。只用 transform 和 opacity 实现；给可视文字加 aria-hidden，另放一份完整文本给读屏；系统开启减少动态效果时整句一次显示。',
      en:
        'character reveal, split text into per-character spans, each char animates opacity 0 to 1 and translateY(' +
        distance +
        'px) to 0, duration ' +
        duration +
        'ms, per-char delay ' +
        stagger +
        'ms, easing ' +
        easing +
        ', animate transform/opacity only, aria-hidden on visual text plus sr-only copy, respect prefers-reduced-motion',
    }
  },
  en: {
    oneLiner: 'The characters of a headline drop into place one after another, as if written out letter by letter.',
    whenToUse: [
      'A hero headline appears for the first time and you want the eye to read through it in order',
      'Short text under twenty or thirty characters, such as a tagline, a slogan, or a product name',
      'You want to stress half a sentence by bringing the first half in and following with the rest',
    ],
    confusions: [
      {
        with: 'typewriter effect',
        diff: 'A typewriter types characters one at a time, usually with a caret and a monospace face, and the text keeps growing. Character reveal keeps every character on its final typeset position and animates each one from transparent and offset back to rest.',
      },
      {
        with: 'staggered entrance',
        diff: 'Stagger applies the same delay pattern to a set of independent elements such as list rows or cards. Character reveal first splits one sentence into individual characters and then applies that pattern to the character run, and it takes extra work for screen readers.',
      },
    ],
    pitfalls: [
      'Once split into per-character spans, a screen reader reads character by character. Mark the visual text aria-hidden="true" and give assistive tech a complete copy (sr-only or aria-label).',
      'Splitting English by letter breaks words, ligatures, and kerning. Split English by word, or segment it by grapheme or word with Intl.Segmenter.',
      'One DOM node per character means long text blows up to hundreds of nodes and a total delay of several seconds. Animate only the first 20 to 30 characters and show the rest immediately.',
      'Stagger times character count is how long the last character waits: 40 characters at 50ms is already two seconds. Do not make readers sit through it.',
      'Under prefers-reduced-motion, drop the delay and the offset and show the whole sentence at once.',
    ],
    spec: [
      { label: 'Per-character duration' },
      { label: 'Stagger' },
      { label: 'Offset' },
      { label: 'Easing' },
      { label: 'Character cap' },
    ],
    reducedMotion: 'Under prefers-reduced-motion: reduce, drop the per-character delay and the offset and render the whole sentence once in its final state.',
    controls: [
      { label: 'Per-character duration', hint: 'Each character runs this long on its own' },
      { label: 'Stagger', hint: 'At 0 the whole sentence appears at once' },
      { label: 'Travel distance', hint: 'How many pixels each character floats up from below' },
      { label: 'Easing' },
    ],
  },
}

export default entry
