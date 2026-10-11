import { interleaveByCategory } from './order'
import { codeOrder } from './taxonomy'
import type { CategoryId, Entry } from './types'

const modules = import.meta.glob<{ default: Entry }>('./entries/**/*.ts', { eager: true })

export const ENTRIES: Entry[] = Object.values(modules)
  .map((mod) => mod.default)
  .sort((a, b) => codeOrder(a.code).localeCompare(codeOrder(b.code)))

export const ENTRY_BY_SLUG = new Map(ENTRIES.map((entry) => [entry.slug, entry]))

export function findEntry(slug: string | undefined): Entry | undefined {
  return slug ? ENTRY_BY_SLUG.get(slug) : undefined
}

export function entriesByCategory(id: CategoryId): Entry[] {
  return ENTRIES.filter((entry) => entry.category === id)
}

/**
 * 首页「正在展出」用的排序：按「每类第几条」交错，
 * 这样取前几个就是每个展厅各一件，而不是前两个展厅的全部。
 * 首屏用的 meta 版本在 meta.ts 的 featuredMeta，两处共用 order.ts 的实现。
 */
export function featuredEntries(): Entry[] {
  return interleaveByCategory(ENTRIES)
}
