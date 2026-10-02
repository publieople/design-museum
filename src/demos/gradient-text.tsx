import type { DemoProps } from '../data/types'
import { boolValue, numberValue, stringValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

const PALETTES: Record<string, [string, string]> = {
  sunset: ['#e5484d', '#7c3aed'],
  ocean: ['#0ea5e9', '#6366f1'],
  acid: ['#4d7c0f', '#db2777'],
}

export default function GradientTextDemo({ values, stage, replayKey, locale = 'zh' }: DemoProps) {
  const zh = locale !== 'en'
  const angle = numberValue(values, 'angle', 120)
  const palette = stringValue(values, 'palette', 'sunset')
  const start = numberValue(values, 'startStop', 0)
  const hue = boolValue(values, 'hue', false)
  const reduced = usePrefersReducedMotion()
  const [from, to] = PALETTES[palette] ?? PALETTES.sunset
  const gradient = 'linear-gradient(' + angle + 'deg, ' + from + ' ' + start + '%, ' + to + ' 100%)'
  const animate = hue && !reduced
  const readout = 'linear-gradient(' + angle + 'deg, ' + from + ' ' + start + '%, ' + to + ' 100%)'

  return (
    <div key={replayKey} data-stage={stage} className="flex w-full max-w-xs flex-col items-center gap-2">
      <style>{'@keyframes dm-type-hue{from{filter:hue-rotate(0deg)}to{filter:hue-rotate(360deg)}}'}</style>
      <p
        className="font-display text-3xl font-bold leading-tight"
        style={{
          backgroundImage: gradient,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
          animation: animate ? 'dm-type-hue 6s linear infinite' : undefined,
        }}
      >
        {zh ? '渐变文字' : 'Gradient text'}
      </p>
      <p className="font-mono text-[10px] opacity-60">{readout}</p>
      <p className="text-center text-[11px] opacity-70">
        {zh
          ? 'background-clip: text 把整条渐变裁进字形里，文字换行也不会每行重来'
          : 'background-clip: text clips the whole gradient into the glyphs, so a wrapped line does not restart it'}
      </p>
    </div>
  )
}
