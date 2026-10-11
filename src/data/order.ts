import type { CategoryId } from './types'

/**
 * 按「每类第几条」交错排序：取前几件就是每个展厅各一件，而不是前两个展厅的全部。
 * 完整词条（index.ts 的 featuredEntries）和首屏 meta（meta.ts 的 featuredMeta）共用。
 */
export function interleaveByCategory<T extends { category: CategoryId }>(items: T[]): T[] {
  const buckets = new Map<CategoryId, T[]>()
  for (const item of items) {
    const list = buckets.get(item.category)
    if (list) list.push(item)
    else buckets.set(item.category, [item])
  }

  const ordered: T[] = []
  const depth = Math.max(0, ...[...buckets.values()].map((list) => list.length))
  for (let index = 0; index < depth; index += 1) {
    for (const list of buckets.values()) {
      const item = list[index]
      if (item) ordered.push(item)
    }
  }
  return ordered
}
