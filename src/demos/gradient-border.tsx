import type { CSSProperties } from 'react'
import type { DemoProps } from '../data/types'
import { numberValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

function ringStyle(
  width: number,
  angle: number,
  hue: number,
  radius: number,
  animated: boolean,
): CSSProperties {
  const first = `hsl(${hue}, 90%, 62%)`
  const second = `hsl(${(hue + 90) % 360}, 92%, 55%)`
  const third = `hsl(${(hue + 180) % 360}, 88%, 60%)`
  return {
    border: `${width}px solid transparent`,
    borderRadius: radius,
    background: `linear-gradient(var(--dm-gb-surface), var(--dm-gb-surface)) padding-box, linear-gradient(calc(${angle}deg + var(--dm-gb-flow)), ${first}, ${second}, ${third}) border-box`,
    '--dm-gb-surface': 'color-mix(in srgb, var(--stage-ink) 12%, transparent)',
    '--dm-gb-flow': '0deg',
    animation: animated ? 'dm-visual-gb-flow 6s linear infinite' : undefined,
  } as CSSProperties
}

export default function GradientBorderDemo({ values, replayKey }: DemoProps) {
  const width = numberValue(values, 'width', 2)
  const angle = numberValue(values, 'angle', 135)
  const hue = numberValue(values, 'hue', 265)
  const radius = numberValue(values, 'radius', 14)
  const reduced = usePrefersReducedMotion()
  const animated = !reduced

  return (
    <div key={replayKey} className="w-full max-w-sm">
      <style>{`
        @property --dm-gb-flow {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes dm-visual-gb-flow {
          to { --dm-gb-flow: 360deg; }
        }
      `}</style>
      <div className="p-4" style={ringStyle(width, angle, hue, radius, animated)}>
        <p className="font-display text-sm font-semibold">渐变描边卡片</p>
        <p className="mt-1 text-[11px] leading-relaxed opacity-70">
          描边是 border-box 那层渐变背景，内部被 padding-box 的实底盖住，所以只剩一圈线。
        </p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span
          className="rounded-full px-3 py-1 font-mono text-[10px]"
          style={ringStyle(width, angle, hue, 999, animated)}
        >
          了解更多
        </span>
        <span className="font-mono text-[10px] opacity-60">同一个渐变，小元素也能用</span>
      </div>
    </div>
  )
}
