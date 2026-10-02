import type { DemoProps } from '../data/types'
import { boolValue, numberValue, stringValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

function noiseUrl(frequency: number) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">' +
    '<filter id="dm-grain">' +
    `<feTurbulence type="fractalNoise" baseFrequency="${frequency}" numOctaves="3" stitchTiles="stitch"/>` +
    '</filter>' +
    '<rect width="100%" height="100%" filter="url(#dm-grain)"/>' +
    '</svg>'
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

const GRADIENT = 'linear-gradient(135deg, #0b1020 0%, #1b2340 35%, #3a2f55 68%, #6d4b6b 100%)'

export default function GrainNoiseDemo({ values, replayKey }: DemoProps) {
  const grain = numberValue(values, 'grain', 1.5)
  const opacity = numberValue(values, 'opacity', 8) / 100
  const blend = stringValue(values, 'blend', 'overlay')
  const flicker = boolValue(values, 'flicker', true)
  const reduced = usePrefersReducedMotion()

  const blendMode = blend === 'soft-light' || blend === 'normal' ? blend : 'overlay'
  const animated = flicker && !reduced
  const noise = noiseUrl(Number((1 / grain).toFixed(2)))

  return (
    <div className="w-full max-w-sm">
      <style>{`
        @keyframes dm-visual-grain-jitter {
          0% { transform: translate3d(-1.5%, -1%, 0); }
          25% { transform: translate3d(1%, -1.8%, 0); }
          50% { transform: translate3d(1.6%, 1.2%, 0); }
          75% { transform: translate3d(-0.8%, 1.5%, 0); }
          100% { transform: translate3d(-1.5%, -1%, 0); }
        }
      `}</style>
      <div
        className="relative h-40 w-full overflow-hidden rounded-2xl"
        style={{ background: GRADIENT, isolation: 'isolate' }}
      >
        <div
          key={replayKey}
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            inset: '-25%',
            backgroundImage: noise,
            backgroundRepeat: 'repeat',
            opacity,
            mixBlendMode: blendMode,
            animation: animated ? 'dm-visual-grain-jitter 0.7s steps(6, end) infinite' : undefined,
          }}
        />
        <p className="absolute inset-x-0 bottom-0 p-4 font-display text-sm font-semibold text-white/90">
          颗粒噪点压住渐变色带
        </p>
      </div>
      <div
        className="relative mt-2 h-10 w-full overflow-hidden rounded-lg"
        style={{ background: GRADIENT }}
      >
        <span className="absolute inset-0 grid place-items-center font-mono text-[10px] text-white/70">
          同样渐变，没有噪点
        </span>
      </div>
    </div>
  )
}
