import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'sticky-header',
  code: 'L-01',
  nameZh: '粘性头部',
  nameEn: 'Sticky Header',
  aliases: ['吸顶导航', '固定顶栏', '滚动吸顶', 'sticky nav', 'fixed header', 'hide on scroll'],
  category: 'layout',
  oneLiner: '页面滚动时头部留在顶部，常配合「下滑隐藏、上滑出现」。',
  whenToUse: [
    '长页面里希望导航和主要操作始终可用',
    '需要随时让用户看到购物车、搜索或当前章节',
    '内容很长又不想一直占着一条顶栏时，用下滑隐藏换回阅读空间',
  ],
  confusions: [
    {
      with: '固定定位 fixed',
      diff: 'position: fixed 的元素脱离文档流，需要手动给下方内容补 padding；position: sticky 仍占位，滚到阈值才吸附，父容器一结束就跟着离开。',
    },
    {
      with: '悬浮按钮',
      diff: '悬浮按钮一直在同一个位置，和滚动无关；粘性头部是「先跟着文档走，到阈值才停住」。',
    },
  ],
  pitfalls: [
    '父级任意一层有 overflow: hidden/auto，sticky 就会失效或只在那个容器里吸附',
    'sticky 元素必须有 top（或 bottom）值，否则不会吸附',
    '下滑隐藏要设阈值，刚滚一两个像素就藏起来会显得页面在抖',
    '隐藏用的是 transform: translateY(-100%)，不要用 display: none，否则没有动画',
  ],
  keywords: ['position: sticky', 'scroll direction', 'hide on scroll down', 'sticky nav', 'will-change: transform'],
  spec: [
    { label: '吸附阈值', value: '60–120px 滚动距离' },
    { label: '出现/隐藏时长', value: '200–300ms' },
    { label: '吸顶后底色', value: '半透明 + backdrop blur' },
    { label: '滚动判定', value: '比较当前与上一次 scrollY' },
  ],
  reducedMotion: '隐藏/出现的位移动画在 prefers-reduced-motion 下改为瞬间切换，或干脆常驻显示不做隐藏。',
  refs: [
    { label: 'MDN · position: sticky', url: 'https://developer.mozilla.org/docs/Web/CSS/position' },
    { label: 'MDN · scroll 事件', url: 'https://developer.mozilla.org/docs/Web/API/Document/scroll_event' },
  ],
  related: ['sticky-stack', 'frosted-glass', 'scroll-snap'],
  scenes: ['nav', 'page', 'scroll'],
  feel: ['calm', 'crisp'],
  intent: ['affordance'],
  controls: [
    { kind: 'range', id: 'threshold', label: '吸顶阈值', min: 0, max: 200, step: 10, def: 60, unit: 'px' },
    { kind: 'toggle', id: 'hide', label: '下滑时隐藏', def: true },
    { kind: 'range', id: 'blur', label: '吸顶后背景模糊', min: 0, max: 20, step: 1, def: 8, unit: 'px' },
  ],
  prompt: (values: ControlValues) => {
    const threshold = Number(values.threshold)
    const hide = Boolean(values.hide)
    const blur = Number(values.blur)
    return {
      zh: `做粘性头部（sticky header）：用 position: sticky; top: 0 吸顶，滚动超过 ${threshold}px 后给头部加半透明底色和 backdrop-filter: blur(${blur}px) 与一条下边框。${hide ? '向下滚动时用 transform: translateY(-100%) 收起头部，向上滚动立刻显示，判定用当前 scrollY 与上一次 scrollY 比较，动画 250ms ease-out。' : '头部始终可见，不做隐藏。'}`,
      en: `sticky header, position: sticky; top: 0, add backdrop-filter: blur(${blur}px) and border-bottom after ${threshold}px scroll, ${hide ? 'hide on scroll down / reveal on scroll up via transform: translateY(-100%) with 250ms ease-out, compare current vs previous scrollY' : 'always visible'}, animate transform only, throttle scroll handler with requestAnimationFrame`,
    }
  },
  loop: 'manual',
  en: {
    oneLiner: 'A page header that stays pinned on scroll and often hides on the way down.',
    whenToUse: [
      'Long pages where navigation and the primary action should stay reachable',
      'Keeping the cart, search, or the current section visible at all times',
      'Very long content where the bar yields reading space by hiding on scroll down',
    ],
    confusions: [
      {
        with: 'position: fixed',
        diff: 'A fixed element is taken out of flow, so you have to pad the content below it. sticky stays in flow, sticks only after it crosses the top offset, and leaves as soon as its containing block scrolls past.',
      },
      {
        with: 'floating action button',
        diff: 'A floating button stays in one spot no matter what the scroll is doing. A sticky header travels with the document first and only stops at the threshold.',
      },
    ],
    pitfalls: [
      'Any ancestor with overflow: hidden or auto breaks it: the header sticks inside that container instead of the viewport',
      'A sticky element needs a top (or bottom) value; without one it never sticks',
      'Set a real hide threshold; hiding after a pixel or two makes the page feel like it is twitching',
      'Hide with transform: translateY(-100%), not display: none, or there is nothing to animate',
    ],
    spec: [
      { label: 'Stick threshold' },
      { label: 'Reveal / hide duration' },
      { label: 'Background after sticking' },
      { label: 'Scroll direction test' },
    ],
    reducedMotion:
      'The hide and reveal translation should switch instantly under prefers-reduced-motion, or the header can simply stay visible all the time.',
    controls: [
      { label: 'Stick threshold' },
      { label: 'Hide on scroll down' },
      { label: 'Background blur after sticking' },
    ],
  },
}

export default entry
