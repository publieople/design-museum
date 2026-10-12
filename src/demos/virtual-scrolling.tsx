import { useCallback, useEffect, useRef, useState } from 'react'
import type { DemoProps } from '../data/types'
import { numberValue } from '../lib/controls'
import { pick } from '../i18n/pick'

const T = {
  hint: { zh: '↓ 在这个框里滚动', en: '↓ Scroll inside this box' },
  aria: { zh: '虚拟滚动列表演示', en: 'Virtual scrolling list demo' },
  rendered: { zh: '渲染', en: 'rendered' },
  rows: { zh: '行', en: 'rows' },
} as const

export default function VirtualScrollingDemo({ values, locale = 'zh' }: DemoProps) {
  const itemHeight = numberValue(values, 'itemHeight', 44)
  const total = numberValue(values, 'total', 10000)
  const overscan = numberValue(values, 'overscan', 4)
  const zh = locale !== 'en'

  const boxRef = useRef<HTMLDivElement | null>(null)
  const frame = useRef(0)
  const [window_, setWindow] = useState({ start: 0, count: 20 })

  const measure = useCallback(() => {
    const node = boxRef.current
    if (!node) return
    const first = Math.max(Math.floor(node.scrollTop / itemHeight) - overscan, 0)
    const visible = Math.ceil(node.clientHeight / itemHeight) + overscan * 2
    const count = Math.min(visible, Math.max(total - first, 0))
    setWindow((current) => (current.start === first && current.count === count ? current : { start: first, count }))
  }, [itemHeight, overscan, total])

  useEffect(() => {
    measure()
  }, [measure])

  const onScroll = () => {
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(measure)
  }

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const rows = Array.from({ length: window_.count }, (_, index) => window_.start + index)

  return (
    <div className="w-full max-w-sm">
      <div
        ref={boxRef}
        onScroll={onScroll}
        aria-label={pick(T.aria, locale)}
        className="h-56 overflow-y-auto overscroll-contain rounded-lg border"
        style={{
          borderColor: 'color-mix(in srgb, var(--stage-ink) 18%, transparent)',
          background: 'color-mix(in srgb, var(--stage-ink) 3%, transparent)',
        }}
      >
        <div style={{ height: total * itemHeight, position: 'relative' }}>
          <div style={{ transform: 'translateY(' + window_.start * itemHeight + 'px)' }}>
            {rows.map((row) => (
              <div
                key={row}
                aria-setsize={total}
                aria-posinset={row + 1}
                className="flex items-center justify-between px-3 text-xs"
                style={{
                  height: itemHeight,
                  color: 'var(--stage-ink)',
                  borderBottom: '1px solid color-mix(in srgb, var(--stage-ink) 10%, transparent)',
                }}
              >
                <span>{zh ? '第 ' + (row + 1) + ' 条' : 'Row ' + (row + 1)}</span>
                <span className="font-mono text-[10px]" style={{ color: 'var(--stage-muted)' }}>
                  {row + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-2 flex items-center justify-between text-[11px]" style={{ color: 'var(--stage-muted)' }}>
        <span>{pick(T.hint, locale)}</span>
        <span className="font-mono">
          {pick(T.rendered, locale)} {window_.count} / {total} {pick(T.rows, locale)}
        </span>
      </p>
    </div>
  )
}
