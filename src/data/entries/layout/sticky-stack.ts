import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'sticky-stack',
  code: 'L-02',
  nameZh: '粘性堆叠卡片',
  nameEn: 'Sticky Stacking Cards',
  aliases: ['卡片堆叠', '叠卡片', '滚动叠卡', 'sticky stacking cards', 'stacking cards', 'card stack on scroll'],
  category: 'layout',
  oneLiner: '滚动时后面的卡片一张张压上来，前一张缩小留在底下。',
  whenToUse: [
    '教程、步骤、结账流程：一张卡讲一件事，滚完一张再翻下一张',
    '长页面里想做出「一摞卡片」的实感，而不是一条平铺的列表',
    '卡片需要依次进入视野，同时把上一张留在原位当上下文',
  ],
  confusions: [
    {
      with: '粘性头部',
      diff: '粘性头部只有一条栏吸附在顶部；粘性堆叠是一叠卡片共用同一个吸附位置，后滚上来的那张盖住先来的那张。',
    },
    {
      with: '轮播 carousel',
      diff: '轮播会自己定时切页、靠左右方向推进；粘性堆叠完全由页面上下滚动驱动，不动手就不换。',
    },
    {
      with: '视差 parallax',
      diff: '视差是各层以不同速度移动，元素之间并不会停住；堆叠卡片会真的吸附在固定位置并互相覆盖。',
    },
  ],
  pitfalls: [
    '每张卡片都要有各自的 top（第 i 张用 i × 露头高度），全给 0 就变成严丝合缝的一摞，看不出层数',
    '后面的卡片 z-index 必须比前面的高，否则新卡片会被旧卡片盖住',
    '滚动容器自己可以有 overflow: auto，但它的任意一层祖先带了 overflow: hidden，sticky 就失效',
    '用 transform: scale() 压小已堆叠的卡片时，缩放原点设 top center，否则底部会露出下一张的边',
    '卡片总高度要明显超过滚动容器，内容不够长就没有可滚的余量，堆叠也演不出来',
  ],
  keywords: ['position: sticky', 'stacking cards', 'z-index', 'transform: scale()', 'sticky offset', 'scroll container'],
  spec: [
    { label: '每张露头高度', value: '12–24px' },
    { label: '已堆叠卡片缩到', value: '92%–97%' },
    { label: '卡片圆角', value: '12–16px' },
    { label: '卡片间距', value: '8–12px' },
    { label: 'z-index', value: '按索引递增 1、2、3…' },
  ],
  reducedMotion:
    '堆叠由滚动位置驱动，不是时间动画，可以保留；压在后面的缩放属于装饰，prefers-reduced-motion: reduce 时去掉缩放，只留吸附堆叠。',
  refs: [
    { label: 'MDN · position（sticky 定位）', url: 'https://developer.mozilla.org/docs/Web/CSS/position' },
    { label: 'MDN · CSS 滚动驱动动画', url: 'https://developer.mozilla.org/docs/Web/CSS/CSS_scroll-driven_animations' },
  ],
  related: ['sticky-header', 'scroll-driven', 'parallax'],
  scenes: ['scroll', 'page', 'card'],
  feel: ['calm', 'crisp'],
  intent: ['hierarchy', 'attention'],
  controls: [
    {
      kind: 'range',
      id: 'offset',
      label: '露头高度',
      min: 0,
      max: 44,
      step: 2,
      def: 14,
      unit: 'px',
      hint: '每张比上一张多留出来的那一条，调到 0 就完全重合',
    },
    { kind: 'range', id: 'count', label: '卡片数量', min: 3, max: 6, step: 1, def: 4, unit: '张' },
    {
      kind: 'range',
      id: 'shrink',
      label: '后层缩到',
      min: 0,
      max: 12,
      step: 1,
      def: 5,
      unit: '%',
      hint: '被压在后面的卡片缩小多少，调到 0 就完全不缩',
    },
    { kind: 'range', id: 'radius', label: '圆角', min: 0, max: 24, step: 1, def: 14, unit: 'px' },
  ],
  prompt: (values: ControlValues) => {
    const offset = Number(values.offset)
    const count = Number(values.count)
    const shrink = Number(values.shrink)
    const radius = Number(values.radius)
    return {
      zh: `做一组滚动堆叠卡片（sticky stacking cards）：共 ${count} 张，每张用 position: sticky，top 依次是「索引 × ${offset}px」，后面的卡片 z-index 更高、滚上来时盖住前一张；被压住的卡片用 transform: scale() 缩到 ${100 - shrink}%，transform-origin 设 top center，圆角 ${radius}px。整组放在一个 overflow-y: auto 的容器里，容器外面的祖先不要加 overflow: hidden。系统开启「减少动态效果」时取消缩放。`,
      en: `sticky stacking cards, position: sticky with top: index * ${offset}px, ${count} cards, increasing z-index 1 2 3, previous card scales down to ${100 - shrink}% via transform: scale() with transform-origin: top center, border-radius: ${radius}px, inside an overflow-y: auto scroll container, no overflow: hidden on ancestors, disable the scale under prefers-reduced-motion`,
    }
  },
}

export default entry