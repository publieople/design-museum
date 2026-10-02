import type { DemoProps } from '../data/types'
import { numberValue, stringValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

const LANES = [
  { id: 'linear', label: 'linear 匀速', timing: 'linear' },
  { id: 'ease-in', label: 'ease-in 渐快', timing: 'ease-in' },
  { id: 'ease-out', label: 'ease-out 渐慢', timing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  { id: 'back-out', label: 'back-out 回弹', timing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
]

const KEYFRAMES = `@keyframes dm-motion-easing-lane { from { left: 0; } to { left: var(--dm-travel); } } @keyframes dm-motion-easing-sweep { from { left: 12px; } to { left: calc(100% - 12px); } }`

export default function EasingDemo({ values, replayKey }: DemoProps) {
  const duration = numberValue(values, 'duration', 900)
  const distance = numberValue(values, 'distance', 100)
  const delay = numberValue(values, 'delay', 300)
  const highlight = stringValue(values, 'easing', 'cubic-bezier(0.22, 1, 0.36, 1)')
  const reduced = usePrefersReducedMotion()
  const runKey = `${replayKey}-${duration}-${distance}-${delay}`

  return (
    <div className="w-full max-w-xs">
      <style>{KEYFRAMES}</style>
      <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">easing curve</p>
      <p className="mt-0.5 text-[11px] opacity-70">
        四条轨道时长一样，只有缓动不同。同一时刻，它们的位置并不在一条线上。
      </p>

      <div className="mt-3 flex flex-col gap-2.5">
        {LANES.map((lane) => {
          const active = lane.timing === highlight
          return (
            <div key={lane.id}>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px]" style={{ opacity: active ? 1 : 0.5 }}>
                  {lane.label}
                </span>
                {active ? <span className="font-mono text-[9px] opacity-70">← 对照项</span> : null}
              </div>
              <div
                key={runKey}
                className="relative mt-1 h-7 rounded-full"
                style={{
                  background: 'color-mix(in srgb, var(--stage-ink) 8%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--stage-ink) 16%, transparent)',
                }}
              >
                <span
                  className="absolute top-1/2 size-4 -translate-y-1/2 rounded-full"
                  style={{
                    background: 'var(--stage-ink)',
                    border: active
                      ? '2px solid color-mix(in srgb, var(--stage-ink) 40%, transparent)'
                      : 'none',
                    ...(reduced
                      ? { left: `calc(${distance}% - 18px)` }
                      : {
                          '--dm-travel': `${distance}% - 18px`,
                          animation: `dm-motion-easing-lane ${duration}ms ${lane.timing} ${delay}ms both infinite alternate`,
                        }),
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3">
        <p className="font-mono text-[10px] opacity-60">对照缓动：{highlight}</p>
        <div
          className="relative mt-1 h-5 overflow-hidden rounded"
          style={{ background: 'color-mix(in srgb, var(--stage-ink) 8%, transparent)' }}
        >
          <span
            key={`${runKey}-${highlight}`}
            className="absolute top-1/2 size-3 -translate-y-1/2 rounded-sm"
            style={{
              background: 'var(--stage-ink)',
              ...(reduced
                ? { left: 'calc(100% - 12px)' }
                : {
                    animation: `dm-motion-easing-sweep ${duration}ms ${highlight} ${delay}ms both infinite alternate`,
                  }),
            }}
          />
        </div>
      </div>

      <p className="mt-3 font-mono text-[10px] opacity-60">
        时长 {duration}ms · 位移 {distance}% · 停顿 {delay}ms
      </p>
    </div>
  )
}
