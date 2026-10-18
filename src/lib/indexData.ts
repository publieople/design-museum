import { CATEGORIES } from '../data/taxonomy'
import type { CategoryId, EntryMeta } from '../data/types'

/**
 * 一个展厅在索引里的摘要：编号字母、中英名、词条数与别名字数。
 *
 * 词条库左侧 IndexRail 与俗称总表的 rail 都读它——两者都要「全部 40 / M8 / F8…」
 * 这一列数字，而数字必须和词条数据同源，不能在两页各写一份。
 */
export interface HallSummary {
  id: CategoryId
  /** 藏品编号前缀，如 "M" */
  letter: string
  nameZh: string
  nameEn: string
  /** 该厅的词条数 */
  count: number
  /** 该厅所有词条的 aliases 总数（不是去重后的说法数） */
  aliases: number
}

/**
 * 按展陈顺序汇总每个厅。
 *
 * 返回项与 CATEGORIES 一一对应、顺序固定：rail 是导航，即使某个厅暂时没有词条
 * 也要留在索引里显示 0，而不是让导航项忽隐忽现。别名计数按「词条写了几条 alias」
 * 累加，与俗称总表的一行一条对齐。
 */
export function hallSummaries(entries: EntryMeta[]): HallSummary[] {
  const tally = new Map<CategoryId, { count: number; aliases: number }>()
  for (const entry of entries) {
    const current = tally.get(entry.category) ?? { count: 0, aliases: 0 }
    current.count += 1
    current.aliases += entry.aliases.length
    tally.set(entry.category, current)
  }

  return CATEGORIES.map((category) => {
    const { count = 0, aliases = 0 } = tally.get(category.id) ?? {}
    return {
      id: category.id,
      letter: category.letter,
      nameZh: category.nameZh,
      nameEn: category.nameEn,
      count,
      aliases,
    }
  })
}

/**
 * 把任意「带 entry 的行」（俗称行、检索命中、图版…）按展厅分组。
 *
 * 组顺序跟 CATEGORIES 的展陈顺序，空组直接丢掉；组内保持传入顺序，
 * 因为上游已经按编号或相关度排过，这里只做分桶，不再重排。
 */
export function groupRowsByHall<T extends { entry: EntryMeta }>(
  rows: T[],
): Array<{ hall: CategoryId; rows: T[] }> {
  const buckets = new Map<CategoryId, T[]>()
  for (const row of rows) {
    const list = buckets.get(row.entry.category)
    if (list) list.push(row)
    else buckets.set(row.entry.category, [row])
  }

  return CATEGORIES.flatMap((category) => {
    const list = buckets.get(category.id)
    if (!list || list.length === 0) return []
    return [{ hall: category.id, rows: list }]
  })
}

/** 全站别名总数：俗称总表的「251 别名」与 rail 的别名计数都从这里取 */
export function totalAliases(entries: EntryMeta[]): number {
  return entries.reduce((sum, entry) => sum + entry.aliases.length, 0)
}
