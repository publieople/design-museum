import { type CSSProperties, type ReactNode } from 'react'
import { STAGES } from '../data/taxonomy'
import type { StageId } from '../data/types'
import { STAGE_STYLES } from './stageStyles'

interface DemoStageProps {
  stage: StageId
  onStageChange: (stage: StageId) => void
  onReplay: () => void
  children: ReactNode
  /** 卡片缩略图用：隐藏工具栏、压缩内边距 */
  compact?: boolean
  className?: string
  /** 额外的舞台内边距控制 */
  padded?: boolean
}

export function DemoStage({
  stage,
  onStageChange,
  onReplay,
  children,
  compact = false,
  className = '',
  padded = true,
}: DemoStageProps) {
  const style = STAGE_STYLES[stage]
  const stageStyle = {
    background: style.background,
    color: style.color,
    '--stage-ink': style.color,
    '--stage-muted': style.muted,
  } as CSSProperties

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-line ${className}`}
      style={stageStyle}
    >
      {padded ? (
        <div
          className={
            compact
              ? 'grid h-52 place-items-center overflow-hidden p-4'
              : 'grid min-h-64 place-items-center p-8'
          }
        >
          {children}
        </div>
      ) : (
        children
      )}

      {compact ? null : (
        // 工具条固定用深色半透明底 + 白字：四种舞台背景的明度差很大，
        // 跟着舞台取色会在浅色/照片感背景上糊掉。
        <div className="absolute right-2 top-2 flex items-center gap-1.5">
          <div
            className="flex overflow-hidden rounded-full p-0.5 backdrop-blur-md"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            role="group"
            aria-label="演示背景"
          >
            {STAGES.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.hint}
                aria-pressed={item.id === stage}
                onClick={() => onStageChange(item.id)}
                className={`cursor-pointer rounded-full px-2 py-1 font-mono text-[10px] tracking-wide transition-colors ${
                  item.id === stage
                    ? 'bg-white text-black'
                    : 'text-white/65 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onReplay}
            className="cursor-pointer rounded-full px-2.5 py-1 font-mono text-[10px] tracking-wide text-white/85 backdrop-blur-md transition-colors hover:text-white"
            style={{ background: 'rgba(0,0,0,0.45)' }}
          >
            重播
          </button>
        </div>
      )}
    </div>
  )
}
