import { useEffect, useState } from 'react'
import type { DemoProps } from '../data/types'
import { boolValue, numberValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'
import { pick } from '../i18n/pick'

const T = {
  aria: { zh: '等宽数字演示', en: 'Tabular numbers demo' },
  label: { zh: '本月访问', en: 'Visits this month' },
  table: { zh: '订单金额', en: 'Order total' },
  reduced: { zh: '已开启减少动态效果，数字不再变化', en: 'Reduced motion is on: the numbers hold still' },
} as const

const STEPS = [9, 148, 1287, 12864, 96, 1043, 12908]
const PRICES = ['9.9', '128.05', '1287.4', '96.25']

export default function TabularNumbersDemo({ values, locale = 'zh' }: DemoProps) {
  const tabular = boolValue(values, 'tabular', true)
  const compare = boolValue(values, 'compare', true)
  const interval = numberValue(values, 'interval', 700)
  const reduced = usePrefersReducedMotion()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (reduced) return
    const timer = window.setInterval(() => setStep((current) => (current + 1) % STEPS.length), interval)
    return () => window.clearInterval(timer)
  }, [interval, reduced])

  const value = STEPS[step]
  const figures = tabular ? 'tabular-nums' : 'proportional-nums'
  const boxStyle = {
    border: '1px solid color-mix(in srgb, var(--stage-ink) 18%, transparent)',
    background: 'color-mix(in srgb, var(--stage-ink) 4%, transparent)',
  }
  const numberStyle = {
    color: 'var(--stage-ink)',
    fontVariantNumeric: figures,
    minWidth: '6ch',
    textAlign: 'right' as const,
  }

  return (
    <div className="w-full max-w-sm" aria-label={pick(T.aria, locale)}>
      <div className="flex items-baseline justify-between gap-3 rounded-lg border px-3 py-2" style={boxStyle}>
        <span className="text-[11px]" style={{ color: 'var(--stage-muted)' }}>
          {pick(T.label, locale)}
        </span>
        <span className="font-mono text-lg" style={numberStyle}>
          {value.toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN')}
        </span>
      </div>

      {compare ? (
        <div
          className="mt-2 flex items-baseline justify-between gap-3 rounded-lg border px-3 py-2"
          style={{ ...boxStyle, borderStyle: 'dashed' }}
        >
          <span className="text-[11px]" style={{ color: 'var(--stage-muted)' }}>
            {locale === 'en' ? 'proportional' : '默认比例数字'}
          </span>
          <span className="font-mono text-lg" style={{ ...numberStyle, fontVariantNumeric: 'proportional-nums' }}>
            {value.toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN')}
          </span>
        </div>
      ) : null}

      <div className="mt-2 rounded-lg border px-3 py-2" style={boxStyle}>
        <span className="text-[11px]" style={{ color: 'var(--stage-muted)' }}>
          {pick(T.table, locale)}
        </span>
        <div className="mt-1 flex flex-col gap-1">
          {PRICES.map((price) => (
            <span key={price} className="font-mono text-xs" style={numberStyle}>
              {price}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-2 text-[11px]" style={{ color: 'var(--stage-muted)' }}>
        font-variant-numeric: {tabular ? 'tabular-nums' : 'proportional-nums'}
        {reduced ? ' · ' + pick(T.reduced, locale) : ''}
      </p>
    </div>
  )
}
