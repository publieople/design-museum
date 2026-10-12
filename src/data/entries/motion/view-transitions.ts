import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'view-transitions',
  code: 'M-07',
  nameZh: '视图过渡',
  nameEn: 'View Transitions',
  aliases: ['页面转场', '跨页面过渡', '共享元素过渡', 'view transition', 'view-transition', 'page transition'],
  category: 'motion',
  oneLiner: '页面切换时，浏览器把新旧两屏接起来，补出中间那一下过渡。',
  whenToUse: [
    '列表点进详情：被点的那张卡片原地放大成详情页的头图',
    '同一个应用里换标签页或换主题，希望两屏连起来而不是硬切',
    '导航栏在多个页面里都一样，想让人看出它是同一个元素',
  ],
  confusions: [
    {
      with: 'CSS transition',
      diff: 'CSS transition 只能让同一个元素自己变；视图过渡是浏览器给整屏拍新旧两张快照再做动画，所以能把旧界面里的某个元素平滑接到新界面的对应元素上。',
    },
    {
      with: '入场动画',
      diff: '入场动画是新页面自己在播，旧界面已经消失；视图过渡的动画发生在两屏之间，旧屏要一起参与，所以改 DOM 的那一步必须放进 startViewTransition 的回调里。',
    },
  ],
  pitfalls: [
    '同一时刻 view-transition-name 必须唯一：列表里给每张卡片都写死一个名字会直接报错，要在点击时只给被点的那张临时加上',
    '改 DOM 的代码必须在 document.startViewTransition(() => …) 的回调里执行，写在回调外面拍到的还是旧界面',
    '过渡期间会有一层伪元素盖在页面上，指针事件被短暂挡住，别在过渡里做点击判断',
    '不支持这个 API 的浏览器要有兜底：直接切换即可，不要留一屏空白等过渡',
    '跨文档（多页应用）要写 @view-transition { navigation: auto }，而且必须同源',
  ],
  keywords: [
    'View Transition API',
    'document.startViewTransition',
    'view-transition-name',
    '::view-transition-old',
    '::view-transition-new',
    'shared element transition',
    'cross-document view transition',
  ],
  spec: [
    { label: '时长', value: '200–400ms' },
    { label: '缓动', value: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    { label: '共享元素命名', value: 'view-transition-name: card-3（同一时刻唯一）' },
    { label: '降级', value: '不支持时瞬间切换，不留空白' },
  ],
  reducedMotion: 'prefers-reduced-motion 下不要调用 startViewTransition（或把 ::view-transition-group 的 animation-duration 设成 0），页面瞬间切换，功能完全一样。',
  refs: [
    { label: 'MDN · View Transition API', url: 'https://developer.mozilla.org/docs/Web/API/View_Transitions_API' },
    {
      label: 'Chrome Developers · View Transitions',
      url: 'https://developer.chrome.com/docs/web-platform/view-transitions',
    },
  ],
  related: ['stagger', 'sticky-header'],
  scenes: ['page', 'card', 'nav'],
  feel: ['crisp', 'calm'],
  intent: ['hierarchy', 'attention'],
  tags: ['browser-api', 'js', 'composited', 'motion-heavy', 'check-support'],
  demo: { shape: 'page', minHeight: 320, thumb: 'still' },
  controls: [
    { kind: 'range', id: 'duration', label: '过渡时长', min: 120, max: 800, step: 20, def: 300, unit: 'ms' },
    {
      kind: 'select',
      id: 'easing',
      label: '缓动',
      options: [
        { value: 'cubic-bezier(0.22, 1, 0.36, 1)', label: '减速到位' },
        { value: 'ease-in-out', label: '两端缓' },
        { value: 'linear', label: '匀速' },
      ],
      def: 'cubic-bezier(0.22, 1, 0.36, 1)',
    },
    { kind: 'toggle', id: 'shared', label: '共享元素过渡', def: true },
  ],
  prompt: (values: ControlValues) => {
    const duration = Number(values.duration)
    const easing = String(values.easing)
    const shared = values.shared !== false
    return {
      zh: `做一个视图过渡（view transition）：点击列表卡片时用 document.startViewTransition 包住 DOM 更新，${shared ? '给被点的那张卡片加 view-transition-name，让它在详情页放大成头图' : '只做整屏交叉淡入，不做共享元素'}，过渡 ${duration}ms、缓动 ${easing}。同一时刻 view-transition-name 只能有一个；不支持这个 API 的浏览器直接切换，不要留空白。`,
      en: `view transition, document.startViewTransition wrapping the DOM update, ${shared ? 'view-transition-name on the shared element so it morphs into the detail header, ' : 'cross-fade only, no shared element, '}::view-transition-old / ::view-transition-new pseudo elements, ${duration}ms ${easing}, instant fallback when unsupported`,
    }
  },
  loop: 'manual',
  en: {
    oneLiner: 'When the view changes, the browser stitches the old and new screens together and animates the gap between them.',
    whenToUse: [
      'A list opens into a detail view: the card you tapped grows into the detail header',
      'Switching tabs or themes inside one app, where the two screens should connect instead of cutting',
      'A nav bar that stays the same across pages and should read as the same element',
    ],
    confusions: [
      {
        with: 'CSS transition',
        diff: 'A CSS transition only animates the element itself. A view transition snapshots both the old and the new screen, so an element in the old view can land on its counterpart in the new one.',
      },
      {
        with: 'entrance animation',
        diff: 'An entrance animation plays on the new page after the old one is gone. A view transition animates between the two screens, so the DOM update has to happen inside the startViewTransition callback.',
      },
    ],
    pitfalls: [
      'view-transition-name must be unique at any moment: giving every card in a list a fixed name throws an error, so set it only on the card you tapped',
      'The DOM update has to run inside document.startViewTransition(() => ...), otherwise the snapshot catches the old view',
      'During the transition a pseudo element covers the page and briefly swallows pointer events, so do not handle clicks there',
      'Browsers without the API need a fallback: switch instantly instead of leaving a blank screen',
      'Cross-document (multi-page) transitions need @view-transition { navigation: auto } and same-origin pages',
    ],
    spec: [{ label: 'Duration' }, { label: 'Easing' }, { label: 'Shared element name' }, { label: 'Fallback' }],
    reducedMotion:
      'Under prefers-reduced-motion do not call startViewTransition (or set the ::view-transition-group animation-duration to 0): the view switches instantly and everything still works.',
    controls: [{ label: 'Transition duration' }, { label: 'Easing' }, { label: 'Shared element transition' }],
  },
}

export default entry
