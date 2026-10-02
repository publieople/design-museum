import { useState } from 'react'
import type { DemoProps } from '../data/types'
import { pick } from '../i18n/pick'
import { numberValue, stringValue } from '../lib/controls'

const FACTORS = [0.62, 1, 0.78, 1.28, 0.7, 1.12, 0.9, 1.22, 0.66, 1.06, 0.84, 1.16]
const LABELS = [
  { zh: '封面', en: 'Cover' },
  { zh: '图表', en: 'Chart' },
  { zh: '引用', en: 'Quote' },
  { zh: '清单', en: 'List' },
  { zh: '数据', en: 'Data' },
  { zh: '标签', en: 'Tag' },
  { zh: '图注', en: 'Caption' },
  { zh: '步骤', en: 'Steps' },
  { zh: '预览', en: 'Preview' },
  { zh: '注脚', en: 'Footnote' },
  { zh: '纪要', en: 'Notes' },
  { zh: '封面图', en: 'Hero' },
]

export default function MasonryDemo({ values, locale = 'zh' }: DemoProps) {
  const zh = locale !== 'en'
  const columns = Math.round(numberValue(values, 'columns', 3))
  const gap = numberValue(values, 'gap', 10)
  const base = numberValue(values, 'base', 64)
  const mode = stringValue(values, 'mode', 'masonry')
  const [tall, setTall] = useState<number[]>([])

  const toggle = (index: number) =>
    setTall((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index],
    )

  const masonry = mode === 'masonry'

  return (
    <div className="w-full max-w-xs">
      <div
        style={
          masonry
            ? { columnCount: columns, columnGap: gap }
            : { display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap }
        }
      >
        {LABELS.map((item, index) => {
          const label = pick(item, locale)
          const height =
            Math.round(base * FACTORS[index % FACTORS.length]) + (tall.includes(index) ? 36 : 0)
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(index)}
              className="block w-full rounded-lg border p-2 text-left"
              style={{
                height,
                marginBottom: masonry ? gap : 0,
                breakInside: 'avoid',
                borderColor: 'color-mix(in srgb, var(--stage-ink) 20%, transparent)',
                background: 'color-mix(in srgb, var(--stage-ink) 9%, transparent)',
              }}
            >
              <span className="font-mono text-[10px] opacity-55">
                ${String(index + 1).padStart(2, '0')}
              </span>
              <span className="ml-1.5 text-[11px]">{label}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-center font-mono text-[10px] opacity-60">
        {zh
          ? `点方块换高度 · ${masonry ? '按列填充' : '按行对齐'}`
          : `Tap a tile to resize - ${masonry ? 'fills by column' : 'aligns by row'}`}
      </p>
    </div>
  )
}
