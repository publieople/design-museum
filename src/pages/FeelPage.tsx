import { useMemo, useState } from 'react'
import { ENTRIES } from '../data'
import { FEELS, INTENTS, SCENES } from '../data/taxonomy'
import { useT, useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { EntryCard } from '../components/EntryCard'
import { FilterChips } from '../components/FilterChips'

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function FeelPage() {
  const t = useT()
  const locale = useLocale()
  const [scenes, setScenes] = useState<string[]>([])
  const [feels, setFeels] = useState<string[]>([])
  const [intents, setIntents] = useState<string[]>([])

  const results = useMemo(
    () =>
      ENTRIES.filter(
        (entry) =>
          (scenes.length === 0 || entry.scenes.some((item) => scenes.includes(item))) &&
          (feels.length === 0 || entry.feel.some((item) => feels.includes(item))) &&
          (intents.length === 0 || entry.intent.some((item) => intents.includes(item))),
      ),
    [scenes, feels, intents],
  )

  const answered = scenes.length + feels.length + intents.length > 0

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t('feel.title')}</h1>
        <p className="max-w-2xl text-muted">{t('feel.lede')}</p>
      </header>

      <div className="flex flex-col gap-6 rounded-lg border border-line bg-raised p-5">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-accent">01</span>
          <FilterChips
            legend={t('feel.q1')}
            options={SCENES.map((s) => ({ value: s.id, label: pick(s.label, locale) }))}
            selected={scenes}
            onToggle={(value) => setScenes((prev) => toggle(prev, value))}
          />
        </div>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-accent">02</span>
          <FilterChips
            legend={t('feel.q2')}
            options={FEELS.map((f) => ({
              value: f.id,
              label: pick(f.label, locale),
              hint: pick(f.hint, locale),
            }))}
            selected={feels}
            onToggle={(value) => setFeels((prev) => toggle(prev, value))}
          />
        </div>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-accent">03</span>
          <FilterChips
            legend={t('feel.q3')}
            options={INTENTS.map((i) => ({
              value: i.id,
              label: pick(i.label, locale),
              hint: pick(i.hint, locale),
            }))}
            selected={intents}
            onToggle={(value) => setIntents((prev) => toggle(prev, value))}
          />
        </div>
        {answered ? (
          <button
            type="button"
            onClick={() => {
              setScenes([])
              setFeels([])
              setIntents([])
            }}
            className="cursor-pointer self-start font-mono text-[11px] text-muted underline decoration-dotted hover:text-accent"
          >
            {t('feel.reset')}
          </button>
        ) : null}
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-2">
          <h2 className="label-mono">{answered ? t('feel.candidates') : t('feel.all')}</h2>
          <span className="font-mono text-xs text-muted">
            {t('home.unit', { n: results.length })}
          </span>
        </div>
        {results.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">
            {t('feel.empty')}
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((entry) => (
              <EntryCard key={entry.slug} entry={entry} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
