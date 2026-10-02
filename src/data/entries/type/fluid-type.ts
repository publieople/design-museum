import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'fluid-type',
  code: 'T-01',
  nameZh: '流体排版',
  nameEn: 'Fluid Type',
  aliases: ['流式字号', '自适应字号', '弹性排版', 'fluid typography', 'fluid type scale', 'responsive font-size'],
  category: 'type',
  oneLiner: '字号随容器宽度连续变化，不会在断点上突然跳一档。',
  whenToUse: [
    '大标题在小屏和大屏之间跨度很大，用媒体查询会看到字号一级一级地跳',
    '想让标题、间距、圆角共用一个比例，跟着屏幕一起放大缩小',
    '需要给字号设上下限，避免手机上一行放不下、超宽屏上又大得荒唐',
  ],
  confusions: [
    {
      with: '媒体查询断点',
      diff: '断点是「到某个宽度就换一套值」，两个断点之间字号是平的，跨过临界点会突然跳一下；流体排版把中间值写成带 vw 或 cqw 的 calc()，宽度一变字号就跟着连续变。',
    },
    {
      with: 'rem 固定字号',
      diff: 'rem 只跟根元素字号走，和屏幕宽度无关；rem 仍然要用，但想让文字跟着屏幕流起来，必须把 rem 和 vw 或 cqw 混进同一个 clamp() 里。',
    },
  ],
  pitfalls: [
    '纯 vw 字号不跟浏览器的默认字号设置走：用户在浏览器里调大文字，vw 那一段不会跟着变大，而无障碍要求文字能放大到 200%。中间值要掺 rem，写成 clamp(1rem, 1rem + 2vw, 2.5rem)。',
    'vw 是视口宽度，不是父容器宽度。把流体标题放进窄卡片时会算出偏大的字号，这种场景要改用容器查询单位 cqw，并给父级加 container-type: inline-size。',
    'min 写成比 max 还大时 clamp() 不会报错，会直接取 min，页面上看起来完全没变化。',
    '只流 font-size 不管 line-height，大标题会挤在一起或者行与行散开；行高要用无单位倍数，或者跟着一起 clamp。',
  ],
  keywords: ['clamp()', 'vw', 'cqw', 'calc()', 'fluid typography', 'responsive font-size', 'container query units'],
  spec: [
    { label: '字号公式', value: 'clamp(1rem, 0.75rem + 1.2vw, 2.5rem)' },
    { label: '正文字号下限', value: '16px（不要低于 14px）' },
    { label: '字号标度比', value: '1.125–1.333' },
    { label: '行高', value: '标题 1.1–1.2，正文 1.5–1.6（无单位）' },
  ],
  reducedMotion: '流体排版是静态排版，和 prefers-reduced-motion 无关。如果有人把它做成随滚动缩放字号，用户开启减少动态效果时应停在基准字号。',
  refs: [
    { label: 'MDN · clamp()', url: 'https://developer.mozilla.org/docs/Web/CSS/clamp' },
    { label: 'MDN · length（vw / cqw 等单位）', url: 'https://developer.mozilla.org/docs/Web/CSS/length' },
  ],
  related: ['variable-font', 'text-balance', 'char-reveal'],
  scenes: ['text', 'page', 'card'],
  feel: ['calm', 'crisp'],
  intent: ['hierarchy'],
  controls: [
    { kind: 'range', id: 'minSize', label: '最小字号', min: 12, max: 32, step: 1, def: 16, unit: 'px', hint: '窄容器下也不会小于这个值' },
    { kind: 'range', id: 'maxSize', label: '最大字号', min: 32, max: 80, step: 2, def: 44, unit: 'px', hint: '字号涨到这个值就不再变大' },
    { kind: 'range', id: 'growth', label: '增长速率', min: 0, max: 8, step: 0.5, def: 3, unit: 'cqw', hint: '每 1cqw 加多少字号，调到 0 就是固定字号' },
    { kind: 'range', id: 'boxWidth', label: '容器宽度', min: 45, max: 100, step: 1, def: 100, unit: '%', hint: '拖动看字号连续变化，不会在某个宽度跳一下' },
  ],
  prompt: (values: ControlValues) => {
    const minSize = Number(values.minSize)
    const maxSize = Number(values.maxSize)
    const growth = Number(values.growth)
    const formula = 'clamp(' + minSize + 'px, calc(' + minSize + 'px + ' + growth + 'cqw), ' + maxSize + 'px)'
    return {
      zh: '做一个流体排版（fluid type）的标题，font-size 写成 ' + formula + '，随容器宽度连续变化，不要用媒体查询断点。父容器加 container-type: inline-size，让 cqw 跟卡片宽度而不是视口走。行高用无单位倍数，保证字放大后不挤。',
      en: 'fluid type scale, font-size: ' + formula + ', container-type: inline-size, cqw container query units, no media query breakpoints, unitless line-height, responsive typography',
    }
  },
  en: {
    oneLiner: 'Font size scales continuously with the container width, so it never jumps a step at a breakpoint.',
    whenToUse: [
      'A headline has to span a wide range between small and large screens, and media queries would step it up in visible jumps',
      'You want headings, spacing, and radii to share one ratio and grow and shrink together with the screen',
      'You need a floor and a ceiling on the size so it neither overflows a phone line nor looks absurd on an ultrawide display',
    ],
    confusions: [
      {
        with: 'media query breakpoints',
        diff: 'A breakpoint swaps in a whole new set of values: the size is flat in between and jumps at the threshold. Fluid type writes the middle value as a calc() with vw or cqw, so the size moves continuously as the width changes.',
      },
      {
        with: 'fixed rem sizes',
        diff: 'rem tracks the root font size only and has no relation to the screen width. Keep using rem, but to make text flow with the screen you have to mix rem and vw or cqw into the same clamp().',
      },
    ],
    pitfalls: [
      'A pure vw size ignores the browser default font size: when a user raises the base text size, the vw part stays put, while WCAG asks text to scale to 200%. Mix rem into the middle value: clamp(1rem, 1rem + 2vw, 2.5rem).',
      'vw is viewport width, not the parent width. A fluid headline dropped into a narrow card computes too large; switch that case to container query units (cqw) and give the parent container-type: inline-size.',
      'If the min in clamp() ends up larger than the max, nothing warns you: clamp() returns the min and the page looks completely unchanged.',
      'Scaling font-size without touching line-height leaves big headings crammed or spread apart. Use a unitless line-height, or clamp it alongside the size.',
    ],
    spec: [
      { label: 'Font size formula' },
      { label: 'Minimum body size' },
      { label: 'Type scale ratio' },
      { label: 'Line height' },
    ],
    reducedMotion:
      'Fluid type is static typography and has nothing to do with prefers-reduced-motion. If someone makes the size scale with scroll, users who asked for reduced motion should land on the base size.',
    controls: [
      { label: 'Minimum size', hint: 'Never goes below this even in a narrow container' },
      { label: 'Maximum size', hint: 'The size stops growing once it reaches this' },
      { label: 'Growth rate', hint: 'Font size added per 1cqw; at 0 it is a fixed size' },
      { label: 'Container width', hint: 'Drag to watch the size change continuously instead of jumping at some width' },
    ],
  },
}

export default entry
