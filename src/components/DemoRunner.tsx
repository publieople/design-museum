import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
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
  /**
   * 缩略图模式：把 demo 等比缩放到填满舞台。
   * 30 个 demo 各自按自己的尺寸设计（多数 max-w-xs），不缩放的话
   * 在宽卡片里只占一小块，两边全是空的。
   */
  fit?: boolean
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

/**
 * lazy demo 解析完并真正挂载时触发一次回调——
 * 用来在「骨架换成真身」之后重新量一次尺寸。
 */
function FitReporter({ onMount }: { onMount: () => void }) {
  useEffect(() => {
    onMount()
  }, [onMount])
  return null
}

// 下限定得低一些，高瘦的 demo（如缓动曲线对比）才缩得进舞台，不会被上下裁掉
const MIN_SCALE = 0.7
const MAX_SCALE = 1.7

export function DemoRunner({
  slug,
  values,
  stage,
  replayKey,
  timeScale,
  fit = false,
  className = '',
}: DemoRunnerProps) {
  const { slow, locale } = usePrefs()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)
  const scaleRef = useRef(1)
  const scaleValue = timeScale ?? (slow ? 1 / 3 : 1)
  useTimeScale(hostRef, scaleValue)

  const Demo = demoFor(slug)

  const measure = useCallback(() => {
    if (!fit) return
    const host = hostRef.current
    if (!host) return

    // offsetWidth / offsetHeight 不受 transform 影响，所以量一次就稳定，不会来回抖
    const inner = host.firstElementChild as HTMLElement | null
    const natural = inner ?? host
    const naturalWidth = natural.offsetWidth || host.offsetWidth
    const naturalHeight = natural.offsetHeight || host.offsetHeight
    if (!naturalWidth || !naturalHeight) return

    // host 是 flex 容器里被拉满的那个，它的尺寸就是可用的内容区
    const availableWidth = host.offsetWidth
    const availableHeight = host.offsetHeight
    if (availableWidth <= 0 || availableHeight <= 0) return

    const raw = Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight)
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(raw * 100) / 100))
    if (Math.abs(next - scaleRef.current) > 0.01) {
      scaleRef.current = next
      setScale(next)
    }
  }, [fit])

  useEffect(() => {
    if (!fit) return
    const host = hostRef.current
    const box = host?.parentElement
    if (!host || !box) return

    measure()
    const raf = window.requestAnimationFrame(measure)
    // 字体与懒加载内容会让 demo 的自然尺寸在挂载后变一次，补测两轮
    const late = [window.setTimeout(measure, 250), window.setTimeout(measure, 900)]

    if (typeof ResizeObserver === 'undefined') {
      const timer = window.setTimeout(measure, 300)
      return () => {
        window.cancelAnimationFrame(raf)
        window.clearTimeout(timer)
        late.forEach(window.clearTimeout)
      }
    }

    // 只观察舞台（尺寸变化源）与宿主（demo 换尺寸时）——两者都不受 transform 影响
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    observer.observe(host)
    return () => {
      window.cancelAnimationFrame(raf)
      late.forEach(window.clearTimeout)
      observer.disconnect()
    }
  }, [fit, measure, slug, stage])

  if (!Demo) return null

  return (
    <div
      ref={hostRef}
      className={`flex h-full w-full items-center justify-center ${className}`}
      style={fit ? { transform: `scale(${scale})` } : undefined}
    >
      <Suspense fallback={<DemoSkeleton stage={stage} />}>
        {fit ? <FitReporter onMount={measure} /> : null}
        <Demo
          values={values}
          stage={stage}
          replayKey={replayKey}
          timeScale={scaleValue}
          locale={locale}
        />
      </Suspense>
    </div>
  )
}
