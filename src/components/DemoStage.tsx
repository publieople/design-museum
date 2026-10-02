import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { STAGES, stageHint, stageLabel } from '../data/taxonomy'
import type { StageId } from '../data/types'
import { useT } from '../i18n'
import { usePrefs } from '../lib/prefs'
import { useLocale } from '../i18n'
import { STAGE_STYLES } from './stageStyles'

interface DemoStageProps {
  stage: StageId
  onStageChange: (stage: StageId) => void
  onReplay: () => void
  children: ReactNode
  /** 卡片缩略图用：隐藏工具栏、压缩内边距、不参与循环重播 */
  compact?: boolean
  className?: string
}

/** 循环重播的间隔：比大多数 demo 的动画总时长略长一点 */
const LOOP_INTERVAL_MS = 2600

export function DemoStage({
  stage,
  onStageChange,
  onReplay,
  children,
  compact = false,
  className = '',
}: DemoStageProps) {
  const t = useT()
  const locale = useLocale()
  const { loop, slow, setPref } = usePrefs()
  const style = STAGE_STYLES[stage]

  // 循环重播：靠递增 replayKey 让 demo 重新挂载，demo 侧不需要任何改动
  useEffect(() => {
    if (compact || !loop) return
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }
    const timer = window.setInterval(onReplay, LOOP_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [compact, loop, onReplay])

  const stageStyle = {
    background: style.background,
    color: style.color,
    '--stage-ink': style.color,
    '--stage-muted': style.muted,
  } as CSSProperties

  const toolbarButton = (active: boolean) =>
    `cursor-pointer rounded-full px-2 py-1 font-mono text-[10px] tracking-wide transition-colors ${
      active ? 'bg-white text-black' : 'text-white/65 hover:text-white'
    }`

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-line ${className}`}
      style={stageStyle}
    >
      <div
        className={
          compact
            ? 'grid h-52 place-items-center overflow-hidden p-4'
            : 'grid min-h-64 place-items-center p-8'
        }
      >
        {children}
      </div>

      {compact ? null : (
        // 工具条固定深色半透明底 + 白字：四种舞台背景明度差很大，
        // 跟着舞台取色会在浅色/照片感背景上糊掉。
        <div className="absolute right-2 top-2 flex flex-wrap items-center justify-end gap-1.5">
          <div
            className="flex overflow-hidden rounded-full p-0.5 backdrop-blur-md"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            role="group"
            aria-label={t('entry.stageGroup')}
          >
            {STAGES.map((item) => (
              <button
                key={item.id}
                type="button"
                title={stageHint(item.id, locale)}
                aria-pressed={item.id === stage}
                onClick={() => onStageChange(item.id)}
                className={toolbarButton(item.id === stage)}
              >
                {stageLabel(item.id, locale)}
              </button>
            ))}
          </div>

          <div
            className="flex items-center gap-0.5 rounded-full p-0.5 backdrop-blur-md"
            style={{ background: 'rgba(0,0,0,0.45)' }}
          >
            <button
              type="button"
              aria-pressed={loop}
              onClick={() => setPref('loop', !loop)}
              className={toolbarButton(loop)}
            >
              {t('stage.loop')}
            </button>
            <button
              type="button"
              aria-pressed={slow}
              onClick={() => setPref('slow', !slow)}
              className={toolbarButton(slow)}
            >
              {t('stage.slow')}
            </button>
            <button type="button" onClick={onReplay} className={toolbarButton(false)}>
              {t('stage.replay')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
