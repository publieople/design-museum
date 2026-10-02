import { useMemo, useState } from 'react'
import { ENTRIES, featuredEntries } from '../data'
import { CATEGORIES, categoryBlurb } from '../data/taxonomy'
import type { Entry } from '../data/types'
import { useT, useLocale } from '../i18n'
import { defaultValues } from '../lib/controls'
import { resolveEntry } from '../lib/localize'
import { usePrefs } from '../lib/prefs'
import { Link } from '../lib/router'
import { searchEntries } from '../lib/search'
import { DemoRunner } from '../components/DemoRunner'
import { DemoStage } from '../components/DemoStage'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { SearchBox } from '../components/SearchBox'
import { resolveStage } from '../components/stageStyles'
import { hasDemo } from '../demos/registry'

function Specimen({ entry }: { entry: Entry }) {
  const t = useT()
  const locale = useLocale()
  const { stage: stagePref } = usePrefs()
  const resolved = useMemo(() => resolveEntry(entry, locale), [entry, locale])
  const values = useMemo(() => defaultValues(entry), [entry])
  const stage = resolveStage(entry, stagePref)

  return (
    <li className="flex flex-col gap-3">
      {hasDemo(entry.slug) ? (
        <Link to={`/entry/${entry.slug}`} className="no-underline" tabIndex={-1} aria-hidden="true">
          <ErrorBoundary label={entry.slug} message={t('error.renderFailed')}>
            <DemoStage compact stage={stage} onStageChange={() => {}} onReplay={() => {}}>
              <DemoRunner slug={entry.slug} values={values} stage={stage} replayKey={0} />
            </DemoStage>
          </ErrorBoundary>
        </Link>
      ) : null}
      <div>
        <span className="font-mono text-[11px] tracking-wider text-accent">{resolved.code}</span>
        <h3 className="font-display text-base font-semibold leading-tight">
          <Link to={`/entry/${entry.slug}`} className="no-underline">
            {resolved.nameZh}
          </Link>
        </h3>
        <p className="font-mono text-[11px] text-muted">{resolved.nameEn}</p>
      </div>
    </li>
  )
}

export function HomePage() {
  const t = useT()
  const locale = useLocale()
  const [query, setQuery] = useState('')
  const hits = useMemo(
    () => (query ? searchEntries(ENTRIES, query).slice(0, 12) : []),
    [query],
  )
  const specimens = featuredEntries().slice(0, 3)

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-6 pt-4">
        <div className="max-w-2xl">
          <p className="label-mono">{t('home.eyebrow', { n: ENTRIES.length })}</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl">
            {t('home.h1a')}
            <br />
            {t('home.h1b')}
          </h1>
          <p className="mt-4 text-muted">{t('home.lede')}</p>
        </div>

        <SearchBox value={query} onChange={setQuery} />

        {query ? (
          <div>
            <p className="label-mono mb-3">
              {hits.length > 0 ? t('home.hits', { n: hits.length }) : t('home.noHits')}
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {hits.map(({ entry }) => {
                const resolved = resolveEntry(entry, locale)
                return (
                  <li key={entry.slug} className="rounded-lg border border-line bg-raised p-3">
                    <Link to={`/entry/${entry.slug}`} className="no-underline">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-display font-semibold">{resolved.nameZh}</span>
                        <span className="font-mono text-[11px] text-accent">{resolved.code}</span>
                      </div>
                      <p className="font-mono text-[11px] text-muted">{resolved.nameEn}</p>
                      <p className="mt-1 text-sm text-muted">{resolved.oneLiner}</p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </section>

      {!query && specimens.length > 0 ? (
        <section>
          <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-line pb-2">
            <h2 className="label-mono">{t('home.nowShowing')}</h2>
            <Link to="/browse" className="font-mono text-xs text-muted no-underline hover:text-accent">
              {t('home.seeAll', { n: ENTRIES.length })}
            </Link>
          </div>
          <ul className="grid gap-6 sm:grid-cols-3">
            {specimens.map((entry) => (
              <Specimen key={entry.slug} entry={entry} />
            ))}
          </ul>
        </section>
      ) : null}

      {!query ? (
        <section>
          <div className="mb-4 border-b border-line pb-2">
            <h2 className="label-mono">{t('home.halls')}</h2>
          </div>
          <ul className="flex flex-col divide-y divide-line border-y border-line">
            {CATEGORIES.map((category) => {
              const count = ENTRIES.filter((entry) => entry.category === category.id).length
              return (
                <li key={category.id}>
                  <Link
                    to={`/browse?cat=${category.id}`}
                    className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4 no-underline transition-colors hover:text-accent"
                  >
                    <span className="w-6 font-mono text-xs text-accent">{category.letter}</span>
                    <span className="font-display text-lg font-semibold">
                      {locale === 'en' ? category.nameEn : category.nameZh}
                    </span>
                    <span className="font-mono text-[11px] text-muted">
                      {locale === 'en' ? category.nameZh : category.nameEn}
                    </span>
                    <span className="ml-auto font-mono text-xs text-muted">
                      {t('home.unit', { n: count })}
                    </span>
                    <span className="w-full text-sm text-muted sm:w-auto sm:flex-1">
                      {categoryBlurb(category.id, locale)}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {!query ? (
        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/feel"
            className="rounded-lg border border-line bg-raised p-5 no-underline transition-colors hover:border-accent/50"
          >
            <h2 className="font-display text-lg font-semibold">{t('home.feelTitle')}</h2>
            <p className="mt-1 text-sm text-muted">{t('home.feelDesc')}</p>
          </Link>
          <Link
            to="/cheatsheet"
            className="rounded-lg border border-line bg-raised p-5 no-underline transition-colors hover:border-accent/50"
          >
            <h2 className="font-display text-lg font-semibold">{t('home.sheetTitle')}</h2>
            <p className="mt-1 text-sm text-muted">{t('home.sheetDesc')}</p>
          </Link>
        </section>
      ) : null}

      {!query ? (
        <p className="text-xs text-muted">
          {t('home.categoriesRef')}
          {CATEGORIES.map((c) => `${c.nameZh}（${c.nameEn}）`).join('、')}。
        </p>
      ) : null}
    </div>
  )
}
