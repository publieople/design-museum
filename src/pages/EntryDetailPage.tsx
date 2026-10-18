import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ENTRIES, findEntry } from '../data'
import { ENTRY_META } from '../data/meta'
import { categoryOf, demoShapeLabel, sceneLabel, tagLabel } from '../data/taxonomy'
import type { ControlValues, StageId } from '../data/types'
import { useT, useLocale, type StringKey } from '../i18n'
import { resolveConfusionTarget } from '../lib/confusions'
import { defaultValues } from '../lib/controls'
import { buildEntryQuery, parseEntryState, writeTunedValues } from '../lib/entryState'
import { resolveEntry, resolveMeta } from '../lib/localize'
import { interactionHintKey, loopPolicy, shouldAutoLoop, type LoopPolicy } from '../lib/loop'
import { usePrefs } from '../lib/prefs'
import { Link, navigate, useRoute } from '../lib/router'
import { entryPath, liveDemoPath } from '../lib/routes'
import { buttonClass } from '../components/Button'
import { ControlPanel } from '../components/ControlPanel'
import { DemoRunner } from '../components/DemoRunner'
import { DemoStage } from '../components/DemoStage'
import { EmptyState } from '../components/EmptyState'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { MetaLine, Rule, Tag } from '../components/Meta'
import { PromptPanel } from '../components/PromptPanel'
import { resolveStage } from '../components/stageStyles'
import { IconArrowUpRight, IconExternal } from '../components/icons'
import { hasLiveDemo } from '../data/live'
import { hasDemo } from '../demos/registry'

const LOOP_KEYS: Record<LoopPolicy, StringKey> = {
  replay: 'loop.replay',
  continuous: 'loop.continuous',
  manual: 'loop.manual',
}

/** 右栏的档案记录：一条横线 + 小标签，下面是内容。 */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <Rule />
      <h2 className="label-mono">{title}</h2>
      {children}
    </section>
  )
}

