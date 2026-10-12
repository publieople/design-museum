import { useState, type CSSProperties } from 'react'
import { flushSync } from 'react-dom'
import type { DemoProps } from '../data/types'
import { boolValue, numberValue, stringValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'
import { pick } from '../i18n/pick'

const T = {
  list: { zh: '卡片列表', en: 'Card list' },
  detail: { zh: '详情页', en: 'Detail view' },
  back: { zh: '返回列表', en: 'Back to list' },
  open: { zh: '点一张卡片，看两屏怎么接起来', en: 'Tap a card and watch the two screens connect' },
  fallback: { zh: '这个浏览器还没有 View Transition API，切换是瞬间的', en: 'No View Transitions API here, so the switch is instant' },
  reduced: { zh: '已开启减少动态效果，切换是瞬间的', en: 'Reduced motion is on, so the switch is instant' },
  aria: { zh: '视图过渡演示，可在列表与详情之间切换', en: 'View transition demo, switch between list and detail' },
  shared: { zh: '共享元素', en: 'shared' },
} as const

type Doc = Document & { startViewTransition?: (callback: () => void) => { finished: Promise<void> } }

const CARDS = [0, 1, 2]

export default function ViewTransitionsDemo({ values, locale = 'zh' }: DemoProps) {
  const duration = numberValue(values, 'duration', 300)
  const easing = stringValue(values, 'easing', 'cubic-bezier(0.22, 1, 0.36, 1)')
  const shared = boolValue(values, 'shared', true)
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState<number | null>(null)

  const doc = typeof document === 'undefined' ? undefined : (document as Doc)
  const native = typeof doc?.startViewTransition === 'function' && !reduced

  const go = (next: number | null) => {
    if (!native || !doc?.startViewTransition) {
      setOpen(next)
      return
    }
    // flushSync：React 的更新默认是异步的，不刷进 DOM 的话 startViewTransition 拍不到新界面
    doc.startViewTransition(() => {
      flushSync(() => setOpen(next))
    })
  }

  const sharedName: CSSProperties | undefined = shared ? { viewTransitionName: 'dm-vt-card' } : undefined
  const frameStyle: CSSProperties = {
    borderColor: 'color-mix(in srgb, var(--stage-ink) 18%, transparent)',
    background: 'color-mix(in srgb, var(--stage-ink) 4%, transparent)',
  }
  const cardStyle: CSSProperties = { background: 'color-mix(in srgb, var(--stage-ink) 6%, transparent)' }

  return (
    <div className="w-full max-w-sm">
      <style>{'::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation-duration: ' + duration + 'ms; animation-timing-function: ' + easing + '; }'}</style>
      <div className="overflow-hidden rounded-xl border" style={frameStyle} aria-label={pick(T.aria, locale)}>
        {open === null ? (
          <div className="flex flex-col gap-2 p-3">
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--stage-muted)' }}>
              {pick(T.list, locale)}
            </span>
            {CARDS.map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => go(index)}
                className="flex items-center gap-3 rounded-lg p-2 text-left"
                style={cardStyle}
              >
                <span
                  className="h-10 w-10 shrink-0 rounded-md"
                  style={{
                    ...(index === 0 ? sharedName : undefined),
                    background: 'var(--stage-ink)',
                    opacity: 0.22 + index * 0.18,
                  }}
                />
                <span className="text-xs" style={{ color: 'var(--stage-ink)' }}>
                  {locale === 'en' ? 'Card ' + (index + 1) : '第 ' + (index + 1) + ' 张卡片'}
                </span>
                {index === 0 && shared ? (
                  <span className="ml-auto font-mono text-[10px]" style={{ color: 'var(--stage-muted)' }}>
                    {pick(T.shared, locale)}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-3">
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--stage-muted)' }}>
              {pick(T.detail, locale)}
            </span>
            <span
              className="h-20 w-full rounded-lg"
              style={{ ...sharedName, background: 'var(--stage-ink)', opacity: 0.3 + open * 0.18 }}
            />
            <span className="text-xs" style={{ color: 'var(--stage-ink)' }}>
              {locale === 'en' ? 'Detail for card ' + (open + 1) : '第 ' + (open + 1) + ' 张卡片的详情'}
            </span>
            <button
              type="button"
              onClick={() => go(null)}
              className="self-start rounded-md px-2 py-1 text-xs"
              style={{
                border: '1px solid color-mix(in srgb, var(--stage-ink) 25%, transparent)',
                color: 'var(--stage-ink)',
              }}
            >
              {pick(T.back, locale)}
            </button>
          </div>
        )}
      </div>
      <p className="mt-2 text-[11px]" style={{ color: 'var(--stage-muted)' }}>
        {reduced ? pick(T.reduced, locale) : native ? pick(T.open, locale) : pick(T.fallback, locale)}
      </p>
    </div>
  )
}
