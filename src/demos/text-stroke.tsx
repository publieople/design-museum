import type { DemoProps } from '../data/types'
import { boolValue, numberValue } from '../lib/controls'
import { pick } from '../i18n/pick'

const T = {
  aria: { zh: '描边文字演示', en: 'Text stroke demo' },
  hollow: { zh: '空心：只有轮廓', en: 'Hollow: outline only' },
  solid: { zh: '描边 + 实心填充', en: 'Stroke over a solid fill' },
} as const

export default function TextStrokeDemo({ values, locale = 'zh' }: DemoProps) {
  const width = numberValue(values, 'width', 2)
  const size = numberValue(values, 'size', 56)
  const fill = boolValue(values, 'fill', false)

  const word = locale === 'en' ? 'MUSEUM' : '设计博物馆'

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3" aria-label={pick(T.aria, locale)}>
      <span
        className="text-center leading-none font-semibold"
        style={{
          fontSize: size,
          letterSpacing: '0.02em',
          color: fill ? 'var(--stage-ink)' : 'transparent',
          WebkitTextStroke: width + 'px var(--stage-ink)',
          paintOrder: 'stroke fill',
        }}
      >
        {word}
      </span>
      <span className="font-mono text-[10px]" style={{ color: 'var(--stage-muted)' }}>
        {width}px / {size}px · {fill ? pick(T.solid, locale) : pick(T.hollow, locale)}
      </span>
    </div>
  )
}
