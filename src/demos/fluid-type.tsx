import type { DemoProps } from '../data/types'
import { numberValue } from '../lib/controls'

const NOTE = {
  zh: '宽度一变，字号就跟着滑，中间没有任何断点。',
  en: 'Change the width and the size slides right along with it, with no breakpoint in between.',
}

export default function FluidTypeDemo({ values, stage, replayKey, locale = 'zh' }: DemoProps) {
  const zh = locale !== 'en'
  const minSize = numberValue(values, 'minSize', 16)
  const maxSize = numberValue(values, 'maxSize', 44)
  const growth = numberValue(values, 'growth', 3)
  const boxWidth = numberValue(values, 'boxWidth', 100)
  const formula = 'clamp(' + minSize + 'px, calc(' + minSize + 'px + ' + growth + 'cqw), ' + maxSize + 'px)'
  const line = 'color-mix(in srgb, var(--stage-ink) 22%, transparent)'
  const fill = 'color-mix(in srgb, var(--stage-ink) 7%, transparent)'

  return (
    <div key={replayKey} data-stage={stage} className="flex w-full max-w-xs flex-col items-center gap-3">
      <div
        className="rounded-xl border p-3"
        style={{ width: boxWidth + '%', containerType: 'inline-size', borderColor: line, background: fill }}
      >
        <p className="font-mono text-[10px] tracking-widest opacity-60">{zh ? 'cqw 容器' : 'cqw container'}</p>
        <h3 className="font-display font-semibold leading-[1.15]" style={{ fontSize: formula }}>
          {zh ? '流体的字' : 'Fluid type'}
        </h3>
        <p className="mt-1 text-[11px] leading-relaxed opacity-70">{zh ? NOTE.zh : NOTE.en}</p>
      </div>
      <p className="font-mono text-[10px] opacity-60">{formula}</p>
    </div>
  )
}
