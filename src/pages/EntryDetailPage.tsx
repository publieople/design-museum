import { useMemo, useState } from 'react'
import { findEntry, ENTRIES } from '../data'
import { categoryOf, sceneLabel } from '../data/taxonomy'
import type { StageId } from '../data/types'
import { defaultValues } from '../lib/controls'
import { Link } from '../lib/router'
import { ControlPanel } from '../components/ControlPanel'
import { DemoStage } from '../components/DemoStage'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { PromptCard } from '../components/PromptCard'
import { preferredStageFor } from '../components/stageStyles'
import { demoFor } from '../demos/registry'

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-4">
      <h2 className="label-mono mb-2">{title}</h2>
      {children}
    </section>
  )
}

export function EntryDetailPage({ slug }: { slug?: string }) {
  const entry = findEntry(slug)
  const [stage, setStage] = useState<StageId>(() => (entry ? preferredStageFor(entry) : 'light'))
  const [replayKey, setReplayKey] = useState(0)
  const [values, setValues] = useState(() => (entry ? defaultValues(entry) : {}))

  const related = useMemo(
    () => (entry ? entry.related.map((s) => findEntry(s)).filter(Boolean) : []),
    [entry],
  )

  if (!entry) {
    return (
      <div className="flex flex-col items-start gap-3">
        <h1 className="font-display text-2xl font-semibold">没有这件展品</h1>
        <p className="text-sm text-muted">
          可能是链接过期了。全馆共 {ENTRIES.length} 件展品，回
          <Link to="/browse" className="mx-1 text-accent no-underline">
            词条库
          </Link>
          看看。
        </p>
      </div>
    )
  }

  const Demo = demoFor(entry.slug)
  const category = categoryOf(entry.category)

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <nav aria-label="面包屑" className="font-mono text-[11px] text-muted">
          <Link to="/browse" className="no-underline hover:text-accent">
            词条库
          </Link>
          <span className="mx-1">/</span>
          <Link to={`/browse?cat=${category.id}`} className="no-underline hover:text-accent">
            {category.nameZh}
          </Link>
          <span className="mx-1">/</span>
          <span className="text-accent">{entry.code}</span>
        </nav>

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{entry.nameZh}</h1>
          <p className="font-mono text-sm text-muted">{entry.nameEn}</p>
        </div>

        <p className="max-w-2xl text-muted">{entry.oneLiner}</p>

        {entry.aliases.length > 0 ? (
          <p className="font-mono text-[11px] text-muted">
            又叫：{entry.aliases.join(' / ')}
          </p>
        ) : null}
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          {Demo ? (
            <ErrorBoundary label={entry.slug}>
              <DemoStage
                stage={stage}
                onStageChange={setStage}
                onReplay={() => setReplayKey((key) => key + 1)}
              >
                <Demo values={values} stage={stage} replayKey={replayKey} />
              </DemoStage>
            </ErrorBoundary>
          ) : (
            <div className="rounded-lg border border-dashed border-line p-6 text-sm text-muted">
              这件展品的演示还没做好。
            </div>
          )}

          <ControlPanel
            controls={entry.controls}
            values={values}
            onChange={(id, value) => setValues((prev) => ({ ...prev, [id]: value }))}
            onReset={() => setValues(defaultValues(entry))}
          />
        </div>

        <div className="flex flex-col gap-6">
          <PromptCard entry={entry} values={values} />

          <Block title="什么时候用">
            <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
              {entry.whenToUse.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-2 font-mono text-[11px] text-muted">
              适用场景：{entry.scenes.map(sceneLabel).join(' / ') || '不限'}
            </p>
          </Block>

          {entry.spec.length > 0 ? (
            <Block title="推荐取值">
              <dl className="flex flex-col divide-y divide-line text-sm">
                {entry.spec.map((item) => (
                  <div key={item.label} className="flex justify-between gap-4 py-1.5">
                    <dt className="text-muted">{item.label}</dt>
                    <dd className="font-mono text-xs">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </Block>
          ) : null}

          {entry.confusions.length > 0 ? (
            <Block title="别搞混">
              <ul className="flex flex-col gap-3 text-sm">
                {entry.confusions.map((item) => (
                  <li key={item.with}>
                    <p className="font-medium">和「{item.with}」的区别</p>
                    <p className="text-muted">{item.diff}</p>
                  </li>
                ))}
              </ul>
            </Block>
          ) : null}

          {entry.pitfalls.length > 0 ? (
            <Block title="容易踩的坑">
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
                {entry.pitfalls.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Block>
          ) : null}

          <Block title="无障碍降级">
            <p className="text-sm text-muted">{entry.reducedMotion}</p>
          </Block>

          <Block title="关键词">
            <ul className="flex flex-wrap gap-2">
              {entry.keywords.map((keyword) => (
                <li
                  key={keyword}
                  className="rounded border border-line px-2 py-0.5 font-mono text-[11px] text-muted"
                >
                  {keyword}
                </li>
              ))}
            </ul>
          </Block>

          <Block title="参考">
            <ul className="flex flex-col gap-1 text-sm">
              {entry.refs.map((ref) => (
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
            <Block title="相关展品">
              <ul className="flex flex-wrap gap-2">
                {related.map((item) =>
                  item ? (
                    <li key={item.slug}>
                      <Link
                        to={`/entry/${item.slug}`}
                        className="rounded-full border border-line px-3 py-1 text-xs no-underline transition-colors hover:border-accent hover:text-accent"
                      >
                        {item.nameZh}
                      </Link>
                    </li>
                  ) : null,
                )}
              </ul>
            </Block>
          ) : null}
        </div>
      </div>
    </article>
  )
}
