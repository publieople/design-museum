import { useMemo, useState } from 'react'
import { ENTRY_META } from '../data/meta'
import { CATEGORIES } from '../data/taxonomy'
import { useLocale, useT } from '../i18n'
import {
  aliasRows,
  filterAliases,
  groupAliases,
  uniqueEntryCount,
  type AliasGroup,
  type AliasRow,
} from '../lib/aliasIndex'
import type { Locale } from '../lib/prefs'
import { Link } from '../lib/router'

const CATEGORY_BY_ID = new Map(CATEGORIES.map((category) => [category.id, category]))

/**
 * 「发现新俗称」的出口：走仓库的「申请新词条」issue 模板——它是 .github/ISSUE_TEMPLATE
 * 里唯一带「口语俗称」字段的入口，比空白的 issues 列表更容易把话说清楚。
 */
const CONTRIBUTE_URL =
  'https://github.com/publieople/design-museum/issues/new?template=entry_request.yml'

/**
 * 俗称总表：把全站 aliases 摊平，按展厅分组，边打边搜。
 *
 * 数据只来自 src/data/meta.ts 的 ENTRY_META（首屏体积约束），完整词条不进来；
 * 首屏内容全在渲染期算出来，不用 useEffect，预渲染脚本能直接拿到正文。
 */
export function AliasesPage() {
  const t = useT()
  const locale = useLocale()
  const [query, setQuery] = useState('')

  const allRows = useMemo(() => aliasRows(ENTRY_META), [])
  const rows = useMemo(() => filterAliases(allRows, query), [allRows, query])
  const groups = useMemo(() => groupAliases(rows), [rows])
  const entryCount = useMemo(() => uniqueEntryCount(rows), [rows])

  return (
    <div className="flex flex-col gap-8">
      <header className="max-w-2xl">
        <p className="label-mono">{t('aliases.eyebrow')}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">{t('aliases.title')}</h1>
        <p className="mt-3 text-muted">{t('aliases.lede')}</p>
      </header>

      <div className="flex flex-col gap-3 rounded-lg border border-line bg-raised p-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative flex-1">
          <input
            type="search"
            value={query}
            aria-label={t('aliases.search')}
            placeholder={t('aliases.search')}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-lg border border-line bg-surface py-2.5 pl-3.5 pr-20 text-sm outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-muted focus:border-accent focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_14%,transparent)]"
          />
          {query ? (
            <button
              type="button"
              aria-label={t('aliases.clear')}
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded px-2 py-1 font-mono text-[11px] text-muted hover:text-accent"
            >
              {t('aliases.clear')}
            </button>
          ) : null}
        </div>
        <p aria-live="polite" className="font-mono text-xs text-muted">
          {t('aliases.count', { a: rows.length, b: entryCount })}
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">
          {t('aliases.empty')}{' '}
          <Link to="/browse" className="text-accent no-underline hover:underline">
            {t('aliases.browseLink')}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <AliasSection key={group.category} group={group} locale={locale} />
          ))}
        </div>
      )}

      <p className="border-t border-line pt-5">
        <a
          href={CONTRIBUTE_URL}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs text-muted no-underline hover:text-accent"
        >
          {t('aliases.contribute')}
        </a>
      </p>
    </div>
  )
}

function AliasSection({ group, locale }: { group: AliasGroup; locale: Locale }) {
  const category = CATEGORY_BY_ID.get(group.category)
  const name = category ? (locale === 'en' ? category.nameEn : category.nameZh) : group.category

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
        <h2 className="font-display text-lg font-semibold">
          {name}
          <span className="ml-2 font-mono text-[11px] font-normal tracking-[0.09em] text-muted">
            {category?.letter}
          </span>
        </h2>
        <span className="font-mono text-[11px] text-muted">{group.rows.length}</span>
      </div>
      <ul className="grid list-none gap-x-4 gap-y-0.5 p-0 sm:grid-cols-2 xl:grid-cols-3">
        {group.rows.map((row) => (
          <li key={`${row.entry.slug}-${row.alias}`}>
            <AliasLink row={row} locale={locale} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function AliasLink({ row, locale }: { row: AliasRow; locale: Locale }) {
  const primary = locale === 'en' ? row.entry.nameEn : row.entry.nameZh
  const secondary = locale === 'en' ? row.entry.nameZh : row.entry.nameEn

  return (
    <Link
      to={`/entry/${row.entry.slug}`}
      className="surface-row group flex items-baseline gap-2 rounded-md px-2.5 py-1.5 no-underline"
    >
      <span className="font-display text-sm font-semibold text-ink transition-colors group-hover:text-accent">
        {row.alias}
      </span>
      <span aria-hidden="true" className="text-xs text-muted">
        →
      </span>
      <span className="min-w-0 flex-1 truncate text-xs text-muted">
        {primary}
        <span className="ml-1.5 font-mono text-[11px] opacity-80">{secondary}</span>
        <span className="ml-1.5 font-mono text-[11px] opacity-80">{row.entry.code}</span>
      </span>
    </Link>
  )
}
