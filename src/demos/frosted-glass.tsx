import type { DemoProps } from '../data/types'
import { numberValue } from '../lib/controls'

// 米白 / 朱红 / 灰绿 / 浅石板：仍然能看出"面板背后有结构"，但不再是霓虹三原色；
// 四个都要在深色顶部站得住
const SWATCHES = ['#f4f2ec', '#c9382a', '#7f8f7a', '#8fa3a8']

export default function FrostedGlassDemo({ values, stage, locale = 'zh' }: DemoProps) {
  const zh = locale !== 'en'
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
          // 0deg 是"从下往上"：底部浅沙、顶部深棕。
          // 面板压在底部（文字的深/浅是按舞台定的），那块必须是浅色才不会深底深字；
          // 顶部放圆点和说明文字，深底才衬得出白色文字。
          background:
            'linear-gradient(0deg, #f2e4c8 0%, #d9a06a 34%, #a8562f 64%, #4a3b33 100%)',
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
          {zh ? '这些圆点和文字是「面板背后的内容」。模糊半径越大，它们越糊。' : 'These dots and this text sit behind the panel. Raise the blur radius and they get fuzzier.'}
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
        <p className="font-display text-sm font-semibold">{zh ? '毛玻璃面板' : 'Frosted glass panel'}</p>
        <p className="mt-0.5 text-[11px] opacity-75">
          {zh ? '面板自身的文字是清晰的，只有背后被糊了' : 'The panel text stays sharp; only what is behind it gets blurred'}
        </p>
      </div>
    </div>
  )
}
