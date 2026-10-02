import type { DemoProps } from '../data/types'
import { numberValue, stringValue } from '../lib/controls'

const SAMPLES: Record<string, string> = {
  'en-heading': 'A short headline should not drop one lonely word onto the last line',
  'en-long':
    'Body copy is a different job: balancing every line of a long paragraph costs layout time, and the browser stops balancing once the text passes a handful of lines.',
}

const ZH_HEADING = {
  zh: '一行短标题不该在最后一行只留下孤零零的一个字',
  en: 'A short title should never strand one word on the last line',
}

export default function TextBalanceDemo({ values, stage, replayKey, locale = 'zh' }: DemoProps) {
  const zh = locale !== 'en'
  const width = numberValue(values, 'width', 16)
  const sample = stringValue(values, 'sample', 'en-heading')
  const mode = stringValue(values, 'mode', 'balance')
  const text = sample === 'zh-heading' ? (zh ? ZH_HEADING.zh : ZH_HEADING.en) : SAMPLES[sample] ?? SAMPLES['en-heading']
  const line = 'color-mix(in srgb, var(--stage-ink) 22%, transparent)'

  return (
    <div key={replayKey} data-stage={stage} className="flex w-full max-w-xs flex-col gap-3">
      <div className="rounded-lg border p-3" style={{ borderColor: line }}>
        <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">text-wrap: wrap</p>
        <p className="mt-1 text-sm leading-snug" style={{ maxWidth: width + 'ch', textWrap: 'wrap' }}>
          {text}
        </p>
      </div>
      <div className="rounded-lg border p-3" style={{ borderColor: line }}>
        <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">{'text-wrap: ' + mode}</p>
        <p className="mt-1 text-sm leading-snug" style={{ maxWidth: width + 'ch', textWrap: mode }}>
          {text}
        </p>
      </div>
    </div>
  )
}
