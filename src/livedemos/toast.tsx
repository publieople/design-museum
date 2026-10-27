import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { usePrefersReducedMotion } from '../lib/motion'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * 整页版「轻提示」：toast 属于视口，不属于文档。
 *
 * 这一页里提示固定贴在视口底部、外壳浮动条的上方；出现 4 秒后自己走，
 * hover / 焦点进入时暂停计时，最多同时 3 条，手动可以关。删除一条档案
 * 会发一条带「撤销」的提示——撤销是真的把档案放回去。
 */

const T = {
  eyebrow: { zh: '现场 · 浮层', en: 'LIVE · OVERLAY' },
  title: { zh: '消息属于视口，不属于文档', en: 'Messages belong to the viewport, not the document' },
  lede: {
    zh: 'toast 不在文档流里：它固定在视口底部、浮动条上方，出现几秒自己走。这一页的四个按钮会真的发四条页面级提示——包括一条可以撤销的删除。',
    en: 'A toast is not in the document flow: it is fixed to the bottom of the viewport, above the floating bar, and leaves on its own after a few seconds. The four buttons on this page really send page-level messages, including a deletion you can undo.',
  },
  hint: { zh: '点按钮，看视口底部', en: 'Press a button and look at the bottom of the viewport' },
  cardLabel: { zh: '触发区', en: 'Triggers' },
  cardNote: {
    zh: '每条提示停留 4 秒；hover 或焦点进入时暂停。最多同时 3 条，第 4 条会把最旧的一条挤掉。',
    en: 'Each toast stays 4 seconds; hovering or focusing pauses the clock. At most 3 at once; a fourth pushes the oldest out.',
  },
  region: { zh: '页面级提示', en: 'Page-level messages' },
  dismiss: { zh: '关闭这条提示', en: 'Dismiss this toast' },
  actionUndo: { zh: '撤销', en: 'Undo' },
  deletedCount: { zh: '已删除 {n} 项，撤销入口在提示里', en: 'Deleted {n} - the undo action is in the toast' },
  itemsLeft: { zh: '档案 {n} 项', en: '{n} items left' },
  triggers: {
    ok: { zh: '保存一项', en: 'Save something' },
    info: { zh: '后台仍在运行', en: 'Background still running' },
    undo: { zh: '删除一项', en: 'Delete one item' },
    error: { zh: '制造一次失败', en: 'Force a failure' },
  },
  toasts: {
    ok: {
      label: { zh: '成功', en: 'SAVED' },
      title: { zh: '已保存到词条库', en: 'Saved to the library' },
      detail: { zh: '页面其余部分没有被挡住', en: 'The rest of the page keeps working' },
    },
    info: {
      label: { zh: '信息', en: 'INFO' },
      title: { zh: '后台任务还在运行', en: 'A background task is still running' },
      detail: { zh: '完成之后会再提示一次', en: 'It will report again when it finishes' },
    },
    undo: {
      label: { zh: '可撤销', en: 'UNDO' },
      title: { zh: '已删除 1 条档案', en: 'Deleted one archive item' },
      detail: { zh: '4 秒内点撤销可以放回去', en: 'Undo within four seconds to put it back' },
    },
    error: {
      label: { zh: '失败', en: 'ERROR' },
      title: { zh: '保存失败：连接中断', en: 'Save failed: the connection dropped' },
      detail: { zh: '严重错误不能只放在 toast 里', en: 'A serious error must not live only in a toast' },
    },
  },
  items: [
    { zh: '命令面板', en: 'Command Palette', code: 'F-08' },
    { zh: '轻提示', en: 'Toast', code: 'F-06' },
    { zh: '鼠标跟随', en: 'Cursor Follower', code: 'M-08' },
  ],
  sections: [
    {
      title: { zh: '视口是它的坐标系', en: 'The viewport is its coordinate system' },
      body: {
        zh: 'toast 用 position: fixed，锚点是视口而不是文档：页面滚到哪里，它都停在底部。这里它落在浮动条上方（bottom: 6rem），z-index 低于浮动条，所以既不挡导航，也不跟着内容滚走。换成一个盒子里的提示，滚动一次就露馅。',
        en: 'A toast uses position: fixed, anchored to the viewport rather than the document: wherever the page scrolls, it stays at the bottom. Here it sits above the floating bar (bottom: 6rem) with a lower z-index, so it neither covers the navigation nor scrolls away with the content. A message inside a box gives itself away on the first scroll.',
      },
      figure: [
        'position: fixed',
        'bottom: 6rem   /* above the shell bar */',
        'z-index: 45    /* below the bar, z-50 */',
      ],
    },
    {
      title: { zh: '四条提示，四种语气', en: 'Four messages, four tones' },
      body: {
        zh: '成功与信息用 role="status"（礼貌播报），失败用 role="alert"（立即播报）。语气不能只靠颜色：每条都有文字标签与不同的停留行为。带撤销的那条把动作放在提示里，4 秒后动作随提示一起消失——这也是它的时限。',
        en: 'Success and information use role="status" (polite), failure uses role="alert" (immediate). Tone never rests on colour alone: every toast carries a text label and its own behaviour. The undo toast keeps its action inside the message, and the action expires with the toast after four seconds - that expiry is the real deadline.',
      },
      figure: [
        'role="status"  polite, success + info',
        'role="alert"   immediate, failure',
        'timeout 4s, pause on hover / focus',
      ],
    },
  ],
  compareTitle: { zh: '什么该进 toast，什么不该', en: 'What belongs in a toast, what does not' },
  compare: [
    {
      case: { zh: '操作成功 / 失败的一句话确认', en: 'A one-line confirmation of success or failure' },
      verdict: { zh: 'toast', en: 'toast' },
    },
    {
      case: { zh: '可以撤销的删除', en: 'A deletion that can be undone' },
      verdict: { zh: 'toast + 撤销动作', en: 'toast with an undo action' },
    },
    {
      case: { zh: '后台任务完成时提醒一下', en: 'A background task finished' },
      verdict: { zh: 'toast', en: 'toast' },
    },
    {
      case: { zh: '表单字段填错了', en: 'A form field is wrong' },
      verdict: { zh: '内联错误，贴在字段旁', en: 'inline error next to the field' },
    },
    {
      case: { zh: '必须处理才能继续的严重错误', en: 'A serious error that must be handled' },
      verdict: { zh: '对话框或整页错误，不用 toast', en: 'a dialog or a full-page state, not a toast' },
    },
    {
      case: { zh: '需要用户读几段话再决定', en: 'The user must read and then decide' },
      verdict: { zh: '不用 toast', en: 'not a toast' },
    },
  ],
  timingTitle: { zh: '计时、堆叠与清理', en: 'Timing, stacking and cleanup' },
  timing: [
    { zh: '停留 4 秒：短于 3 秒读不完，长于 6 秒挡视线。', en: 'Four seconds: under three is unreadable, over six gets in the way.' },
    { zh: 'hover 或键盘焦点进入时暂停，离开后接着计时。', en: 'Hovering or focusing pauses the clock; leaving resumes it.' },
    { zh: '最多同时 3 条，超出时挤掉最旧的一条。', en: 'At most three at once; a fourth pushes the oldest out.' },
    { zh: '每条都可以手动关闭；退场动画结束后才从列表里删除。', en: 'Every toast can be closed by hand; it leaves the list only after the exit animation.' },
    { zh: '组件卸载时必须清掉所有 timeout，否则重新进入页面会被旧提示打到。', en: 'Unmount must clear every timeout, or a later visit gets hit by stale messages.' },
  ],
  paramsTitle: { zh: '参数与判断', en: 'Parameters and judgement' },
  params: [
    { label: { zh: '停留时长', en: 'Dwell time' }, value: { zh: '3–5 秒，这里是 4 秒', en: '3-5s; four seconds here' } },
    { label: { zh: '入场动画', en: 'Enter' }, value: { zh: '220ms，位移 8–12px + 淡入', en: '220ms, 8-12px offset with a fade' } },
    { label: { zh: '同时最多', en: 'Max at once' }, value: { zh: '3 条', en: 'three' } },
    { label: { zh: '宽度', en: 'Width' }, value: { zh: '280–420px，移动端留 2rem 边距', en: '280-420px, 2rem gutters on mobile' } },
    { label: { zh: '位置', en: 'Placement' }, value: { zh: '视口底部居中，浮动条上方', en: 'bottom center, above the floating bar' } },
    { label: { zh: '播报', en: 'Announcement' }, value: { zh: 'status 礼貌；alert 只给失败', en: 'status for polite; alert only for failure' } },
    { label: { zh: '层级', en: 'Z-index' }, value: { zh: '低于底部导航，高于页面内容', en: 'below the bottom nav, above page content' } },
    { label: { zh: '减少动态', en: 'Reduced motion' }, value: { zh: '直接出现、直接消失，停留时间不变', en: 'appear and vanish instantly; dwell time unchanged' } },
  ],
  codeTitle: { zh: '这一页实际在用的', en: 'What this page actually uses' },
  codeNote: {
    zh: '左边是入退场与减少动态的规则，右边是入队、计时与清理的骨架。每条提示一个 id，退出顺序永远按 id 走，不按数组位置。',
    en: 'Left: the enter, exit and reduced-motion rules. Right: the skeleton of the queue, timers and cleanup. Every toast has an id, and removal follows the id rather than an array position.',
  },
  reducedNote: {
    zh: '开启减少动态时，提示直接出现、直接消失，不做位移与淡入；停留时间不变。',
    en: 'When reduced motion is on, toasts appear and vanish instantly, with no offset or fade; the dwell time is unchanged.',
  },
  back: { zh: '回到词条：轻提示', en: 'Back to the entry: Toast' },
} as const

