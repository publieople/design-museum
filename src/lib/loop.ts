import type { Entry } from '../data/types'

export type LoopPolicy = 'replay' | 'continuous' | 'manual'

export function loopPolicy(entry: Pick<Entry, 'loop'>): LoopPolicy {
  return entry.loop ?? 'replay'
}

/** 只有「一次性动画」才该被循环定时器重挂载 */
export function shouldAutoLoop(entry: Pick<Entry, 'loop'>): boolean {
  return loopPolicy(entry) === 'replay'
}

/**
 * 缩略图角标：只在「不自己动、必须用户上手」时出现。
 * 滚动驱动类的卡片不放角标的话，看上去就只是一张静止的图。
 */
export function interactionHintKey(entry: Pick<Entry, 'loop'>): 'stage.needsScroll' | null {
  return loopPolicy(entry) === 'manual' ? 'stage.needsScroll' : null
}
