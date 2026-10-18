import { codeOrder } from '../data/taxonomy'
import type { EntryMeta } from '../data/types'

/** 词条库排序：编号（按展厅动线的默认序）或中文名（拼音）。排序只是本地状态，不写 URL */
export type BrowseSort = 'code' | 'nameZh'

/** 排序选项的稳定顺序，页面按这个顺序渲染切换按钮 */
export const BROWSE_SORTS: BrowseSort[] = ['code', 'nameZh']

/**
 * 稳定排序。
 *
 * Array.prototype.sort 从 ES2019 起本身就稳定，但这里把「相等时保留原顺序」写进实现：
 * 不依赖运行环境的默认行为，重复键（同名词条、同编号的假数据）的测试才有意义。
 */
function stableSort<T>(items: readonly T[], compare: (a: T, b: T) => number): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => compare(a.item, b.item) || a.index - b.index)
    .map(({ item }) => item)
}

/**
 * 返回排好序的新数组，不修改入参。
 *
 * - 'code'：走 taxonomy 的 codeOrder，先按展厅展陈顺序（动效 → 交互 → 布局 → 质感 → 排版），
 *   再按两位序号；直接用字符串比较编号会把 M-10 排到 M-02 前面，所以必须过 codeOrder。
 * - 'nameZh'：localeCompare('zh-Hans-CN')，即中文名的拼音序。
 */
export function sortEntries(entries: EntryMeta[], sort: BrowseSort): EntryMeta[] {
  if (sort === 'nameZh') {
    return stableSort(entries, (a, b) => a.nameZh.localeCompare(b.nameZh, 'zh-Hans-CN'))
  }
  return stableSort(entries, (a, b) => codeOrder(a.code).localeCompare(codeOrder(b.code)))
}
