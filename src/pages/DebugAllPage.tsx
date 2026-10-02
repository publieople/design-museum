import { ENTRIES } from '../data'
import { defaultValues } from '../lib/controls'
import { DEMO_SLUGS, demoFor } from '../demos/registry'
import { DemoStage } from '../components/DemoStage'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { preferredStageFor } from '../components/stageStyles'

/**
 * 开发期冒烟页：把全馆 demo 一次性挂起来，谁崩了一眼就能看到。
 * 生产构建里也可以访问，代价只是这一页本身很重。
 */
export function DebugAllPage() {
  const missing = ENTRIES.filter((entry) => !demoFor(entry.slug))
  const orphans = DEMO_SLUGS.filter((slug) => !ENTRIES.some((entry) => entry.slug === slug))

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight">冒烟测试 · 全部 demo</h1>
        <p className="text-sm text-muted">
          词条 {ENTRIES.length} 件 · demo {DEMO_SLUGS.length} 个 · 缺 demo {missing.length} 件 ·
          孤儿 demo {orphans.length} 个
        </p>
        {missing.length > 0 ? (
          <p className="font-mono text-xs text-accent">缺 demo：{missing.map((e) => e.slug).join(', ')}</p>
        ) : null}
        {orphans.length > 0 ? (
          <p className="font-mono text-xs text-accent">孤儿 demo：{orphans.join(', ')}</p>
        ) : null}
      </header>

      <ul className="flex flex-col gap-6">
        {ENTRIES.map((entry) => {
          const Demo = demoFor(entry.slug)
          if (!Demo) return null
          const stage = preferredStageFor(entry)
          return (
            <li key={entry.slug} className="flex flex-col gap-2">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] text-accent">{entry.code}</span>
                <span className="font-display font-semibold">{entry.nameZh}</span>
                <span className="font-mono text-[11px] text-muted">{entry.slug}</span>
              </div>
              <ErrorBoundary label={entry.slug}>
                <DemoStage stage={stage} onStageChange={() => {}} onReplay={() => {}}>
                  <Demo values={defaultValues(entry)} stage={stage} replayKey={0} />
                </DemoStage>
              </ErrorBoundary>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
