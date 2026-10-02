import { useEffect, useRef, useState } from 'react'

/**
 * 只报告元素是否进入视口。卡片网格里几十个 demo 同时跑会掉帧，
 * 所以由调用方决定「不可见就不挂载」。
 */
export function useInView<T extends Element>(options: { rootMargin?: string; once?: boolean } = {}) {
  const { rootMargin = '160px', once = false } = options
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          setInView(record.isIntersecting)
          if (record.isIntersecting && once) observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin, once])

  return { ref, inView }
}
