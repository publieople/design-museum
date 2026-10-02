import { ENTRIES } from '../data'
import { useT } from '../i18n'
import { defaultValues } from '../lib/controls'
import { usePrefs } from '../lib/prefs'
import { DEMO_SLUGS, hasDemo } from '../demos/registry'
import { DemoRunner } from '../components/DemoRunner'
import { DemoStage } from '../components/DemoStage'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { resolveStage } from '../components/stageStyles'

/**
 * 开发期冒烟页：把全馆 demo 一次性挂起来，谁崩了一眼就能看到。
 * 生产构建里也可以访问，代价只是这一页本身很重。
 */
export function DebugAllPage() {
  const t = useT()
  const { stage: stagePref } = usePrefs()
  const missing = ENTRIES.filter((entry) => !hasDemo(entry.slug))
  const orphans = DEMO_SLUGS.filter((slug) => !ENTRIES.some((entry) => entry.slug === slug))

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t('debug.title')}</h1>
        <p className="text-sm text-muted">
          {t('debug.stats', {
            entries: ENTRIES.length,
            demos: DEMO_SLUGS.length,
            missing: missing.length,
            orphans: orphans.length,
          })}
        </p>
        {missing.length > 0 ? (
          <p className="font-mono text-xs text-accent">
            {t('debug.missing')}
            {missing.map((e) => e.slug).join(', ')}
          </p>
        ) : null}
        {orphans.length > 0 ? (
          <p className="font-mono text-xs text-accent">
            {t('debug.orphans')}
            {orphans.join(', ')}
          </p>
        ) : null}
      </header>

      <ul className="flex flex-col gap-6">
        {ENTRIES.map((entry) => {
          if (!hasDemo(entry.slug)) return null
          const stage = resolveStage(entry, stagePref)
          return (
            <li key={entry.slug} className="flex flex-col gap-2">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] text-accent">{entry.code}</span>
                <span className="font-display font-semibold">{entry.nameZh}</span>
                <span className="font-mono text-[11px] text-muted">{entry.slug}</span>
              </div>
              <ErrorBoundary label={entry.slug} message={t('error.renderFailed')}>
                <DemoStage stage={stage} onStageChange={() => {}} onReplay={() => {}}>
                  <DemoRunner
                    slug={entry.slug}
                    values={defaultValues(entry)}
                    stage={stage}
                    replayKey={0}
                  />
                </DemoStage>
              </ErrorBoundary>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
