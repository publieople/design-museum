import { useRef, useState } from 'react'
import type { DemoProps } from '../data/types'
import { pick } from '../i18n/pick'
import { numberValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'
import { CARD_GAP, CARD_HEIGHT, PAD, STACK_VIEW, stackLayout } from './sticky-stack.layout'

const CARDS = [
  { title: { zh: '总览', en: 'Overview' }, note: { zh: '今天的用量', en: 'Usage today' } },
  { title: { zh: '用量', en: 'Usage' }, note: { zh: '峰值在下午', en: 'Peaks in the afternoon' } },
  { title: { zh: '设置', en: 'Settings' }, note: { zh: '只改了通知', en: 'Only changed notifications' } },
  { title: { zh: '团队', en: 'Team' }, note: { zh: '新加了一位成员', en: 'Added one member' } },
  { title: { zh: '账单', en: 'Billing' }, note: { zh: '下月改年付', en: 'Moving to yearly next month' } },
  { title: { zh: '归档', en: 'Archive' }, note: { zh: '还留着两版', en: 'Keeping two versions' } },
]

export default function StickyStackDemo({ values, replayKey, locale = 'zh' }: DemoProps) {
  const zh = locale !== 'en'
  const offset = numberValue(values, 'offset', 18)
  const count = Math.round(numberValue(values, 'count', 6))
  const shrink = numberValue(values, 'shrink', 5)
  const radius = numberValue(values, 'radius', 14)
  const reduced = usePrefersReducedMotion()

  const boxRef = useRef<HTMLDivElement | null>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const cards = CARDS.slice(0, count)
  const layout = stackLayout(count, offset)
  const shrinkRate = reduced ? 0 : shrink / 100

  return (
    <div className="w-full max-w-xs">
      <div
        ref={boxRef}
        key={replayKey}
        onScroll={() => setScrollTop(boxRef.current?.scrollTop ?? 0)}
        tabIndex={0}
        aria-label={zh ? '粘性堆叠演示，可上下滚动' : 'Sticky stack demo, scroll up and down'}
        className="overflow-y-auto overscroll-contain rounded-xl"
        style={{
          height: STACK_VIEW,
          padding: PAD,
          background: 'color-mix(in srgb, var(--stage-ink) 6%, transparent)',
        }}
      >
        {cards.map((card, index) => {
          const title = pick(card.title, locale)
          const top = PAD + index * (CARD_HEIGHT + CARD_GAP)
          const stickAt = top - index * offset
          const progress = Math.min(1, Math.max(0, (scrollTop - stickAt) / CARD_HEIGHT))
          const scale = 1 - progress * shrinkRate
          return (
            <article
              key={title}
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
                <span className="text-xs font-semibold">{title}</span>
                <span className="font-mono text-[10px] opacity-55">
                  ${index + 1}/{cards.length}
                </span>
              </div>
              <p className="text-[11px] opacity-70">{pick(card.note, locale)}</p>
            </article>
          )
        })}
        {/* 让最后一张也有地方吸附并停住；留白不足时后面的卡片永远压不上来 */}
        <div aria-hidden="true" style={{ height: layout.spacer }} />
      </div>
      <p className="mt-2 text-center font-mono text-[10px] opacity-60">
        {zh
          ? `↑↓ 在框里滚动，${cards.length} 张卡片一张张叠上来；框底那段留白是故意的，真实页面里那里是后续内容`
          : `↑↓ Scroll in the box and the ${cards.length} cards stack one by one. The blank stretch at the bottom is deliberate: in a real page that is the content below.`}
      </p>
    </div>
  )
}
