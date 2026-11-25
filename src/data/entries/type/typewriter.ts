import type { ControlValues, Entry } from '../../types'

const SAMPLE = '把想法一个字一个字敲进屏幕里。'

const entry: Entry = {
  slug: 'typewriter',
  code: 'T-09',
  nameZh: '打字机效果',
  nameEn: 'Typewriter',
  aliases: ['打字效果', '逐字打字', '打字机', 'typewriter effect', 'typing effect', 'type-on text', 'caret blink'],
  category: 'type',
  oneLiner: '文字像被键盘一个字一个字敲出来，末尾光标一直闪。',
  whenToUse: [
    '首屏只有一句主张，想让读者跟着敲字的节奏往下读',
    '终端、代码编辑器、复古机械感的界面语言',
    'AI 回答的流式预览、输入框旁的示例问题，用打字暗示「正在生成」',
  ],
  confusions: [
    {
      with: '逐字显现',
      diff: '逐字显现是整句话早已排好版，每个字从透明和偏移回到原位，文本长度不变；打字机是文本真的一个字一个字长出来，后面还没打到的地方是空的，通常还配一个闪烁光标。',
    },
    {
      with: '跑马灯',
      diff: '跑马灯是一整段文字横向循环滚动，适合放不下的长文本；打字机在原地逐字增加内容，不横向移动，长度到顶后一般停住或清空重打。',
    },
    {
      with: '数字滚动',
      diff: '数字滚动只处理数字，靠插值让读数从旧值跳到新值；打字机处理任意字符序列，按固定节奏追加字符，不存在中间数值。',
    },
  ],
  pitfalls: [
    '每敲一个字都会改变文本宽度并触发重排；给容器预留最终宽度或固定 min-height，避免标题下面的内容跟着上下跳。',
    '读屏软件会随着每次追加不断朗读；把正在打的部分设成 aria-hidden，另放一份完整句子给读屏，并且不要开 aria-live。',
    '逐字更新用 setInterval 容易在切后台后堆积回调；改用 setTimeout 递归、每次重算下一拍，或者在页面隐藏时暂停。',
    '中英文混排时按 UTF-16 下标切字符会把 emoji 和组合字符切坏；用 Array.from 或 Intl.Segmenter 按字素切。',
    '标点和句末要有比普通字更长的停顿，否则读起来像机器在赶工；prefers-reduced-motion 下一次显示整句，不要保留循环。',
  ],
  keywords: ['typewriter effect', 'steps()', 'caret-color', 'setTimeout', 'Array.from', 'aria-live', 'prefers-reduced-motion'],
  spec: [
    { label: '每字间隔', value: '50–80ms' },
    { label: '标点停顿', value: '150–250ms' },
    { label: '光标闪烁', value: '1–1.2s，steps(2) 硬切' },
    { label: '打完停留', value: '1.5–2.5s 再循环' },
  ],
  reducedMotion: 'prefers-reduced-motion: reduce 时跳过逐字过程，整句一次显示，光标不再闪烁，也不自动循环重打。',
  refs: [
    { label: 'MDN · steps() 缓动函数', url: 'https://developer.mozilla.org/docs/Web/CSS/easing-function/steps' },
    { label: 'MDN · caret-color', url: 'https://developer.mozilla.org/docs/Web/CSS/caret-color' },
    { label: 'web.dev · 用 transform 和 opacity 做动画', url: 'https://web.dev/articles/animations-guide' },
  ],
  related: ['char-reveal', 'count-up', 'marquee'],
  scenes: ['text', 'page'],
  feel: ['crisp', 'playful'],
  intent: ['attention'],
  tags: ['js', 'main-thread', 'motion-heavy', 'stable'],
  demo: { shape: 'stage' },
  controls: [
    { kind: 'range', id: 'speed', label: '每字间隔', min: 20, max: 160, step: 5, def: 70, unit: 'ms', hint: '调到 20ms 像机器在刷屏，160ms 像人手在敲' },
    { kind: 'range', id: 'hold', label: '打完停留', min: 400, max: 3000, step: 100, def: 1600, unit: 'ms', hint: '整句打完到清空重来之间的停顿' },
    { kind: 'toggle', id: 'caret', label: '闪烁光标', def: true },
  ],
  prompt: (values: ControlValues) => {
    const speed = Number(values.speed)
    const hold = Number(values.hold)
    const caret = Boolean(values.caret)
    return {
      zh:
        '做一个打字机效果（typewriter）：把「' +
        SAMPLE +
        '」逐字打进容器，每字间隔 ' +
        speed +
        'ms，逗号句号后多停 180ms，整句打完后停留 ' +
        hold +
        'ms 再清空重打。' +
        (caret ? '末尾放一个 1ch 宽的光标，用 steps(2) 每 1s 硬切闪烁。' : '不放光标。') +
        '文本用 Array.from 按字素切分，容器预留最终宽度避免重排跳动；正在打的部分 aria-hidden，另放完整句子给读屏；prefers-reduced-motion 时整句一次显示且不循环。',
      en:
        'typewriter effect: type the sentence one character at a time with ' +
        speed +
        'ms per character, add a 180ms pause after punctuation, hold the finished line for ' +
        hold +
        'ms, then clear and retype. ' +
        (caret ? 'Show a 1ch caret at the end that blinks with steps(2) every 1s. ' : 'No caret. ') +
        'Split text by grapheme with Array.from, reserve the final width so the layout does not reflow, mark the typing part aria-hidden and expose the full sentence to screen readers, and show the whole line at once under prefers-reduced-motion with no loop.',
    }
  },
  loop: 'replay',
  en: {
    oneLiner: 'Text is knocked out one character at a time, with a blinking caret at the end.',
    whenToUse: [
      'A hero holds a single line and you want readers to move through it at typing pace',
      'Terminal, code editor, or retro mechanical interface language',
      'Streaming previews of an AI answer, or example prompts beside an input, where typing hints that something is being generated',
    ],
    confusions: [
      {
        with: 'character reveal',
        diff: 'Character reveal lays the whole sentence out first and animates each character from transparent and offset back into place, so the text never changes length. A typewriter actually grows the string one character at a time, leaves the rest empty, and usually pairs the text with a blinking caret.',
      },
      {
        with: 'marquee',
        diff: 'A marquee scrolls a finished line sideways on a loop, which suits text that does not fit. A typewriter appends characters in place, never moves sideways, and usually stops or clears once the line is complete.',
      },
      {
        with: 'count up',
        diff: 'Count up only handles numbers, interpolating a reading from an old value to a new one. A typewriter appends arbitrary characters at a fixed cadence and has no intermediate numeric value at all.',
      },
    ],
    pitfalls: [
      'Every appended character changes the text width and triggers reflow. Reserve the final width or set a min-height so the content below the headline does not jump.',
      'Screen readers announce each append, so the line is read over and over. Mark the typing part aria-hidden, expose a complete sentence instead, and never turn on aria-live.',
      'setInterval keeps queueing callbacks after the tab is hidden. Use a recursive setTimeout that recomputes the next tick, or pause while the document is hidden.',
      'Slicing by UTF-16 index breaks emoji and combining marks in mixed text. Split by grapheme with Array.from or Intl.Segmenter.',
      'Punctuation needs a longer beat than ordinary characters or the rhythm feels rushed. Under prefers-reduced-motion show the whole sentence at once and drop the loop.',
    ],
    spec: [
      { label: 'Per-character interval' },
      { label: 'Punctuation pause' },
      { label: 'Caret blink' },
      { label: 'Hold before looping' },
    ],
    reducedMotion:
      'Under prefers-reduced-motion: reduce skip the typing entirely, show the whole sentence at once, stop the caret from blinking, and do not loop.',
    controls: [
      { label: 'Per-character interval', hint: 'At 20ms it reads like a machine; at 160ms it reads like a person typing' },
      { label: 'Hold before looping', hint: 'The pause between the finished line and clearing it to start again' },
      { label: 'Blinking caret' },
    ],
  },
}

export default entry
