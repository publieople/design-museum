import { useEffect, useState } from 'react'
import type { DemoProps } from '../data/types'
import { boolValue, numberValue, stringValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

type Ease = (t: number) => number

const EASINGS: Record<string, Ease> = {
  linear: (t) => t,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeOutExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
}

export default function CountUpDemo({ values, stage, replayKey }: DemoProps) {
  const target = numberValue(values, 'target', 12800)
  const duration = numberValue(values, 'duration', 1200)
  const easing = stringValue(values, 'easing', 'easeOutExpo')
  const grouping = boolValue(values, 'grouping', true)
  const reduced = usePrefersReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (reduced) {
      setDisplay(target)
      return
    }
    const ease = EASINGS[easing] ?? EASINGS.easeOutExpo
    let frame = 0
    let start = 0
    const tick = (now: number) => {
      if (start === 0) start = now
      const t = Math.min(1, (now - start) / Math.max(1, duration))
      setDisplay(target * ease(t))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    setDisplay(0)
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, easing, reduced, replayKey])

  const value = Math.round(display)
  const text = grouping ? value.toLocaleString('en-US') : String(value)
  const finalText = grouping ? target.toLocaleString('en-US') : String(target)

  return (
    <div data-stage={stage} className="flex w-full max-w-xs flex-col items-center gap-2">
      <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">本月活跃用户</p>
      <p
        className="font-display text-4xl font-semibold"
        style={{ fontVariantNumeric: 'tabular-nums', minWidth: '6ch', textAlign: 'center', color: 'var(--stage-ink)' }}
      >
        {text}
      </p>
      <p className="text-[11px] opacity-70">{'0 → ' + finalText + '，' + duration + 'ms / ' + easing}</p>
    </div>
  )
}
