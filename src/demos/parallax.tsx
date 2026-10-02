import { useEffect, useRef, useState } from 'react'
import type { DemoProps } from '../data/types'
import { boolValue, numberValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

const LAYERS = [
  {
    id: 'sky',
    factor: 1,
    style: { left: '-6%', right: '-6%', top: '-14%', height: '72%' },
    background: 'radial-gradient(60% 80% at 25% 30%, var(--stage-ink) 0%, transparent 70%)',
  },
  {
    id: 'mid',
    factor: 0.6,
    style: { left: '-4%', right: '-4%', top: '-6%', height: '58%' },
    background: 'radial-gradient(55% 75% at 72% 62%, var(--stage-ink) 0%, transparent 72%)',
  },
  {
    id: 'main',
    factor: 1.25,
    style: { left: '-8%', right: '-8%', top: '2%', height: '46%' },
    background: 'radial-gradient(65% 85% at 45% 35%, var(--stage-ink) 0%, transparent 68%)',
  },
]

export default function ParallaxDemo({ values, replayKey }: DemoProps) {
  const speed = numberValue(values, 'speed', 0.45)
  const distance = numberValue(values, 'distance', 60)
  const reverse = boolValue(values, 'reverse', false)
  const reduced = usePrefersReducedMotion()

  const boxRef = useRef<HTMLDivElement | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const [y, setY] = useState(0)
  const [moving, setMoving] = useState(false)

  const sign = reverse ? -1 : 1

  const onScroll = () => {
    const node = boxRef.current
    if (!node) return
    setY(node.scrollTop)
    setMoving(true)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMoving(false), 180)
  }

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  const offset = (factor: number) => (reduced ? 0 : (distance - y * speed) * factor * sign)

  return (
    <div className="w-full max-w-xs">
      <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">parallax</p>
      <p className="mt-0.5 text-[11px] opacity-70">
        三层图案以不同速度移动，滚动时就有了纵深。上面的方块是普通滚动，用来对照。
      </p>

      <div
        ref={boxRef}
        key={replayKey}
        onScroll={onScroll}
        className="mt-3 h-60 overflow-y-auto overscroll-contain rounded-lg"
        style={{ background: 'color-mix(in srgb, var(--stage-ink) 7%, transparent)' }}
        tabIndex={0}
        aria-label="可滚动的视差演示"
      >
        <div className="relative h-[26rem]">
          {LAYERS.map((layer) => (
            <div
              key={layer.id}
              className="absolute rounded-[50%]"
              style={{
                ...layer.style,
                background: layer.background,
                opacity: 0.4,
                filter: 'blur(10px)',
                transform: 'translate3d(0, ' + offset(layer.factor).toFixed(1) + 'px, 0)',
                willChange: moving ? 'transform' : undefined,
              }}
            />
          ))}

          <div className="absolute inset-x-3 top-24 z-10">
            <div
              className="relative h-32 overflow-hidden rounded-xl"
              style={{ background: 'color-mix(in srgb, var(--stage-ink) 6%, transparent)' }}
            >
              <div
                className="absolute left-3 top-1/2 size-12 rounded-lg"
                style={{
                  background: 'var(--stage-ink)',
                  transform: 'translate3d(0, -50%, 0)',
                  boxShadow: moving ? '0 10px 24px color-mix(in srgb, var(--stage-ink) 25%, transparent)' : 'none',
                }}
              />
              <p className="absolute bottom-3 left-3 text-[11px] opacity-80">
                这一层是普通滚动，不做视差
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-2 text-center font-mono text-[10px] opacity-60">
        滚动位移 {y.toFixed(0)}px · 视差系数 {speed} · 基准 {distance}px{reverse ? ' · 反向' : ''}
      </p>
    </div>
  )
}
