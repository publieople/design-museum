import { useState } from 'react'
import type { DemoProps } from '../data/types'
import { numberValue, stringValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

const CARDS = [
  { title: '词条卡片', titleEn: 'Specimen card', meta: 'visual / frosted-glass' },
  { title: 'demo 缩略图', titleEn: 'Demo thumbnail', meta: 'motion / stagger' },
  { title: '速查表一节', titleEn: 'Cheat sheet row', meta: 'layout / sticky-header' },
]

export default function HoverLiftDemo({ values, stage, locale = 'zh' }: DemoProps) {
  const lift = numberValue(values, 'lift', 6)
  const duration = numberValue(values, 'duration', 200)
  const shadow = numberValue(values, 'shadow', 45)
  const easing = stringValue(values, 'easing', 'cubic-bezier(0.22, 1, 0.36, 1)')
  const reduced = usePrefersReducedMotion()
  const [hovered, setHovered] = useState<string | null>(null)
  const dark = stage === 'dark' || stage === 'accent'
  const zh = locale !== 'en'

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      {CARDS.map((card) => {
        const active = hovered === card.title
        const shadowAlpha = ((shadow / 100) * 0.3).toFixed(2)
        return (
          <button
            key={card.title}
            type="button"
            onPointerEnter={() => setHovered(card.title)}
            onPointerLeave={() => setHovered(null)}
            onFocus={() => setHovered(card.title)}
            onBlur={() => setHovered(null)}
            className="cursor-pointer rounded-lg px-3 py-2.5 text-left"
            style={{
              border: '1px solid color-mix(in srgb, var(--stage-ink) 20%, transparent)',
              background: dark
                ? 'color-mix(in srgb, var(--stage-ink) 8%, transparent)'
                : 'color-mix(in srgb, var(--stage-ink) 4%, transparent)',
              color: 'var(--stage-ink)',
              transform: active && !reduced ? 'translateY(-' + lift + 'px) scale(1.02)' : 'none',
              boxShadow: active
                ? '0 10px 24px rgba(0, 0, 0, ' + shadowAlpha + ')'
                : '0 1px 2px rgba(0, 0, 0, 0.06)',
              transition:
                'transform ' + duration + 'ms ' + easing + ', box-shadow ' + duration + 'ms ' + easing,
            }}
          >
            <p className="font-display text-sm font-semibold">{zh ? card.title : card.titleEn}</p>
            <p className="mt-0.5 font-mono text-[10px] opacity-55">{card.meta}</p>
          </button>
        )
      })}
      <p className="mt-1 text-center font-mono text-[10px] opacity-60">
        {zh ? '把指针移到卡片上，看它抬起来' : 'Hover a card to watch it lift'}
      </p>
    </div>
  )
}
