import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'spotlight-glow',
  code: 'V-05',
  nameZh: '光晕聚光',
  nameEn: 'Spotlight Glow',
  aliases: ['聚光灯', '鼠标光晕', '光标跟随光', 'spotlight card', 'cursor glow', 'radial highlight'],
  category: 'visual',
  oneLiner: '一块柔光跟着指针在卡片表面移动，像有人拿手电照上去。',
  whenToUse: [
    '深色卡片想让用户意识到鼠标正停在这里，比整块变色更有空间感',
    '定价卡、功能卡里突出「正在看的那一张」',
    'Hero 区要一束光追着指针走，给静态页面一点氛围',
    '按钮的 hover 高亮想含蓄一点，用一层径向光代替纯色填充',
  ],
  confusions: [
    {
      with: 'box-shadow 阴影',
      diff: 'box-shadow 是元素轮廓外的一圈均匀柔光，跟着盒子形状走，不会移动；聚光光晕是一个有圆心坐标的光斑，位置随指针变。',
    },
    {
      with: 'hover 换底色',
      diff: 'hover 是把整块背景色换掉，边界是硬切；聚光有衰减，越靠圆心越亮，越往外越淡。',
    },
    {
      with: '跟随指针的拖尾',
      diff: '拖尾装饰的是鼠标本身，跟着指针满屏幕跑；聚光被裁在元素内部（overflow: hidden 或 mask），是打在表面的一层。',
    },
  ],
  pitfalls: [
    '别在 pointermove 里 setState，一帧多次重渲染会卡；把坐标直接写进元素的 style.transform 或 CSS 变量',
    '光斑要 overflow: hidden 裁在卡片里，否则看起来是飘在旁边的一个圆',
    '触屏没有 hover，必须给一个默认居中或居下的静态光斑，否则移动端一片死黑',
    '光太亮会把内容吃掉，峰值不透明度 0.10–0.25 就够，配 mix-blend-mode: screen 或 soft-light',
    '在长条卡片上用百分比尺寸算光斑会被拉成椭圆，改用固定 px 直径',
    'pointermove 里每次都读 getBoundingClientRect 会触发布局，缓存 rect 或只在 resize 时更新',
  ],
  keywords: [
    'radial-gradient',
    'pointermove',
    'CSS custom properties',
    'transform: translate3d',
    'mix-blend-mode: screen',
    'overflow: hidden',
    'spotlight card',
  ],
  spec: [
    { label: '光斑直径', value: '320–560px' },
    { label: '峰值不透明度', value: '0.10–0.25' },
    { label: '位置过渡', value: 'transform 80–160ms ease-out' },
    { label: '混合模式', value: 'screen / soft-light' },
    { label: '移出淡出', value: '150–250ms' },
  ],
  reducedMotion: '光斑是直接改 transform，本来就没有缓动；prefers-reduced-motion: reduce 下把 transform 的 transition 去掉，光斑瞬间跳到指针位置，不再有跟不上的拖影。',
  refs: [
    { label: 'MDN · radial-gradient()', url: 'https://developer.mozilla.org/docs/Web/CSS/gradient/radial-gradient' },
    { label: 'MDN · Element: pointermove 事件', url: 'https://developer.mozilla.org/docs/Web/API/Element/pointermove_event' },
    { label: 'MDN · mix-blend-mode', url: 'https://developer.mozilla.org/docs/Web/CSS/mix-blend-mode' },
  ],
  related: ['glassmorphism', 'gradient-border', 'hover-lift'],
  scenes: ['card', 'button', 'page'],
  feel: ['playful', 'crisp'],
  intent: ['attention', 'affordance'],
  controls: [
    {
      kind: 'range',
      id: 'radius',
      label: '光斑半径',
      min: 80,
      max: 360,
      step: 10,
      def: 220,
      unit: 'px',
      hint: '直径是它的两倍；小于 150px 像激光笔，越大越像氛围光',
    },
    {
      kind: 'range',
      id: 'intensity',
      label: '峰值不透明度',
      min: 0,
      max: 60,
      step: 2,
      def: 22,
      unit: '%',
      hint: '拖到 0 光完全消失，能对比「高亮」和「变白」的区别',
    },
    {
      kind: 'range',
      id: 'hue',
      label: '光斑色相',
      min: 0,
      max: 360,
      step: 5,
      def: 40,
      unit: 'deg',
      hint: '40deg 偏暖像台灯，220deg 偏蓝像屏幕反光',
    },
    { kind: 'toggle', id: 'follow', label: '跟随指针', def: true },
  ],
  prompt: (values: ControlValues) => {
    const radius = Number(values.radius)
    const intensity = (Number(values.intensity) / 100).toFixed(2)
    const hue = Number(values.hue)
    const follow = Boolean(values.follow)
    return {
      zh: `做卡片聚光（spotlight glow）：卡片 overflow: hidden，里面放一个 ${radius * 2}px 的圆形光斑，背景 radial-gradient(circle, hsla(${hue}, 95%, 70%, ${intensity}) 0%, hsla(${hue}, 95%, 70%, 0) 70%)，mix-blend-mode: screen，pointer-events: none。${follow ? '用 pointermove 把指针坐标换算成光斑的 transform: translate3d()，直接改元素 style 不要 setState，并加 120ms 的 transform 过渡；指针移出回到卡片中心。' : '光斑固定在卡片中心，不跟随指针。'}默认位置就要好看，因为触屏没有 hover。`,
      en: `spotlight card glow, ${radius * 2}px circle, radial-gradient(circle, hsla(${hue}, 95%, 70%, ${intensity}), transparent 70%), mix-blend-mode: screen, pointer-events: none, overflow: hidden${follow ? ', follow cursor with pointermove, write transform: translate3d directly to the element (no React state), 120ms ease-out transition on transform, recenter on pointerleave' : ', centered static glow'}, static fallback for touch devices`,
    }
  },
}

export default entry
