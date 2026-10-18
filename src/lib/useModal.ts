import { useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * 对话框 / 抽屉共用的模态行为：
 * - 打开时记住焦点，关闭后还回去（键盘用户不会掉到页面顶上）
 * - 锁 body 滚动，避免背景跟着滚
 * - Esc 关闭，Tab / Shift+Tab 在容器内循环
 * 返回的 ref 必须挂在面板本身（不是遮罩上），焦点陷阱以它为边界。
 * 只在客户端跑：SSR 时 open 恒为有效值，effect 不会执行。
 */
export function useModal(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    restoreRef.current = previous instanceof HTMLElement ? previous : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null || element === document.activeElement,
      )
      if (focusable.length === 0) {
        event.preventDefault()
        panel.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (event.shiftKey) {
        if (active === first || !panel.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else if (active === last || !panel.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      restoreRef.current?.focus()
    }
  }, [open, onClose])

  return panelRef
}
