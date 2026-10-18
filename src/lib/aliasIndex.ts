import { CATEGORIES } from '../data/taxonomy'
import type { CategoryId, EntryMeta } from '../data/types'
import { normalizeText, searchEntries } from './search'

/** 一行俗称：别名本身 + 它所属的词条（只取 meta，够渲染名字、编号与链接） */
export interface AliasRow {
  alias: string
  entry: EntryMeta
}

/** 一个展厅分组；category 只存 id，名字与顺序都从 CATEGORIES 取 */
export interface AliasGroup {
  category: CategoryId
  rows: AliasRow[]
}

/**
 * 展开全部 alias。
 *
 * 顺序稳定：先按传入词条的顺序，再按每条词条自己写的别名顺序——两者都是
 * 数据里人工排过的，所以索引页扫起来和词条库的顺序一致，不会随构建环境跳动。
 * 不做去重：同一个说法被两条词条收下时，两行都该出现（这正是「俗称有歧义」的证据）。
 */
export function aliasRows(entries: EntryMeta[]): AliasRow[] {
  const rows: AliasRow[] = []
  for (const entry of entries) {
    for (const alias of entry.aliases) {
      rows.push({ alias, entry })
    }
  }
  return rows
}

/** 这些行一共涉及多少条不同的词条（count 文案的 {b}） */
export function uniqueEntryCount(rows: AliasRow[]): number {
  return new Set(rows.map((row) => row.entry.slug)).size
}

/**
 * 过滤：大小写、前后空白、中间的连续空白都不敏感。
 *
 * 命中有两条路：
 *  1. 这条词条的 alias / nameZh / nameEn / code 里包含查询（归一化后的子串）；
 *  2. 加权检索 searchEntries 认为这条词条相关——拼音、近义词这类能力由
 *     src/lib/search.ts 负责，aliasIndex 不重复养一套匹配规则，自动跟着它升级。
 *
 * 一旦词条命中，它名下的**全部** alias 都保留：搜「毛玻璃」应该看到它的
 * 「磨砂 / backdrop blur」，而不是只看到字面对上的那一行。
 */
export function filterAliases(rows: AliasRow[], query: string): AliasRow[] {
  const compact = normalizeText(query)
  if (!compact) return rows

  // rows 可能已被上游筛过（比如按展厅缩小范围），所以只拿它们涉及的词条做检索，
  // 避免出现「行不在 rows 里、检索却命中了它的词条」这种越界结果。
  const entries: EntryMeta[] = []
  const seen = new Set<string>()
  for (const row of rows) {
    if (seen.has(row.entry.slug)) continue
    seen.add(row.entry.slug)
    entries.push(row.entry)
  }
  const hitSlugs = new Set(searchEntries(entries, query).map((hit) => hit.entry.slug))

  return rows.filter((row) => {
    if (hitSlugs.has(row.entry.slug)) return true
    const { alias, entry } = row
    return [alias, entry.nameZh, entry.nameEn, entry.code].some((text) =>
      normalizeText(text).includes(compact),
    )
  })
}

/**
 * 按展厅分组：组顺序跟 CATEGORIES 的展陈顺序（动效 → 交互 → 布局 → 质感 → 排版），
 * 空组直接丢掉；组内保持 rows 的原有顺序。
 */
export function groupAliases(rows: AliasRow[]): AliasGroup[] {
  const byCategory = new Map<CategoryId, AliasRow[]>()
  for (const row of rows) {
    const list = byCategory.get(row.entry.category)
    if (list) list.push(row)
    else byCategory.set(row.entry.category, [row])
  }

  return CATEGORIES.flatMap((category) => {
    const list = byCategory.get(category.id)
    if (!list || list.length === 0) return []
    return [{ category: category.id, rows: list }]
  })
}
