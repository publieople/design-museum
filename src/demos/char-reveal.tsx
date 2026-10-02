import type { DemoProps } from '../data/types'
import { numberValue, stringValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

const TEXT = '把一句话拆成字再依次落位'

export default function CharRevealDemo({ values, stage, replayKey }: DemoProps) {
  const duration = numberValue(values, 'duration', 480)
  const stagger = numberValue(values, 'stagger', 45)
  const distance = numberValue(values, 'distance', 14)
  const easing = stringValue(values, 'easing', 'cubic-bezier(0.22, 1, 0.36, 1)')
  const reduced = usePrefersReducedMotion()
  const chars = Array.from(TEXT)
  const keyframe = 'dm-type-char-' + distance
  const rules =
    '@keyframes ' +
    keyframe +
    '{from{opacity:0;transform:translateY(' +
    distance +
    'px)}to{opacity:1;transform:none}}'

  return (
    <div key={replayKey} data-stage={stage} className="flex w-full max-w-xs flex-col items-center gap-3">
      <style>{rules}</style>
      <p className="text-center font-display text-2xl font-semibold leading-snug">
        <span className="sr-only">{TEXT}</span>
        <span aria-hidden="true">
          {chars.map((char, index) => (
            <span
              key={char + index}
              className="inline-block"
              style={
                reduced
                  ? undefined
                  : {
                      animation: keyframe + ' ' + duration + 'ms ' + easing + ' both',
                      animationDelay: index * stagger + 'ms',
                    }
              }
            >
              {char}
            </span>
          ))}
        </span>
      </p>
      <p className="font-mono text-[10px] opacity-60">
        {'最后一位要等 ' + (duration + (chars.length - 1) * stagger) + 'ms'}
      </p>
    </div>
  )
}
