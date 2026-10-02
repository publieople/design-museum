import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'toast',
  code: 'F-06',
  nameZh: '轻提示',
  nameEn: 'Toast',
  aliases: ['轻提示', '消息提示条', '浮层提示', '自动消失的提示', 'toast notification', 'snackbar'],
  category: 'feedback',
  oneLiner: '一条短消息从屏幕边缘滑进来，几秒后自己消失，不打断当前操作。',
  whenToUse: [
    '一次操作成功或失败，给一句话的确认，不用用户做决定',
    '配合撤销（undo），比如「已删除 · 撤销」',
    '后台任务完成时提醒一下，用户当时可能在别处',
  ],
  confusions: [
    {
      with: '模态弹窗（modal）',
      diff: 'modal 挡住页面、必须处理才能继续；toast 不阻塞、会自动消失，所以不能把必须被看到的严重错误只放进 toast。',
    },
    {
      with: '字段内联校验',
      diff: '表单错误要贴在出错字段旁边并保持可见，直到用户改对；toast 在角落且会消失，不适合报字段级错误。',
    },
  ],
  pitfalls: [
    '自动消失的提示不能用 aria-live="assertive"，会打断读屏；用 role="status" 或 aria-live="polite"',
    '停留时间少于 3 秒读不完，超过 6 秒又挡视线，3–5 秒比较合适',
    '多条 toast 要堆叠并限制数量（最多 3–4 条），否则会铺满屏幕',
    '不能只靠颜色区分成功和失败，要有图标或文案；也不能让 toast 成为唯一的信息来源',
  ],
  keywords: ['toast', 'snackbar', 'aria-live', 'role="status"', 'auto-dismiss', 'transform: translateY'],
  spec: [
    { label: '停留时长', value: '3–5s' },
    { label: '入场时长', value: '200–300ms' },
    { label: '同时最多', value: '3 条' },
    { label: '宽度', value: '280–420px' },
    { label: '位置', value: '底部居中或右上角' },
  ],
  reducedMotion: 'prefers-reduced-motion: reduce 下取消入场和退场的位移与淡出，直接出现、直接消失，停留时长保持不变。',
  refs: [
    { label: 'MDN · ARIA live regions', url: 'https://developer.mozilla.org/docs/Web/Accessibility/ARIA/ARIA_Live_Regions' },
    { label: 'MDN · role="status"', url: 'https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Roles/status_role' },
    { label: 'MDN · transition', url: 'https://developer.mozilla.org/docs/Web/CSS/transition' },
  ],
  related: ['optimistic-ui', 'skeleton-shimmer', 'sticky-header'],
  scenes: ['button', 'form', 'page'],
  feel: ['calm', 'soft'],
  intent: ['waiting', 'affordance'],
  controls: [
    { kind: 'range', id: 'duration', label: '停留时长', min: 1500, max: 6000, step: 250, def: 3000, unit: 'ms', hint: '拖到最长，能看到它一直不消失' },
    {
      kind: 'select',
      id: 'position',
      label: '出现位置',
      def: 'bottom',
      options: [
        { value: 'bottom', label: '底部居中' },
        { value: 'top', label: '顶部居中' },
        { value: 'corner', label: '右上角' },
      ],
    },
    { kind: 'range', id: 'distance', label: '滑入距离', min: 0, max: 24, step: 2, def: 12, unit: 'px' },
  ],
  prompt: (values: ControlValues) => {
    const duration = Number(values.duration)
    const distance = Number(values.distance)
    const position = String(values.position)
    const place = position === 'top' ? '顶部居中' : position === 'corner' ? '右上角' : '底部居中'
    return {
      zh: '做一个轻提示（toast）组件：触发后从' + place + '滑入，滑入距离 ' + distance + 'px，入场 220ms ease-out，停留 ' + duration + 'ms 后自动消失。容器用 role="status" 和 aria-live="polite"，多条时纵向堆叠、最多同时 3 条。动画只用 transform: translateY 和 opacity，禁用状态别遮挡页面操作。系统减少动态效果时直接出现和消失。',
      en: 'toast / snackbar component, slides in from ' + place + ', translateY(' + distance + 'px) with 220ms ease-out, auto-dismiss after ' + duration + 'ms, role="status" aria-live="polite", stack up to 3 toasts, animate transform + opacity only, non-blocking, no entry/exit animation under prefers-reduced-motion',
    }
  },
}

export default entry
