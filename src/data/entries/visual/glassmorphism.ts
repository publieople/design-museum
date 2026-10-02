import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'glassmorphism',
  code: 'V-02',
  nameZh: '玻璃拟态',
  nameEn: 'Glassmorphism',
  aliases: ['玻璃态', '玻璃质感', '玻璃卡片', 'glass UI', 'glass card', 'glassmorphic'],
  category: 'visual',
  oneLiner: '半透明面板 + 亮边 + 柔影叠在彩色背景上，像一块玻璃浮在画面里。',
  whenToUse: [
    '登录页、定价卡、数据卡想显得轻透精致，又不想整页铺实心色块',
    '面板压在彩色渐变或照片上，希望底下的颜色透一点上来',
    '浮层、侧栏要和主内容拉开层级，同时不切断和背景的联系',
  ],
  confusions: [
    {
      with: '毛玻璃',
      diff: '毛玻璃只说「背后被模糊」这一件事（backdrop-filter: blur）；玻璃拟态是一整套外观：模糊 + 半透明白色斜向渐变 + 1px 亮描边 + inset 顶部高光 + 外投影，而且几乎都压在彩色背景上。只加一个 blur 不叫玻璃拟态。',
    },
    {
      with: '半透明卡片',
      diff: '半透明只是把底色设成 rgba，边缘是平的；玻璃拟态的边界靠那圈亮描边勾出来，高光和投影一起把面板从背景里托起来。',
    },
  ],
  pitfalls: [
    '必须压在彩色渐变或照片上；纯色背景加 backdrop-filter 几乎看不出变化',
    '亮描边和 inset 高光是玻璃感的命根子，省掉就只剩一块半透明矩形',
    '面板上的文字对比度会随背景变色：深色背景用白字加一点 text-shadow，别指望浅色底能托住黑字',
    'backdrop-filter 每次都要重新合成背景，一屏十几块玻璃会明显掉帧，长列表项里不要用',
    'Safari 要写 -webkit-backdrop-filter，并给不支持的浏览器留一个够不透明的兜底色',
  ],
  keywords: [
    'glassmorphism',
    'backdrop-filter',
    'translucent panel',
    '1px highlight border',
    'inset box-shadow',
    'saturate(180%)',
  ],
  spec: [
    { label: '模糊半径', value: '10–20px' },
    { label: '面板底色', value: 'linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06))' },
    { label: '描边', value: '1px solid rgba(255,255,255,0.30)' },
    { label: '投影', value: '0 8px 32px rgba(0,0,0,0.30)' },
    { label: '内高光', value: 'inset 0 1px 0 rgba(255,255,255,0.50)' },
    { label: '圆角', value: '12–24px' },
  ],
  reducedMotion: '玻璃拟态是静态观感，本身不需要降级；如果给它加了入场或悬浮位移，prefers-reduced-motion: reduce 下直接呈现最终状态，只留静态的玻璃层。',
  refs: [
    { label: 'MDN · backdrop-filter', url: 'https://developer.mozilla.org/docs/Web/CSS/backdrop-filter' },
    { label: 'MDN · box-shadow', url: 'https://developer.mozilla.org/docs/Web/CSS/box-shadow' },
  ],
  related: ['frosted-glass', 'gradient-border', 'spotlight-glow'],
  scenes: ['card', 'page', 'nav'],
  feel: ['soft', 'playful'],
  intent: ['hierarchy', 'attention'],
  controls: [
    {
      kind: 'range',
      id: 'blur',
      label: '模糊半径',
      min: 0,
      max: 30,
      step: 1,
      def: 16,
      unit: 'px',
      hint: '拖到 0px 能看出「透过去」和「糊掉」是两件事',
    },
    {
      kind: 'range',
      id: 'border',
      label: '描边不透明度',
      min: 0,
      max: 60,
      step: 2,
      def: 30,
      unit: '%',
      hint: '拖到 0 玻璃立刻塌成一块半透明色块',
    },
    {
      kind: 'range',
      id: 'shadow',
      label: '投影强度',
      min: 0,
      max: 60,
      step: 2,
      def: 30,
      unit: '%',
      hint: '0 时面板贴回背景，浮起来的感觉全靠它',
    },
    {
      kind: 'range',
      id: 'radius',
      label: '圆角',
      min: 0,
      max: 28,
      step: 1,
      def: 18,
      unit: 'px',
      hint: '小圆角像玻璃板，大到 24px 以上更像胶囊',
    },
  ],
  prompt: (values: ControlValues) => {
    const blur = Number(values.blur)
    const border = (Number(values.border) / 100).toFixed(2)
    const shadow = (Number(values.shadow) / 100).toFixed(2)
    const radius = Number(values.radius)
    return {
      zh: `做一块玻璃拟态（Glassmorphism）卡片：backdrop-filter: blur(${blur}px) saturate(160%)，面板底色 linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06))，1px 描边 rgba(255,255,255,${border})，外投影 0 8px 32px rgba(0,0,0,${shadow})，再补 inset 0 1px 0 rgba(255,255,255,0.5) 当顶部高光，圆角 ${radius}px。卡片必须压在彩色渐变或照片上，并写 -webkit-backdrop-filter 和够不透明的兜底色。`,
      en: `glassmorphism card, backdrop-filter: blur(${blur}px) saturate(160%), -webkit-backdrop-filter, background: linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06)), border: 1px solid rgba(255,255,255,${border}), box-shadow: 0 8px 32px rgba(0,0,0,${shadow}) and inset 0 1px 0 rgba(255,255,255,0.5), border-radius: ${radius}px, translucent frosted panel over colorful gradient, fallback background for unsupported browsers`,
    }
  },
  loop: 'continuous',
  en: {
    oneLiner: 'A translucent panel with a bright edge and soft shadow, floating over a colorful background.',
    whenToUse: [
      'Login pages, pricing cards, and stat cards that should feel light and polished without solid fills across the page',
      'A panel over a colorful gradient or a photo where a little of the color underneath should come through',
      'Overlays and sidebars that need to sit above the main content without cutting the link to the background',
    ],
    confusions: [
      {
        with: 'frosted glass',
        diff: 'Frosted glass does one thing: blurs the backdrop (backdrop-filter: blur). Glassmorphism is a whole look: blur plus a translucent white diagonal gradient, a 1px bright border, an inset top highlight, and an outer shadow, almost always over something colorful. A single blur is not glassmorphism.',
      },
      {
        with: 'translucent card',
        diff: 'A translucent card only sets its background to rgba and keeps flat edges. Glassmorphism draws its boundary with that bright border, and the highlight and shadow together lift the panel off the background.',
      },
    ],
    pitfalls: [
      'It has to sit on a colorful gradient or a photo; backdrop-filter over a flat color barely shows',
      'The bright border and the inset highlight are what make it read as glass; drop them and you are left with a translucent rectangle',
      'Text contrast shifts with the background underneath: on dark backgrounds use white text with a little text-shadow, and do not count on a light surface to hold black text',
      'Every backdrop-filter recomposites the background, so a dozen glass panels on one screen will visibly drop frames; keep them out of long list rows',
      'Safari needs -webkit-backdrop-filter, and browsers without support need a fallback color opaque enough to stay readable',
    ],
    spec: [
      { label: 'Blur radius' },
      { label: 'Panel background' },
      { label: 'Border' },
      { label: 'Shadow' },
      { label: 'Inner highlight' },
      { label: 'Corner radius' },
    ],
    reducedMotion:
      'Glassmorphism is a static look and needs no fallback by itself. If you add an entrance or hover movement, prefers-reduced-motion: reduce should land on the final state and keep only the static glass layers.',
    controls: [
      { label: 'Blur radius', hint: 'At 0px you can see that seeing through and blurring are two different things' },
      { label: 'Border opacity', hint: 'At 0 the glass collapses into a plain translucent block' },
      { label: 'Shadow strength', hint: 'At 0 the panel sits back on the background; the float comes entirely from this' },
      { label: 'Corner radius', hint: 'A small radius reads as a glass sheet; past 24px it turns into a pill' },
    ],
  },
}

export default entry
