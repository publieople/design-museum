import { useState } from 'react'
import type { DemoProps } from '../data/types'
import { boolValue, numberValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

export default function PressFeedbackDemo({ values, stage, locale = 'zh' }: DemoProps) {
  const scale = numberValue(values, 'scale', 0.96)
  const duration = numberValue(values, 'duration', 110)
  const spring = boolValue(values, 'spring', true)
  const reduced = usePrefersReducedMotion()
  const [pressed, setPressed] = useState(false)
  const [count, setCount] = useState(0)
  const dark = stage === 'dark' || stage === 'accent'
  const zh = locale !== 'en'

  const easing = spring ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' : 'ease-out'
  const activeScale = pressed && !reduced ? scale : 1
  const glow = dark ? 0.5 : 0.32

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-3">
      <button
        type="button"
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        onKeyDown={(event) => {
          if (event.key === ' ' || event.key === 'Enter') setPressed(true)
        }}
        onKeyUp={(event) => {
          if (event.key === ' ' || event.key === 'Enter') setPressed(false)
        }}
        onClick={() => setCount((value) => value + 1)}
        className="cursor-pointer rounded-full px-6 py-2.5 text-sm font-semibold text-white"
        style={{
          background: 'linear-gradient(135deg, #ff6b4a, #c9382a)',
          border: 'none',
          transform: 'scale(' + activeScale + ')',
          boxShadow: pressed
            ? '0 2px 8px rgba(0, 0, 0, 0.18)'
            : '0 8px 20px rgba(201, 56, 42, ' + glow + ')',
          transition:
            'transform ' + duration + 'ms ' + easing + ', box-shadow ' + duration + 'ms ease-out',
          touchAction: 'manipulation',
        }}
      >
        {zh ? '点我试试' : 'Press me'}
      </button>
      <p className="font-mono text-[11px] opacity-65" style={{ color: 'var(--stage-ink)' }}>
        {zh ? `已点击 ${count} 次` : `${count} clicks`}
      </p>
      <p className="text-center text-[11px] opacity-55" style={{ color: 'var(--stage-ink)' }}>
        {zh
          ? `按住缩小到 ${scale.toFixed(2)}，松开 ${duration}ms 内回弹`
          : `Squishes to ${scale.toFixed(2)} while held, springs back in ${duration}ms`}
      </p>
    </div>
  )
}
