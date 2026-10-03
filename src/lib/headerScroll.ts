import { useEffect, useState } from 'react'

/** 离顶部这么近就一定露出来，免得刚往下滚一点点头部就没了 */
const TOP_ALWAYS_VISIBLE = 90
/** 累加到这么多像素的位移才动作，避免触控板微抖时头部来回闪 */
const MIN_DELTA = 6
/** 滚过这么多之后才允许收起 */
const HIDE_AFTER = 160

/**
 * 单个滚动事件该不该收起来（纯函数，方便单测）。
 * 手感的三条规矩都在这儿：位移太小不动、靠近顶部一定露出、
 * 只有往下滚且滚过阈值才收。
 */
export function resolveHidden(y: number, last: number, hidden: boolean): boolean {
  const delta = y - last
  if (Math.abs(delta) < MIN_DELTA) return hidden
  if (y <= TOP_ALWAYS_VISIBLE) return false
  if (delta > 0 && y > HIDE_AFTER) return true
  return false
}

/**
 * 智能头部：往下滚收起来、往上滚立刻回来、靠近顶部永远露出。
 *
 * 这一条没法用 CSS 滚动驱动动画做——时间线只知道滚动**位置**，
 * 不知道滚动**方向**，所以只能是这几十行 JS。
 * 监听挂在 window 上；演示卡片自带的滚动容器不会冒泡到这里，互不干扰。
 */
export function useHeaderHidden() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    let frame = 0

    const update = () => {
      frame = 0
      const y = window.scrollY
      if (Math.abs(y - last) < MIN_DELTA) return
      const previous = last
      last = y
      setHidden((prev) => resolveHidden(y, previous, prev))
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return [hidden, setHidden] as const
}
