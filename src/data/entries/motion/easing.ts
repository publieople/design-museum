import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'easing',
  code: 'M-02',
  nameZh: '缓动曲线',
  nameEn: 'Easing',
  aliases: ['缓动函数', '时间曲线', '速度曲线', '贝塞尔曲线', 'timing function', 'easing curve', 'cubic-bezier'],
  category: 'motion',
  oneLiner: '决定动画快慢怎么分配：起步快还是收尾慢，全在这条曲线上。',
  whenToUse: [
    '想让动画有「加速度」而不是全程匀速平移',
    '入场要收得干净（快进慢停），退场要果断（慢起快走）',
    '排一排按钮或卡片时，让动效的手感保持一致',
  ],
  confusions: [
    {
      with: '时长 duration',
      diff: '时长只管「多久走完」，缓动曲线管「时间怎么分配」。两条时长相同的动画，换一条曲线，前 100ms 里走完的路程能差好几倍。',
    },
    {
      with: '过渡 transition 本身',
      diff: 'transition 只是声明「哪个属性要动、动多久」；缓动是其中的 timing-function 参数。transition 写了 ease 不等于做了缓动，ease 只是默认曲线而已。',
    },
  ],
  pitfalls: [
    '一整套界面全用默认 ease：什么都在慢慢爬，界面显得没精神',
    'cubic-bezier 的控制点超出 0–1 会冲出范围（也就是回弹），用得过量会像坏掉的弹簧',
    '给用户主动触发的操作调缓动，别把 ease-in 放在点击反馈上，起手慢会让人觉得卡',
    '缓动不改动画的物理路径，只改时间轴；位移、缩放交给 transform，别指望曲线解决布局抖动',
  ],
  keywords: [
    'animation-timing-function',
    'cubic-bezier()',
    'transition-timing-function',
    'linear()',
    'steps()',
    'easing curve',
  ],
  spec: [
    { label: '进场（快进慢停）', value: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    { label: '退场', value: 'cubic-bezier(0.4, 0, 1, 1)' },
    { label: '标准 / 两头缓', value: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    { label: '时长范围', value: '150–400ms' },
    { label: '回弹幅度', value: '控制点 y 值 1.2–1.6，再多就油腻' },
  ],
  reducedMotion:
    '缓动只是时间分配，在 prefers-reduced-motion: reduce 下应把时长压到接近 0（或直接改成 opacity 渐变），保留状态变化、去掉速度感。',
  refs: [
    { label: 'MDN · cubic-bezier()', url: 'https://developer.mozilla.org/docs/Web/CSS/easing-function/cubic-bezier' },
    { label: 'MDN · animation-timing-function', url: 'https://developer.mozilla.org/docs/Web/CSS/animation-timing-function' },
  ],
  related: ['spring', 'stagger', 'scroll-driven'],
  scenes: ['button', 'card', 'page'],
  feel: ['crisp', 'playful'],
  intent: ['affordance', 'hierarchy'],
  controls: [
    {
      kind: 'range',
      id: 'duration',
      label: '动画时长',
      min: 200,
      max: 1600,
      step: 50,
      def: 900,
      unit: 'ms',
      hint: '拉长到 1s 以上，四条曲线的差距才看得清',
    },
    { kind: 'range', id: 'distance', label: '行进距离', min: 20, max: 100, step: 5, def: 100, unit: '%' },
    { kind: 'range', id: 'delay', label: '每轮停顿时长', min: 0, max: 1200, step: 50, def: 300, unit: 'ms' },
    {
      kind: 'select',
      id: 'easing',
      label: '重点对照',
      def: 'cubic-bezier(0.22, 1, 0.36, 1)',
      options: [
        { value: 'cubic-bezier(0.22, 1, 0.36, 1)', label: 'ease-out-quint（进场推荐）' },
        { value: 'linear', label: 'linear（匀速）' },
        { value: 'ease-in', label: 'ease-in（渐快）' },
        { value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', label: 'back-out（轻微回弹）' },
      ],
    },
  ],
  prompt: (values: ControlValues) => {
    const duration = Number(values.duration)
    const distance = Number(values.distance)
    const delay = Number(values.delay)
    const easing = String(values.easing)
    return {
      zh: `帮我调一下动效的缓动曲线：入场用 ${easing}，动画时长 ${duration}ms，每轮结束后停 ${delay}ms。位移幅度大概 ${distance}% 的可用宽度，用 transform 走，不要动 left/top。同一批元素（按钮、卡片）必须用同一条曲线，手感才统一；缓动只改时间分配，不要顺手把路径也改了。`,
      en: `animation-timing-function: ${easing}, transition-timing-function, cubic-bezier() easing curve, duration ${duration}ms, delay ${delay}ms, travel ${distance}%, animate transform only (no left/top), keep one shared easing across buttons and cards, respect prefers-reduced-motion`,
    }
  },
  en: {
    oneLiner: 'How an animation spends its time: fast off the line or soft on arrival, all in one curve.',
    whenToUse: [
      'You want motion that accelerates rather than translating at a constant rate',
      'Entrances should land cleanly (fast in, slow stop) and exits should leave decisively (slow start, fast out)',
      'A row of buttons or cards should all move with the same feel',
    ],
    confusions: [
      {
        with: 'duration',
        diff: 'Duration only says how long the trip takes; easing decides how that time is divided. Two animations of equal duration can cover several times different distance in the first 100ms once you swap the curve.',
      },
      {
        with: 'the transition property itself',
        diff: 'transition only declares which property moves and for how long; easing is its timing-function argument. Writing ease into a transition is not a design choice - ease is just the default curve.',
      },
    ],
    pitfalls: [
      'Leaving every transition on the default ease makes the whole UI creep and feel sluggish',
      'cubic-bezier control points outside 0-1 overshoot the range; use too much and it looks like a broken spring',
      'Never put ease-in on click feedback - a slow start reads as lag on an action the user just took',
      'Easing reshapes the timeline, not the physical path; move and scale with transform, because no curve fixes layout jank',
    ],
    spec: [
      { label: 'Entrance (fast in, slow stop)' },
      { label: 'Exit' },
      { label: 'Standard / ease-in-out' },
      { label: 'Duration range' },
      { label: 'Overshoot amount' },
    ],
    reducedMotion:
      'Easing only divides time, so under prefers-reduced-motion: reduce pull the duration down to near zero (or fade opacity instead): keep the state change, drop the sense of speed.',
    controls: [
      { label: 'Animation duration', hint: 'Stretch it past 1s before the four curves become easy to tell apart' },
      { label: 'Travel distance' },
      { label: 'Pause between rounds' },
      { label: 'Curves to compare' },
    ],
  },
}

export default entry
