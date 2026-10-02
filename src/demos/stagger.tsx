import type { DemoProps } from '../data/types'
import { numberValue, stringValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

const ITEMS = ['把需求写清楚', '先给效果起名', '参数调到满意', '再交给 AI 实现', '最后自己验一遍']

export default function StaggerDemo({ values, replayKey }: DemoProps) {
  const duration = numberValue(values, 'duration', 420)
  const stagger = numberValue(values, 'stagger', 80)
  const distance = numberValue(values, 'distance', 16)
  const easing = stringValue(values, 'easing', 'cubic-bezier(0.22, 1, 0.36, 1)')
  const reduced = usePrefersReducedMotion()

  return (
    <ul key={replayKey} className="flex w-full max-w-xs flex-col gap-2">
      {ITEMS.map((label, index) => (
        <li
          key={label}
          className="rounded-md border px-3 py-2 text-sm"
          style={{
            borderColor: 'color-mix(in srgb, var(--stage-ink) 22%, transparent)',
            ...(reduced
              ? {}
              : {
                  animation: `museum-stagger ${duration}ms ${easing} both`,
                  animationDelay: `${index * stagger}ms`,
                  '--stagger-distance': `${distance}px`,
                }),
          }}
        >
          <span className="font-mono text-[11px] opacity-50">0{index + 1}</span>
          <span className="ml-2">{label}</span>
        </li>
      ))}
    </ul>
  )
}
