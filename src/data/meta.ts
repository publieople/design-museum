import { ENTRY_META } from './entryMeta'
import { interleaveByCategory } from './order'
import type { EntryMeta } from './types'

/**
 * 首屏词条数据：只含首页 / 词条库 / 感觉导航 / 搜索用到的字段。
 *
 * 完整词条（spec、refs、related、reducedMotion、controls、prompt、英文覆盖层）
 * 在 ./index.ts，只被详情页等懒加载路由引用。改字段范围见 ./metaOf.ts。
 */
export { ENTRY_META }

/** 和 index.ts 的 featuredEntries 同一套排序，只是数据换成 meta */
export function featuredMeta(): EntryMeta[] {
  return interleaveByCategory(ENTRY_META)
}
