import { useMemo } from 'react'
import { useT, useLocale } from '../i18n'
import { defaultValues } from '../lib/controls'
import { resolveEntry } from '../lib/localize'
import { usePrefs } from '../lib/prefs'
import { Link } from '../lib/router'
import { useInView } from '../lib/viewport'
import type { Entry } from '../data/types'
import { DemoRunner } from './DemoRunner'
import { DemoStage } from './DemoStage'
import { ErrorBoundary } from './ErrorBoundary'
import { hasDemo } from '../demos/registry'
import { resolveStage } from './stageStyles'

interface EntryCardProps {
  entry: Entry
  /** 卡片缩略演示：默认开启，不可见时不挂载 */
  showDemo?: boolean
}

export function EntryCard({ entry, showDemo = true }: EntryCardProps) {
  const t = useT()
  const locale = useLocale()
  const { stage: stagePref } = usePrefs()
  const { ref, inView } = useInView<HTMLLIElement>({ rootMargin: '240px' })

  const resolved = useMemo(() => resolveEntry(entry, locale), [entry, locale])
  const values = useMemo(() => defaultValues(entry), [entry])
  const stage = resolveStage(entry, stagePref)
  const showStage = showDemo && inView && hasDemo(entry.slug)

  return (
    <li
      ref={ref}
      className="flex flex-col overflow-hidden rounded-lg border border-line bg-raised transition-colors hover:border-accent/50"
    >
      {showStage ? (
        <ErrorBoundary label={entry.slug} message={t('error.renderFailed')}>
          <DemoStage
            compact
            stage={stage}
            className="rounded-none border-x-0 border-t-0"
            onStageChange={() => {}}
            onReplay={() => {}}
          >
            <DemoRunner slug={entry.slug} values={values} stage={stage} replayKey={0} />
          </DemoStage>
        </ErrorBoundary>
      ) : null}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-[11px] tracking-wider text-accent">{resolved.code}</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
            {resolved.nameEn}
          </span>
        </div>

        <h3 className="font-display text-lg font-semibold leading-tight">
          <Link to={`/entry/${resolved.slug}`} className="no-underline">
            {resolved.nameZh}
          </Link>
        </h3>

        <p className="text-sm text-muted">{resolved.oneLiner}</p>

        {resolved.aliases.length > 0 ? (
          <p className="mt-auto pt-2 font-mono text-[11px] text-muted">
            {resolved.aliases.slice(0, 3).join(' / ')}
          </p>
        ) : null}
      </div>
    </li>
  )
}
