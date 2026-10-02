import { useState } from 'react'
import type { DemoProps } from '../data/types'
import { pick } from '../i18n/pick'
import { boolValue, numberValue, stringValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

const ITEMS = [
  {
    q: { zh: '怎么改参数？', en: 'How do I change the params?' },
    a: { zh: '拖上面的滑块，面板和动画时长立刻跟着变。', en: 'Drag the sliders above; the panel and duration update live.' },
  },
  {
    q: { zh: '能同时开两个吗？', en: 'Can two open at once?' },
    a: { zh: '把「展开模式」切到多开，就能一项一项都展开。', en: 'Switch Expand mode to multiple and every item can stay open.' },
  },
  {
    q: { zh: '什么时候该用？', en: 'When should I use this?' },
    a: { zh: '一屏放不下、又不想跳页的说明文字，用折叠最省地方。', en: 'For supporting text that will not fit on one screen without a page jump.' },
  },
  {
    q: { zh: '内容太多怎么办？', en: 'What if there is too much?' },
    a: { zh: '超过五六项就分组，或者干脆换成一页一个的 tabs。', en: 'Group past five or six items, or move to one page per tab.' },
  },
]

export default function AccordionDemo({ values, replayKey, locale = 'zh' }: DemoProps) {
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
        const q = pick(item.q, locale)
        const a = pick(item.a, locale)
        const isOpen = open.includes(index)
        return (
          <div
            key={q}
            className="overflow-hidden rounded-lg border"
            style={{ borderColor: 'color-mix(in srgb, var(--stage-ink) 22%, transparent)' }}
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
            >
              <span className="text-xs font-medium">{q}</span>
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
                  {a}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
