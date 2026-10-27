import type { ControlValues, Entry } from '../../types'

/**
 * 滚动进度条（scroll progress bar）：阅读类页面顶部那条细线。
 * 和 scroll-driven 的区别：这条是「一个 UI 部件」，把滚动位置压成 0–100%；
 * scroll-driven 是「把任意属性绑到滚动上的时间线机制」，进度条只是它最常见的用途。
 */
const entry: Entry = {
  slug: 'scroll-progress',
  code: 'M-09',
  nameZh: '滚动进度条',
  nameEn: 'Scroll Progress Bar',
  aliases: ['阅读进度条', '滚动进度', '进度条', '阅读条', 'scroll progress', 'scroll progress bar', 'reading progress', 'reading progress bar'],
  category: 'motion',
  oneLiner: '页面顶部一条细线，跟着阅读进度走，告诉读者还剩多少。',
  whenToUse: [
    '长文、文档、教程：读者随时知道读了多远、还剩多少',
    '单页长落地页：把进度条当成章节指示器',
    '分步表单或长列表：让「滚到底才出现」的动作有预期',
  ],
  confusions: [
    {
      with: '滚动驱动动画 scroll-driven',
      diff: '进度条只是把滚动位置压成 0–100% 的一条指示物；滚动驱动动画是把任意属性（旋转、透明度、颜色）绑到滚动上的时间线机制。进度条可以用 scroll-driven 实现，但前者是 UI 部件，后者是机制，不能互相替代。',
    },
    {
      with: '浏览器自带的滚动条',
      diff: '原生滚动条贴着滚动容器、每个系统长得不一样，还会随滚动消失；进度条固定在视口顶部、只有几像素高、全站统一，是设计选择而不是系统 UI。',
    },
  ],
  pitfalls: [
    '用 width 改进度：每帧都要重排。用 transform: scaleX() 配 transform-origin: left，走合成层',
    '把进度条放在滚动容器外面却写 animation-timeline: scroll()：时间线取的是元素自己的滚动祖先，取不到就不动，得放在容器内或显式指定 target',
    '固定在顶部却不给正文留等价 padding：第一行标题永远被压住',
    '让读屏软件读进度条：它每秒变化几十次，是噪音；进度条一般 aria-hidden，需要的话另给一条静态的「已读 60%」文本',
  ],
  keywords: [
    'scroll progress',
    'reading progress',
    'animation-timeline: scroll()',
    'transform: scaleX()',
    'document.scrollingElement',
    'requestAnimationFrame',
    'progress indicator',
  ],
  spec: [
    { label: '高度', value: '桌面 2–4px，移动端 3–6px' },
    { label: '颜色', value: '强调色实心条 + 当前文字色 8–12% 的底槽' },
    { label: '实现', value: 'transform: scaleX(0 → 1) + transform-origin: left' },
    { label: '时间线', value: 'animation-timeline: scroll(root block)；不支持时 rAF 读 scrollTop' },
  ],
  reducedMotion:
    '进度条是指示物，可以保留；去掉平滑追赶（不要用 0.2s 过渡逐帧追随），在 prefers-reduced-motion: reduce 下直接把滚动位置映射成 scaleX，不做额外动画。',
  refs: [
    { label: 'MDN · animation-timeline', url: 'https://developer.mozilla.org/docs/Web/CSS/animation-timeline' },
    { label: 'Chrome for Developers · 滚动驱动动画', url: 'https://developer.chrome.com/docs/css-ui/scroll-driven-animations' },
  ],
  related: ['scroll-driven', 'scroll-reveal', 'sticky-header'],
  scenes: ['page', 'scroll', 'text'],
  feel: ['calm', 'crisp'],
  intent: ['hierarchy', 'attention'],
  tags: ['modern-css', 'js', 'composited', 'check-support'],
  demo: { shape: 'scroll', thumb: 'still' },
  controls: [
    { kind: 'range', id: 'height', label: '进度条粗细', min: 1, max: 10, step: 1, def: 3, unit: 'px' },
    { kind: 'toggle', id: 'track', label: '显示底槽', def: true },
    {
      kind: 'select',
      id: 'mode',
      label: '实现方式',
      options: [
        { value: 'auto', label: '自动（CSS + 兜底）' },
        { value: 'css', label: 'CSS 时间线' },
        { value: 'js', label: 'JS 兜底' },
      ],
      def: 'auto',
    },
  ],
  prompt: (values: ControlValues) => {
    const height = Number(values.height)
    const track = values.track !== false
    const mode = String(values.mode)
    const mechanism =
      mode === 'js'
        ? '用 requestAnimationFrame 读 document.scrollingElement.scrollTop 再写 scaleX，不要在 scroll 事件里每帧读写布局'
        : mode === 'css'
          ? '用 animation-timeline: scroll(root block) 驱动，不写一行 JS'
          : '优先用 animation-timeline: scroll(root block)，CSS.supports 检测不到时退回 requestAnimationFrame 读取滚动位置'
    return {
      zh: `在页面顶部固定一条 ${height}px 高的阅读进度条，用 transform: scaleX() 从 0 到 1 跟随页面滚动（transform-origin: left），${track ? '底槽用当前文字色 10% 透明铺满' : '不要底槽，只留进度条本身'}。${mechanism}；进度条 aria-hidden，不要让读屏软件反复播报。prefers-reduced-motion 下不做平滑追赶，直接把滚动位置映射成进度。`,
      en: `scroll progress bar, fixed to the top of the page, ${height}px tall, driven by transform: scaleX() from 0 to 1 with transform-origin: left, ${track ? 'visible track at 10% currentColor' : 'no track'}. ${mode === 'js' ? 'Drive it with requestAnimationFrame reading document.scrollingElement.scrollTop, never read and write layout inside the scroll handler.' : 'Drive it with animation-timeline: scroll(root block), falling back to requestAnimationFrame when CSS.supports() says no.'} Keep it aria-hidden, and under prefers-reduced-motion map the scroll position straight to scaleX without smoothing.`,
    }
  },
  loop: 'manual',
  en: {
    oneLiner: 'A thin line at the top of the page that tracks how far the reader has got.',
    whenToUse: [
      'Long articles, docs and tutorials: the reader always knows how far in they are',
      'Single-page landing pages: the bar doubles as a chapter indicator',
      'Step forms or long lists: gives the “scroll to the end” action an expected length',
    ],
    confusions: [
      {
        with: 'scroll-driven animation',
        diff: 'A progress bar is one UI widget that compresses scroll position into 0–100%; scroll-driven animation is the timeline mechanism that binds any property (rotation, opacity, colour) to scroll. A bar can be built with the mechanism, but the widget and the mechanism are not the same thing.',
      },
      {
        with: 'the native scrollbar',
        diff: 'The native scrollbar hugs its scroll container, looks different on every platform and fades away; a progress bar is fixed to the viewport, a few pixels tall, and consistent site-wide — a design decision, not system UI.',
      },
    ],
    pitfalls: [
      'Animating width forces a layout every frame; use transform: scaleX() with transform-origin: left so it stays on the compositor',
      'Putting the bar outside the scroll container while using animation-timeline: scroll() resolves no scroll ancestor and it never moves; keep it inside or pass an explicit target',
      'Fixing it to the top without matching padding hides the first heading forever',
      'Letting a screen reader announce it: it changes dozens of times a second. Keep the bar aria-hidden and expose a static “60% read” label if needed',
    ],
    spec: [
      { label: 'Height' },
      { label: 'Colour' },
      { label: 'Implementation' },
      { label: 'Timeline' },
    ],
    reducedMotion:
      'The bar itself is an indicator, so it may stay; drop the smooth chase (no 0.2s transition per frame) and under prefers-reduced-motion: reduce map scroll position straight to scaleX with no added animation.',
    controls: [
      { label: 'Bar height' },
      { label: 'Show track' },
      { label: 'Mechanism' },
    ],
  },
}

export default entry
