import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'mesh-gradient',
  code: 'V-03',
  nameZh: '渐变网格',
  nameEn: 'Mesh Gradient',
  aliases: ['网格渐变', '弥散渐变', '多色渐变背景', 'mesh gradient', 'diffuse gradient', 'aurora background'],
  category: 'visual',
  oneLiner: '多个径向渐变叠在一起，颜色朝任意方向过渡，没有一条直线的渐变轴。',
  whenToUse: [
    '落地页 Hero 想要有颜色的纵深，又不想加载一张大图',
    '把品牌主色柔和地铺满一整块区域，做卡片或弹窗底板',
    '没有真实图片时的默认封面、头像底色，让占位也有内容',
    '需要跟着主题色换一整套配色，用 filter 转个色相就能换',
  ],
  confusions: [
    {
      with: '线性渐变 / 锥形渐变',
      diff: 'linear-gradient 只有一条渐变轴，conic-gradient 只有一个圆心，颜色沿一条线或一个角走；渐变网格是好几层 radial-gradient 各自带中心点叠起来，颜色在二维上互相混合。注意 CSS 里没有 mesh-gradient 这个属性，都是叠出来的。',
    },
    {
      with: '网格背景（grid 线）',
      diff: '网格背景是重复的等距线条，是规则图案；渐变网格是色场，没有线条，颜色之间连续过渡。中文名字里的「网格」指色控点的连线，不是画格子。',
    },
    {
      with: '毛玻璃',
      diff: '毛玻璃是把背后已有的内容糊掉；渐变网格是自己画出一片颜色。两者常一起用（网格背景 + 玻璃面板），但一个负责背景，一个负责面板。',
    },
  ],
  pitfalls: [
    'radial-gradient 的透明端直接写 transparent，在部分浏览器会和黑混出灰边，要写同一个颜色的 rgba(...,0)',
    '色标停到 100% 会露出硬边，提前在 50%–70% 结束，色斑才会自然融合',
    '叠超过 7–8 层背景重绘会变慢，再叠加 filter: blur 更明显，4–6 层够用',
    '给整层加 blur 时要把它 scale 放大到 1.2 以上，否则元素边缘会透出模糊的透明边',
    '纯 CSS 渐变在宽色域显示器上容易出现色带，叠一层 3%–8% 的颗粒噪点能压掉',
    '色相旋转用的是 filter: hue-rotate，它作用在整层上，别把文字也放进这一层',
  ],
  keywords: [
    'radial-gradient',
    'layered backgrounds',
    'transparent color stops',
    'filter: blur()',
    'hue-rotate()',
    'mesh gradient',
    'diffuse gradient',
  ],
  spec: [
    { label: '色斑层数', value: '4–6 层' },
    { label: '色标停靠', value: '50%–70% 处提前淡出' },
    { label: '整层模糊', value: '0–40px' },
    { label: '放大倍数', value: 'scale(1.2)–scale(1.5)' },
    { label: '底色', value: '#101018 之类的深中性色' },
  ],
  reducedMotion: '静态的渐变网格不需要降级；如果让色斑缓慢缩放漂移，prefers-reduced-motion: reduce 下暂停动画，固定在一个构图上。',
  refs: [
    { label: 'MDN · radial-gradient()', url: 'https://developer.mozilla.org/docs/Web/CSS/gradient/radial-gradient' },
    { label: 'MDN · filter', url: 'https://developer.mozilla.org/docs/Web/CSS/filter' },
  ],
  related: ['grain-noise', 'gradient-border', 'frosted-glass'],
  scenes: ['page', 'card'],
  feel: ['soft', 'playful'],
  intent: ['attention', 'hierarchy'],
  controls: [
    {
      kind: 'range',
      id: 'spread',
      label: '色斑扩散',
      min: 10,
      max: 80,
      step: 1,
      def: 55,
      unit: '%',
      hint: '色标提前淡出的位置，越小色斑越紧、留白越多',
    },
    {
      kind: 'range',
      id: 'softness',
      label: '弥散模糊',
      min: 0,
      max: 60,
      step: 2,
      def: 0,
      unit: 'px',
      hint: '0 时能看清每层径向渐变的形状，越大越像一片云',
    },
    {
      kind: 'range',
      id: 'hue',
      label: '色相旋转',
      min: 0,
      max: 360,
      step: 5,
      def: 0,
      unit: 'deg',
      hint: '整体换色，不用改每一层的色值',
    },
    { kind: 'toggle', id: 'drift', label: '色斑缓慢漂移', def: true },
  ],
  prompt: (values: ControlValues) => {
    const spread = Number(values.spread)
    const softness = Number(values.softness)
    const hue = Number(values.hue)
    const drift = Boolean(values.drift)
    return {
      zh: `铺一块渐变网格（Mesh Gradient）背景：用 5 层 radial-gradient(circle at ...) 叠出来，每层色标在 ${spread}% 处提前淡出，透明端写成同色的 rgba(...,0)；底色 #101018。整层加 filter: blur(${softness}px) hue-rotate(${hue}deg)，再 scale(1.3) 放大避免模糊露边。${drift ? '让色斑用 18s ease-in-out 无限缓慢缩放旋转，' : ''}注意 CSS 没有 mesh-gradient 属性，只能这样叠。`,
      en: `mesh gradient background, 5 layered radial-gradient() color blobs, transparent color stops at ${spread}% using rgba(r,g,b,0), base color #101018, filter: blur(${softness}px) hue-rotate(${hue}deg), transform: scale(1.3) to hide blur edges${drift ? ', 18s ease-in-out infinite drift animation' : ', static composition'}, no native mesh-gradient property in CSS`,
    }
  },
}

export default entry
