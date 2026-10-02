import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'accordion',
  code: 'L-06',
  nameZh: '折叠面板',
  nameEn: 'Accordion',
  aliases: ['手风琴', '展开收起', '折叠展开', 'collapsible panel', 'collapse', 'disclosure'],
  category: 'layout',
  oneLiner: '点标题展开内容，同一组里通常只开一个，标题一直在。',
  whenToUse: [
    'FAQ、帮助文档，一屏要放十几条问题',
    '表单里的高级设置，默认收起，需要的人再展开',
    '移动端详情页，把长说明折起来省空间',
  ],
  confusions: [
    {
      with: '选项卡 tabs',
      diff: 'tabs 是对内容做横向切换，切走的那块完全消失；手风琴所有标题始终纵向排在一起，展开的内容还在标题下面，只是把下面的内容推下去。',
    },
    {
      with: '弹层 popover',
      diff: '弹层浮在页面上方、会遮住别的内容；手风琴在文档流里撑开，不做遮挡。',
    },
  ],
  pitfalls: [
    '不要对 height: auto 做过渡，浏览器不会对 auto 补间动画；改用 grid-template-rows: 0fr → 1fr，或先量出内容高度再写像素值',
    '折叠部分要包一层 overflow: hidden，否则收起来时文字还露在外面',
    '标题要用真正的 button（或 details/summary），并带上 aria-expanded，键盘和读屏才用得了',
    '一旦允许多项同时展开，面板就成了长列表，这种场景该换 tabs 或分页',
  ],
  keywords: ['accordion', 'collapsible', 'aria-expanded', 'details/summary', 'grid-template-rows: 0fr', 'disclosure pattern'],
  spec: [
    { label: '展开时长', value: '200–300ms' },
    { label: '缓动', value: 'ease-out / cubic-bezier(0.22, 1, 0.36, 1)' },
    { label: '标题高度', value: '40–48px' },
    { label: '展开动画', value: 'grid-template-rows: 0fr → 1fr（配内层 overflow: hidden）' },
    { label: '图标', value: '同一枚箭头旋转 180°' },
  ],
  reducedMotion:
    'prefers-reduced-motion: reduce 时把展开时长设为 0，内容直接显隐，箭头也不旋转。',
  refs: [
    { label: 'MDN · details 元素', url: 'https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/details' },
    { label: 'MDN · aria-expanded', url: 'https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Attributes/aria-expanded' },
  ],
  related: ['scroll-reveal', 'stagger', 'easing'],
  scenes: ['form', 'page', 'list'],
  feel: ['calm', 'crisp'],
  intent: ['affordance', 'hierarchy'],
  controls: [
    {
      kind: 'select',
      id: 'mode',
      label: '展开模式',
      def: 'single',
      options: [
        { value: 'single', label: '单开（同时只展开一项）' },
        { value: 'multi', label: '多开（可同时展开）' },
      ],
    },
    { kind: 'range', id: 'duration', label: '展开时长', min: 120, max: 600, step: 20, def: 260, unit: 'ms' },
    {
      kind: 'select',
      id: 'easing',
      label: '缓动',
      def: 'cubic-bezier(0.22, 1, 0.36, 1)',
      options: [
        { value: 'ease-out', label: 'ease-out' },
        { value: 'ease-in-out', label: 'ease-in-out' },
        { value: 'cubic-bezier(0.22, 1, 0.36, 1)', label: 'ease-out-expo（推荐）' },
      ],
    },
    { kind: 'toggle', id: 'rotate', label: '箭头旋转 180°', def: true },
  ],
  prompt: (values: ControlValues) => {
    const mode = String(values.mode)
    const duration = Number(values.duration)
    const easing = String(values.easing)
    const rotate = Boolean(values.rotate)
    return {
      zh: `做一个折叠面板（accordion）：${mode === 'single' ? '同一组里同时只展开一项（单开手风琴）' : '允许多项同时展开'}，展开和收起时长 ${duration}ms，缓动 ${easing}；标题用真正的 <button> 并带 aria-expanded，箭头图标${rotate ? '展开时旋转 180°' : '保持不动、只做透明度变化'}。动画不要碰 height: auto（浏览器不会过渡），用 grid-template-rows: 0fr → 1fr 配一层 overflow: hidden。系统开启「减少动态效果」时时长设成 0。`,
      en: `accordion disclosure pattern, ${mode === 'single' ? 'single-open, only one panel expanded at a time' : 'multi-open, several panels expanded at once'}, expand and collapse duration ${duration}ms with easing ${easing}, header is a real button with aria-expanded and a chevron that ${rotate ? 'rotates 180deg when open' : 'stays static'}, animate grid-template-rows: 0fr → 1fr inside overflow: hidden instead of height: auto, set duration to 0 under prefers-reduced-motion`,
    }
  },
  en: {
    oneLiner: 'Clicking a heading reveals its panel, usually one at a time, and the headings never move.',
    whenToUse: [
      'FAQs and help docs with a dozen questions on one screen',
      'Advanced settings in a form, collapsed by default and opened only when needed',
      'Mobile detail pages that tuck long descriptions away to save space',
    ],
    confusions: [
      {
        with: 'tabs',
        diff: 'Tabs swap content horizontally and the panel you leave disappears. An accordion keeps every heading stacked vertically, and the open panel stays under its heading, pushing the rest down.',
      },
      {
        with: 'popover',
        diff: 'A popover floats above the page and covers other content. An accordion expands in the document flow and covers nothing.',
      },
    ],
    pitfalls: [
      'Do not transition height: auto; browsers cannot interpolate auto. Use grid-template-rows: 0fr to 1fr, or measure the content height and animate a pixel value.',
      'Wrap the collapsing part in overflow: hidden, or the text stays visible while the panel is closed',
      'The heading must be a real button (or details/summary) with aria-expanded, or keyboard and screen reader users cannot operate it',
      'Once several panels can be open at the same time the page turns into a long list, and that is a case for tabs or pagination instead',
    ],
    spec: [
      { label: 'Expand duration' },
      { label: 'Easing' },
      { label: 'Header height' },
      { label: 'Expand animation' },
      { label: 'Icon' },
    ],
    reducedMotion:
      'Under prefers-reduced-motion: reduce set the expand duration to 0, show or hide the content instantly, and skip the icon rotation.',
    controls: [
      { label: 'Open mode' },
      { label: 'Expand duration' },
      { label: 'Easing' },
      { label: 'Rotate chevron 180deg' },
    ],
  },
}

export default entry