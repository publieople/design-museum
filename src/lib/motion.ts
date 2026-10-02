import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function current(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(QUERY).matches
}

/** 系统是否开启了「减少动态效果」。所有 demo 都必须尊重它。 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(current)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const media = window.matchMedia(QUERY)
    const onChange = () => setReduced(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return reduced
}
