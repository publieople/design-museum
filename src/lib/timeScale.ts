import { useEffect, type RefObject } from 'react'

/**
 * 慢放：不要求每个 demo 自己实现倍速，直接给子树里所有 Web Animations
 * 设 playbackRate。CSS 动画与过渡都会被覆盖；rAF 自驱的 demo（如弹簧）
 * 仍然读 DemoProps.timeScale 自己处理。
 */
export function useTimeScale(ref: RefObject<HTMLElement | null>, timeScale: number) {
  useEffect(() => {
    const host = ref.current
    if (!host) return

    const apply = () => {
      const animations = host.getAnimations({ subtree: true })
      for (const animation of animations) {
        if (animation.playbackRate !== timeScale) animation.playbackRate = timeScale
      }
    }

    apply()
    // 循环重播、参数变化都会产生新的 Animation，定时补一遍
    const timer = window.setInterval(apply, 400)

    return () => {
      window.clearInterval(timer)
      for (const animation of host.getAnimations({ subtree: true })) {
        animation.playbackRate = 1
      }
    }
  }, [ref, timeScale])
}
