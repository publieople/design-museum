import type { DemoProps } from '../data/types'
import { boolValue, numberValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

const BLOBS = [
  { at: '18% 20%', rgb: '255,122,89' },
  { at: '82% 16%', rgb: '255,209,102' },
  { at: '88% 82%', rgb: '6,214,160' },
  { at: '22% 86%', rgb: '17,138,178' },
  { at: '54% 52%', rgb: '123,47,247' },
] as const

function meshImage(spread: number) {
  const layers = BLOBS.map((blob, index) => {
    const end = index === BLOBS.length - 1 ? spread + 12 : spread
    return `radial-gradient(circle at ${blob.at}, rgba(${blob.rgb},0.95) 0%, rgba(${blob.rgb},0) ${end}%)`
  })
  return [...layers, '#101018'].join(', ')
}

export default function MeshGradientDemo({ values, replayKey, locale = 'zh' }: DemoProps) {
  const zh = locale !== 'en'
  const spread = numberValue(values, 'spread', 55)
  const softness = numberValue(values, 'softness', 0)
  const hue = numberValue(values, 'hue', 0)
  const drift = boolValue(values, 'drift', true)
  const reduced = usePrefersReducedMotion()
  const animated = drift && !reduced

  return (
    <div className="w-full max-w-sm">
      <style>{`
        @keyframes dm-visual-mesh-drift {
          0% { transform: scale(1.28) rotate(0deg); }
          50% { transform: scale(1.44) rotate(10deg); }
          100% { transform: scale(1.28) rotate(0deg); }
        }
      `}</style>
      <div className="relative h-52 w-full overflow-hidden rounded-2xl">
        <div
          key={replayKey}
          className="absolute inset-0"
          style={{
            background: meshImage(spread),
            filter: `blur(${softness}px) hue-rotate(${hue}deg)`,
            transform: animated ? undefined : 'scale(1.28)',
            animation: animated ? 'dm-visual-mesh-drift 18s ease-in-out infinite' : undefined,
          }}
        />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="font-display text-sm font-semibold text-white drop-shadow">{zh ? '渐变网格' : 'Mesh gradient'}</p>
          <p className="text-[11px] text-white/75">{zh ? '五层 radial-gradient 叠出来的色场' : 'A color field stacked from five radial-gradients'}</p>
        </div>
      </div>
      <p
        className="mt-2 text-center font-mono text-[10px] opacity-60"
        style={{ color: 'var(--stage-ink)' }}
      >
        {zh ? 'CSS 没有 mesh-gradient 属性，只能一层层叠' : 'CSS has no mesh-gradient property; you stack the layers'}
      </p>
    </div>
  )
}
