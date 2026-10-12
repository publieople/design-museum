import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'marquee',
  code: 'L-08',
  nameZh: '跑马灯',
  nameEn: 'Marquee',
  aliases: ['无缝滚动', '横向滚动条', '循环滚动', 'marquee', 'infinite marquee', 'ticker', 'scrolling text'],
  category: 'layout',
  oneLiner: '一排内容不停地横向滑过，首尾相接，看不出接缝。',
  whenToUse: [
    '客户 logo 墙、合作方列表这类「多到放不下但每条都很短」的内容',
    '公告、注意事项这类要一直提醒但不值得占一整屏的信息',
    '标签流、作品缩略图做背景装饰，让画面一直在动',
  ],
  confusions: [
    {
      with: '自动轮播',
      diff: '轮播是分页的：一屏一屏地翻，还有指示点；跑马灯是匀速连续滚动，没有「第几屏」的概念。',
    },
    {
      with: '滚动捕捉',
      diff: '滚动捕捉是用户自己滑、停下时吸附到某一项；跑马灯是自己走、用户只读，停下来只是因为悬停。',
    },
  ],
  pitfalls: [
    '无缝要复制一份内容并整体平移 50%（或正好一整份的宽度），否则会看到「唰」地跳回起点',
    '用 transform: translate3d 做位移，别用 margin-left / left，后者每帧都要重排',
    '悬停或聚焦时暂停是惯例，最好再给一个暂停按钮，否则读屏和慢读的用户永远读不完',
    '复制出来的那一份要 aria-hidden，不然读屏软件会把内容念两遍',
    '离屏时动画还在烧电：用 IntersectionObserver 或 animation-play-state 停掉',
    '内容比容器短时不要循环，会出现空档；长度不够就复制到足够长',
  ],
  keywords: [
    'marquee',
    'infinite marquee',
    'ticker',
    '@keyframes translateX',
    'transform: translate3d',
    'animation-play-state',
    'mask-image',
    'aria-hidden duplicate',
  ],
  spec: [
    { label: '速度', value: '20–60px/s（约等于阅读速度的一半）' },
    { label: '无缝', value: '复制一份内容，整体平移 50%' },
    { label: '暂停', value: '悬停暂停 + 明确的暂停按钮' },
    { label: '两端', value: '加渐隐遮罩（mask-image）避免硬切' },
    { label: '降级', value: 'prefers-reduced-motion 下不自动滚动' },
  ],
  reducedMotion: 'prefers-reduced-motion 下不要自动滚动：把内容静态换行展示，或改成用户可以自己横向滑动的区域。',
  refs: [
    { label: 'MDN · animation-play-state', url: 'https://developer.mozilla.org/docs/Web/CSS/animation-play-state' },
    { label: 'MDN · mask-image', url: 'https://developer.mozilla.org/docs/Web/CSS/mask-image' },
  ],
  related: ['scroll-snap', 'parallax'],
  scenes: ['list', 'page', 'scroll'],
  feel: ['calm', 'playful'],
  intent: ['attention', 'hierarchy'],
  tags: ['js', 'gradient', 'composited', 'motion-heavy', 'stable'],
  demo: { shape: 'stage' },
  controls: [
    { kind: 'range', id: 'speed', label: '滚动速度', min: 10, max: 80, step: 5, def: 40, unit: 'px/s' },
    { kind: 'toggle', id: 'pauseOnHover', label: '悬停暂停', def: true },
    { kind: 'toggle', id: 'edgeMask', label: '两端渐隐', def: true },
  ],
  prompt: (values: ControlValues) => {
    const speed = Number(values.speed)
    const pause = values.pauseOnHover !== false
    const mask = values.edgeMask !== false
    return {
      zh: `做一个无缝跑马灯（marquee）：内容复制一份首尾相接，用 transform: translate3d 横向匀速平移 50% 循环，速度约 ${speed}px/s、linear 匀速；${pause ? '指针悬停或键盘聚焦时暂停，' : ''}${mask ? '两端加渐隐遮罩（mask-image）避免硬切，' : ''}复制的那一份设 aria-hidden 免得读屏念两遍；内容比容器短时要先复制到足够长。prefers-reduced-motion 下停住，改成静态换行展示。`,
      en: `seamless horizontal marquee, content duplicated and translated 50% in a linear infinite loop with transform: translate3d, about ${speed}px/s, ${pause ? 'pauses on hover and keyboard focus, ' : ''}${mask ? 'faded edges via mask-image, ' : ''}duplicate marked aria-hidden, duplicated until the track is longer than the container, animation stops under prefers-reduced-motion`,
    }
  },
  loop: 'continuous',
  en: {
    oneLiner: 'A row of content slides sideways forever, joined end to end with no visible seam.',
    whenToUse: [
      'Logo walls and partner lists with too many short items for the layout',
      'Announcements and notices that should keep reminding without owning a full screen',
      'Tag rows and thumbnail strips used as moving background texture',
    ],
    confusions: [
      {
        with: 'auto carousel',
        diff: 'A carousel pages: one screen at a time with dots. A marquee scrolls continuously at a constant speed, so there is no current page.',
      },
      {
        with: 'scroll snap',
        diff: 'Scroll snap is user-driven and settles on an item. A marquee drives itself while the user just reads, pausing only when they hover.',
      },
    ],
    pitfalls: [
      'Duplicate the content and translate by exactly 50% (or one full copy), otherwise the loop snaps back visibly',
      'Move with transform: translate3d, not margin-left or left, which re-layout every frame',
      'Pausing on hover and focus is expected; add an explicit pause control so slow readers and screen readers are not forced to keep up',
      'Mark the duplicated copy aria-hidden, or screen readers read the content twice',
      'An offscreen animation still burns power: stop it with IntersectionObserver or animation-play-state',
      'Do not loop content shorter than the container: duplicate until it is long enough, or gaps appear',
    ],
    spec: [
      { label: 'Speed' },
      { label: 'Seamless loop' },
      { label: 'Pausing' },
      { label: 'Edges' },
      { label: 'Fallback' },
    ],
    reducedMotion:
      'Under prefers-reduced-motion stop the automatic scroll: show the items as a static wrapped list, or leave a horizontally scrollable region the user drives.',
    controls: [{ label: 'Speed' }, { label: 'Pause on hover' }, { label: 'Faded edges' }],
  },
}

export default entry
