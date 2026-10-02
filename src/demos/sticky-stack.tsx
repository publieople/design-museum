import { useRef, useState } from 'react'
import type { DemoProps } from '../data/types'
import { numberValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

const CARD_HEIGHT = 76
const CARD_GAP = 10
const PAD = 12

const CARDS = [
  { title: '总览', note: '今天的用量' },
  { title: '用量', note: '峰值在下午' },
  { title: '设置', note: '只改了通知' },
  { title: '团队', note: '新加了一位成员' },
  { title: '账单', note: '下月改年付' },
  { title: '归档', note: '还留着两版' },
]

export default function StickyStackDemo({ values, replayKey }: DemoProps) {
  const offset = numberValue(values, 'offset', 14)
  const count = Math.round(numberValue(values, 'count', 4))
  const shrink = numberValue(values, 'shrink', 5)
  const radius = numberValue(values, 'radius', 14)
  const reduced = usePrefersReducedMotion()

  const boxRef = useRef<HTMLDivElement | null>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const cards = CARDS.slice(0, count)
  const shrinkRate = reduced ? 0 : shrink / 100

  return (
    <div className="w-full max-w-xs">
      <div
        ref={boxRef}
        key={replayKey}
        onScroll={() => setScrollTop(boxRef.current?.scrollTop ?? 0)}
        tabIndex={0}
        aria-label="粘性堆叠演示，可上下滚动"
        className="h-60 overflow-y-auto overscroll-contain rounded-xl"
        style={{
          padding: PAD,
          background: 'color-mix(in srgb, var(--stage-ink) 6%, transparent)',
        }}
      >
        {cards.map((card, index) => {
          const top = PAD + index * (CARD_HEIGHT + CARD_GAP)
          const stickAt = top - index * offset
          const progress = Math.min(1, Math.max(0, (scrollTop - stickAt) / CARD_HEIGHT))
          const scale = 1 - progress * shrinkRate
          return (
            <article
              key={card.title}
              className="sticky flex flex-col justify-between rounded-xl border p-3"
              style={{
                top: index * offset,
                height: CARD_HEIGHT,
                marginBottom: CARD_GAP,
                zIndex: index + 1,
                transform: `scale(${scale.toFixed(3)})`,
                transformOrigin: 'top center',
                borderRadius: radius,
                borderColor: 'color-mix(in srgb, var(--stage-ink) 22%, transparent)',
                background: `color-mix(in srgb, var(--stage-ink) ${10 + index * 6}%, transparent)`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{card.title}</span>
                <span className="font-mono text-[10px] opacity-55">
                  ${index + 1}/${cards.length}
                </span>
              </div>
              <p className="text-[11px] opacity-70">{card.note}</p>
            </article>
          )
        })}
      </div>
      <p className="mt-2 text-center font-mono text-[10px] opacity-60">
        ↑↓ 在框里滚动，卡片会一张张叠上来
      </p>
    </div>
  )
}