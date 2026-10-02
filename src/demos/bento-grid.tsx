import { useState } from 'react'
import type { DemoProps } from '../data/types'
import { numberValue } from '../lib/controls'

const SPANS = [
  { col: 1, row: 1 },
  { col: 2, row: 1 },
  { col: 2, row: 2 },
  { col: 1, row: 2 },
]
const TILES = ['封面', '数据', '活动', '列表', '快捷', '图']
const INITIAL = [2, 0, 0, 1, 0, 0]

export default function BentoGridDemo({ values }: DemoProps) {
  const columns = Math.round(numberValue(values, 'columns', 4))
  const gap = numberValue(values, 'gap', 8)
  const rowHeight = numberValue(values, 'rowHeight', 46)
  const radius = numberValue(values, 'radius', 14)
  const [spans, setSpans] = useState<number[]>(INITIAL)

  const cycle = (index: number) =>
    setSpans((prev) => prev.map((value, i) => (i === index ? (value + 1) % SPANS.length : value)))

  return (
    <div className="w-full max-w-xs">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridAutoRows: rowHeight,
          gap,
        }}
      >
        {TILES.map((label, index) => {
          const span = SPANS[spans[index] % SPANS.length]
          const col = Math.min(span.col, columns)
          return (
            <button
              key={label}
              type="button"
              onClick={() => cycle(index)}
              className="flex flex-col justify-between border p-2 text-left"
              style={{
                gridColumn: `span ${col}`,
                gridRow: `span ${span.row}`,
                borderRadius: radius,
                borderColor: 'color-mix(in srgb, var(--stage-ink) 20%, transparent)',
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--stage-ink) 12%, transparent), color-mix(in srgb, var(--stage-ink) 4%, transparent))',
              }}
            >
              <span className="text-[11px] font-medium">{label}</span>
              <span className="font-mono text-[10px] opacity-55">
                ${col}×${span.row}
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-center font-mono text-[10px] opacity-60">点方块切换跨格大小</p>
    </div>
  )
}