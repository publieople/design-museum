import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'command-palette',
  code: 'F-08',
  nameZh: '命令面板',
  nameEn: 'Command Palette',
  aliases: ['命令面板', '快捷搜索框', '⌘K 面板', 'command palette', 'command menu', 'quick switcher', 'spotlight search'],
  category: 'feedback',
  oneLiner: '按一个快捷键弹出一个搜索框，敲几个字就能跳到任何功能。',
  whenToUse: [
    '功能多到侧栏或顶部导航塞不下的后台、编辑器、工具型产品',
    '想让熟练用户完全不离开键盘就能跳转（⌘K / Ctrl+K）',
    '需要把「命令」和「跳转」放在同一个入口里检索',
  ],
  confusions: [
    {
      with: '搜索框',
      diff: '搜索框在页面里占位置、搜的是内容；命令面板是浮层、搜的是动作与位置，选中就直接执行或跳转，还会把快捷键写在行尾。',
    },
    {
      with: '下拉选择',
      diff: '下拉选择是「从有限选项里挑一个」；命令面板的结果是动态过滤出来的，而且键盘导航（上下键选中、回车确认、Esc 关闭）是它的核心而不是附加功能。',
    },
  ],
  pitfalls: [
    '键盘导航不能省：上下键移动、回车确认、Esc 关闭，否则命令面板就只是个搜索框',
    '打开时立刻把焦点放进输入框，关闭后要把焦点还给触发它的按钮，不然键盘用户会迷路',
    '结果列表要限制条数（8–12 条）并高亮当前项，用 aria-activedescendant 或 aria-selected 标出来',
    '⌘K / Ctrl+K 要自己监听 keydown（preventDefault，别让浏览器抢走），忘记绑定就会出现「快捷键没反应」',
    '浮层要用 z-index 与位置锚定拿住层级，别让页面里的 sticky 元素盖在上面',
    'prefers-reduced-motion 下关掉进出场缩放，只做透明度切换',
  ],
  keywords: [
    'command palette',
    'command menu',
    'role="listbox"',
    'aria-activedescendant',
    'meta+k',
    'fuzzy filter',
    'focus trap',
    'z-index overlay',
  ],
  spec: [
    { label: '快捷键', value: '⌘K（macOS）/ Ctrl+K（Windows、Linux），同时支持 /' },
    { label: '结果条数', value: '8–12 条，超出就滚动而不是全塞' },
    { label: '过滤', value: '按输入实时过滤，空格分词做模糊匹配' },
    { label: '键盘', value: '↑↓ 移动、Enter 确认、Esc 关闭、Tab 不离开面板' },
    { label: '进出场', value: '120–200ms，缩放到 0.96 → 1 加透明度' },
  ],
  reducedMotion: 'prefers-reduced-motion 下不要做缩放与位移，只保留 100ms 以内的透明度切换。',
  refs: [
    { label: 'MDN · role="listbox"', url: 'https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Roles/listbox_role' },
    { label: 'MDN · aria-activedescendant', url: 'https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Attributes/aria-activedescendant' },
  ],
  related: ['accordion', 'toast'],
  scenes: ['nav', 'page', 'form'],
  feel: ['crisp', 'calm'],
  intent: ['affordance', 'hierarchy'],
  tags: ['js', 'stateful', 'layout-triggering', 'keyboard-operable', 'stable'],
  demo: { shape: 'interactive', minHeight: 320, thumb: 'still' },
  controls: [
    { kind: 'range', id: 'results', label: '最多显示条数', min: 3, max: 12, step: 1, def: 6 },
    { kind: 'toggle', id: 'withShortcut', label: '显示快捷键', def: true },
    { kind: 'toggle', id: 'fuzzy', label: '模糊过滤', def: true },
  ],
  prompt: (values: ControlValues) => {
    const results = Number(values.results)
    const withShortcut = values.withShortcut !== false
    const fuzzy = values.fuzzy !== false
    return {
      zh: `做一个命令面板（command palette）：${withShortcut ? '按 ⌘K / Ctrl+K（同时支持 /）' : '按快捷键'}打开浮层搜索框，输入时${fuzzy ? '做模糊过滤' : '做前缀过滤'}，最多显示 ${results} 条，上下键移动高亮、回车确认并执行、Esc 关闭，打开时焦点进输入框、关闭后还给触发按钮；当前项用 aria-selected 或 aria-activedescendant 标出，进出场 150ms 缩放加淡入；prefers-reduced-motion 下只做透明度切换。`,
      en: `command palette overlay, ${withShortcut ? 'meta+k / ctrl+k plus / shortcut, ' : ''}${fuzzy ? 'live fuzzy filter' : 'prefix filter'} over commands, top ${results} results, arrow keys move the highlight, Enter runs the command, Escape closes, focus moves into the input on open and back to the trigger on close, aria-selected / aria-activedescendant on the active row, 150ms scale and fade in and out, opacity only under prefers-reduced-motion`,
    }
  },
  loop: 'manual',
  en: {
    oneLiner: 'One shortcut opens a search box where a few keystrokes reach any command.',
    whenToUse: [
      'Dense tools, editors and dashboards whose features no longer fit in a sidebar',
      'Power users who should reach anything without leaving the keyboard (meta+K / ctrl+K)',
      'Products that want commands and navigation behind a single entry point',
    ],
    confusions: [
      {
        with: 'search box',
        diff: 'A search box sits in the layout and searches content. A palette is an overlay that searches actions and places, runs the highlighted row immediately and prints the shortcut at the end of each row.',
      },
      {
        with: 'select dropdown',
        diff: 'A select picks from a fixed short list. A palette filters its rows live, and full keyboard navigation (arrows, Enter, Escape) is the point rather than an extra.',
      },
    ],
    pitfalls: [
      'Keyboard navigation is not optional: arrows to move, Enter to confirm, Escape to close, otherwise it is just a search box',
      'Move focus into the input when it opens and back to the trigger when it closes, or keyboard users get lost',
      'Cap the result list at 8–12 rows and mark the active one with aria-selected or aria-activedescendant',
      'Bind meta+K / ctrl+K yourself with preventDefault, or the shortcut silently does nothing',
      'Give the overlay enough z-index so sticky page elements do not cover it',
      'Drop the scale and offset under prefers-reduced-motion and keep an opacity fade',
    ],
    spec: [
      { label: 'Shortcut' },
      { label: 'Result count' },
      { label: 'Filter' },
      { label: 'Keyboard' },
      { label: 'Enter and exit' },
    ],
    reducedMotion: 'Under prefers-reduced-motion skip the scale and offset, keeping an opacity fade under 100ms.',
    controls: [{ label: 'Max results' }, { label: 'Show the shortcut' }, { label: 'Fuzzy filter' }],
  },
}

export default entry
