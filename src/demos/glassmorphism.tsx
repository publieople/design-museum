import type { DemoProps } from '../data/types'
import { numberValue } from '../lib/controls'

const BLOBS = [
  { color: '#ff7a59', top: '-12%', left: '-10%', size: '58%' },
  { color: '#7b2ff7', top: '14%', left: '50%', size: '64%' },
  { color: '#06d6a0', top: '54%', left: '4%', size: '52%' },
  { color: '#1f6feb', top: '62%', left: '58%', size: '60%' },
]

export default function GlassmorphismDemo({ values, locale = 'zh' }: DemoProps) {
  const zh = locale !== 'en'
  const blur = numberValue(values, 'blur', 16)
  const border = numberValue(values, 'border', 30) / 100
  const shadow = numberValue(values, 'shadow', 30) / 100
  const radius = numberValue(values, 'radius', 18)

  return (
    <div className="w-full max-w-sm">
      <div
        className="relative flex h-56 items-end overflow-hidden rounded-2xl"
        style={{ background: '#12101c' }}
      >
        {BLOBS.map((blob) => (
          <span
            key={blob.color}
            aria-hidden="true"
            className="absolute rounded-full"
            style={{
              top: blob.top,
              left: blob.left,
              width: blob.size,
              aspectRatio: '1',
              background: blob.color,
              filter: 'blur(28px)',
              opacity: 0.85,
            }}
          />
        ))}

        <div
          className="relative m-4 w-[calc(100%-2rem)] p-4"
          style={{
            backdropFilter: `blur(${blur}px) saturate(160%)`,
            WebkitBackdropFilter: `blur(${blur}px) saturate(160%)`,
            background: 'linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06))',
            border: `1px solid rgba(255,255,255,${border})`,
            boxShadow: `0 8px 32px rgba(0,0,0,${shadow}), inset 0 1px 0 rgba(255,255,255,${Math.min(1, border + 0.2)})`,
            borderRadius: radius,
            color: '#ffffff',
          }}
        >
          <p className="font-display text-sm font-semibold">{zh ? '玻璃拟态卡片' : 'Glassmorphism card'}</p>
          <p className="mt-1 text-[11px] leading-relaxed opacity-80">
            {zh ? '背后是彩色色斑，面板把颜色透一点上来，再被模糊开。' : 'Color blobs sit behind; the panel lets some color through and blurs it.'}
          </p>
          <span
            className="mt-3 inline-block rounded-full px-3 py-1 font-mono text-[10px]"
            style={{ background: 'rgba(255,255,255,0.22)' }}
          >
            glassmorphism
          </span>
        </div>
      </div>
      <p
        className="mt-2 text-center font-mono text-[10px] opacity-60"
        style={{ color: 'var(--stage-ink)' }}
      >
        {zh ? '把「描边不透明度」拖到 0，玻璃感就塌了' : 'Drag Border opacity to 0 and the glass collapses'}
      </p>
    </div>
  )
}
