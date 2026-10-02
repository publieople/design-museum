import type { DemoProps } from '../data/types'
import { numberValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

export default function SkeletonShimmerDemo({ values, stage, replayKey }: DemoProps) {
  const duration = numberValue(values, 'duration', 1400)
  const highlight = numberValue(values, 'highlight', 32)
  const rows = Math.round(numberValue(values, 'rows', 3))
  const reduced = usePrefersReducedMotion()
  const dark = stage === 'dark' || stage === 'accent'

  const half = highlight / 2
  const band =
    'linear-gradient(100deg, transparent ' +
    (50 - half) +
    '%, color-mix(in srgb, var(--stage-ink) 42%, transparent) 50%, transparent ' +
    (50 + half) +
    '%)'
  const base = dark
    ? 'color-mix(in srgb, var(--stage-ink) 14%, transparent)'
    : 'color-mix(in srgb, var(--stage-ink) 10%, transparent)'
  const sweep = reduced
    ? {}
    : { background: band, animation: 'dm-feedback-shimmer-run ' + duration + 'ms linear infinite' }

  return (
    <div
      className="w-full max-w-xs rounded-xl p-3"
      style={{
        border: '1px solid color-mix(in srgb, var(--stage-ink) 18%, transparent)',
        background: dark
          ? 'color-mix(in srgb, var(--stage-ink) 5%, transparent)'
          : 'color-mix(in srgb, var(--stage-ink) 3%, transparent)',
      }}
    >
      <style>
        {'@keyframes dm-feedback-shimmer-run { from { transform: translateX(-100%); } to { transform: translateX(100%); } }'}
      </style>
      <div key={replayKey} className="flex gap-3">
        <div
          className="relative size-12 shrink-0 overflow-hidden rounded-full"
          style={{ background: base }}
        >
          <span className="absolute inset-0" style={sweep} />
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2">
          {Array.from({ length: rows }, (_, index) => (
            <div
              key={index}
              className="relative overflow-hidden"
              style={{
                height: '10px',
                width: index === rows - 1 ? '55%' : '100%',
                background: base,
                borderRadius: '5px',
              }}
            >
              <span className="absolute inset-0" style={sweep} />
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 font-mono text-[10px] opacity-60" style={{ color: 'var(--stage-ink)' }}>
        正在加载 {rows} 行内容 · 高光 {highlight}% · {duration}ms 扫一次
      </p>
    </div>
  )
}
