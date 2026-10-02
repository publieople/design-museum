import { useState } from 'react'
import type { DemoProps } from '../data/types'
import { boolValue, numberValue, stringValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

const ITEMS = [
  { q: '怎么改参数？', a: '拖上面的滑块，面板和动画时长立刻跟着变。' },
  { q: '能同时开两个吗？', a: '把「展开模式」切到多开，就能一项一项都展开。' },
  { q: '什么时候该用？', a: '一屏放不下、又不想跳页的说明文字，用折叠最省地方。' },
  { q: '内容太多怎么办？', a: '超过五六项就分组，或者干脆换成一页一个的 tabs。' },
]

export default function AccordionDemo({ values, replayKey }: DemoProps) {
  const mode = stringValue(values, 'mode', 'single')
  const duration = numberValue(values, 'duration', 260)
  const easing = stringValue(values, 'easing', 'cubic-bezier(0.22, 1, 0.36, 1)')
  const rotate = boolValue(values, 'rotate', true)
  const reduced = usePrefersReducedMotion()

  const [open, setOpen] = useState<number[]>([0])

  const toggle = (index: number) =>
    setOpen((prev) => {
      if (prev.includes(index)) return prev.filter((item) => item !== index)
      return mode === 'single' ? [index] : [...prev, index]
    })

  const motion = reduced ? undefined : `${duration}ms ${easing}`

  return (
    <div key={replayKey} className="flex w-full max-w-xs flex-col gap-2">
      {ITEMS.map((item, index) => {
        const isOpen = open.includes(index)
        return (
          <div
            key={item.q}
            className="overflow-hidden rounded-lg border"
            style={{ borderColor: 'color-mix(in srgb, var(--stage-ink) 22%, transparent)' }}
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
            >
              <span className="text-xs font-medium">{item.q}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  transform: `rotate(${isOpen && rotate ? 180 : 0}deg)`,
                  transition: reduced ? undefined : `transform ${duration}ms ${easing}`,
                }}
              >
                <path
                  d="M2 4.5 6 8.5 10 4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div
              style={{
                display: 'grid',
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition: motion ? `grid-template-rows ${motion}` : undefined,
              }}
            >
              <div className="overflow-hidden">
                <p
                  className="px-3 pb-3 text-[11px] leading-relaxed"
                  style={{
                    transform: isOpen ? 'none' : 'translateY(-4px)',
                    opacity: isOpen ? 1 : 0.7,
                    transition: motion ? `opacity ${motion}, transform ${motion}` : undefined,
                  }}
                >
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}