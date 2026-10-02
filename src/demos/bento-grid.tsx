import { useState } from 'react'
import type { DemoProps } from '../data/types'
import { pick } from '../i18n/pick'
import { numberValue } from '../lib/controls'

const SPANS = [
  { col: 1, row: 1 },
  { col: 2, row: 1 },
  { col: 2, row: 2 },
  { col: 1, row: 2 },
]
const TILES = [
  { zh: '封面', en: 'Cover' },
  { zh: '数据', en: 'Data' },
  { zh: '活动', en: 'Events' },
  { zh: '列表', en: 'List' },
  { zh: '快捷', en: 'Shortcuts' },
  { zh: '图', en: 'Image' },
]
const INITIAL = [2, 0, 0, 1, 0, 0]

export default function BentoGridDemo({ values, locale = 'zh' }: DemoProps) {
  const zh = locale !== 'en'
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
        {TILES.map((item, index) => {
          const label = pick(item, locale)
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
      <p className="mt-2 text-center font-mono text-[10px] opacity-60">
        {zh ? '点方块切换跨格大小' : 'Tap a tile to change its span'}
      </p>
    </div>
  )
}
