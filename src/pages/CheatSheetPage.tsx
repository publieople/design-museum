import { useEffect, useMemo, useState } from 'react'
import { ENTRIES } from '../data'
import { CATEGORIES } from '../data/taxonomy'
import { useT, useLocale } from '../i18n'
import { defaultValues } from '../lib/controls'
import { clearTunedValues, readTunedValues, valuesForSheet } from '../lib/entryState'
import { resolveEntry } from '../lib/localize'
import type { Locale } from '../lib/prefs'
import { buildCheatSheet } from '../lib/prompt'
import { copyText } from '../lib/copy'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../components/Toast'
import { IconCheck, IconCopy } from '../components/icons'

export function CheatSheetPage() {
  const t = useT()
  const locale = useLocale()
  const { notify } = useToast()
  const [selected, setSelected] = useState<string[]>([])
  const [useTuned, setUseTuned] = useState(false)
  const [hasTuned, setHasTuned] = useState(false)
  // 导出语言默认跟随界面语言；用户点过语言切换后以自己的选择为准
  const [lang, setLang] = useState<Locale | null>(null)

  // 本地存储只在挂载后读：预渲染没有 localStorage，首屏先按默认参数直出。
  // 这是同步浏览器存储这一外部系统，不是从 props 派生 state，故显式豁免该规则。
  useEffect(() => {
    const anyTuned = ENTRIES.some((entry) => readTunedValues(entry.slug))
    // oxlint-disable-next-line react/set-state-in-effect
    setHasTuned(anyTuned)
    // oxlint-disable-next-line react/set-state-in-effect
    setUseTuned(anyTuned)
  }, [])

  const exportLocale = lang ?? locale

  const items = useMemo(
    () =>
      ENTRIES.filter((entry) => selected.includes(entry.slug)).map((entry) => ({
        entry: resolveEntry(entry, exportLocale),
        // 带上是用户在词条页调过的值——不然调了半天等于白调
        values: useTuned ? valuesForSheet(entry) : defaultValues(entry),
      })),
    [selected, exportLocale, useTuned],
  )

  const sheet = useMemo(() => buildCheatSheet(items, exportLocale), [items, exportLocale])

  const toggle = (slug: string) => {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]))
  }

  async function copySheet() {
    if (!sheet) return
    const ok = await copyText(sheet)
    notify(ok ? t('sheet.toast') : t('copy.manual'), ok ? 'ok' : 'error')
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t('titles.cheatsheet')}
        lede={t('sheet.lede')}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelected(ENTRIES.map((entry) => entry.slug))}
            >
              {t('sheet.selectAll')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
              {t('sheet.clear')}
            </Button>
          </div>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="flex min-w-0 flex-col gap-6">
          {hasTuned ? (
            <div className="well flex flex-wrap items-center justify-between gap-3 px-3 py-2">
              <span className="font-mono text-[11px] text-muted">
                {useTuned ? t('sheet.tuned') : t('sheet.defaults')}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (useTuned) {
                    clearTunedValues()
                    setUseTuned(false)
                  } else {
                    setUseTuned(true)
                  }
                }}
                className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.08em] text-muted underline decoration-dotted underline-offset-2 hover:text-accent"
              >
                {useTuned ? t('sheet.resetTuned') : t('sheet.tuned')}
              </button>
            </div>
          ) : null}

          {CATEGORIES.map((category) => {
            const group = ENTRIES.filter((entry) => entry.category === category.id)
            if (group.length === 0) return null
            return (
              <fieldset key={category.id} className="flex min-w-0 flex-col gap-1.5 border-t border-line pt-3">
                <legend className="label-mono flex w-full items-baseline gap-2">
                  <span className="text-accent">{category.letter}</span>
                  <span>{locale === 'en' ? category.nameEn : category.nameZh}</span>
                  <span className="font-mono text-[10px] normal-case tracking-normal text-muted">
                    {locale === 'en' ? category.nameZh : category.nameEn}
                  </span>
                </legend>
                <ul className="flex flex-col">
                  {group.map((entry) => {
                    const checked = selected.includes(entry.slug)
                    return (
                      <li key={entry.slug}>
                        <label className="row-link -mx-2 flex cursor-pointer items-center gap-2 px-2 py-1.5 text-caption">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(entry.slug)}
                            className="size-3.5 cursor-pointer"
                            style={{ accentColor: 'var(--accent)' }}
                          />
                          <span className="font-mono text-[10px] text-accent">{entry.code}</span>
                          <span className="text-ink">{entry.nameZh}</span>
                          <span className="truncate font-mono text-[10px] text-muted">
                            {entry.nameEn}
                          </span>
                          {checked ? (
                            <IconCheck size={12} className="ml-auto shrink-0 text-accent" />
                          ) : null}
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </fieldset>
            )
          })}
        </div>

        <div className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-20 lg:self-start">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-2">
            <span className="label-mono">
              {t('sheet.selected', { a: selected.length, b: ENTRIES.length })}
            </span>
            <div className="flex items-center gap-1">
              {(['zh', 'en'] as Locale[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  aria-pressed={exportLocale === code}
                  onClick={() => setLang(code)}
                  className={`cursor-pointer rounded-[2px] border px-2 py-0.5 font-mono text-[10px] transition-colors ${
                    exportLocale === code
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-line text-muted hover:text-ink'
                  }`}
                >
                  {code === 'zh' ? t('sheet.langZh') : t('sheet.langEn')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="label-mono">{t('sheet.preview')}</span>
            {sheet ? (
              <Button size="sm" onClick={copySheet}>
                <IconCopy size={14} />
                {t('sheet.copyAll')}
              </Button>
            ) : null}
          </div>

          {sheet ? (
            <textarea
              readOnly
              value={sheet}
              aria-label={t('sheet.preview')}
              className="well h-[36rem] w-full resize-y bg-surface p-3 font-mono text-[11px] leading-relaxed text-ink-2"
              onFocus={(event) => event.currentTarget.select()}
            />
          ) : (
            <EmptyState title={t('sheet.empty')} />
          )}
        </div>
      </div>
    </div>
  )
}
