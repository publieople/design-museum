import type { DemoProps } from '../data/types'
import { boolValue, numberValue, stringValue } from '../lib/controls'

const RULER = [300, 400, 500, 600, 700]

function quantize(value: number, steps: number): number {
  if (steps <= 1) return Math.round(value)
  const size = (700 - 300) / (steps - 1)
  return Math.round(300 + Math.round((value - 300) / size) * size)
}

export default function VariableFontDemo({ values, stage, replayKey }: DemoProps) {
  const wght = numberValue(values, 'wght', 450)
  const steps = numberValue(values, 'steps', 1)
  const family = stringValue(values, 'family', 'display')
  const ruler = boolValue(values, 'ruler', true)
  const applied = quantize(wght, steps)
  const fontClass = family === 'mono' ? 'font-mono' : 'font-display'
  const settings = '"wght" ' + applied
  const nearest = RULER.reduce((best, value) => (Math.abs(value - applied) < Math.abs(best - applied) ? value : best), RULER[0])
  const line = 'color-mix(in srgb, var(--stage-ink) 22%, transparent)'

  return (
    <div key={replayKey} data-stage={stage} className="flex w-full max-w-xs flex-col items-center gap-3">
      <p className={'text-4xl ' + fontClass} style={{ fontVariationSettings: settings, color: 'var(--stage-ink)' }}>
        变粗变细
      </p>
      <p className="font-mono text-[10px] opacity-60">{'font-variation-settings: ' + settings}</p>
      {ruler ? (
        <div className="flex w-full flex-col gap-1 rounded-lg border p-2" style={{ borderColor: line }}>
          {RULER.map((value) => (
            <div key={value} className="flex items-baseline gap-2">
              <span className="font-mono text-[10px] opacity-50" style={{ width: '2.5rem' }}>
                {value}
              </span>
              <span
                className={'text-base ' + fontClass}
                style={{ fontVariationSettings: '"wght" ' + value, opacity: value === nearest ? 1 : 0.45 }}
              >
                可变字重
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
