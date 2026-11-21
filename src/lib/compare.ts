import type { EntryMeta } from '../data/types'
import { codeOrder } from '../data/taxonomy'
import { resolveConfusionTarget } from './confusions'

/**
 * 一对可互相跳转的易混词条。
 *
 * a / b 是展示方向：comparePairs 统一把编号小的放 a（同一对只出现一次），
 * 页面上的「交换」则保留用户选择的左右顺序，所以 comparePair 不强转方向。
 */
export interface ComparePair {
  a: EntryMeta
  b: EntryMeta
  /** pairKey(a.slug, b.slug)，无序去重与列表 key 都用它 */
  key: string
}

/** 两个 slug 的无序键：排序后用 '~' 连接，a/b 换位得到同一个键 */
export function pairKey(a: string, b: string): string {
  return a <= b ? `${a}~${b}` : `${b}~${a}`
}

/** 编号比较：先展厅动线（M → F → L → V → T），再序号；同号时用 slug 兜底保证稳定 */
function compareEntries(a: EntryMeta, b: EntryMeta): number {
  const left = codeOrder(a.code)
  const right = codeOrder(b.code)
  if (left !== right) return left < right ? -1 : 1
  if (a.code !== b.code) return a.code < b.code ? -1 : 1
  if (a.slug === b.slug) return 0
  return a.slug < b.slug ? -1 : 1
}

/**
 * 全站「容易搞混」的两两对照表。
 *
 * 数据是单向写的（A 的 confusions 里提到 B 就够了），所以这里扫全站 confusions：
 * 每条 with 用 resolveConfusionTarget 解析成词条，排除自己与解析失败（“半透明”
 * “hover 换底色”这类不是词条的说法），再用 pairKey 无序去重——A 说 B、B 说 A
 * 只算一对。输出顺序固定：先按 a.code 再按 b.code，和词条库的展厅动线一致。
 */
export function comparePairs(entries: EntryMeta[]): ComparePair[] {
  const found = new Map<string, ComparePair>()

  for (const entry of entries) {
    for (const item of entry.confusions) {
      const other = resolveConfusionTarget(item.with, entries)
      if (!other || other.slug === entry.slug) continue
      // 方向统一成编号小的在 a，保证去重后一对只有一个固定朝向
      const [a, b] = compareEntries(entry, other) <= 0 ? [entry, other] : [other, entry]
      const key = pairKey(a.slug, b.slug)
      if (!found.has(key)) found.set(key, { a, b, key })
    }
  }

  return [...found.values()].sort((x, y) => compareEntries(x.a, y.a) || compareEntries(x.b, y.b))
}

/** 归一化检索串：小写并去掉空白与连字符，大小写、空格、M-01 与 m01 都能对上 */
function fold(text: string): string {
  return text.toLowerCase().replace(/[\s-]+/g, '')
}

/** 这一对里只要有一边（中文名、英文名、别名或编号）包含查询串就算命中 */
function pairMatches(pair: ComparePair, needle: string): boolean {
  return [pair.a, pair.b].some((entry) =>
    [entry.nameZh, entry.nameEn, entry.code, ...entry.aliases].some((field) =>
      fold(field).includes(needle),
    ),
  )
}

/**
 * 对照列表的本地筛选：查询串 + 展厅。
 *
 * hallId 为空或 'all' 表示不按展厅过滤，否则只看「左边那条」(a) 所属展厅——
 * 与下方列表的分组口径一致，一对只出现一次。query 匹配两边任一条目的
 * 中文名、英文名、别名与编号，大小写和空白不敏感；空查询不筛。
 */
export function filterPairs(pairs: ComparePair[], query: string, hallId = ''): ComparePair[] {
  const needle = fold(query)
  const hall = hallId && hallId !== 'all' ? hallId : ''
  return pairs.filter(
    (pair) =>
      (!hall || pair.a.category === hall) && (needle === '' || pairMatches(pair, needle)),
  )
}

/**
 * 取指定两个 slug 的对照，query 里 a/b 谁先谁后都能命中。
 * 返回的 a/b 保留调用方给的左右顺序（页面「交换」按钮依赖这一点）；
 * 两个 slug 相同、不存在，或它们之间没有任何一侧写过 confusions 时返回 null，
 * 页面据此回退到默认的一对。
 */
export function comparePair(
  entries: EntryMeta[],
  aSlug: string,
  bSlug: string,
): ComparePair | null {
  if (!aSlug || !bSlug || aSlug === bSlug) return null

  const a = entries.find((entry) => entry.slug === aSlug)
  const b = entries.find((entry) => entry.slug === bSlug)
  if (!a || !b) return null

  // 双向任一方向写了区别才算「这一对真的在对照档案里」
  if (confusionDiff(a, b, entries) === null && confusionDiff(b, a, entries) === null) return null

  return { a, b, key: pairKey(a.slug, b.slug) }
}

/**
 * entry 的 confusions 里指向 other 的那条区别，没写返回 null。
 * 页面分别调用两遍，才知道「只有一边写了区别」还是「两边都没写」。
 */
export function confusionDiff(
  entry: EntryMeta,
  other: EntryMeta,
  entries: EntryMeta[],
): string | null {
  for (const item of entry.confusions) {
    const target = resolveConfusionTarget(item.with, entries)
    if (target && target.slug === other.slug) return item.diff
  }
  return null
}
