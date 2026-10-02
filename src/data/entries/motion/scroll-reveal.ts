import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'scroll-reveal',
  code: 'M-04',
  nameZh: '滚动揭示',
  nameEn: 'Scroll Reveal',
  aliases: ['滚动出现', '滚动淡入', '进入视口出现', '滚动加载动画', 'reveal on scroll', 'fade in on scroll', 'view enter'],
  category: 'motion',
  oneLiner: '内容滚进视口时才淡入上移，没滚到的先藏着。',
  whenToUse: [
    '长落地页的分段内容，一次进来太多会显得糊成一片',
    '图文混排的营销页、案例列表，想让阅读节奏被一段段接上',
    '列表首屏之外的项目，滚到了再出现，首屏渲染更轻',
  ],
  confusions: [
    {
      with: '滚动驱动动画 scroll-driven',
      diff: '滚动揭示是「进入视口触发一次」——元素自己动，触发后就把自己从观察列表里摘掉；滚动驱动动画是每一帧的进度都绑定滚动位置，往回滚还会倒着播。',
    },
    {
      with: '懒加载 lazy loading',
      diff: '懒加载省的是网络和图片解码，元素位置早就占好了；滚动揭示动的是 opacity 和 transform，内容本来就在页面里，只是先看不见。',
    },
  ],
  pitfalls: [
    '触发一次之后要 unobserve 或断开观察器，否则来回滚动会反复淡入淡出',
    'IntersectionObserver 的 threshold 写成 1，短视口里的长元素永远达不到，永远不出现',
    '在滚动事件里直接读 scrollTop 会让布局反复重算，用 IntersectionObserver 或 requestAnimationFrame 节流',
    '元素先设成 opacity: 0 时确认内容仍在 DOM 里，别让禁用脚本或爬虫拿到一个空页面',
  ],
  keywords: [
    'IntersectionObserver',
    'threshold',
    'rootMargin',
    'reveal on scroll',
    'fade in on scroll',
    'unobserve',
    'translateY + opacity',
  ],
  spec: [
    { label: '位移距离', value: '12–32px，再大就像东西从下面掉出来' },
    { label: '淡入时长', value: '400–700ms' },
    { label: '缓动', value: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    { label: '触发阈值', value: '元素露出 15%–25%' },
  ],
  reducedMotion:
    'prefers-reduced-motion: reduce 时不要观察也不要位移，内容直接以最终状态渲染（本 demo 走的就是这条路径）。',
  refs: [
    { label: 'MDN · IntersectionObserver', url: 'https://developer.mozilla.org/docs/Web/API/IntersectionObserver' },
    { label: 'MDN · IntersectionObserverEntry', url: 'https://developer.mozilla.org/docs/Web/API/IntersectionObserverEntry' },
  ],
  related: ['scroll-driven', 'stagger', 'parallax'],
  scenes: ['scroll', 'page', 'list'],
  feel: ['calm', 'soft'],
  intent: ['attention', 'hierarchy'],
  controls: [
    { kind: 'range', id: 'distance', label: '上移距离', min: 0, max: 64, step: 2, def: 24, unit: 'px' },
    { kind: 'range', id: 'duration', label: '淡入时长', min: 150, max: 1200, step: 50, def: 550, unit: 'ms' },
    {
      kind: 'range',
      id: 'threshold',
      label: '触发阈值',
      min: 0,
      max: 90,
      step: 5,
      def: 20,
      unit: '%',
      hint: '指元素露出多少比例才触发；拖到 90 会很难触发',
    },
    { kind: 'range', id: 'delay', label: '项间隔', min: 0, max: 200, step: 10, def: 60, unit: 'ms' },
  ],
  prompt: (values: ControlValues) => {
    const distance = Number(values.distance)
    const duration = Number(values.duration)
    const threshold = Number(values.threshold) / 100
    const delay = Number(values.delay)
    return {
      zh: `给这些内容块加滚动揭示（reveal on scroll）：用 IntersectionObserver 监听，threshold ${threshold}，元素露出后播放 opacity 0 → 1、translateY(${distance}px) → 0 的过渡，时长 ${duration}ms、cubic-bezier(0.22, 1, 0.36, 1)，相邻块错开 ${delay}ms，播完立刻 unobserve。只动 transform 和 opacity。prefers-reduced-motion 下不要观察，内容直接显示。`,
      en: `reveal on scroll, IntersectionObserver with threshold ${threshold}, add class when isIntersecting, transition: opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1), transform translateY(${distance}px) to 0, stagger ${delay}ms, unobserve after first intersection, opacity + transform only, respect prefers-reduced-motion`,
    }
  },
  loop: 'manual',
  en: {
    oneLiner: 'Content fades in and slides up only once it scrolls into view; off-screen items stay hidden.',
    whenToUse: [
      'Sections of a long landing page, where arriving all at once reads as one blur',
      'Marketing pages and case-study lists where the reading rhythm should be picked up section by section',
      'List items below the first screen, which appear only when scrolled to, keeping the first paint lighter',
    ],
    confusions: [
      {
        with: 'scroll-driven animation',
        diff: 'A reveal fires once as the element enters the viewport, runs its own animation, then leaves the observer. A scroll-driven animation maps every frame of progress to the scroll position, so scrolling back plays it in reverse.',
      },
      {
        with: 'lazy loading',
        diff: 'Lazy loading saves network and image decoding, and the element already occupies its space. Scroll reveal animates opacity and transform on content that is already in the page, just hidden at first.',
      },
    ],
    pitfalls: [
      'unobserve or disconnect after the first trigger, or scrolling up and down replays the fade',
      'A threshold of 1 never fires for a tall element in a short viewport, so it stays invisible forever',
      'Reading scrollTop inside a scroll handler forces repeated layout; use IntersectionObserver, or throttle with requestAnimationFrame',
      'If you start elements at opacity: 0, keep the content in the DOM so a blocked script or a crawler does not get an empty page',
    ],
    spec: [
      { label: 'Travel distance' },
      { label: 'Fade duration' },
      { label: 'Easing' },
      { label: 'Trigger threshold' },
    ],
    reducedMotion:
      'Under prefers-reduced-motion: reduce, do not observe and do not translate - render the content in its final state (this demo takes that path).',
    controls: [
      { label: 'Rise distance' },
      { label: 'Fade duration' },
      { label: 'Trigger threshold', hint: 'How much of the element must be visible; at 90 it will rarely fire' },
      { label: 'Item interval' },
    ],
  },
}

export default entry
