import { useRef, useState, type PointerEvent } from 'react'
import type { DemoProps } from '../data/types'
import { numberValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

export default function MagneticButtonDemo({ values, stage }: DemoProps) {
  const strength = numberValue(values, 'strength', 0.3)
  const maxDistance = numberValue(values, 'maxDistance', 12)
  const radius = numberValue(values, 'radius', 1.6)
  const duration = numberValue(values, 'duration', 350)
  const reduced = usePrefersReducedMotion()
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [near, setNear] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const dark = stage === 'dark' || stage === 'accent'

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced) return
    const node = buttonRef.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    const limit = radius * Math.max(rect.width, rect.height)
    if (Math.hypot(dx, dy) > limit) {
      setNear(false)
      setOffset({ x: 0, y: 0 })
      return
    }
    let x = dx * strength
    let y = dy * strength
    const magnitude = Math.hypot(x, y)
    if (magnitude > maxDistance && magnitude > 0) {
      x = (x / magnitude) * maxDistance
      y = (y / magnitude) * maxDistance
    }
    setNear(true)
    setOffset({ x, y })
  }

  const reset = () => {
    setNear(false)
    setOffset({ x: 0, y: 0 })
  }

  return (
    <div
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className="flex h-40 w-full max-w-xs items-center justify-center rounded-xl"
      style={{ border: '1px dashed color-mix(in srgb, var(--stage-ink) 25%, transparent)' }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="cursor-pointer rounded-full px-6 py-3 font-display text-sm font-semibold"
        style={{
          color: dark ? '#101014' : '#ffffff',
          background: dark ? '#f2f2f5' : 'linear-gradient(135deg, #2f6bff, #7b2ff7)',
          transform:
            'translate3d(' + offset.x.toFixed(1) + 'px, ' + offset.y.toFixed(1) + 'px, 0)',
          transition:
            'transform ' +
            (near ? 90 : duration) +
            'ms ' +
            (near ? 'ease-out' : 'cubic-bezier(0.22, 1, 0.36, 1)'),
        }}
      >
        磁吸按钮
      </button>
    </div>
  )
}
