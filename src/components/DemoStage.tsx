import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { STAGES, stageHint, stageLabel } from '../data/taxonomy'
import type { DemoShape, StageId } from '../data/types'
import { useT } from '../i18n'
import { usePrefs } from '../lib/prefs'
import { stageContentClass } from '../lib/loop'
import { useLocale } from '../i18n'
import { STAGE_STYLES } from './stageStyles'

interface DemoStageProps {
  stage: StageId
  onStageChange: (stage: StageId) => void
  onReplay: () => void
  children: ReactNode
  /** 卡片缩略图用：隐藏工具栏、压缩内边距 */
  compact?: boolean
  /** 这个演示该不该被循环定时器重挂载；由词条的 loop 策略决定 */
  loopable?: boolean
  /** 演示形态：决定内容区高度与缩略图策略（见 docs/ENTRY-SPEC.md 第 4 节） */
  shape?: DemoShape
  /** 缩略图定格：非固定舞台的卡片不接指针事件，只给一帧静态画面 */
  still?: boolean
  /** 舞台角标：卡片里或详情页里看不出效果时，告诉观众要自己动手 */
  hint?: 'stage.needsScroll' | 'stage.tapToTry' | null
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
  shape = 'stage',
  still = false,
  loopable = true,
  hint = null,
  className = '',
}: DemoStageProps) {
  const t = useT()
  const locale = useLocale()
  const { loop, slow, setPref } = usePrefs()
  const style = STAGE_STYLES[stage]

  // 循环重播：靠递增 replayKey 让 demo 重新挂载，demo 侧不需要任何改动。
  // 但不是所有 demo 都适合被重置：进度类会瞬间弹回去、滚动类会跟用户打架、
  // 自驱类本来就在动。由词条的 loop 策略说了算。
  useEffect(() => {
    if (!loop || !loopable) return
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }
    const timer = window.setInterval(onReplay, LOOP_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [loop, loopable, onReplay])

  const stageStyle = {
    background: style.background,
    color: style.color,
    '--stage-ink': style.color,
    '--stage-muted': style.muted,
    // demo 需要不透明底色时用它（见 StageStyle.base）
    '--stage-bg': style.base,
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
      {/* flex 而不是 grid：grid 的 justify-items:center 会让 w-full 的子元素按 max-content 收缩，
          卡片里的 demo 于是塌成一条窄带。高度用 aspect-ratio 跟着卡片宽度自适应，
          非固定舞台（滚动 / 指针 / 整页对比）在详情页要高一些。 */}
      <div
        className={`${stageContentClass(shape, compact)}${still ? ' pointer-events-none select-none' : ''}`}
        aria-hidden={still || undefined}
      >
        {children}
      </div>

      {hint ? (
        <span
          className="pointer-events-none absolute bottom-2 left-2 rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wide text-white/90 backdrop-blur-md"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        >
          {t(hint)}
        </span>
      ) : null}

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
