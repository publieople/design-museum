import { useMemo, useState } from 'react'
import { ENTRIES } from '../data'
import { CATEGORIES } from '../data/taxonomy'
import { useT, useLocale } from '../i18n'
import { clearTunedValues, readTunedValues, valuesForSheet } from '../lib/entryState'
import { defaultValues } from '../lib/controls'
import { resolveEntry } from '../lib/localize'
import { buildCheatSheet } from '../lib/prompt'
import { CopyButton } from '../components/CopyButton'

export function CheatSheetPage() {
  const t = useT()
  const locale = useLocale()
  const [selected, setSelected] = useState<string[]>([])
  const [useTuned, setUseTuned] = useState(true)

  const hasTuned = useMemo(() => ENTRIES.some((entry) => readTunedValues(entry.slug)), [])

  const items = useMemo(
    () =>
      ENTRIES.filter((entry) => selected.includes(entry.slug)).map((entry) => ({
        entry: resolveEntry(entry, locale),
        // 带上是用户在词条页调过的值——不然调了半天等于白调
        values: useTuned ? valuesForSheet(entry) : defaultValues(entry),
      })),
    [selected, locale, useTuned],
  )

  const sheet = useMemo(() => buildCheatSheet(items, locale), [items, locale])

  const toggle = (slug: string) => {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]))
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-title font-display font-semibold enter enter-1">{t('sheet.title')}</h1>
        <p className="max-w-2xl text-muted">{t('sheet.lede')}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="label-mono">
              {t('sheet.selected', { a: selected.length, b: ENTRIES.length })}
            </span>
            <div className="flex gap-3 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setSelected(ENTRIES.map((entry) => entry.slug))}
                className="cursor-pointer text-muted underline decoration-dotted hover:text-accent"
              >
                {t('sheet.selectAll')}
              </button>
              <button
                type="button"
                onClick={() => setSelected([])}
                className="cursor-pointer text-muted underline decoration-dotted hover:text-accent"
              >
                {t('sheet.clear')}
              </button>
            </div>
          </div>

          {hasTuned ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-raised px-4 py-3">
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
                className="cursor-pointer font-mono text-[11px] text-muted underline decoration-dotted hover:text-accent"
              >
                {useTuned ? t('sheet.resetTuned') : t('sheet.tuned')}
              </button>
            </div>
          ) : null}

          {CATEGORIES.map((category) => {
            const group = ENTRIES.filter((entry) => entry.category === category.id)
            if (group.length === 0) return null
            return (
              <fieldset key={category.id} className="rounded-lg border border-line bg-raised p-4">
                <legend className="label-mono px-1">
                  {locale === 'en' ? category.nameEn : category.nameZh}
                </legend>
                <ul className="flex flex-col gap-2">
                  {group.map((entry) => {
                    const resolved = resolveEntry(entry, locale)
                    return (
                      <li key={entry.slug}>
                        <label className="surface-row -mx-2 flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm">
                          <input
                            type="checkbox"
                            checked={selected.includes(entry.slug)}
                            onChange={() => toggle(entry.slug)}
                            style={{ accentColor: 'var(--accent)' }}
                          />
                          <span className="font-mono text-[11px] text-accent">{resolved.code}</span>
                          <span>{resolved.nameZh}</span>
                          <span className="font-mono text-[11px] text-muted">
                            {resolved.nameEn}
                          </span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </fieldset>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 lg:sticky lg:top-[5.5rem] lg:self-start">
          <div className="flex items-center justify-between gap-3">
            <span className="label-mono">{t('sheet.preview')}</span>
            {sheet ? (
              <CopyButton text={sheet} label={t('sheet.copyAll')} toastMessage={t('sheet.toast')} />
            ) : null}
          </div>
          {sheet ? (
            <textarea
              readOnly
              value={sheet}
              className="h-[36rem] w-full resize-y rounded-lg border border-line bg-raised p-4 font-mono text-xs leading-relaxed"
              onFocus={(event) => event.currentTarget.select()}
            />
          ) : (
            <p className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">
              {t('sheet.empty')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
