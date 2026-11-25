import type { DemoProps } from '../data/types'
import { numberValue, stringValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'
import { pick } from '../i18n/pick'

const T = {
  aria: { zh: '流星雨演示', en: 'Meteor shower demo' },
  hint: { zh: '慢一点看，尾迹比流星本身更长', en: 'Watch slowly: the tail is longer than the meteor' },
  reduced: { zh: '已开启减少动态效果：流星停住，只留斜向光带', en: 'Reduced motion is on: the meteors hold still as diagonal streaks' },
} as const

// 固定种子而不是 Math.random：服务端预渲染与客户端水合必须画出同一片天空
const SEEDS = [
  { left: 4, top: 6, delay: 0, length: 120, factor: 1 },
  { left: 38, top: 2, delay: 0.6, length: 90, factor: 0.9 },
  { left: 66, top: 10, delay: 1.4, length: 150, factor: 1.15 },
  { left: 18, top: 22, delay: 2.1, length: 110, factor: 0.85 },
  { left: 52, top: 18, delay: 0.3, length: 135, factor: 1.05 },
  { left: 78, top: 30, delay: 2.8, length: 100, factor: 0.95 },
  { left: 8, top: 44, delay: 1.1, length: 145, factor: 1.1 },
  { left: 44, top: 40, delay: 3.3, length: 95, factor: 0.8 },
  { left: 70, top: 48, delay: 1.9, length: 125, factor: 1.2 },
  { left: 28, top: 58, delay: 0.9, length: 105, factor: 0.9 },
  { left: 58, top: 62, delay: 2.5, length: 140, factor: 1 },
  { left: 86, top: 56, delay: 3.8, length: 85, factor: 0.85 },
]

const STARS = [
  { left: 12, top: 14, size: 2 },
  { left: 31, top: 8, size: 1 },
  { left: 47, top: 26, size: 2 },
  { left: 63, top: 4, size: 1 },
  { left: 81, top: 18, size: 1 },
  { left: 22, top: 34, size: 1 },
  { left: 91, top: 42, size: 2 },
  { left: 5, top: 30, size: 1 },
]

export default function MeteorShowerDemo({ values, stage, locale = 'zh' }: DemoProps) {
  const count = Math.round(numberValue(values, 'count', 8))
  const duration = numberValue(values, 'duration', 3)
  const angle = Number(stringValue(values, 'angle', '45'))
  const reduced = usePrefersReducedMotion()
  const zh = locale !== 'en'

  return (
    <div
      data-stage={stage}
      className="relative w-full max-w-md overflow-hidden rounded-xl"
      style={{
        minHeight: 260,
        background:
          'radial-gradient(120% 120% at 82% 0%, color-mix(in srgb, var(--stage-ink) 12%, transparent), transparent 62%)',
        border: '1px solid color-mix(in srgb, var(--stage-ink) 10%, transparent)',
      }}
      aria-label={pick(T.aria, locale)}
    >
      <style>
        {'@keyframes dm-meteor { 0% { transform: translate3d(0, 0, 0); opacity: 0; } 8% { opacity: 0.9; } 72% { opacity: 0.5; } 100% { transform: translate3d(320px, 0, 0); opacity: 0; } }'}
      </style>
      {STARS.map((star, index) => (
        <span
          key={'star-' + index}
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            left: star.left + '%',
            top: star.top + '%',
            width: star.size,
            height: star.size,
            background: 'color-mix(in srgb, var(--stage-ink) 35%, transparent)',
          }}
        />
      ))}
      {SEEDS.slice(0, count).map((seed, index) => (
        <span
          key={'meteor-' + index}
          aria-hidden="true"
          className="absolute block"
          style={{
            left: seed.left + '%',
            top: seed.top + '%',
            width: seed.length,
            height: 2,
            transform: 'rotate(' + angle + 'deg)',
            transformOrigin: 'left center',
          }}
        >
          <span
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              borderRadius: 999,
              background:
                'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--stage-ink) 55%, transparent) 76%, var(--stage-ink) 100%)',
              animation: reduced
                ? undefined
                : 'dm-meteor ' +
                  (duration * seed.factor).toFixed(2) +
                  's linear ' +
                  (-seed.delay).toFixed(2) +
                  's infinite',
              willChange: reduced ? undefined : 'transform, opacity',
            }}
          />
        </span>
      ))}
      <div className="relative flex h-full flex-col justify-end gap-1 p-4" style={{ minHeight: 260 }}>
        <p className="font-display text-lg font-semibold" style={{ color: 'var(--stage-ink)' }}>
          {zh ? '夜空下的发布' : 'A launch under the night sky'}
        </p>
        <p className="text-[11px] opacity-70">{reduced ? pick(T.reduced, locale) : pick(T.hint, locale)}</p>
      </div>
    </div>
  )
}
