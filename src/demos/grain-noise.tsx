import type { DemoProps } from '../data/types'
import { boolValue, numberValue, stringValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'
import { noiseUrl } from '../lib/noise'

// 中间调暖色。之前是近黑的藏蓝渐变：overlay 混色压在暗色上本来就看不见
// （词条自己列的坑），暗底上噪点也没有对比度可言——所以"有和没有没区别"。
const GRADIENT =
  'linear-gradient(135deg, #1a1714 0%, #4a4238 36%, #9c8a6e 70%, #e8d9bd 100%)'

export default function GrainNoiseDemo({ values, replayKey, locale = 'zh' }: DemoProps) {
  const zh = locale !== 'en'
  const grain = numberValue(values, 'grain', 1.5)
  const opacity = numberValue(values, 'opacity', 10) / 100
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
      {/* 左半边有噪点、右半边没有：同尺寸相邻对比才看得出这层颗粒在干什么。
          裁切放在外层包裹上——内层是 inset:-25% 的抖动层，直接裁它 50% 不等于面板的 50%。 */}
      <div
        className="relative h-44 w-full overflow-hidden rounded-2xl"
        style={{ background: GRADIENT, isolation: 'isolate' }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ clipPath: 'inset(0 50% 0 0)' }}
        >
          <div
            key={replayKey}
            className="absolute"
            style={{
              inset: '-25%',
              backgroundImage: noise,
              backgroundRepeat: 'repeat',
              opacity,
              mixBlendMode: blendMode,
              animation: animated ? 'dm-visual-grain-jitter 0.7s steps(6, end) infinite' : undefined,
            }}
          />
        </div>
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-1/2 w-px"
          style={{ background: 'rgba(255,255,255,0.4)' }}
        />
        <div className="absolute inset-x-0 bottom-0 flex justify-between p-3 font-mono text-[10px] text-white/85">
          <span>{zh ? '有噪点' : 'With grain'}</span>
          <span>{zh ? '无噪点' : 'No grain'}</span>
        </div>
      </div>
      <p
        className="mt-2 text-center font-mono text-[10px] opacity-60"
        style={{ color: 'var(--stage-ink)' }}
      >
        {zh
          ? '同一块渐变：左半边压了一层颗粒，右半边没有'
          : 'One gradient: the left half carries a grain layer, the right half does not'}
      </p>
    </div>
  )
}