const CSS_TEXT = [
  '@keyframes live-tst-in {',
  '  from { opacity: 0; transform: translateY(10px) }',
  '  to   { opacity: 1; transform: none }',
  '}',
  '@keyframes live-tst-out {',
  '  from { opacity: 1; transform: none }',
  '  to   { opacity: 0; transform: translateY(8px) }',
  '}',
  '.live-tst-item { animation: live-tst-in 220ms ease-out both }',
  '.live-tst-item[data-leaving="true"] { animation: live-tst-out 180ms ease-in both }',
  '@media (prefers-reduced-motion: reduce) {',
  '  .live-tst-item { animation: none }',
  '}',
].join('\n')

const CSS_SNIPPET = [
  '.toast {',
  '  position: fixed;',
  '  inset: auto 0 6rem;',
  '  display: flex;',
  '  justify-content: center;',
  '  z-index: 45;',
  '}',
  '',
  '.toast > li {',
  '  animation: toast-in 220ms ease-out both;',
  '}',
  '',
  '@keyframes toast-in {',
  '  from { opacity: 0; transform: translateY(10px) }',
  '  to   { opacity: 1; transform: none }',
  '}',
  '',
  '@media (prefers-reduced-motion: reduce) {',
  '  .toast > li { animation: none }',
  '}',
].join('\n')

