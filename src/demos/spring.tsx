import { useEffect, useRef, useState } from 'react'
import type { DemoProps } from '../data/types'
import { numberValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'
import { pick } from '../i18n/pick'

const T = {
  blurb: {
    zh: '方块被弹簧拉向右侧终点。刚度决定冲多快，阻尼决定晃几下，质量决定惯性感。',
    en: 'A spring pulls the box to the end of the track. Stiffness sets how fast it starts, damping how much it wobbles, mass how heavy it feels.',
  },
  overshoot: { zh: '超调', en: 'Overshoot' },
  reduced: { zh: '已减少动效', en: 'Reduced motion' },
  moving: { zh: '运动中', en: 'Moving' },
  replay: { zh: '重播', en: 'Replay' },
} as const

export default function SpringDemo({ values, replayKey, locale = 'zh' }: DemoProps) {
  const zh = locale !== 'en'
  const stiffness = numberValue(values, 'stiffness', 260)
  const damping = numberValue(values, 'damping', 18)
  const mass = numberValue(values, 'mass', 1)
  const reduced = usePrefersReducedMotion()

  const [progress, setProgress] = useState(reduced ? 1 : 0)
  const [run, setRun] = useState({ peak: 1, ms: 0 })
  const [localRun, setLocalRun] = useState(0)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [trackWidth, setTrackWidth] = useState(224)

  useEffect(() => {
    const node = trackRef.current
    if (!node || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => setTrackWidth(node.clientWidth))
    observer.observe(node)
    setTrackWidth(node.clientWidth)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (reduced) return
    setProgress(0)
    setRun({ peak: 1, ms: 0 })
    let frame = 0
    let last = 0
    let startedAt = 0
    let peak = 1
    let position = 0
    let velocity = 0
    let settled = false
    const step = (now: number) => {
      if (!startedAt) {
        startedAt = now
        last = now
      }
      const frameDelta = Math.min((now - last) / 1000, 1 / 30)
      last = now
      let elapsed = 0
      while (elapsed < frameDelta) {
        const slice = Math.min(1 / 120, frameDelta - elapsed)
        const acceleration = (stiffness * (1 - position) - damping * velocity) / mass
        velocity += acceleration * slice
        position += velocity * slice
        elapsed += slice
      }
      if (position > peak) peak = position
      if (!settled && Math.abs(1 - position) < 0.02 && Math.abs(velocity) < 0.08) {
        position = 1
        velocity = 0
        settled = true
        setRun({ peak: Math.min(peak, 1.6), ms: now - startedAt })
        setProgress(1)
        return
      }
      setProgress(position)
      frame = window.requestAnimationFrame(step)
    }
    frame = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(frame)
  }, [reduced, stiffness, damping, mass, replayKey, localRun])

  const shown = reduced ? 1 : progress
  const overshoot = reduced ? 0 : Math.max(0, (run.peak - 1) * 100)
  const travel = Math.max(24, trackWidth - 40)
  const x = Math.max(0, shown) * travel

  const status = reduced
    ? pick(T.reduced, locale)
    : run.ms
      ? Math.round(run.ms) + (zh ? 'ms 停稳' : 'ms to settle')
      : pick(T.moving, locale)

  return (
    <div className="w-full max-w-xs">
      <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">spring physics</p>
      <p className="mt-0.5 text-[11px] opacity-70">
        {pick(T.blurb, locale)}
      </p>

      <div
        ref={trackRef}
        className="relative mt-3 h-14 overflow-hidden rounded-lg"
        style={{
          background: 'color-mix(in srgb, var(--stage-ink) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--stage-ink) 14%, transparent)',
        }}
      >
        <span
          className="absolute bottom-3 top-3 w-1 rounded-full"
          style={{ right: 16, background: 'color-mix(in srgb, var(--stage-ink) 40%, transparent)' }}
        />
        <div
          className="absolute left-3 top-1/2 size-9 rounded-lg"
          style={{
            background: 'var(--stage-ink)',
            transform: `translate(${x.toFixed(2)}px, -50%)`,
          }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[10px] opacity-70">
        <span>{pick(T.overshoot, locale)} {overshoot.toFixed(1)}%</span>
        <span>{status}</span>
      </div>

      <button
        type="button"
        onClick={() => setLocalRun((n) => n + 1)}
        className="mt-3 cursor-pointer rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-widest"
        style={{ borderColor: 'color-mix(in srgb, var(--stage-ink) 25%, transparent)' }}
      >
        {pick(T.replay, locale)}
      </button>
      <p className="mt-2 font-mono text-[10px] opacity-60">
        stiffness {stiffness} · damping {damping} · mass {mass}
      </p>
    </div>
  )
}
