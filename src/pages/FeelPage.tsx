import { useMemo, useState } from 'react'
import { ENTRY_META } from '../data/meta'
import { FEELS, INTENTS, SCENES } from '../data/taxonomy'
import { useLocale, useT } from '../i18n'
import { pick } from '../i18n/pick'
import { buttonClass } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { FilterRow, type FilterOption } from '../components/FilterRow'
import { PageHeader } from '../components/PageHeader'
import { SpecimenPlate } from '../components/SpecimenPlate'

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function Question({
  index,
  title,
  options,
  selected,
  onToggle,
}: {
  index: string
  title: string
  options: FilterOption[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="grid gap-3 border-b border-line pb-6 last:border-0 last:pb-0 sm:grid-cols-[2.5rem_minmax(0,1fr)]">
      <span className="stamp w-fit">{index}</span>
      <FilterRow legend={title} options={options} selected={selected} onToggle={onToggle} />
    </div>
  )
}

export function FeelPage() {
  const t = useT()
  const locale = useLocale()
  const [scenes, setScenes] = useState<string[]>([])
  const [feels, setFeels] = useState<string[]>([])
  const [intents, setIntents] = useState<string[]>([])

  const results = useMemo(
    () =>
      ENTRY_META.filter((entry) => {
        if (scenes.length > 0 && !entry.scenes.some((scene) => scenes.includes(scene))) return false
        if (feels.length > 0 && !entry.feel.some((item) => feels.includes(item))) return false
        if (intents.length > 0 && !entry.intent.some((item) => intents.includes(item))) return false
        return true
      }),
    [scenes, feels, intents],
  )

  const answered = scenes.length + feels.length + intents.length > 0

  const reset = () => {
    setScenes([])
    setFeels([])
    setIntents([])
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        kicker={t('footer.index')}
        title={t('titles.feel')}
        lede={t('feel.lede')}
      />

      <section className="well flex flex-col gap-6 p-5 sm:p-6">
        <Question
          index="01"
          title={t('feel.q1')}
          options={SCENES.map((item) => ({ value: item.id, label: pick(item.label, locale) }))}
          selected={scenes}
          onToggle={(value) => setScenes((current) => toggle(current, value))}
        />
        <Question
          index="02"
          title={t('feel.q2')}
          options={FEELS.map((item) => ({
            value: item.id,
            label: pick(item.label, locale),
            hint: pick(item.hint, locale),
          }))}
          selected={feels}
          onToggle={(value) => setFeels((current) => toggle(current, value))}
        />
        <Question
          index="03"
          title={t('feel.q3')}
          options={INTENTS.map((item) => ({
            value: item.id,
            label: pick(item.label, locale),
            hint: pick(item.hint, locale),
          }))}
          selected={intents}
          onToggle={(value) => setIntents((current) => toggle(current, value))}
        />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-2">
          <h2 className="label-mono text-ink">{answered ? t('feel.candidates') : t('feel.all')}</h2>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-muted">{t('home.unit', { n: results.length })}</span>
            {answered ? (
              <button
                type="button"
                onClick={reset}
                className="cursor-pointer font-mono text-[11px] text-muted underline decoration-dotted underline-offset-4 transition-colors hover:text-accent"
              >
                {t('feel.reset')}
              </button>
            ) : null}
          </div>
        </div>

        {results.length === 0 ? (
          <EmptyState
            title={t('feel.empty')}
            action={
              <button type="button" onClick={reset} className={buttonClass({ variant: 'secondary', size: 'sm' })}>
                {t('feel.reset')}
              </button>
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((entry) => (
              <SpecimenPlate key={entry.slug} entry={entry} variant="grid" />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
