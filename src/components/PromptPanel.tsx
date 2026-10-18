import { useState } from 'react'
import type { ControlValues, StageId } from '../data/types'
import { useT } from '../i18n'
import { entryLink } from '../lib/entryState'
import type { ResolvedEntry } from '../lib/localize'
import { buildPrompt } from '../lib/prompt'
import { copyText } from '../lib/copy'
import { buttonClass } from './Button'
import { IconCopy } from './icons'
import { useToast } from './Toast'

type Tab = 'zh' | 'en' | 'link'

interface PromptPanelProps {
  entry: ResolvedEntry
  values: ControlValues
  stage: StageId
}

/**
 * 详情页右栏的「输出舱」：观众在这里把看到的东西翻译成 AI 听得懂的。
 * 三个页签同时挂在 DOM 里（非当前页签用 hidden 包住）——
 * 预渲染要保证三种文案都存在，切换只是显隐，不重新构建。
 */
export function PromptPanel({ entry, values, stage }: PromptPanelProps) {
  const t = useT()
  const [tab, setTab] = useState<Tab>('zh')
  const prompt = buildPrompt(entry, values)
  const link = entryLink(entry, values, stage)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'zh', label: t('entry.tabZh') },
    { id: 'en', label: t('entry.tabEn') },
    { id: 'link', label: t('entry.tabLink') },
  ]

  return (
    <section aria-label={t('prompt.title')} className="plate">
      <div className="flex items-baseline justify-between gap-3 px-4 pt-4">
        <h2 className="label-mono">{t('prompt.title')}</h2>
        <span className="font-mono text-[10px] text-muted">
          {entry.controls.length > 0 ? t('prompt.live') : t('prompt.fixed')}
        </span>
      </div>

      <div role="tablist" aria-label={t('entry.output')} className="mt-3 flex gap-1 border-b border-line px-3">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`prompt-tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`prompt-panel-${item.id}`}
            onClick={() => setTab(item.id)}
            className={`cursor-pointer border-b-2 px-2.5 py-2 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors ${
              tab === item.id
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id="prompt-panel-zh"
        aria-labelledby="prompt-tab-zh"
        hidden={tab !== 'zh'}
        className="flex flex-col gap-3 p-4"
      >
        <p className="well whitespace-pre-wrap p-3 text-caption leading-relaxed text-ink-2">{prompt.zh}</p>
        <div className="flex justify-end">
          <CopyAction text={prompt.zh} label={t('prompt.copyZh')} toastMessage={t('prompt.toastZh')} />
        </div>
      </div>

      <div
        role="tabpanel"
        id="prompt-panel-en"
        aria-labelledby="prompt-tab-en"
        hidden={tab !== 'en'}
        className="flex flex-col gap-3 p-4"
      >
        <p className="well break-words p-3 font-mono text-xs leading-relaxed text-ink-2">{prompt.en}</p>
        <div className="flex justify-end">
          <CopyAction text={prompt.en} label={t('prompt.copyEn')} toastMessage={t('prompt.toastEn')} />
        </div>
      </div>

      <div
        role="tabpanel"
        id="prompt-panel-link"
        aria-labelledby="prompt-tab-link"
        hidden={tab !== 'link'}
        className="flex flex-col gap-3 p-4"
      >
        <p className="well break-all p-3 font-mono text-xs leading-relaxed text-ink-2">{link}</p>
        <p className="text-micro text-muted">{t('prompt.shareHint')}</p>
        <div className="flex justify-end">
          <CopyAction text={link} label={t('prompt.copyLink')} toastMessage={t('prompt.toastLink')} />
        </div>
      </div>
    </section>
  )
}

function CopyAction({ text, label, toastMessage }: { text: string; label: string; toastMessage: string }) {
  const t = useT()
  const { notify } = useToast()

  async function handleCopy() {
    const ok = await copyText(text)
    notify(ok ? toastMessage : t('copy.manual'), ok ? 'ok' : 'error')
  }

  return (
    <button type="button" onClick={handleCopy} className={buttonClass({ variant: 'secondary', size: 'sm' })}>
      <IconCopy size={14} />
      {label}
    </button>
  )
}