const JS_SNIPPET = [
  'const [toasts, setToasts] = useState([])',
  'const timers = useRef(new Map())',
  '',
  'const push = (tone) => {',
  '  const id = ++nextId.current',
  '  setToasts((prev) => [...prev, { id, tone }].slice(-3))',
  '  const timeout = setTimeout(() => dismiss(id), 4000)',
  '  timers.current.set(id, timeout)',
  '}',
  '',
  'const dismiss = (id) => {',
  '  clearTimeout(timers.current.get(id))',
  '  timers.current.delete(id)',
  '  setToasts((prev) => prev.filter((toast) => toast.id !== id))',
  '}',
  '',
  '// pause: clear the timeouts and remember the remaining time;',
  '// resume: re-arm them. On unmount, clear every timeout.',
].join('\n')

type Tone = 'ok' | 'info' | 'undo' | 'error'

interface ToastItem {
  id: number
  tone: Tone
  action?: () => void
  leaving?: boolean
}

const DURATION = 4000
const EXIT = 200
const MAX_TOASTS = 3

const TONE_BORDER: Record<Tone, string> = {
  ok: 'border-l-accent',
  info: 'border-l-line-strong',
  undo: 'border-l-ink',
  error: 'border-l-accent',
}

const TONE_GLYPH: Record<Tone, string> = {
  ok: 'OK',
  info: 'i',
  undo: 'U',
  error: '!',
}

