import { useMemo } from 'react'
import { defaultValues } from '../lib/controls'
import { Link } from '../lib/router'
import { useInView } from '../lib/viewport'
import type { Entry, StageId } from '../data/types'
import { DemoStage } from './DemoStage'
import { ErrorBoundary } from './ErrorBoundary'
import { demoFor } from '../demos/registry'
import { preferredStageFor } from './stageStyles'

interface EntryCardProps {
  entry: Entry
  /** 卡片缩略演示：默认开启，不可见时不挂载 */
  showDemo?: boolean
}

export function EntryCard({ entry, showDemo = true }: EntryCardProps) {
  const { ref, inView } = useInView<HTMLLIElement>({ rootMargin: '240px' })
  const values = useMemo(() => defaultValues(entry), [entry])
  const Demo = demoFor(entry.slug)
  const stage: StageId = preferredStageFor(entry)

  return (
    <li
      ref={ref}
      className="flex flex-col overflow-hidden rounded-lg border border-line bg-raised transition-colors hover:border-accent/50"
    >
      {showDemo && inView && Demo ? (
        <ErrorBoundary label={entry.slug}>
          <DemoStage
            compact
            stage={stage}
            className="rounded-none border-x-0 border-t-0"
            onStageChange={() => {}}
            onReplay={() => {}}
          >
            <Demo values={values} stage={stage} replayKey={0} />
          </DemoStage>
        </ErrorBoundary>
      ) : null}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-[11px] tracking-wider text-accent">{entry.code}</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
            {entry.nameEn}
          </span>
        </div>

        <h3 className="font-display text-lg font-semibold leading-tight">
          <Link to={`/entry/${entry.slug}`} className="no-underline">
            {entry.nameZh}
          </Link>
        </h3>

        <p className="text-sm text-muted">{entry.oneLiner}</p>

        {entry.aliases.length > 0 ? (
          <p className="mt-auto pt-2 font-mono text-[11px] text-muted">
            又叫：{entry.aliases.slice(0, 3).join(' / ')}
          </p>
        ) : null}
      </div>
    </li>
  )
}
