import { useMemo, useState } from 'react'
import { ENTRY_META, featuredMeta } from '../data/meta'
import { FACETS, FEELS, SCENES, facetLabel, tagsInFacet } from '../data/taxonomy'
import { useLocale, useT } from '../i18n'
import { pick } from '../i18n/pick'
import { useQueryUpdater, useRoute, Link } from '../lib/router'
import { hallSummaries } from '../lib/indexData'
import {
  filterEntries,
  hasBrowseFilter,
  parseTags,
  serializeTags,
  toggleTag,
} from '../lib/browseFilter'
import { BROWSE_SORTS, sortEntries, type BrowseSort } from '../lib/browseSort'
import { buttonClass } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { FilterDisclosure } from '../components/FilterDisclosure'
import { FilterRow } from '../components/FilterRow'
import { PageHeader } from '../components/PageHeader'
import { SearchBox } from '../components/SearchBox'
import { SpecimenPlate } from '../components/SpecimenPlate'

interface HallNavItem {
  id: string
  letter: string
  name: string
  count: number
}

function railRowClass(active: boolean): string {
  return (
    'grid w-full cursor-pointer grid-cols-[1rem_minmax(0,1fr)_auto] items-baseline gap-2 border-l-2 py-1.5 pl-2 pr-1 text-left text-[13px] transition-colors ' +
    (active
      ? 'border-accent text-accent'
      : 'border-transparent text-ink-2 hover:border-line-strong hover:text-ink')
  )
}

function stripChipClass(active: boolean): string {
  return (
    'flex shrink-0 cursor-pointer items-baseline gap-1.5 rounded-[2px] border px-2.5 py-1.5 font-mono text-[11px] transition-colors ' +
    (active
      ? 'border-accent bg-accent-soft text-accent'
      : 'border-line text-muted hover:border-line-strong hover:text-ink')
  )
}

function HallIndex({
  items,
  active,
  total,
  allLabel,
  hint,
  variant,
  onSelect,
}: {
  items: HallNavItem[]
  active: string
  total: number
  allLabel: string
  hint: string
  variant: 'rail' | 'strip'
  onSelect: (value: string) => void
}) {
  const rail = variant === 'rail'
  const all: HallNavItem = { id: '', letter: '·', name: allLabel, count: total }
  const rows = [all, ...items]

  if (rail) {
    return (
      <nav aria-label={hint} className="flex flex-col">
        {rows.map((row) => {
          const selected = active === row.id
          return (
            <button
              key={row.id || 'all'}
              type="button"
              aria-current={selected ? 'page' : undefined}
              onClick={() => onSelect(row.id)}
              className={railRowClass(selected)}
            >
              <span className={selected ? 'font-mono text-[11px] text-accent' : 'font-mono text-[11px] text-muted'}>
                {row.letter}
              </span>
              <span className="truncate">{row.name}</span>
              <span className={selected ? 'font-mono text-[10px] tabular-nums text-accent' : 'font-mono text-[10px] tabular-nums text-muted'}>
                {row.count}
              </span>
            </button>
          )
        })}
      </nav>
    )
  }

  return (
    <nav aria-label={hint} className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:hidden">
      {rows.map((row) => {
        const selected = active === row.id
        return (
          <button
            key={row.id || 'all'}
            type="button"
            aria-current={selected ? 'page' : undefined}
            onClick={() => onSelect(row.id)}
            className={stripChipClass(selected)}
          >
            {row.id ? <span className={selected ? 'text-accent' : 'text-muted'}>{row.letter}</span> : null}
            <span>{row.name}</span>
            <span className="tabular-nums opacity-60">{row.count}</span>
          </button>
        )
      })}
    </nav>
  )
}

