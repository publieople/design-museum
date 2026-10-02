import type { DemoProps } from '../data/types'
import { numberValue } from '../lib/controls'

const SWATCHES = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2']

export default function FrostedGlassDemo({ values, stage }: DemoProps) {
  const blur = numberValue(values, 'blur', 12)
  const saturate = numberValue(values, 'saturate', 180)
  const alpha = numberValue(values, 'alpha', 8) / 100
  const radius = numberValue(values, 'radius', 14)
  const lightText = stage === 'dark' || stage === 'accent'

  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-lg">
      {/* 背景内容：毛玻璃必须有东西可糊 */}
      <div
        className="flex h-52 flex-col justify-between p-4"
        style={{
          background:
            'linear-gradient(135deg, #2b1b4d 0%, #6d3b8f 40%, #d95f7a 70%, #f2b880 100%)',
        }}
      >
        <div className="flex gap-2">
          {SWATCHES.map((color) => (
            <span
              key={color}
              className="size-7 rounded-full"
              style={{ background: color }}
              aria-hidden="true"
            />
          ))}
        </div>
        <p
          className="max-w-[15rem] text-xs font-medium leading-snug"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          这些圆点和文字是「面板背后的内容」。模糊半径越大，它们越糊。
        </p>
      </div>

      <div
        className="absolute inset-x-4 bottom-4 p-3.5"
        style={{
          backdropFilter: `blur(${blur}px) saturate(${saturate}%)`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(${saturate}%)`,
          background: `rgba(255,255,255,${alpha})`,
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: radius,
          color: lightText ? '#ffffff' : '#16161a',
        }}
      >
        <p className="font-display text-sm font-semibold">毛玻璃面板</p>
        <p className="mt-0.5 text-[11px] opacity-75">
          面板自身的文字是清晰的，只有背后被糊了
        </p>
      </div>
    </div>
  )
}
