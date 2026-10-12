import { useState, type KeyboardEvent, type PointerEvent } from 'react'
import type { DemoProps } from '../data/types'
import { boolValue, numberValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'
import { pick } from '../i18n/pick'

const T = {
  label: { zh: '点我试试', en: 'Tap me' },
  hint: { zh: '按下或按 Enter，看波纹从哪里荡开', en: 'Press it, or hit Enter, to see where the ripple starts' },
  reduced: { zh: '已开启减少动态效果，改成底色变化', en: 'Reduced motion is on, so the press only changes the background' },
  aria: { zh: '涟漪反馈演示按钮', en: 'Ripple feedback demo button' },
} as const

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

let seq = 0

export default function RippleDemo({ values, locale = 'zh' }: DemoProps) {
  const duration = numberValue(values, 'duration', 450)
  const peak = numberValue(values, 'opacity', 30)
  const fromPoint = boolValue(values, 'fromPoint', true)
  const reduced = usePrefersReducedMotion()
  const [ripples, setRipples] = useState<Ripple[]>([])
  const [pressed, setPressed] = useState(false)

  const spawn = (x: number, y: number, size: number) => {
    if (reduced) return
    seq += 1
    setRipples((list) => [...list, { id: seq, x, y, size }])
  }

  const spawnFrom = (node: HTMLElement, clientX?: number, clientY?: number) => {
    const rect = node.getBoundingClientRect()
    const usePoint = fromPoint && clientX !== undefined && clientY !== undefined
    const x = usePoint ? clientX - rect.left : rect.width / 2
    const y = usePoint ? clientY - rect.top : rect.height / 2
    spawn(x, y, 2 * Math.hypot(rect.width, rect.height))
  }

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    setPressed(true)
    spawnFrom(event.currentTarget, event.clientX, event.clientY)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    setPressed(true)
    // 键盘没有坐标，从中心扩散
    spawnFrom(event.currentTarget)
  }

  return (
    <div className="w-full max-w-xs">
      <style>
        {'@keyframes dm-feedback-ripple { from { transform: scale(0); opacity: 1; } to { transform: scale(1); opacity: 0; } }'}
      </style>
      <button
        type="button"
        aria-label={pick(T.aria, locale)}
        onPointerDown={onPointerDown}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onKeyDown={onKeyDown}
        onKeyUp={() => setPressed(false)}
        className="relative w-full overflow-hidden rounded-lg px-6 py-3 text-sm font-medium"
        style={{
          border: '1px solid color-mix(in srgb, var(--stage-ink) 25%, transparent)',
          color: 'var(--stage-ink)',
          background:
            pressed && reduced
              ? 'color-mix(in srgb, var(--stage-ink) 12%, transparent)'
              : 'color-mix(in srgb, var(--stage-ink) 4%, transparent)',
          transition: reduced ? 'background-color 120ms ease-out' : undefined,
        }}
      >
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            aria-hidden
            onAnimationEnd={() => setRipples((list) => list.filter((item) => item.id !== ripple.id))}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              marginLeft: -ripple.size / 2,
              marginTop: -ripple.size / 2,
              background: `radial-gradient(circle, color-mix(in srgb, var(--stage-ink) ${peak}%, transparent) 0%, transparent 70%)`,
              animation: `dm-feedback-ripple ${duration}ms ease-out forwards`,
            }}
          />
        ))}
        <span className="relative">{pick(T.label, locale)}</span>
      </button>
      <p className="mt-2 text-[11px]" style={{ color: 'var(--stage-muted)' }}>
        {reduced ? pick(T.reduced, locale) : pick(T.hint, locale)}
      </p>
    </div>
  )
}
