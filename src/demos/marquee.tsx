import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { DemoProps } from '../data/types'
import { boolValue, numberValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'
import { pick } from '../i18n/pick'

const T = {
  hint: { zh: '指针移上去会暂停', en: 'Hover to pause' },
  reduced: { zh: '已开启减少动态效果，跑马灯停住', en: 'Reduced motion is on: the marquee stays still' },
  aria: { zh: '跑马灯演示', en: 'Marquee demo' },
} as const

const ITEMS_ZH = ['毛玻璃', '视差滚动', '交错进场', '数字滚动', '命令面板', '滚动捕捉']
const ITEMS_EN = ['Frosted glass', 'Parallax', 'Stagger', 'Count up', 'Command palette', 'Scroll snap']

/** 一份内容的近似宽度：6 个标签加上间距，用来把 px/s 换算成动画时长 */
const TRACK_WIDTH = 520

export default function MarqueeDemo({ values, locale = 'zh' }: DemoProps) {
  const speed = numberValue(values, 'speed', 40)
  const pauseOnHover = boolValue(values, 'pauseOnHover', true)
  const edgeMask = boolValue(values, 'edgeMask', true)
  const reduced = usePrefersReducedMotion()
  const [hovered, setHovered] = useState(false)

  const items = locale === 'en' ? ITEMS_EN : ITEMS_ZH
  const duration = TRACK_WIDTH / Math.max(speed, 1)
  const paused = reduced || (pauseOnHover && hovered)

  const trackStyle: CSSProperties = reduced
    ? {}
    : {
        animation: 'dm-layout-marquee ' + duration.toFixed(2) + 's linear infinite',
        animationPlayState: paused ? 'paused' : 'running',
      }

  const maskStyle: CSSProperties = edgeMask
    ? {
        maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
      }
    : {}

  const lane = (hidden: boolean) => (
    <div className="flex shrink-0 items-center gap-2 pr-2" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full px-3 py-1 text-xs whitespace-nowrap"
          style={{
            border: '1px solid color-mix(in srgb, var(--stage-ink) 20%, transparent)',
            color: 'var(--stage-ink)',
            background: 'color-mix(in srgb, var(--stage-ink) 6%, transparent)',
          }}
        >
          {item}
        </span>
      ))}
    </div>
  )

  return (
    <div className="w-full max-w-sm" aria-label={pick(T.aria, locale)}>
      <style>
        {'@keyframes dm-layout-marquee { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(-50%, 0, 0); } }'}
      </style>
      <div
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        className="overflow-hidden rounded-xl border py-3"
        style={{
          ...maskStyle,
          borderColor: 'color-mix(in srgb, var(--stage-ink) 18%, transparent)',
          background: 'color-mix(in srgb, var(--stage-ink) 3%, transparent)',
        }}
      >
        <div className="flex w-max" style={trackStyle}>
          {lane(false)}
          {lane(true)}
        </div>
      </div>
      <p className="mt-2 text-[11px]" style={{ color: 'var(--stage-muted)' }}>
        {reduced ? pick(T.reduced, locale) : pick(T.hint, locale)}
      </p>
    </div>
  )
}
