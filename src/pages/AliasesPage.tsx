import { useMemo, useState } from 'react'
import type { Locale } from '../lib/prefs'
import { ENTRY_META } from '../data/meta'
import { categoryOf } from '../data/taxonomy'
import { useLocale, useT } from '../i18n'
import {
  aliasRows,
  filterAliases,
  uniqueEntryCount,
  type AliasRow,
} from '../lib/aliasIndex'
import { groupRowsByHall, hallSummaries, totalAliases } from '../lib/indexData'
import { normalizeText } from '../lib/search'
import { entryPath } from '../lib/routes'
import { Link } from '../lib/router'
import { buttonClass } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { IconClose, IconSearch } from '../components/icons'

const CONTRIBUTE_URL =
  'https://github.com/publieople/design-museum/issues/new?template=entry_request.yml'

interface HallLink {
  id: string
  letter: string
  name: string
  count: number
  href: string
  disabled: boolean
}

function HallJumpNav({
  links,
  label,
  variant,
}: {
  links: HallLink[]
  label: string
  variant: 'rail' | 'strip'
}) {
  if (variant === 'strip') {
    return (
      <nav aria-label={label} className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:hidden">
        {links.map((link) =>
          link.disabled ? (
            <span
              key={link.id}
              className="flex shrink-0 items-baseline gap-1.5 rounded-[2px] border border-line px-2.5 py-1.5 font-mono text-[11px] text-muted opacity-40"
            >
              <span>{link.name}</span>
            </span>
          ) : (
            <a
              key={link.id}
              href={link.href}
              className="flex shrink-0 items-baseline gap-1.5 rounded-[2px] border border-line px-2.5 py-1.5 font-mono text-[11px] text-ink-2 no-underline transition-colors hover:border-line-strong hover:text-ink"
            >
              <span className="text-muted">{link.letter}</span>
              <span>{link.name}</span>
              <span className="tabular-nums opacity-60">{link.count}</span>
            </a>
          ),
        )}
      </nav>
    )
  }

  return (
    <nav aria-label={label} className="flex flex-col">
      {links.map((link) => {
        const base = 'flex items-baseline justify-between gap-2 border-l-2 py-1.5 pl-2 pr-1 text-[13px]'
        if (link.disabled) {
          return (
            <span key={link.id} className={'border-transparent text-muted opacity-40 ' + base}>
              <span className="flex items-baseline gap-2">
                <span className="font-mono text-[11px]">{link.letter}</span>
                <span>{link.name}</span>
              </span>
              <span className="font-mono text-[10px] tabular-nums">{link.count}</span>
            </span>
          )
        }
        return (
          <a
            key={link.id}
            href={link.href}
            className={
              'border-transparent text-ink-2 no-underline transition-colors hover:border-accent hover:text-accent ' + base
            }
          >
            <span className="flex items-baseline gap-2">
              <span className="font-mono text-[11px] text-muted">{link.letter}</span>
              <span>{link.name}</span>
            </span>
            <span className="font-mono text-[10px] tabular-nums text-muted">{link.count}</span>
          </a>
        )
      })}
    </nav>
  )
}

function AliasRowLink({
  row,
  locale,
  query,
}: {
  row: AliasRow
  locale: Locale
  query: string
}) {
  const { entry } = row
  const primary = locale === 'en' ? entry.nameEn : entry.nameZh
  const secondary = locale === 'en' ? entry.nameZh : entry.nameEn
  const hit = query.length > 0 && normalizeText(row.alias).includes(query)

  return (
    <Link
      to={entryPath(entry.slug)}
      className="group flex items-baseline gap-2 border-l-2 border-transparent py-1.5 pl-2 pr-1 no-underline transition-colors hover:border-accent"
    >
      <span
        className={
          'shrink-0 font-display text-[13px] font-semibold transition-colors ' +
          (hit ? 'text-accent' : 'text-ink group-hover:text-accent')
        }
      >
        {row.alias}
      </span>
      <span aria-hidden="true" className="min-w-3 flex-1 self-center border-t border-dotted border-line" />
      <span className="min-w-0 truncate text-caption text-ink-2">{primary}</span>
      <span className="hidden shrink-0 font-mono text-[10px] text-muted md:inline">{secondary}</span>
      <span
        className={
          'shrink-0 font-mono text-[10px] tabular-nums ' + (query ? 'text-accent' : 'text-muted')
        }
      >
        {entry.code}
      </span>
    </Link>
  )
}

