import { useRef, useState } from 'react'
import type { DemoProps } from '../data/types'
import { pick } from '../i18n/pick'
import { boolValue, numberValue, stringValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

const SLIDES = [
  { zh: '概览', en: 'Overview' },
  { zh: '明细', en: 'Details' },
  { zh: '图表', en: 'Chart' },
  { zh: '备注', en: 'Notes' },
  { zh: '导出', en: 'Export' },
]
const GAP = 10

export default function ScrollSnapDemo({ values, replayKey, locale = 'zh' }: DemoProps) {
  const zh = locale !== 'en'
  const snapRaw = stringValue(values, 'snap', 'x mandatory')
  const padding = numberValue(values, 'padding', 12)
  const alignRaw = stringValue(values, 'align', 'start')
  const stop = boolValue(values, 'stop', true)
  const reduced = usePrefersReducedMotion()

  const snap: 'none' | 'x proximity' | 'x mandatory' =
    snapRaw === 'none' ? 'none' : snapRaw === 'x proximity' ? 'x proximity' : 'x mandatory'
  const align: 'start' | 'center' | 'end' =
    alignRaw === 'center' ? 'center' : alignRaw === 'end' ? 'end' : 'start'

  const boxRef = useRef<HTMLDivElement | null>(null)
  const [index, setIndex] = useState(0)

  const onScroll = () => {
    const node = boxRef.current
    if (!node) return
    const slides = Array.from(node.children) as HTMLElement[]
    let best = 0
    let bestDistance = Number.POSITIVE_INFINITY
    slides.forEach((slide, i) => {
      const distance = Math.abs(slide.offsetLeft - node.scrollLeft)
      if (distance < bestDistance) {
        bestDistance = distance
        best = i
      }
    })
    setIndex(best)
  }

  return (
    <div className="w-full max-w-xs">
      <div
        ref={boxRef}
        key={replayKey}
        onScroll={onScroll}
        tabIndex={0}
        aria-label={zh ? '滚动捕捉演示，可横向滚动' : 'Scroll snap demo, scroll horizontally'}
        className="overflow-x-auto overscroll-x-contain rounded-xl"
        style={{
          position: 'relative',
          display: 'flex',
          gap: GAP,
          padding,
          scrollSnapType: snap,
          scrollPadding: padding,
          scrollBehavior: reduced ? 'auto' : 'smooth',
          background: 'color-mix(in srgb, var(--stage-ink) 6%, transparent)',
        }}
      >
        {SLIDES.map((item, i) => {
          const label = pick(item, locale)
          return (
            <div
              key={label}
              className="flex h-24 shrink-0 flex-col justify-between rounded-lg border p-2.5"
              style={{
                flexBasis: '76%',
                scrollSnapAlign: align,
                scrollSnapStop: stop ? 'always' : 'normal',
                borderColor: 'color-mix(in srgb, var(--stage-ink) 20%, transparent)',
                background: 'color-mix(in srgb, var(--stage-ink) 10%, transparent)',
              }}
            >
              <span className="font-mono text-[10px] opacity-55">
                ${String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-xs font-medium">{label}</span>
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-center font-mono text-[10px] opacity-60">
        {zh
          ? `横向滑动，停在第 ${index + 1} / ${SLIDES.length} 张`
          : `Swipe sideways, stops on ${index + 1} / ${SLIDES.length}`}
      </p>
    </div>
  )
}
