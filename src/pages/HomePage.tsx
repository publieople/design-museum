import { useMemo, useState, type ReactNode } from 'react'
import { ENTRY_META } from '../data/meta'
import { CATEGORIES, categoryBlurb } from '../data/taxonomy'
import { useLocale, useT } from '../i18n'
import { resolveMeta } from '../lib/localize'
import { Link } from '../lib/router'
import { searchEntries } from '../lib/search'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { SearchBox } from '../components/SearchBox'
import { SpecimenPlate } from '../components/SpecimenPlate'
import { StepList } from '../components/StepList'
import { IconArrowRight } from '../components/icons'

/** 正在展出的三件：按展厅动线手挑（质感 → 动效 → 布局），不跟首屏排序走 */
const FEATURED_SLUGS = ['frosted-glass', 'stagger', 'sticky-header']

const FEATURED = FEATURED_SLUGS.flatMap((slug) => {
  const entry = ENTRY_META.find((item) => item.slug === slug)
  return entry ? [entry] : []
})

const TOOLS = [
  { to: '/reverse', title: 'nav.reverse', desc: 'home.reverseDesc' },
  { to: '/aliases', title: 'nav.aliases', desc: 'home.aliasDesc' },
  { to: '/feel', title: 'nav.feel', desc: 'home.feelDesc' },
  { to: '/cheatsheet', title: 'nav.cheatsheet', desc: 'home.sheetDesc' },
] as const

function SectionHead({
  index,
  title,
  action,
}: {
  index: string
  title: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-ink pb-2">
      <h2 className="flex items-baseline gap-3 font-display text-h2 text-ink">
        <span aria-hidden="true" className="font-mono text-[11px] tracking-[0.08em] text-accent">
          {index}
        </span>
        {title}
      </h2>
      {action}
    </div>
  )
}

function MoreLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1 font-mono text-[11px] text-muted no-underline transition-colors hover:text-accent"
    >
      {children}
      <IconArrowRight size={12} />
    </Link>
  )
}

export function HomePage() {
  const t = useT()
  const locale = useLocale()
  const [query, setQuery] = useState('')
  const hits = useMemo(
    () => (query ? searchEntries(ENTRY_META, query).slice(0, 8) : []),
    [query],
  )

  return (
    <div className="flex flex-col gap-16 pb-6">
      <section className="flex flex-col gap-8 pt-2">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-2">
            <p className="label-mono text-accent">{t('home.kicker')}</p>
            <p className="label-mono">{t('home.eyebrow', { n: ENTRY_META.length })}</p>
          </div>
          <h1 className="max-w-[22ch] font-display text-display text-ink">
            {t('home.h1a')}
            <br />
            {t('home.h1b')}
          </h1>
          <p className="max-w-[58ch] text-body text-ink-2">{t('home.lede')}</p>
        </div>

        <div className="flex max-w-3xl flex-col gap-2">
          <SearchBox value={query} onChange={setQuery} />
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
            <p>{t('search.pinyinHint')}</p>
            <MoreLink to="/browse">{t('home.browseAll', { n: ENTRY_META.length })}</MoreLink>
          </div>
        </div>

        {query && hits.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-2">
              <p className="label-mono text-accent">{t('home.hits', { n: hits.length })}</p>
              <MoreLink to={'/browse?q=' + encodeURIComponent(query)}>
                {t('search.browseAll', { n: ENTRY_META.length })}
              </MoreLink>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {hits.map(({ entry }) => {
                const resolved = resolveMeta(entry, locale)
                return (
                  <li key={entry.slug}>
                    <Link
                      to={'/entry/' + entry.slug}
                      className="plate plate-interactive flex h-full flex-col gap-1.5 p-4 no-underline"
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-display text-h3 text-ink">
                          {locale === 'en' ? resolved.nameEn : resolved.nameZh}
                        </span>
                        <span className="stamp">{resolved.code}</span>
                      </span>
                      <span className="font-mono text-[11px] text-muted">
                        {locale === 'en' ? resolved.nameZh : resolved.nameEn}
                      </span>
                      <span className="line-clamp-2 text-caption text-muted">{resolved.oneLiner}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        {query && hits.length === 0 ? (
          <EmptyState
            title={t('home.noHits')}
            body={t('search.noResultsHint')}
            action={
              <Button variant="secondary" size="sm" onClick={() => setQuery('')}>
                {t('common.clear')}
              </Button>
            }
          />
        ) : null}
      </section>

      {query ? null : (
        <>
          <section>
            <SectionHead
              index="01"
              title={t('home.nowShowing')}
              action={<MoreLink to="/browse">{t('home.browseAll', { n: ENTRY_META.length })}</MoreLink>}
            />
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURED.map((entry) => (
                <SpecimenPlate key={entry.slug} entry={entry} variant="featured" />
              ))}
            </ul>
          </section>

          <section>
            <SectionHead index="02" title={t('home.halls')} />
            <ul className="flex flex-col border-t border-line">
              {CATEGORIES.map((category) => {
                const count = ENTRY_META.filter((entry) => entry.category === category.id).length
                return (
                  <li key={category.id}>
                    <Link
                      to={'/browse?cat=' + category.id}
                      className="row-link group flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line px-2 py-4 no-underline"
                    >
                      <span className="w-4 font-mono text-[11px] text-accent">{category.letter}</span>
                      <span className="font-display text-h3 text-ink">
                        {locale === 'en' ? category.nameEn : category.nameZh}
                      </span>
                      <span className="font-mono text-[11px] text-muted">
                        {locale === 'en' ? category.nameZh : category.nameEn}
                      </span>
                      <span className="ml-auto font-mono text-[11px] text-muted">
                        {t('home.unit', { n: count })}
                      </span>
                      <IconArrowRight
                        size={14}
                        className="text-muted transition-colors group-hover:text-accent"
                      />
                      <span className="basis-full max-w-[62ch] text-caption text-muted">
                        {categoryBlurb(category.id, locale)}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>

          <section>
            <SectionHead index="03" title={t('home.toolsTitle')} />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TOOLS.map((tool, index) => (
                <li key={tool.to}>
                  <Link
                    to={tool.to}
                    className="plate plate-interactive group flex h-full flex-col gap-3 p-5 no-underline"
                  >
                    <span className="flex items-baseline justify-between font-mono text-[11px]">
                      <span className="text-accent" aria-hidden="true">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <IconArrowRight
                        size={14}
                        className="text-muted transition-colors group-hover:text-accent"
                      />
                    </span>
                    <span className="font-display text-h3 leading-tight text-ink">
                      {t(tool.title)}
                    </span>
                    <span className="text-caption text-muted">{t(tool.desc)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHead
              index="04"
              title={t('home.howTitle')}
              action={<MoreLink to="/about">{t('nav.about')}</MoreLink>}
            />
            <StepList
              items={[
                { title: t('home.step1Title'), body: t('home.step1Desc') },
                { title: t('home.step2Title'), body: t('home.step2Desc') },
                { title: t('home.step3Title'), body: t('home.step3Desc') },
              ]}
            />
          </section>

          <section className="border-t-2 border-ink pt-4">
            <p className="label-mono mb-3">{t('home.categoriesRef')}</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px]">
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <Link
                    to={'/browse?cat=' + category.id}
                    className="text-muted no-underline transition-colors hover:text-accent"
                  >
                    <span className="text-ink">
                      {locale === 'en' ? category.nameEn : category.nameZh}
                    </span>
                    <span className="mx-1 opacity-50">/</span>
                    {locale === 'en' ? category.nameZh : category.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
