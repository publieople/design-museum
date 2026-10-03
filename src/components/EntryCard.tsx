import { useMemo } from 'react'
import { useT, useLocale } from '../i18n'
import { defaultValues } from '../lib/controls'
import { aliasesFor, resolveEntry } from '../lib/localize'
import { interactionHintKey, shouldAutoLoop } from '../lib/loop'
import { usePrefs } from '../lib/prefs'
import { Link } from '../lib/router'
import { useReplayKey } from '../lib/replay'
import { useInView } from '../lib/viewport'
import type { Entry } from '../data/types'
import { DemoRunner } from './DemoRunner'
import { DemoStage } from './DemoStage'
import { ErrorBoundary } from './ErrorBoundary'
import { hasDemo } from '../demos/registry'
import { resolveStage } from './stageStyles'

interface EntryCardProps {
  entry: Entry
  /** 卡片缩略演示：默认开启；不在视口里时只挂骨架不挂 demo */
  showDemo?: boolean
}

export function EntryCard({ entry, showDemo = true }: EntryCardProps) {
  const t = useT()
  const locale = useLocale()
  const { stage: stagePref } = usePrefs()
  const { ref, inView } = useInView<HTMLLIElement>({ rootMargin: '240px' })
  const [replayKey, replay] = useReplayKey()

  const resolved = useMemo(() => resolveEntry(entry, locale), [entry, locale])
  const values = useMemo(() => defaultValues(entry), [entry])
  const aliases = useMemo(() => aliasesFor(resolved.aliases, locale), [resolved.aliases, locale])
  const stage = resolveStage(entry, stagePref)

  const title = locale === 'en' ? resolved.nameEn : resolved.nameZh
  const subtitle = locale === 'en' ? resolved.nameZh : resolved.nameEn

  return (
    <li
      ref={ref}
      className="flex flex-col overflow-hidden rounded-xl border border-line bg-raised shadow-[var(--shadow-card)] transition-[translate,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-accent/45 hover:shadow-[var(--shadow-lift)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* 舞台永远渲染：只有它在这儿占住 aspect-ratio 的高度，卡片高度才是恒定的。
          以前「进视口才渲染整个舞台」会让卡片在滚动中瞬间长高 400px，
          触发浏览器滚动锚定，页面就会突然往下跳。 */}
      {showDemo && hasDemo(entry.slug) ? (
        <ErrorBoundary label={entry.slug} message={t('error.renderFailed')}>
          <DemoStage
            compact
            stage={stage}
            className="rounded-none border-x-0 border-t-0"
            loopable={shouldAutoLoop(entry)}
            hint={interactionHintKey(entry)}
            onStageChange={() => {}}
            onReplay={replay}
          >
            {inView ? (
              <DemoRunner slug={entry.slug} values={values} stage={stage} replayKey={replayKey} fit />
            ) : null}
          </DemoStage>
        </ErrorBoundary>
      ) : null}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="stamp">{resolved.code}</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
            {resolved.nameEn}
          </span>
        </div>

        <h3 className="font-display text-lg font-semibold leading-tight">
          <Link to={`/entry/${resolved.slug}`} className="no-underline">
            {title}
          </Link>
        </h3>

        {subtitle !== title ? (
          <p className="-mt-1 font-mono text-[10px] text-muted">{subtitle}</p>
        ) : null}

        <p className="text-sm text-muted">{resolved.oneLiner}</p>

        {aliases.length > 0 ? (
          <p className="mt-auto pt-2 font-mono text-[11px] text-muted">
            {aliases.slice(0, 3).join(' / ')}
          </p>
        ) : null}
      </div>
    </li>
  )
}
