import { useRef, useState } from 'react'
import type { DemoProps } from '../data/types'
import { boolValue, numberValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

export default function SpotlightGlowDemo({ values, replayKey }: DemoProps) {
  const radius = numberValue(values, 'radius', 220)
  const intensity = numberValue(values, 'intensity', 22) / 100
  const hue = numberValue(values, 'hue', 40)
  const follow = boolValue(values, 'follow', true)
  const reduced = usePrefersReducedMotion()
  const cardRef = useRef<HTMLDivElement | null>(null)
  const glowRef = useRef<HTMLDivElement | null>(null)
  const [hovering, setHovering] = useState(false)

  return (
    <div className="w-full max-w-sm">
      <style>{`
        @keyframes dm-visual-spotlight-idle {
          0% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 0.85; }
        }
      `}</style>
      <div
        ref={cardRef}
        className="relative h-44 w-full overflow-hidden rounded-2xl"
        style={{
          background: 'radial-gradient(140% 120% at 18% 0%, #21243a 0%, #0a0a10 72%)',
          border: '1px solid color-mix(in srgb, var(--stage-ink) 22%, transparent)',
          isolation: 'isolate',
        }}
        onPointerMove={(event) => {
          if (!follow) return
          const card = cardRef.current
          const glow = glowRef.current
          if (!card || !glow) return
          const rect = card.getBoundingClientRect()
          const dx = event.clientX - rect.left - rect.width / 2
          const dy = event.clientY - rect.top - rect.height / 2
          glow.style.transform = `translate3d(${dx}px, ${dy}px, 0)`
        }}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => {
          setHovering(false)
          const glow = glowRef.current
          if (glow) glow.style.transform = 'translate3d(0, 0, 0)'
        }}
      >
        <div
          key={`${follow ? 'follow' : 'static'}-${replayKey}`}
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left: '50%',
            top: '50%',
            width: radius * 2,
            height: radius * 2,
            marginLeft: -radius,
            marginTop: -radius,
            mixBlendMode: 'screen',
            transition: reduced ? 'none' : 'transform 120ms ease-out',
          }}
        >
          <div
            className="size-full rounded-full"
            style={{
              background: `radial-gradient(circle, hsla(${hue}, 95%, 70%, ${intensity}) 0%, hsla(${hue}, 95%, 70%, 0) 70%)`,
              animation:
                hovering || reduced
                  ? undefined
                  : 'dm-visual-spotlight-idle 3.2s ease-in-out infinite',
            }}
          />
        </div>

        <div className="relative p-4">
          <p className="font-display text-sm font-semibold text-white">聚光卡片</p>
          <p className="mt-1 max-w-[13rem] text-[11px] leading-relaxed text-white/70">
            把指针移到卡片上，光斑会跟过来；移出去它会回到中心。
          </p>
          <span
            className="mt-3 inline-block rounded-full px-3 py-1 font-mono text-[10px] text-white"
            style={{ background: 'rgba(255,255,255,0.14)' }}
          >
            spotlight glow
          </span>
        </div>
      </div>
      <p
        className="mt-2 text-center font-mono text-[10px] opacity-60"
        style={{ color: 'var(--stage-ink)' }}
      >
        关掉「跟随指针」看静态回退
      </p>
    </div>
  )
}
