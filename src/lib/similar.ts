import { resolveConfusionTarget } from './confusions'
import type { EntryMeta } from '../data/types'
import { codeOrder } from '../data/taxonomy'

/** 同一展厅：最硬的线索，同厅的条目本来就在解决同一类问题 */
const HALL_WEIGHT = 12
/** 共享标签：技术手段或成本相近 */
const TAG_WEIGHT = 3
/** 适用场景、感受、意图：同一个语境里经常一起出现 */
const CONTEXT_WEIGHT = 2
/** 手写 related 是编辑的判断，权重高于任何一项自动特征 */
const RELATED_WEIGHT = 8
/** 易混邻居：用户最容易拿来做对比的那一条 */
const CONFUSION_WEIGHT = 6

function sharedCount(a: readonly string[], b: readonly string[]) {
  const set = new Set(a)
  return b.reduce((count, item) => (set.has(item) ? count + 1 : count), 0)
}

/**
 * 按展厅、标签、场景、感受、意图、手写 related 与易混邻居打分，取最相似的前 `limit` 条。
 *
 * 纯函数：同样的输入永远给出同样的顺序——总分相同时按编号（codeOrder）排，
 * 这样推荐结果可复现，测试也能钉住。
 *
 * `entry` 只需要 EntryMeta（首屏数据），related 不在 EntryMeta 上，
 * 由调用方把完整词条的 `related` 经 `extraRelated` 传进来。
 */
export function similarEntries(
  entry: EntryMeta,
  entries: EntryMeta[],
  limit = 4,
  extraRelated: string[] = [],
): EntryMeta[] {
  const related = new Set(extraRelated)
  const selfConfusions = new Set(
    entry.confusions
      .map((item) => resolveConfusionTarget(item.with, entries)?.slug)
      .filter((slug): slug is string => Boolean(slug)),
  )

  const scored = entries
    .filter((other) => other.slug !== entry.slug)
    .map((other) => {
      let score = 0
      if (other.category === entry.category) score += HALL_WEIGHT
      score += sharedCount(entry.tags, other.tags) * TAG_WEIGHT
      score += sharedCount(entry.scenes, other.scenes) * CONTEXT_WEIGHT
      score += sharedCount(entry.feel, other.feel) * CONTEXT_WEIGHT
      score += sharedCount(entry.intent, other.intent) * CONTEXT_WEIGHT
      if (related.has(other.slug)) score += RELATED_WEIGHT
      // 易混是双向的：本条指向对方，或对方指向本条，都算一对易混邻居
      const pointsBack = other.confusions.some(
        (item) => resolveConfusionTarget(item.with, entries)?.slug === entry.slug,
      )
      if (selfConfusions.has(other.slug) || pointsBack) score += CONFUSION_WEIGHT
      return { other, score }
    })
    .filter((item) => item.score > 0)

  scored.sort(
    (a, b) => b.score - a.score || codeOrder(a.other.code).localeCompare(codeOrder(b.other.code)),
  )

  return scored.slice(0, Math.max(0, limit)).map((item) => item.other)
}
