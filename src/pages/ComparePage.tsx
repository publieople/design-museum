import { useMemo } from 'react'
import { ENTRY_META } from '../data/meta'
import { CATEGORIES } from '../data/taxonomy'
import type { EntryMeta } from '../data/types'
import { useT } from '../i18n'
import { comparePair, comparePairs, confusionDiff, type ComparePair } from '../lib/compare'
import { groupRowsByHall } from '../lib/indexData'
import { Link, navigate, useRoute } from '../lib/router'
import { comparePath, entryPath } from '../lib/routes'
import { PageHeader } from '../components/PageHeader'
import { buttonClass } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { IconArrowUpRight } from '../components/icons'

/** 左边或右边的一张展签：编号、中英名、一句话、别名与词条入口 */
function PairPanel({ entry, slot }: { entry: EntryMeta; slot: string }) {
  const t = useT()
  return (
    <article className="plate flex flex-col gap-4 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="label-mono text-accent">{slot}</span>
        <span className="stamp">{entry.code}</span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-h3 text-ink">{entry.nameZh}</h3>
        <p className="font-mono text-micro text-muted">{entry.nameEn}</p>
      </div>
      <p className="text-body text-ink-2">{entry.oneLiner}</p>
      {entry.aliases.length > 0 ? (
        <p className="font-mono text-[11px] leading-relaxed text-muted">
          {entry.aliases.slice(0, 4).join(' · ')}
        </p>
      ) : null}
      <div className="mt-auto border-t border-line pt-3">
        <Link
          to={entryPath(entry.slug)}
          className="text-link inline-flex items-center gap-1 font-mono text-[11px]"
        >
          {t('compare.openEntry')}
          <IconArrowUpRight size={12} />
        </Link>
      </div>
    </article>
  )
}

/** 一侧写的区别；这一侧没写时给出说明而不是留白 */
function DiffBlock({
  label,
  diff,
  fallback,
}: {
  label: string
  diff: string | null
  fallback: string
}) {
  return (
    <div className="well flex flex-col gap-3 p-5">
      <h3 className="label-mono text-ink">{label}</h3>
      <p className={diff ? 'text-body text-ink-2' : 'text-caption text-muted'}>
        {diff ?? fallback}
      </p>
    </div>
  )
}

/**
 * 「别搞混」双向对照页。
 *
 * 左右两张展签按 ?a=slug&b=slug 渲染，交换按钮只调换左右顺序、不重排数据；
 * 下方把两侧 confusions 里写的区别各自读出来（单向写了就只显示一边），
 * 最后按展厅列出全站所有可对照的一对——这一页同时是「查这一对」和「翻全部」。
 */
export function ComparePage() {
  const t = useT()
  const route = useRoute()
  const pairs = useMemo(() => comparePairs(ENTRY_META), [])
  const hallById = useMemo(() => new Map(CATEGORIES.map((hall) => [hall.id, hall])), [])

  // query 里给了有效的两个 slug 就照着渲染，否则回退到档案里的第一对
  const requested = useMemo(
    () => comparePair(ENTRY_META, route.query.get('a') ?? '', route.query.get('b') ?? ''),
    [route.query],
  )
  const pair: ComparePair | undefined = requested ?? pairs[0]
  const diffA = pair ? confusionDiff(pair.a, pair.b, ENTRY_META) : null
  const diffB = pair ? confusionDiff(pair.b, pair.a, ENTRY_META) : null

  // 全站对照按「左边那条」所属展厅分组，与词条库的展厅动线一致
  const grouped = useMemo(
    () => groupRowsByHall(pairs.map((item) => ({ entry: item.a, pair: item }))),
    [pairs],
  )

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        kicker={t('compare.kicker')}
        title={t('titles.compare')}
        lede={t('compare.lede')}
        meta={<span>{t('compare.count', { n: pairs.length })}</span>}
      />

      {pair ? (
        <>
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="label-mono text-ink">
                {pair.a.code} × {pair.b.code}
              </h2>
              <button
                type="button"
                onClick={() => navigate(comparePath(pair.b.slug, pair.a.slug))}
                className={buttonClass({ variant: 'secondary', size: 'sm' })}
              >
                {t('compare.swap')}
              </button>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <PairPanel entry={pair.a} slot={t('compare.left')} />
              <PairPanel entry={pair.b} slot={t('compare.right')} />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="border-b border-line pb-2">
              <h2 className="label-mono text-ink">{t('compare.diffTitle')}</h2>
            </div>
            {diffA === null && diffB === null ? (
              <p className="well p-5 text-caption text-muted">{t('compare.noDiff')}</p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                <DiffBlock
                  label={t('compare.aSays', { x: pair.a.nameZh })}
                  diff={diffA}
                  fallback={t('compare.onlyOne')}
                />
                <DiffBlock
                  label={t('compare.aSays', { x: pair.b.nameZh })}
                  diff={diffB}
                  fallback={t('compare.onlyOne')}
                />
              </div>
            )}
          </section>
        </>
      ) : (
        <EmptyState title={t('compare.noDiff')} />
      )}

      <section className="flex flex-col gap-6">
        <div className="flex items-baseline justify-between gap-3 border-b-2 border-ink pb-2">
          <h2 className="label-mono text-ink">{t('compare.allPairs')}</h2>
          <span className="font-mono text-[11px] text-muted">
            {t('compare.count', { n: pairs.length })}
          </span>
        </div>
        {grouped.map((group) => {
          const hall = hallById.get(group.hall)
          if (!hall) return null
          return (
            <div key={group.hall} className="flex flex-col gap-2">
              <div className="flex items-baseline gap-3">
                <span className="stamp">{hall.letter}</span>
                <h3 className="font-display text-h3 text-ink">{hall.nameZh}</h3>
                <span className="font-mono text-micro text-muted">{hall.nameEn}</span>
                <span className="ml-auto font-mono text-[11px] text-muted">{group.rows.length}</span>
              </div>
              <ul className="grid gap-x-8 sm:grid-cols-2">
                {group.rows.map(({ pair: item }) => (
                  <li key={item.key}>
                    <Link
                      to={comparePath(item.a.slug, item.b.slug)}
                      aria-current={item.key === pair?.key ? 'true' : undefined}
                      className={`row-link flex items-baseline gap-2 px-1 py-1.5 font-mono text-[11px] ${
                        item.key === pair?.key ? 'text-accent' : 'text-ink-2'
                      }`}
                    >
                      <span className="text-ink">{item.a.nameZh}</span>
                      <span className="text-muted">×</span>
                      <span className="text-ink">{item.b.nameZh}</span>
                      <span className="ml-auto shrink-0 text-muted">
                        {item.a.code} / {item.b.code}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </section>
    </div>
  )
}
