import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'mask-fade',
  code: 'V-08',
  nameZh: '边缘渐隐',
  nameEn: 'Mask Fade',
  aliases: ['渐隐遮罩', '边缘淡出', '两端渐隐', 'mask fade', 'fade mask', 'gradient mask', 'edge fade'],
  category: 'visual',
  oneLiner: '内容在边缘渐渐淡掉，暗示这一头还能继续滑。',
  whenToUse: [
    '横向卡片列表、标签流的边缘，提示后面还有内容',
    '固定高度的滚动区，顶部或底部用渐隐代替一条生硬的分割线',
    '跑马灯、logo 墙的两端，让循环看不出接缝',
  ],
  confusions: [
    {
      with: 'overflow: hidden',
      diff: 'overflow 是硬切，内容到边就断；mask 是淡出，边缘逐渐透明。想暗示「还能滑」用 mask，想干脆截断用 overflow。',
    },
    {
      with: '渐变色盖层',
      diff: '盖一层同色渐变只是「看起来像」，一旦底色不是纯色（图片、渐变、深色模式）就露馅；mask 直接改内容的可见性，跟底色无关。',
    },
  ],
  pitfalls: [
    '渐隐长度要够（约容器宽度的 8–15%），太短看起来像脏边',
    '旧版 Safari 需要 -webkit-mask-image 前缀，写两份最稳',
    'mask 会让被遮住的区域真的看不见，但那部分仍然可点击、可聚焦——不要用 mask 当「隐藏」',
    'mask 与 backdrop-filter 同时用在同一个元素上，某些 Chrome 版本会渲染异常（毛玻璃会被切断）',
    '纵向滚动区做上下渐隐时，滚到顶部/底部要淡出对应的那侧，否则永远是「下面还有」的错觉',
    '两端用同一条线性渐变对称处理，别只做一边',
  ],
  keywords: [
    'mask-image',
    '-webkit-mask-image',
    'linear-gradient mask',
    'mask-composite',
    'edge fade',
    'fade mask',
    'scroll hint',
    'CSS masking',
  ],
  spec: [
    { label: '渐隐长度', value: '容器宽/高的 8–15%，或 16–32px' },
    { label: '写法', value: 'mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)' },
    { label: '兼容', value: '同时写 -webkit-mask-image' },
    { label: '注意', value: '别和 backdrop-filter 用在同一元素' },
  ],
  reducedMotion: '边缘渐隐本身是静态的，不需要降级；只有配合滚动的动态提示在 prefers-reduced-motion 下才改成静态可见。',
  refs: [
    { label: 'MDN · mask-image', url: 'https://developer.mozilla.org/docs/Web/CSS/mask-image' },
    { label: 'MDN · CSS masking', url: 'https://developer.mozilla.org/docs/Web/CSS/CSS_masking' },
  ],
  related: ['marquee', 'scroll-snap'],
  scenes: ['list', 'scroll', 'page'],
  feel: ['calm', 'crisp'],
  intent: ['affordance', 'hierarchy'],
  tags: ['css-only', 'modern-css', 'gradient', 'paint-heavy', 'stable'],
  demo: { shape: 'stage' },
  controls: [
    { kind: 'range', id: 'fade', label: '渐隐长度', min: 4, max: 30, step: 2, def: 12, unit: '%' },
    {
      kind: 'select',
      id: 'axis',
      label: '方向',
      options: [
        { value: 'x', label: '横向' },
        { value: 'y', label: '纵向' },
      ],
      def: 'x',
    },
    { kind: 'toggle', id: 'hardEdge', label: '对照：硬切（不用 mask）', def: false },
  ],
  prompt: (values: ControlValues) => {
    const fade = Number(values.fade)
    const axis = String(values.axis) === 'y' ? '纵向' : '横向'
    const hardEdge = values.hardEdge === true
    const gradient =
      axis === '横向'
        ? `linear-gradient(90deg, transparent, #000 ${fade}%, #000 ${100 - fade}%, transparent)`
        : `linear-gradient(180deg, transparent, #000 ${fade}%, #000 ${100 - fade}%, transparent)`
    return {
      zh: hardEdge
        ? '这个演示现在用的是 overflow: hidden 的硬切，把「对照：硬切」关掉就能看到 mask 的淡出效果。'
        : `给这个${axis}可滚动区域加边缘渐隐：${gradient}，同时写 -webkit-mask-image 兼容旧版 Safari，让内容在两端渐渐淡掉、暗示还能继续滑。渐隐长度占容器 ${fade}%，两端对称；注意 mask 会让被遮住的部分真的看不见（但仍然可以点击），也不要和 backdrop-filter 用在同一元素上。`,
      en: hardEdge
        ? 'This demo currently hard-clips with overflow: hidden; switch the comparison off to see the mask fade.'
        : `fade the edges of this scrollable area with mask-image: ${gradient} (plus -webkit-mask-image), so ${fade}% of each end fades out and hints that there is more to scroll, applied symmetrically on both ends, not combined with backdrop-filter on the same element`,
    }
  },
  loop: 'continuous',
  en: {
    oneLiner: 'Content fades out at the edges, hinting that there is more to scroll.',
    whenToUse: [
      'Edges of horizontal card rows and tag strips that continue offscreen',
      'Fixed-height scroll areas where a fade beats a hard divider line',
      'Both ends of a marquee or logo wall, to hide the loop seam',
    ],
    confusions: [
      {
        with: 'overflow: hidden',
        diff: 'Overflow cuts content hard at the border. A mask fades it out. Use the mask to hint at more content, overflow to end it cleanly.',
      },
      {
        with: 'gradient overlay',
        diff: 'A same-colour overlay only looks right on a flat background and gives up on images, gradients or dark mode. A mask changes visibility itself, independent of what is behind it.',
      },
    ],
    pitfalls: [
      'The fade has to be long enough (roughly 8–15% of the container), or it reads as a dirty edge',
      'Older Safari needs the -webkit-mask-image prefix, so write both',
      'A mask really hides the faded part, yet it stays clickable and focusable: never use a mask as a way to hide things',
      'Combining a mask with backdrop-filter on the same element renders badly in some Chrome versions (frosted blur gets cut)',
      'For vertical scroll areas, fade the matching side out at the top and bottom ends, or it always claims there is more below',
      'Apply the same gradient symmetrically to both ends: a one-sided fade reads as a bug',
    ],
    spec: [
      { label: 'Fade length' },
      { label: 'Recipe' },
      { label: 'Compatibility' },
      { label: 'Caution' },
    ],
    reducedMotion:
      'The fade itself is static and needs no fallback. Only a scroll-driven dynamic hint should become statically visible under prefers-reduced-motion.',
    controls: [{ label: 'Fade length' }, { label: 'Axis' }, { label: 'Compare: hard clip' }],
  },
}

export default entry
