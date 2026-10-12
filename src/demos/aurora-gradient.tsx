import { type CSSProperties } from 'react'
import type { DemoProps } from '../data/types'
import { numberValue, stringValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'
import { pick } from '../i18n/pick'

const T = {
  aria: { zh: '极光渐变背景演示', en: 'Aurora gradient demo' },
  reduced: { zh: '已开启减少动态效果，光斑停住', en: 'Reduced motion is on: the blobs hold still' },
} as const

// 配色是这类效果的主体，所以这里写死色值（和 mesh-gradient 一样是刻意的例外）
const PALETTES: Record<string, string[]> = {
  aurora: ['#34d399', '#6366f1', '#a855f7', '#22d3ee', '#818cf8', '#4ade80'],
  sunset: ['#f97316', '#ec4899', '#8b5cf6', '#fb7185', '#f59e0b', '#e879f9'],
}

const SPOTS = [
  { left: '-10%', top: '10%', size: '60%' },
  { left: '35%', top: '-15%', size: '55%' },
  { left: '10%', top: '55%', size: '65%' },
  { left: '60%', top: '35%', size: '50%' },
  { left: '-5%', top: '70%', size: '45%' },
  { left: '70%', top: '75%', size: '40%' },
]

export default function AuroraGradientDemo({ values, locale = 'zh' }: DemoProps) {
  const blobs = Math.round(numberValue(values, 'blobs', 4))
  const blur = numberValue(values, 'blur', 80)
  const duration = numberValue(values, 'duration', 30)
  const palette = stringValue(values, 'palette', 'aurora')
  const reduced = usePrefersReducedMotion()

  const colors = PALETTES[palette] ?? PALETTES.aurora
  const base: CSSProperties = {
    background: 'radial-gradient(120% 120% at 50% 0%, #0b1220 0%, #060911 60%, #04060c 100%)',
  }

  return (
    <div className="w-full max-w-md" aria-label={pick(T.aria, locale)}>
      <style>
        {'@keyframes dm-visual-aurora { 0% { transform: translate3d(-8%, 0, 0) scale(1); } 50% { transform: translate3d(9%, 6%, 0) scale(1.18); } 100% { transform: translate3d(-8%, 0, 0) scale(1); } }'}
      </style>
      <div className="relative h-52 overflow-hidden rounded-xl" style={base}>
        {SPOTS.slice(0, blobs).map((spot, index) => (
          <span
            key={index}
            aria-hidden
            className="absolute rounded-full"
            style={{
              left: spot.left,
              top: spot.top,
              width: spot.size,
              aspectRatio: '1 / 1',
              background: 'radial-gradient(circle, ' + colors[index % colors.length] + ' 0%, transparent 70%)',
              filter: 'blur(' + blur + 'px) saturate(140%)',
              mixBlendMode: 'screen',
              animation: reduced
                ? undefined
                : 'dm-visual-aurora ' + (duration + index * 4) + 's ease-in-out ' + index * 1.5 + 's infinite',
            }}
          />
        ))}
        <div className="relative flex h-full items-end justify-between p-3">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.82)' }}>
            {locale === 'en' ? 'Aurora' : '极光'}
          </span>
          {reduced ? (
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {pick(T.reduced, locale)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