export function BrowsePage() {
  const t = useT()
  const locale = useLocale()
  const route = useRoute()
  const updateQuery = useQueryUpdater()
  const [sort, setSort] = useState<BrowseSort>('code')

  const q = route.query.get('q') ?? ''
  const cat = route.query.get('cat') ?? ''
  const scene = route.query.get('scene') ?? ''
  const feel = route.query.get('feel') ?? ''
  const tags = useMemo(() => parseTags(route.query.get('tag')), [route.query])

  const results = useMemo(
    () => sortEntries(filterEntries(ENTRY_META, { q, cat, scene, feel, tags }), sort),
    [q, cat, scene, feel, tags, sort],
  )

  const halls = useMemo<HallNavItem[]>(
    () =>
      hallSummaries(ENTRY_META).map((summary) => ({
        id: summary.id,
        letter: summary.letter,
        name: locale === 'en' ? summary.nameEn : summary.nameZh,
        count: summary.count,
      })),
    [locale],
  )

  const recommended = useMemo(() => featuredMeta().slice(0, 3), [])
  const hasFilter = hasBrowseFilter({ q, cat, scene, feel, tags })
  const activeCount = (q ? 1 : 0) + (cat ? 1 : 0) + (scene ? 1 : 0) + (feel ? 1 : 0) + tags.length

  const clearFilters = () => {
    updateQuery({ q: null, cat: null, scene: null, feel: null, tag: null })
  }

  const selectHall = (value: string) => {
    updateQuery({ cat: value || null })
  }

  const toggleSingle = (key: 'scene' | 'feel') => (value: string) => {
    const current = route.query.get(key) ?? ''
    updateQuery({ [key]: current === value ? null : value })
  }

  const toggleTagValue = (value: string) => {
    updateQuery({ tag: serializeTags(toggleTag(tags, value)) })
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        kicker={t('footer.index')}
        title={t('titles.browse')}
        lede={t('browse.lede', { n: ENTRY_META.length })}
        meta={<span>{t('browse.count', { a: results.length, b: ENTRY_META.length })}</span>}
        actions={
          <label className="flex items-center gap-2">
            <span className="label-mono">{t('browse.sort')}</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as BrowseSort)}
              className="cursor-pointer rounded-[3px] border border-line-strong bg-raised px-2 py-1.5 font-mono text-[11px] text-ink outline-none transition-colors hover:border-ink focus:border-accent focus:ring-2 focus:ring-accent/25"
            >
              {BROWSE_SORTS.map((value) => (
                <option key={value} value={value}>
                  {value === 'code' ? t('browse.sortCode') : t('browse.sortName')}
                </option>
              ))}
            </select>
          </label>
        }
      />

      <HallIndex
        items={halls}
        active={cat}
        total={ENTRY_META.length}
        allLabel={t('browse.allHalls')}
        hint={t('browse.railHint')}
        variant="strip"
        onSelect={selectHall}
      />

      <div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="flex flex-col gap-3 lg:sticky lg:top-20">
            <p className="label-mono">{t('browse.railHalls')}</p>
            <HallIndex
              items={halls}
              active={cat}
              total={ENTRY_META.length}
              allLabel={t('browse.allHalls')}
              hint={t('browse.railHint')}
              variant="rail"
              onSelect={selectHall}
            />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <SearchBox value={q} onChange={(value) => updateQuery({ q: value || null })} />

          <FilterDisclosure
            label={t('browse.filters')}
            activeLabel={hasFilter ? t('browse.active', { n: activeCount }) : undefined}
            clearLabel={t('browse.clear')}
            onClear={clearFilters}
            openByDefault={hasFilter}
          >
            <FilterRow
              legend={t('browse.scene')}
              options={SCENES.map((item) => ({ value: item.id, label: pick(item.label, locale) }))}
              selected={scene ? [scene] : []}
              onToggle={toggleSingle('scene')}
            />
            <FilterRow
              legend={t('browse.feel')}
              options={FEELS.map((item) => ({
                value: item.id,
                label: pick(item.label, locale),
                hint: pick(item.hint, locale),
              }))}
              selected={feel ? [feel] : []}
              onToggle={toggleSingle('feel')}
            />
            <div className="flex flex-col gap-4">
              <p className="label-mono text-ink">{t('browse.tags')}</p>
              {FACETS.map((facet) => {
                const facetTags = tagsInFacet(facet.id)
                if (facetTags.length === 0) return null
                return (
                  <FilterRow
                    key={facet.id}
                    legend={facetLabel(facet.id, locale)}
                    options={facetTags.map((tag) => ({
                      value: tag.id,
                      label: pick(tag.label, locale),
                      hint: pick(tag.hint, locale),
                    }))}
                    selected={tags}
                    onToggle={toggleTagValue}
                  />
                )
              })}
            </div>
          </FilterDisclosure>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-2">
              <h2 className="label-mono text-ink">{t('browse.results')}</h2>
              {hasFilter ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="cursor-pointer font-mono text-[11px] text-muted underline decoration-dotted underline-offset-4 transition-colors hover:text-accent"
                >
                  {t('browse.clear')}
                </button>
              ) : null}
            </div>

            {results.length === 0 ? (
              <div className="flex flex-col gap-10">
                <EmptyState
                  title={t('browse.empty')}
                  action={
                    <div className="flex flex-wrap justify-center gap-2">
                      <button type="button" onClick={clearFilters} className={buttonClass({ variant: 'secondary', size: 'sm' })}>
                        {t('browse.clear')}
                      </button>
                      <Link to="/feel" className={buttonClass({ variant: 'ghost', size: 'sm' })}>
                        {t('browse.tryFeel')}
                      </Link>
                    </div>
                  }
                />
                <section className="flex flex-col gap-4">
                  <h2 className="label-mono text-ink">{t('home.nowShowing')}</h2>
                  <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {recommended.map((entry) => (
                      <SpecimenPlate key={entry.slug} entry={entry} variant="featured" />
                    ))}
                  </ul>
                </section>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((entry) => (
                  <SpecimenPlate key={entry.slug} entry={entry} variant="grid" />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
