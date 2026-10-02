import type { Entry, StageId } from '../data/types'
import type { StagePref } from '../lib/prefs'

export interface StageStyle {
  background: string
  color: string
  muted: string
  /** 深色舞台需要给 demo 换一套前景色 */
  dark: boolean
}

/**
 * demo 舞台与界面主题刻意解耦：毛玻璃、发光这类效果在深色或彩色背景上才看得出来，
 * 界面的深浅色跟着系统走，但展品的背景由观众自己挑。
 */
export const STAGE_STYLES: Record<StageId, StageStyle> = {
  light: {
    background: `repeating-linear-gradient(0deg, rgba(20,18,14,0.07) 0 1px, transparent 1px 28px),
      repeating-linear-gradient(90deg, rgba(20,18,14,0.07) 0 1px, transparent 1px 28px),
      linear-gradient(180deg, #f4f2ec, #e8e4da)`,
    color: '#16161a',
    muted: 'rgba(22,22,26,0.55)',
    dark: false,
  },
  dark: {
    background: `repeating-linear-gradient(0deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 28px),
      repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 28px),
      linear-gradient(180deg, #131317, #0b0b0e)`,
    color: '#f2f2f5',
    muted: 'rgba(242,242,245,0.6)',
    dark: true,
  },
  accent: {
    background: 'linear-gradient(135deg, #c9382a 0%, #7b2ff7 55%, #1f6feb 100%)',
    color: '#ffffff',
    muted: 'rgba(255,255,255,0.72)',
    dark: true,
  },
  photo: {
    background: `radial-gradient(120% 90% at 15% 18%, #ffd6a5 0%, transparent 55%),
      radial-gradient(100% 80% at 85% 12%, #9ad0ff 0%, transparent 52%),
      radial-gradient(90% 90% at 72% 88%, #ff9ecd 0%, transparent 55%),
      radial-gradient(80% 70% at 18% 92%, #b8f2d8 0%, transparent 60%),
      linear-gradient(140deg, #e8e4ff, #fff3e0)`,
    color: '#1b1b20',
    muted: 'rgba(27,27,32,0.6)',
    dark: false,
  },
}

/**
 * 卡片缩略图默认用哪个舞台。质感类效果离开彩色/照片感背景就不成立，
 * 其余一律用浅色墙——深色舞台在深色界面里会和卡片糊成一片，读不出「展品框」。
 * 想看别的背景，详情页随时能切。
 */
export function preferredStageFor(entry: Entry): StageId {
  return entry.category === 'visual' ? 'photo' : 'light'
}

/**
 * 把用户的「展品背景」偏好解成实际舞台：
 * auto = 按展品类型挑；否则一律用用户选的背景，全馆统一。
 */
export function resolveStage(entry: Entry, pref: StagePref): StageId {
  if (pref !== 'auto') return pref
  return preferredStageFor(entry)
}
