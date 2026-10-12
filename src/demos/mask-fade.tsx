import { type CSSProperties } from 'react'
import type { DemoProps } from '../data/types'
import { boolValue, numberValue, stringValue } from '../lib/controls'
import { pick } from '../i18n/pick'

const T = {
  aria: { zh: '边缘渐隐演示', en: 'Mask fade demo' },
  hint: { zh: '滑一下，两端会淡掉', en: 'Scroll it: both ends fade out' },
  hard: { zh: '对照：现在是硬切', en: 'Comparison: hard clip right now' },
} as const

const ROWS_ZH = ['毛玻璃', '视差滚动', '交错进场', '数字滚动', '命令面板', '滚动捕捉', '粘性头部', '涟漪反馈', '边缘渐隐']
const ROWS_EN = ['Frosted glass', 'Parallax', 'Stagger', 'Count up', 'Command palette', 'Scroll snap', 'Sticky header', 'Ripple', 'Mask fade']

export default function MaskFadeDemo({ values, locale = 'zh' }: DemoProps) {
  const fade = numberValue(values, 'fade', 12)
  const axis = stringValue(values, 'axis', 'x') === 'y' ? 'y' : 'x'
  const hardEdge = boolValue(values, 'hardEdge', false)

  const items = locale === 'en' ? ROWS_EN : ROWS_ZH
  const gradient =
    axis === 'x'
      ? `linear-gradient(90deg, transparent, #000 ${fade}%, #000 ${100 - fade}%, transparent)`
      : `linear-gradient(180deg, transparent, #000 ${fade}%, #000 ${100 - fade}%, transparent)`

  const maskStyle: CSSProperties = hardEdge
    ? {}
    : { maskImage: gradient, WebkitMaskImage: gradient }

  return (
    <div className="w-full max-w-sm" aria-label={pick(T.aria, locale)}>
      <div
        className={
          axis === 'x'
            ? 'overflow-x-auto overscroll-x-contain rounded-xl border'
            : 'h-40 overflow-y-auto overscroll-contain rounded-xl border'
        }
        style={{
          ...maskStyle,
          borderColor: 'color-mix(in srgb, var(--stage-ink) 18%, transparent)',
          background: 'color-mix(in srgb, var(--stage-ink) 3%, transparent)',
        }}
      >
        <div className={axis === 'x' ? 'flex w-max gap-2 p-3' : 'flex flex-col gap-2 p-3'}>
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
      </div>
      <p className="mt-2 text-[11px]" style={{ color: 'var(--stage-muted)' }}>
        {hardEdge ? pick(T.hard, locale) : pick(T.hint, locale)}
      </p>
    </div>
  )
}