export default function ToastLive() {
  const locale = useLocale()
  const reduced = usePrefersReducedMotion()
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [paused, setPaused] = useState(false)
  const [items, setItems] = useState<number[]>([0, 1, 2])
  const [deleted, setDeleted] = useState<number[]>([])
  const nextId = useRef(1)
  const remaining = useRef(new Map<number, number>())
  const scheduled = useRef(new Map<number, { timeout: number; deadline: number }>())
  const exitTimers = useRef(new Set<number>())

  const remove = useCallback((id: number) => {
    remaining.current.delete(id)
    setToasts((previous) => previous.filter((toast) => toast.id !== id))
  }, [])

  const dismiss = useCallback(
    (id: number) => {
      remaining.current.delete(id)
      if (reduced) {
        remove(id)
        return
      }
      setToasts((previous) =>
        previous.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)),
      )
      const timer = window.setTimeout(() => {
        exitTimers.current.delete(timer)
        remove(id)
      }, EXIT)
      exitTimers.current.add(timer)
    },
    [reduced, remove],
  )

  useEffect(() => {
    if (paused) return
    const scheduledMap = scheduled.current
    const remainingMap = remaining.current
    const armed: number[] = []
    for (const toast of toasts) {
      if (toast.leaving) continue
      const wait = remainingMap.get(toast.id) ?? DURATION
      remainingMap.delete(toast.id)
      const deadline = Date.now() + wait
      const timeout = window.setTimeout(() => {
        scheduledMap.delete(toast.id)
        dismiss(toast.id)
      }, wait)
      scheduledMap.set(toast.id, { timeout, deadline })
      armed.push(toast.id)
    }
    return () => {
      const now = Date.now()
      for (const id of armed) {
        const entry = scheduledMap.get(id)
        if (!entry) continue
        window.clearTimeout(entry.timeout)
        remainingMap.set(id, Math.max(EXIT, entry.deadline - now))
        scheduledMap.delete(id)
      }
    }
  }, [toasts, paused, dismiss])

  useEffect(
    () => () => {
      for (const entry of scheduled.current.values()) window.clearTimeout(entry.timeout)
      scheduled.current.clear()
      for (const timer of exitTimers.current) window.clearTimeout(timer)
      exitTimers.current.clear()
    },
    [],
  )

  const push = (tone: Tone, action?: () => void) => {
    const id = nextId.current
    nextId.current += 1
    setToasts((previous) => {
      const next = [...previous, { id, tone, action }]
      return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next
    })
  }

  const deleteOne = () => {
    const last = items[items.length - 1]
    if (last === undefined) return
    setItems((previous) => previous.filter((item) => item !== last))
    setDeleted((previous) => [...previous, last])
    push('undo', () => {
      setItems((previous) => (previous.includes(last) ? previous : [...previous, last].sort((a, b) => a - b)))
      setDeleted((previous) => previous.filter((item) => item !== last))
    })
  }

  const toastCopy = (tone: Tone) => T.toasts[tone]

  return (
    <div className="relative bg-canvas pb-28">
      <style>{CSS_TEXT}</style>

      <section
        aria-label={pick(T.title, locale)}
        className="flex min-h-[92svh] items-center px-5 py-16 sm:px-8"
      >
        <div className="mx-auto grid w-full max-w-[88rem] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-center">
          <div className="flex flex-col gap-5">
            <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
            <h2 className="max-w-[15ch] font-display text-display font-semibold leading-[1.05] text-ink">
              {pick(T.title, locale)}
            </h2>
            <p className="max-w-[56ch] text-body text-ink-2">{pick(T.lede, locale)}</p>
            <p className="flex items-center gap-2 font-mono text-[11px] text-muted">
              <span aria-hidden="true" className="inline-block h-2 w-2 bg-accent" />
              {pick(T.hint, locale)}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              {deleted.length > 0
                ? pick(T.deletedCount, locale).replace('{n}', String(deleted.length))
                : pick(T.itemsLeft, locale).replace('{n}', String(items.length))}
            </p>
            {reduced ? (
              <p aria-live="polite" className="max-w-[52ch] text-caption text-accent">
                {pick(T.reducedNote, locale)}
              </p>
            ) : null}
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm border border-line-strong bg-raised p-6">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                <span>{pick(T.cardLabel, locale)}</span>
                <span className="stamp">F-06</span>
              </div>

              <ul className="mt-5 flex flex-col border-t border-line">
                {items.map((index) => (
                  <li
                    key={T.items[index].code}
                    className="flex items-baseline justify-between gap-3 border-b border-line py-2 font-mono text-[11px]"
                  >
                    <span className="text-ink-2">{pick(T.items[index], locale)}</span>
                    <span className="text-muted">{T.items[index].code}</span>
                  </li>
                ))}
                {items.length === 0 ? (
                  <li className="border-b border-line py-2 font-mono text-[11px] text-muted">
                    {pick(T.itemsLeft, locale).replace('{n}', '0')}
                  </li>
                ) : null}
              </ul>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => push('ok')}
                  className="cursor-pointer border border-line px-2 py-2 font-mono text-[10px] text-ink-2 transition-colors hover:border-ink hover:text-ink"
                >
                  {pick(T.triggers.ok, locale)}
                </button>
                <button
                  type="button"
                  onClick={() => push('info')}
                  className="cursor-pointer border border-line px-2 py-2 font-mono text-[10px] text-ink-2 transition-colors hover:border-ink hover:text-ink"
                >
                  {pick(T.triggers.info, locale)}
                </button>
                <button
                  type="button"
                  onClick={deleteOne}
                  disabled={items.length === 0}
                  className="cursor-pointer border border-line px-2 py-2 font-mono text-[10px] text-ink-2 transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:text-muted"
                >
                  {pick(T.triggers.undo, locale)}
                </button>
                <button
                  type="button"
                  onClick={() => push('error')}
                  className="cursor-pointer border border-accent px-2 py-2 font-mono text-[10px] text-accent transition-colors hover:bg-accent hover:text-accent-ink"
                >
                  {pick(T.triggers.error, locale)}
                </button>
              </div>

              <p className="mt-4 border-t border-line pt-3 text-caption text-muted">
                {pick(T.cardNote, locale)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {T.sections.map((section, index) => (
        <section
          key={section.title.zh}
          aria-labelledby={'live-tst-section-' + index}
          className="flex min-h-[62vh] items-center px-5 py-16 sm:px-8"
        >
          <div className="mx-auto grid w-full max-w-[88rem] gap-6 border-t border-line pt-6 md:grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,15rem)] md:gap-10">
            <div className="flex items-baseline gap-3 md:flex-col md:gap-2">
              <span aria-hidden="true" className="font-display text-h1 leading-none text-line-strong">
                {'0' + (index + 1)}
              </span>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                {index + 1} / {T.sections.length}
              </p>
            </div>
            <div className="flex max-w-[58ch] flex-col gap-3">
              <h2 id={'live-tst-section-' + index} className="font-display text-h2 text-ink">
                {pick(section.title, locale)}
              </h2>
              <p className="text-body text-ink-2">{pick(section.body, locale)}</p>
            </div>
            <pre className="self-start overflow-x-auto border-l-2 border-accent pl-3 font-mono text-[10px] leading-relaxed text-muted">
              {section.figure.join('\n')}
            </pre>
          </div>
        </section>
      ))}

      <section
        aria-labelledby="live-tst-compare-title"
        className="flex min-h-[62vh] items-center px-5 py-16 sm:px-8"
      >
        <div className="mx-auto grid w-full max-w-[88rem] gap-6 border-t border-line pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <h2 id="live-tst-compare-title" className="font-display text-h2 text-ink">
              {pick(T.compareTitle, locale)}
            </h2>
            <dl className="flex flex-col">
              {T.compare.map((row) => (
                <div
                  key={row.case.zh}
                  className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4 border-b border-line py-2.5"
                >
                  <dt className="text-caption text-ink-2">{pick(row.case, locale)}</dt>
                  <dd className="font-mono text-[11px] text-accent">{pick(row.verdict, locale)}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="label-mono text-accent">{pick(T.timingTitle, locale)}</h3>
            <ul className="flex flex-col gap-2">
              {T.timing.map((item) => (
                <li key={item.zh} className="flex gap-2 text-caption text-ink-2">
                  <span aria-hidden="true" className="mt-2 inline-block h-1 w-1 shrink-0 bg-accent" />
                  {pick(item, locale)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="live-tst-params-title" className="px-5 py-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-[88rem] gap-6 border-t border-line pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <h2 id="live-tst-params-title" className="font-display text-h2 text-ink">
              {pick(T.paramsTitle, locale)}
            </h2>
            <dl className="flex flex-col">
              {T.params.map((row) => (
                <div
                  key={row.label.zh}
                  className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-line py-2.5"
                >
                  <dt className="label-mono">{pick(row.label, locale)}</dt>
                  <dd className="text-caption text-ink">{pick(row.value, locale)}</dd>
                </div>
              ))}
            </dl>
          </div>
          <pre className="well self-start overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
            {CSS_SNIPPET}
          </pre>
        </div>
      </section>

      <section aria-labelledby="live-tst-code-title" className="px-5 py-20 pb-28 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-5">
          <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
            <h2 id="live-tst-code-title" className="font-display text-h3 text-ink">
              {pick(T.codeTitle, locale)}
            </h2>
            <span className="label-mono">CSS + JS</span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
              {CSS_SNIPPET}
            </pre>
            <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
              {JS_SNIPPET}
            </pre>
          </div>
          <div className="flex max-w-[62ch] flex-col gap-3">
            <p className="text-caption text-ink-2">{pick(T.codeNote, locale)}</p>
            <p className="text-caption text-muted">{pick(T.reducedNote, locale)}</p>
            <Link
              to={entryPath('toast')}
              className="text-link self-start font-mono text-[11px] text-accent no-underline"
            >
              {pick(T.back, locale)} -&gt;
            </Link>
          </div>
        </div>
      </section>

      <div
        role="region"
        aria-label={pick(T.region, locale)}
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[45] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => {
          const copy = toastCopy(toast.tone)
          return (
            <div
              key={toast.id}
              role={toast.tone === 'error' ? 'alert' : 'status'}
              data-leaving={toast.leaving ? 'true' : 'false'}
              onPointerEnter={() => setPaused(true)}
              onPointerLeave={() => setPaused(false)}
              onFocusCapture={() => setPaused(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setPaused(false)
                }
              }}
              className={
                'live-tst-item pointer-events-auto flex w-full max-w-[calc(100vw-2rem)] items-start gap-3 border border-l-[3px] border-line-strong bg-raised p-3 shadow-[var(--shadow-overlay)] sm:max-w-[24rem] ' +
                TONE_BORDER[toast.tone]
              }
            >
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-line-strong font-mono text-[10px] text-ink-2"
              >
                {TONE_GLYPH[toast.tone]}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  {pick(copy.label, locale)}
                </p>
                <p className="text-caption font-medium text-ink">{pick(copy.title, locale)}</p>
                <p className="text-[11px] leading-snug text-muted">{pick(copy.detail, locale)}</p>
                {toast.action ? (
                  <button
                    type="button"
                    onClick={() => {
                      toast.action?.()
                      dismiss(toast.id)
                    }}
                    className="mt-1 cursor-pointer self-start border border-line px-2 py-0.5 font-mono text-[11px] text-ink transition-colors hover:border-ink"
                  >
                    {pick(T.actionUndo, locale)}
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label={pick(T.dismiss, locale)}
                className="cursor-pointer border border-transparent px-1 font-mono text-[11px] text-muted transition-colors hover:border-line-strong hover:text-ink"
              >
                x
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
