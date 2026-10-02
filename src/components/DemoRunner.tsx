import { Suspense, useRef } from 'react'
import { demoFor } from '../demos/registry'
import { usePrefs } from '../lib/prefs'
import { useTimeScale } from '../lib/timeScale'
import type { ControlValues, StageId } from '../data/types'
import { STAGE_STYLES } from './stageStyles'

interface DemoRunnerProps {
  slug: string
  values: ControlValues
  stage: StageId
  replayKey: number
  /** 慢放时给 rAF 自驱的 demo 自己用 */
  timeScale?: number
  className?: string
}

/** 懒加载骨架：用舞台底色，避免加载时白闪与跳动 */
function DemoSkeleton({ stage }: { stage: StageId }) {
  const style = STAGE_STYLES[stage]
  return (
    <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
      <span
        className="h-2 w-16 rounded-full"
        style={{
          background: style.dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.18)',
          animation: 'museum-pulse 1.4s ease-in-out infinite',
        }}
      />
    </div>
  )
}

export function DemoRunner({
  slug,
  values,
  stage,
  replayKey,
  timeScale,
  className = '',
}: DemoRunnerProps) {
  const { slow } = usePrefs()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const scale = timeScale ?? (slow ? 1 / 3 : 1)
  useTimeScale(hostRef, scale)

  const Demo = demoFor(slug)
  if (!Demo) return null

  return (
    <div ref={hostRef} className={className}>
      <Suspense fallback={<DemoSkeleton stage={stage} />}>
        <Demo values={values} stage={stage} replayKey={replayKey} timeScale={scale} />
      </Suspense>
    </div>
  )
}
