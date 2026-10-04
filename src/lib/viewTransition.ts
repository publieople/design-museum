import type { ThemeMode } from './prefs'

/** lib.dom 已把 startViewTransition 标成必需，但旧浏览器上并不存在，所以按可选处理 */
type StartViewTransition = (callback: () => void) => { finished: Promise<void> }

function startViewTransition(): StartViewTransition | undefined {
  if (typeof document === 'undefined') return undefined
  return (document as unknown as { startViewTransition?: StartViewTransition }).startViewTransition
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const ANIMATING_CLASS = 'theme-animating'

/**
 * 主题/语言这类整页换装的切换包一层过渡。
 * 优先用 View Transitions（真交叉淡入）；不支持时退回「临时打开全局 transition」——
 * 只在切换的 300ms 内挂 class，避免把全局 transition 常开（那会拖慢所有交互）。
 */
export function withThemeTransition(apply: () => void) {
  if (typeof document === 'undefined') {
    apply()
    return
  }

  const start = startViewTransition()
  if (start && !prefersReducedMotion()) {
    try {
      start.call(document, apply)
      return
    } catch {
      // 掉到回退分支
    }
  }

  if (prefersReducedMotion()) {
    apply()
    return
  }

  const root = document.documentElement
  root.classList.add(ANIMATING_CLASS)
  apply()
  window.setTimeout(() => root.classList.remove(ANIMATING_CLASS), 320)
}

/**
 * 路由切换的转场：只有路径真的变了才调它。
 *
 * View Transitions 的难点是「什么时候算新画面已经画好」：hash 变化是异步事件，
 * React 也是异步提交的。所以回调返回一个「等 hashchange 再等一帧」的 Promise，
 * 让浏览器在新页面真的进 DOM 之后再抓新快照，否则会拍到两张一样的旧图。
 * 200ms 兜底，避免目标等于当前地址时把整页卡住。
 */
export function withRouteTransition(apply: () => void) {
  const start = startViewTransition()
  if (!start || prefersReducedMotion()) {
    apply()
    return
  }

  const root = document.documentElement
  // 转场期间才给 main 起 view-transition-name（见 global.css），
  // 免得切主题的交叉淡入也跟着带位移。
  root.dataset.routeTransition = 'true'
  const cleanup = () => {
    delete root.dataset.routeTransition
  }

  try {
    const transition = start.call(document, () => {
      return new Promise<void>((resolve) => {
        let settled = false
        const done = () => {
          if (settled) return
          settled = true
          // 用定时器而不是 requestAnimationFrame：窗口被别的窗口挡住时
          // rAF 会被节流甚至完全不触发，Promise 不 resolve 的话浏览器会一直
          // 挂着旧快照，页面看起来就"卡住了"。React 在 hashchange 里是同步提交的，
          // 让出一个宏任务足够它把新页面画进 DOM。
          window.setTimeout(resolve, 24)
        }
        window.addEventListener('hashchange', done, { once: true })
        window.setTimeout(done, 200)
        apply()
      })
    })
    // 兜底：不管转场结果如何，标记都要摘掉
    window.setTimeout(cleanup, 1200)
    void transition.finished.then(cleanup, cleanup)
  } catch {
    cleanup()
    apply()
  }
}

/** 把主题偏好落到 <html data-theme>；system 时移除属性，交给 CSS 媒体查询 */
export function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.dataset.theme = theme
}
