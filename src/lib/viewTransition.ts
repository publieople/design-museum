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

/** 把主题偏好落到 <html data-theme>；system 时移除属性，交给 CSS 媒体查询 */
export function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.dataset.theme = theme
}
