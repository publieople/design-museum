import type { ControlValues, StageId } from '../data/types'
import type { ResolvedEntry } from '../lib/localize'
import { useT } from '../i18n'
import { entryLink } from '../lib/entryState'
import { buildPrompt, formatValues } from '../lib/prompt'
import { CopyButton } from './CopyButton'

interface PromptCardProps {
  entry: ResolvedEntry
  values: ControlValues
  stage: StageId
}

/**
 * 这个项目的核心出口：观众在这里把「我看到的」翻译成「AI 听得懂的」。
 * 中文版负责语义，英文关键词版负责让模型精确定位到标准实现，
 * 分享链接负责把你调出来的那一组参数一起带走。
 */
export function PromptCard({ entry, values, stage }: PromptCardProps) {
  const t = useT()
  const prompt = buildPrompt(entry, values)
  const params = formatValues(entry, values)
  const link = entryLink(entry, values, stage)

  return (
    <section aria-label={t('prompt.title')} className="rounded-lg border border-line bg-raised">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="label-mono">{t('prompt.title')}</h2>
        <span className="font-mono text-[11px] text-muted">
          {entry.controls.length > 0 ? t('prompt.live') : t('prompt.fixed')}
        </span>
      </header>

      <div className="flex flex-col gap-4 p-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] text-muted">{t('prompt.zh')}</span>
            <CopyButton text={prompt.zh} label={t('prompt.copyZh')} toastMessage={t('prompt.toastZh')} />
          </div>
          <p className="rounded border border-line bg-surface p-3 text-sm leading-relaxed">
            {prompt.zh}
          </p>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] text-muted">{t('prompt.en')}</span>
            <CopyButton text={prompt.en} label={t('prompt.copyEn')} toastMessage={t('prompt.toastEn')} />
          </div>
          <p className="rounded border border-line bg-surface p-3 font-mono text-xs leading-relaxed break-words">
            {prompt.en}
          </p>
        </div>

        {params.length > 0 ? (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 text-xs">
            {params.map((item, index) => {
              const label = entry.controls[index]?.label ?? ''
              const value = item.slice(label.length + 1)
              return (
                <div key={item} className="flex justify-between gap-2">
                  <dt className="text-muted">{label}</dt>
                  <dd className="font-mono">{value}</dd>
                </div>
              )
            })}
          </dl>
        ) : null}

        <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
          <span className="font-mono text-[11px] text-muted">{t('prompt.shareHint')}</span>
          <CopyButton text={link} label={t('prompt.copyLink')} toastMessage={t('prompt.toastLink')} />
        </div>
      </div>
    </section>
  )
}
