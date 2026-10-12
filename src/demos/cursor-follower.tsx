import { useEffect, useRef, useState, type PointerEvent } from 'react'
import type { DemoProps } from '../data/types'
import { boolValue, numberValue, stringValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'
import { pick } from '../i18n/pick'

const T = {
  hint: { zh: '把指针移进来，圆点会慢半拍跟着走', en: 'Move the pointer in here: the dot trails behind it' },
  reduced: { zh: '已开启减少动态效果，用回系统光标', en: 'Reduced motion is on: the native cursor stays' },
  coarse: { zh: '触屏设备保留系统光标', en: 'Touch devices keep the native cursor' },
  aria: { zh: '光标跟随演示区域', en: 'Cursor follower demo area' },
} as const

export default function CursorFollowerDemo({ values, locale = 'zh' }: DemoProps) {
  const lag = numberValue(values, 'lag', 90)
  const size = numberValue(values, 'size', 20)
  const blend = stringValue(values, 'blend', 'difference')
  const hideNative = boolValue(values, 'hideNative', true)
  const reduced = usePrefersReducedMotion()

  const areaRef = useRef<HTMLDivElement | null>(null)
  const dotRef = useRef<HTMLSpanElement | null>(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (reduced) return
    let frame = 0
    let last = performance.now()
    const step = (now: number) => {
      const dt = Math.min(now - last, 64)
      last = now
      // 指数趋近：lag 越大越慢半拍；lag = 0 时几乎瞬移
      const k = 1 - Math.pow(0.0005, dt / Math.max(lag, 16))
      current.current.x += (target.current.x - current.current.x) * k
      current.current.y += (target.current.y - current.current.y) * k
      const node = dotRef.current
      if (node) {
        const half = size / 2
        node.style.transform =
          'translate3d(' + (current.current.x - half) + 'px, ' + (current.current.y - half) + 'px, 0)'
      }
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [lag, reduced, size])

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced) return
    const node = areaRef.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    target.current = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    if (!active) {
      if (!current.current.x && !current.current.y) current.current = { ...target.current }
      setActive(true)
    }
  }

  const onLeave = () => setActive(false)

  const follow = !reduced && active

  return (
    <div className="w-full max-w-md">
      <div
        ref={areaRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        aria-label={pick(T.aria, locale)}
        className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-xl border"
        style={{
          borderColor: 'color-mix(in srgb, var(--stage-ink) 18%, transparent)',
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--stage-ink) 6%, transparent), color-mix(in srgb, var(--stage-ink) 14%, transparent))',
          cursor: follow && hideNative ? 'none' : 'auto',
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 rounded-full transition-opacity duration-150"
          style={{
            width: size,
            height: size,
            background: 'var(--stage-ink)',
            mixBlendMode: blend === 'normal' ? 'normal' : (blend as 'difference' | 'screen'),
            opacity: follow ? 1 : 0,
          }}
          ref={dotRef}
        />
        {!follow ? (
          <span className="px-4 text-center text-[11px]" style={{ color: 'var(--stage-muted)' }}>
            {reduced ? pick(T.reduced, locale) : pick(T.hint, locale)}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-[11px]" style={{ color: 'var(--stage-muted)' }}>
        {reduced ? pick(T.reduced, locale) : pick(T.hint, locale)}
      </p>
    </div>
  )
}
