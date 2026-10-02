import { useEffect, useMemo, useRef, useState } from 'react'
import { ENTRIES, findEntry } from '../data'
import { categoryOf, sceneLabel } from '../data/taxonomy'
import type { ControlValues, StageId } from '../data/types'
import { useT, useLocale } from '../i18n'
import { defaultValues } from '../lib/controls'
import { buildEntryQuery, parseEntryState, writeTunedValues } from '../lib/entryState'
import { resolveEntry } from '../lib/localize'
import { usePrefs } from '../lib/prefs'
import { Link, navigate, useRoute } from '../lib/router'
import { ControlPanel } from '../components/ControlPanel'
import { DemoRunner } from '../components/DemoRunner'
import { DemoStage } from '../components/DemoStage'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { PromptCard } from '../components/PromptCard'
import { resolveStage } from '../components/stageStyles'
import { hasDemo } from '../demos/registry'

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-4">
      <h2 className="label-mono mb-2">{title}</h2>
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
      <div className="flex flex-col items-start gap-3">
        <h1 className="font-display text-2xl font-semibold">{t('entry.notFound')}</h1>
        <p className="text-sm text-muted">
          {t('entry.notFoundDesc', { n: ENTRIES.length })}
          <Link to="/browse" className="mx-1 text-accent no-underline">
            {t('entry.browse')}
          </Link>
        </p>
      </div>
    )
  }

  const category = categoryOf(entry.category)

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <nav aria-label="breadcrumb" className="font-mono text-[11px] text-muted">
          <Link to="/browse" className="no-underline hover:text-accent">
            {t('entry.browse')}
          </Link>
          <span className="mx-1">/</span>
          <Link to={`/browse?cat=${category.id}`} className="no-underline hover:text-accent">
            {locale === 'en' ? category.nameEn : category.nameZh}
          </Link>
          <span className="mx-1">/</span>
          <span className="text-accent">{resolved.code}</span>
        </nav>

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{resolved.nameZh}</h1>
          <p className="font-mono text-sm text-muted">{resolved.nameEn}</p>
        </div>

        <p className="max-w-2xl text-muted">{resolved.oneLiner}</p>

        {resolved.aliases.length > 0 ? (
          <p className="font-mono text-[11px] text-muted">
            {t('entry.aliases')}
            {resolved.aliases.join(' / ')}
          </p>
        ) : null}
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          {hasDemo(entry.slug) ? (
            <ErrorBoundary label={entry.slug} message={t('error.renderFailed')}>
              <DemoStage
                stage={stage}
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
          ) : (
            <div className="rounded-lg border border-dashed border-line p-6 text-sm text-muted">
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

        <div className="flex flex-col gap-6">
          <PromptCard entry={resolved} values={values} stage={stage} />

          <Block title={t('entry.whenToUse')}>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
              {resolved.whenToUse.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-2 font-mono text-[11px] text-muted">
              {t('entry.scenes')}
              {resolved.scenes.map((scene) => sceneLabel(scene, locale)).join(' / ') ||
                t('entry.unlimited')}
            </p>
          </Block>

          {resolved.spec.length > 0 ? (
            <Block title={t('entry.spec')}>
              <dl className="flex flex-col divide-y divide-line text-sm">
                {resolved.spec.map((item) => (
                  <div key={item.label} className="flex justify-between gap-4 py-1.5">
                    <dt className="text-muted">{item.label}</dt>
                    <dd className="font-mono text-xs">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </Block>
          ) : null}

          {resolved.confusions.length > 0 ? (
            <Block title={t('entry.confusions')}>
              <ul className="flex flex-col gap-3 text-sm">
                {resolved.confusions.map((item) => (
                  <li key={item.with}>
                    <p className="font-medium">{t('entry.confusionWith', { x: item.with })}</p>
                    <p className="text-muted">{item.diff}</p>
                  </li>
                ))}
              </ul>
            </Block>
          ) : null}

          {resolved.pitfalls.length > 0 ? (
            <Block title={t('entry.pitfalls')}>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
                {resolved.pitfalls.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Block>
          ) : null}

          <Block title={t('entry.reducedMotion')}>
            <p className="text-sm text-muted">{resolved.reducedMotion}</p>
          </Block>

          <Block title={t('entry.keywords')}>
            <ul className="flex flex-wrap gap-2">
              {resolved.keywords.map((keyword) => (
                <li
                  key={keyword}
                  className="rounded border border-line px-2 py-0.5 font-mono text-[11px] text-muted"
                >
                  {keyword}
                </li>
              ))}
            </ul>
          </Block>

          <Block title={t('entry.refs')}>
            <ul className="flex flex-col gap-1 text-sm">
              {resolved.refs.map((ref) => (
                <li key={ref.url}>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent no-underline hover:underline"
                  >
                    {ref.label}
                  </a>
                </li>
              ))}
            </ul>
          </Block>

          {related.length > 0 ? (
            <Block title={t('entry.related')}>
              <ul className="flex flex-wrap gap-2">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      to={`/entry/${item.slug}`}
                      className="rounded-full border border-line px-3 py-1 text-xs no-underline transition-colors hover:border-accent hover:text-accent"
                    >
                      {item.nameZh}
                    </Link>
                  </li>
                ))}
              </ul>
            </Block>
          ) : null}
        </div>
      </div>
    </article>
  )
}