export function EntryDetailPage({ slug }: { slug?: string }) {
  const t = useT()
  const locale = useLocale()
  const route = useRoute()
  const { stage: stagePref } = usePrefs()
  const entry = findEntry(slug)

  // 初值从 URL 读一次：分享链接里带着别人调好的参数
  const [values, setValues] = useState<ControlValues>(() =>
    entry ? parseEntryState(entry, route.query).values : {},
  )
  const [stageOverride, setStageOverride] = useState<StageId | null>(() =>
    entry ? parseEntryState(entry, route.query).stage : null,
  )
  const [replayKey, setReplayKey] = useState(0)
  const dirty = useRef(false)

  const stage = stageOverride ?? (entry ? resolveStage(entry, stagePref) : 'light')

  // 参数与舞台回写 URL（replace，不污染历史），同时记住调过的值给速查表用
  useEffect(() => {
    if (!entry) return
    const query = buildEntryQuery(entry, values, stageOverride)
    navigate(`/entry/${entry.slug}${query ? `?${query}` : ''}`, { replace: true })
    if (dirty.current) writeTunedValues(entry.slug, values)
  }, [entry, values, stageOverride])

  const resolved = useMemo(() => (entry ? resolveEntry(entry, locale) : null), [entry, locale])
  const related = useMemo(
    () =>
      entry
        ? entry.related
            .map((relSlug) => findEntry(relSlug))
            .filter((item): item is NonNullable<typeof item> => Boolean(item))
        : [],
    [entry],
  )

  if (!entry || !resolved) {
    return (
      <EmptyState
        title={t('entry.notFound')}
        body={t('entry.notFoundDesc', { n: ENTRIES.length })}
        action={
          <Link to="/browse" className={buttonClass({ variant: 'secondary', size: 'sm' })}>
            {t('entry.browse')}
          </Link>
        }
      />
    )
  }

  const category = categoryOf(entry.category)
  const categoryName = locale === 'en' ? category.nameEn : category.nameZh
  const loop = loopPolicy(entry)
  const aliases = resolved.aliases

  return (
    <article className="flex flex-col gap-8">
      {/* 展签：所在展厅 / 编号章 / 名称 / 一句话 / 别名 / 档案元数据 */}
      <header className="flex flex-col gap-4 border-b-2 border-ink pb-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <nav aria-label="breadcrumb" className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
            <Link to="/browse" className="no-underline hover:text-accent">
              {t('entry.browse')}
            </Link>
            <span className="text-line-strong">/</span>
            <Link to={`/browse?cat=${category.id}`} className="no-underline hover:text-accent">
              {categoryName}
            </Link>
          </nav>
          <span className="stamp">{resolved.code}</span>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="font-display text-h1 font-semibold text-ink">{resolved.nameZh}</h1>
          <p className="font-mono text-caption text-muted">{resolved.nameEn}</p>
        </div>

        <p className="max-w-[58ch] text-body text-ink-2">{resolved.oneLiner}</p>

        {aliases.length > 0 ? (
          <ul className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-dashed border-line pt-3 font-mono text-[11px] text-muted">
            <li>{t('entry.aliases')}</li>
            {aliases.map((alias, index) => (
              <li
                key={alias}
                className={`pl-2 ${index === 0 ? '' : 'border-l border-dashed border-line'}`}
              >
                {alias}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-col gap-2">
          <MetaLine
            items={[
              { label: t('entry.hallLabel'), value: categoryName },
              { label: t('entry.metaShape'), value: demoShapeLabel(entry.demo.shape, locale) },
              { label: t('entry.metaLoop'), value: t(LOOP_KEYS[loop]) },
              {
                label: t('entry.keywords'),
                value: entry.tags.map((tag) => tagLabel(tag, locale)).join(' / '),
              },
            ]}
          />
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        {/* 粘性列要停在粘性头部下面，不然一滚就被盖住 */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          {hasDemo(entry.slug) ? (
            <div className="overflow-hidden rounded-[6px] border border-line bg-raised">
              <ErrorBoundary label={entry.slug} message={t('error.renderFailed')}>
                <DemoStage
                  flush
                  stage={stage}
                  shape={entry.demo.shape}
                  loopable={shouldAutoLoop(entry)}
                  hint={interactionHintKey(entry)}
                  onStageChange={(next) => {
                    dirty.current = true
                    setStageOverride(next)
                  }}
                  onReplay={() => setReplayKey((key) => key + 1)}
                >
                  <DemoRunner
                    slug={entry.slug}
                    values={values}
                    stage={stage}
                    replayKey={replayKey}
                  />
                </DemoStage>
              </ErrorBoundary>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-3 py-2 font-mono text-[10px] text-muted">
                <span className="stamp">{resolved.code}</span>
                <span>
                  {t('entry.metaShape')} <span className="text-ink-2">{demoShapeLabel(entry.demo.shape, locale)}</span>
                </span>
                <span>
                  {t('entry.metaLoop')} <span className="text-ink-2">{t(LOOP_KEYS[loop])}</span>
                </span>
                <span className="ml-auto truncate">{resolved.nameEn}</span>
              </div>
              {hasLiveDemo(entry.slug) ? (
                <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2">
                  <span className="label-mono">{t('live.badge')}</span>
                  <Link
                    to={liveDemoPath(entry.slug)}
                    className={buttonClass({ variant: 'secondary', size: 'sm' })}
                  >
                    {t('live.open')} <IconArrowUpRight size={13} />
                  </Link>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-[6px] border border-dashed border-line px-4 py-8 text-caption text-muted">
              {t('entry.demoMissing')}
            </div>
          )}

          <ControlPanel
            controls={resolved.controls}
            values={values}
            onChange={(id, value) => {
              dirty.current = true
              setValues((prev) => ({ ...prev, [id]: value }))
            }}
            onReset={() => {
              dirty.current = true
              setValues(defaultValues(entry))
              setStageOverride(null)
            }}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <PromptPanel entry={resolved} values={values} stage={stage} />

          <Section title={t('entry.whenToUse')}>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-caption text-ink-2">
              {resolved.whenToUse.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="font-mono text-[11px] text-muted">
              {t('entry.scenes')}
              {resolved.scenes.map((scene) => sceneLabel(scene, locale)).join(' / ') ||
                t('entry.unlimited')}
            </p>
          </Section>

          {resolved.spec.length > 0 ? (
            <Section title={t('entry.spec')}>
              <dl className="flex flex-col divide-y divide-line text-caption">
                {resolved.spec.map((item) => (
                  <div key={item.label} className="flex justify-between gap-4 py-1.5">
                    <dt className="text-muted">{item.label}</dt>
                    <dd className="text-right font-mono text-[11px] text-ink-2">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          ) : null}

          {resolved.confusions.length > 0 ? (
            <Section title={t('entry.confusions')}>
              <ul className="flex flex-col gap-3">
                {resolved.confusions.map((item) => {
                  const target = resolveConfusionTarget(item.with, ENTRY_META)
                  const targetMeta = target ? resolveMeta(target, locale) : null
                  return (
                    <li key={item.with} className="flex flex-col gap-1">
                      <p className="text-caption text-ink">
                        {t('entry.confusionWith', { x: item.with })}
                      </p>
                      <p className="text-caption text-muted">{item.diff}</p>
                      {targetMeta ? (
                        <p className="flex flex-wrap items-baseline gap-2">
                          <span className="label-mono">{t('entry.compareTo')}</span>
                          <Link
                            to={entryPath(targetMeta.slug)}
                            className="text-link font-mono text-[11px] text-accent no-underline"
                          >
                            {t('entry.openCompare', {
                              x: locale === 'en' ? targetMeta.nameEn : targetMeta.nameZh,
                            })}
                          </Link>
                        </p>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            </Section>
          ) : null}

          {resolved.pitfalls.length > 0 ? (
            <Section title={t('entry.pitfalls')}>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-caption text-ink-2">
                {resolved.pitfalls.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Section>
          ) : null}

          <Section title={t('entry.reducedMotion')}>
            <p className="text-caption text-ink-2">{resolved.reducedMotion}</p>
          </Section>

          <Section title={t('entry.keywords')}>
            <ul className="flex flex-wrap gap-1.5">
              {resolved.keywords.map((keyword) => (
                <li key={keyword}>
                  <Tag>{keyword}</Tag>
                </li>
              ))}
            </ul>
          </Section>

          <Section title={t('entry.refs')}>
            <ul className="flex flex-col gap-1.5">
              {resolved.refs.map((ref) => (
                <li key={ref.url}>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-baseline gap-1.5 text-caption text-accent no-underline hover:underline"
                  >
                    <span>{ref.label}</span>
                    <IconExternal size={12} className="shrink-0 opacity-70" />
                  </a>
                </li>
              ))}
            </ul>
          </Section>

          {related.length > 0 ? (
            <Section title={t('entry.related')}>
              <ul className="flex flex-col divide-y divide-line">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      to={entryPath(item.slug)}
                      className="row-link -mx-2 flex items-baseline gap-3 px-2 py-2 no-underline"
                    >
                      <span className="font-mono text-[10px] text-accent">{item.code}</span>
                      <span className="font-display text-caption font-semibold text-ink">
                        {item.nameZh}
                      </span>
                      <span className="ml-auto truncate font-mono text-[10px] text-muted">
                        {item.nameEn}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </div>
      </div>
    </article>
  )
}