export function AliasesPage() {
  const t = useT()
  const locale = useLocale()
  const [query, setQuery] = useState('')

  const allRows = useMemo(() => aliasRows(ENTRY_META), [])
  const rows = useMemo(() => filterAliases(allRows, query), [allRows, query])
  const groups = useMemo(() => groupRowsByHall(rows), [rows])
  const summaries = useMemo(() => hallSummaries(ENTRY_META), [])
  const visibleCounts = useMemo(
    () => new Map(groups.map((group) => [group.hall, group.rows.length])),
    [groups],
  )
  const matchedEntries = useMemo(() => uniqueEntryCount(rows), [rows])
  const compactQuery = normalizeText(query)
  const hasQuery = compactQuery.length > 0

  const links = useMemo<HallLink[]>(
    () =>
      summaries.map((summary) => {
        const matched = visibleCounts.get(summary.id) ?? 0
        return {
          id: summary.id,
          letter: summary.letter,
          name: locale === 'en' ? summary.nameEn : summary.nameZh,
          count: hasQuery ? matched : summary.aliases,
          href: '#hall-' + summary.id,
          disabled: hasQuery && matched === 0,
        }
      }),
    [summaries, visibleCounts, hasQuery, locale],
  )

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        kicker={t('footer.index')}
        title={t('titles.aliases')}
        lede={t('aliases.lede')}
        meta={
          <span>
            {t('aliases.count', { a: totalAliases(ENTRY_META), b: ENTRY_META.length })}
          </span>
        }
      />

      <HallJumpNav links={links} label={t('aliases.jump')} variant="strip" />

      <div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="flex flex-col gap-3 lg:sticky lg:top-20">
            <p className="label-mono">{t('aliases.jump')}</p>
            <HallJumpNav links={links} label={t('aliases.jump')} variant="rail" />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div className="well flex items-center gap-2 rounded-[3px] px-3 py-1.5 transition-colors focus-within:border-ink focus-within:ring-2 focus-within:ring-accent/25">
              <span className="text-muted">
                <IconSearch size={18} />
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label={t('aliases.search')}
                placeholder={t('aliases.search')}
                className="min-w-0 flex-1 bg-transparent py-1.5 text-body text-ink outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label={t('aliases.clear')}
                  className="flex cursor-pointer items-center gap-1 rounded-[2px] p-1 text-muted transition-colors hover:text-accent"
                >
                  <IconClose size={14} />
                  <span className="font-mono text-[10px]">{t('aliases.clear')}</span>
                </button>
              ) : null}
            </div>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[11px] text-muted" aria-live="polite">
              <span>{t('aliases.count', { a: rows.length, b: matchedEntries })}</span>
              {hasQuery ? <span className="text-accent">{t('aliases.highlightHint')}</span> : null}
            </div>
          </div>

          {groups.length === 0 ? (
            <EmptyState
              title={t('aliases.empty')}
              action={
                <Link to="/browse" className={buttonClass({ variant: 'secondary', size: 'sm' })}>
                  {t('aliases.browseLink')}
                </Link>
              }
            />
          ) : (
            <div className="flex flex-col gap-10">
              {groups.map((group) => {
                const category = categoryOf(group.hall)
                return (
                  <section
                    key={group.hall}
                    id={'hall-' + group.hall}
                    className="scroll-mt-24"
                  >
                    <div className="sticky top-14 z-10 -mx-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line bg-canvas px-2 py-2">
                      <h2 className="flex items-baseline gap-2.5 font-display text-h2 text-ink">
                        <span className="stamp">{category.letter}</span>
                        <span>{locale === 'en' ? category.nameEn : category.nameZh}</span>
                      </h2>
                      <span className="font-mono text-[11px] text-muted">
                        {t('aliases.groupCount', { n: group.rows.length })}
                      </span>
                    </div>
                    <ul className="mt-2 grid list-none grid-cols-1 gap-x-6 gap-y-0.5 p-0 sm:grid-cols-2 xl:grid-cols-3">
                      {group.rows.map((row) => (
                        <li key={row.entry.slug + ':' + row.alias}>
                          <AliasRowLink row={row} locale={locale} query={compactQuery} />
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          )}

          <footer className="border-t border-line pt-5">
            <a
              href={CONTRIBUTE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-link font-mono text-caption text-ink-2 transition-colors hover:text-accent"
            >
              {t('aliases.contribute')}
            </a>
          </footer>
        </div>
      </div>
    </div>
  )
}
