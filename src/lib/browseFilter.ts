import type { CategoryId, Feel, Scene, TagId } from '../data/types'
import type { EntryMeta } from '../data/types'
import { searchEntries } from './search'

/** 词条库的筛选条件：全部来自 URL 查询参数，所以每个筛选状态都能分享 */
export interface BrowseFilter {
  q: string
  cat: string
  scene: string
  feel: string
  /** 多个标签之间是「都要满足」，和「先缩小再缩小」的直觉一致 */
  tags: string[]
}

/** URL 里的标签是逗号分隔的一串，空串视为没筛选 */
export function parseTags(raw: string | null | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function serializeTags(tags: string[]): string | null {
  return tags.length > 0 ? tags.join(',') : null
}

export function toggleTag(tags: string[], tag: string): string[] {
  return tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag]
}

export function hasBrowseFilter(filter: BrowseFilter): boolean {
  return Boolean(filter.q || filter.cat || filter.scene || filter.feel || filter.tags.length > 0)
}

/**
 * 词条库的筛选：搜索走 search.ts 的加权命中，其余条件都取自 meta（首屏就带着）。
 * 抽成纯函数是为了能直接测——页面只负责把 URL 参数搬进来。
 */
export function filterEntries(entries: EntryMeta[], filter: BrowseFilter): EntryMeta[] {
  const base = filter.q ? searchEntries(entries, filter.q).map((hit) => hit.entry) : entries
  return base.filter((entry) => {
    if (filter.cat && entry.category !== (filter.cat as CategoryId)) return false
    if (filter.scene && !entry.scenes.includes(filter.scene as Scene)) return false
    if (filter.feel && !entry.feel.includes(filter.feel as Feel)) return false
    if (filter.tags.length > 0 && !filter.tags.every((tag) => entry.tags.includes(tag as TagId))) {
      return false
    }
    return true
  })
}
