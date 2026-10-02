import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'optimistic-ui',
  code: 'F-05',
  nameZh: '乐观更新',
  nameEn: 'Optimistic UI',
  aliases: ['乐观更新', '先改后存', '点了立刻变', 'optimistic update', 'rollback on failure', 'immediate UI'],
  category: 'feedback',
  oneLiner: '点下去界面立刻变成成功的样子，请求在后台跑，失败了再退回去。',
  whenToUse: [
    '点赞、收藏、关注这类高频、低风险、可重复的操作',
    '发送消息或评论，希望它立刻出现在列表里，而不是等服务器回声',
    '网络慢的时候想减少等待感，把结果先摆出来',
  ],
  confusions: [
    {
      with: '加载中（loading / disabled）',
      diff: 'loading 明确说「正在提交，先等一下」，还会把按钮锁住；乐观更新反过来，先显示结果、把等待藏起来，只在失败时才提示并回滚。',
    },
    {
      with: '本地缓存（local cache）',
      diff: '乐观更新只改当前这一次的界面状态，刷新就没了；缓存是真正存下来的数据，下次打开还在。',
    },
  ],
  pitfalls: [
    '支付、下单、删除账号这类不能重放的操作不能乐观，必须等服务器确认',
    '失败必须回滚并给出提示（toast 或内联错误），只回滚不提示，用户会以为自己成功了',
    '快速连点会产生竞态，给请求编号或声明「最后一次为准」，别让旧响应覆盖新状态',
    '回滚要按 id 定位那一条，不要按数组下标，否则列表并发更新时会改错行',
  ],
  keywords: ['optimistic UI', 'rollback', 'useOptimistic', 'race condition', 'pending state', 'reconcile'],
  spec: [
    { label: '界面更新延迟', value: '0ms（点击即变）' },
    { label: '失败提示停留', value: '2–4s' },
    { label: '请求超时', value: '5–10s' },
    { label: '回滚过渡', value: '200–300ms' },
  ],
  reducedMotion: '回滚的颜色和位移过渡在 prefers-reduced-motion 下取消，状态直接切换，但「已撤销」的文字或图标提示必须保留。',
  refs: [
    { label: 'React · useOptimistic', url: 'https://react.dev/reference/react/useOptimistic' },
    { label: 'MDN · ARIA live regions', url: 'https://developer.mozilla.org/docs/Web/Accessibility/ARIA/ARIA_Live_Regions' },
  ],
  related: ['toast', 'press-feedback', 'skeleton-shimmer'],
  scenes: ['list', 'button', 'form'],
  feel: ['crisp', 'calm'],
  intent: ['affordance', 'waiting'],
  controls: [
    { kind: 'range', id: 'latency', label: '模拟服务器延迟', min: 300, max: 3000, step: 100, def: 1200, unit: 'ms' },
    { kind: 'range', id: 'failureRate', label: '失败概率', min: 0, max: 100, step: 5, def: 30, unit: '%', hint: '调高一点更容易看到回滚' },
    { kind: 'toggle', id: 'optimistic', label: '乐观更新', def: true },
  ],
  prompt: (values: ControlValues) => {
    const latency = Number(values.latency)
    const failureRate = Number(values.failureRate)
    const optimistic = Boolean(values.optimistic)
    return {
      zh: '做一个乐观更新（optimistic UI）的点赞列表：点击后' + (optimistic ? '立刻把这一条改成已赞、计数 +1，同时标记 pending，不等接口返回' : '先标记 pending、按钮暂时禁用，等接口返回再更新界面') + '。模拟请求延迟 ' + latency + 'ms，失败概率 ' + failureRate + '%，失败时按 id 回滚到原状态并在那一条上显示「失败，已撤销」的提示。用 useOptimistic 或本地 state 实现，注意快速连点的竞态。',
      en: 'optimistic UI like button, ' + (optimistic ? 'update state immediately on click and mark pending, no await' : 'mark pending and disable until the request resolves') + ', simulated latency ' + latency + 'ms, failure rate ' + failureRate + '%, rollback by id on error with an inline error message, handle race conditions (last write wins), useOptimistic, aria-live polite for the error',
    }
  },
}

export default entry
