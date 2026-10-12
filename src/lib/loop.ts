import type { DemoShape, EntryMeta } from '../data/types'

export type LoopPolicy = 'replay' | 'continuous' | 'manual'

export function loopPolicy(entry: Pick<EntryMeta, 'loop'>): LoopPolicy {
  return entry.loop ?? 'replay'
}

/** 只有「一次性动画」才该被循环定时器重挂载 */
export function shouldAutoLoop(entry: Pick<EntryMeta, 'loop'>): boolean {
  return loopPolicy(entry) === 'replay'
}

/** 舞台提示的文案键（详情页与卡片缩略图都用它） */
export type StageHintKey = 'stage.needsScroll' | 'stage.tapToTry'

/**
 * 详情页提示：这一档里既有滚动驱动也有点击/拖拽驱动，文案要对两者都成立。
 * 只在不自己动、必须用户上手时出现——滚动驱动类不提示的话，看上去就是一张静止的图。
 */
export function interactionHintKey(entry: Pick<EntryMeta, 'loop'>): StageHintKey | null {
  return loopPolicy(entry) === 'manual' ? 'stage.needsScroll' : null
}

/**
 * 卡片缩略图能不能放活的交互：只有固定舞台能。
 * 滚动类塞进卡片会跟页面滚动打架，指针类缩到 0.7–1.7 倍也玩不了，
 * 所以非固定舞台的缩略图定格（still），角标换成「点开自己动手」。
 */
export function thumbnailIsStill(entry: Pick<EntryMeta, 'demo'>): boolean {
  return entry.demo.shape !== 'stage'
}

export function thumbHintKey(entry: Pick<EntryMeta, 'loop' | 'demo'>): StageHintKey | null {
  if (thumbnailIsStill(entry)) return 'stage.tapToTry'
  return interactionHintKey(entry)
}

/**
 * 舞台内容区的高度：非固定舞台要更大的地方才演示得开（滚动、指针、整页对比）。
 * 卡片缩略图一律用 4:3，卡片高度才是恒定的。
 */
export function stageContentClass(shape: DemoShape, compact: boolean): string {
  if (compact) return 'flex aspect-[4/3] min-h-48 items-center justify-center overflow-hidden p-4'
  if (shape === 'stage') return 'flex min-h-64 items-center justify-center p-8'
  if (shape === 'sequence') return 'flex min-h-72 items-center justify-center p-6'
  return 'flex min-h-80 items-center justify-center p-6'
}
