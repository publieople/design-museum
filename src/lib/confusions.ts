import type { EntryMeta } from '../data/types'
import { normalizeText } from './search'

/**
 * 把「容易搞混」里写的名字解析成站内词条。
 *
 * 词条数据里的 confusions.with 是给人看的短标签，写法不统一：
 * 有正式中文名（毛玻璃）、英文名（frosted glass）、别名（磨砂玻璃），
 * 也有带说明的短语（模糊滤镜 blur()、hover 换底色）和根本不是词条的概念（半透明）。
 * 详情页要靠这个函数决定「打开对照 →」能不能点，所以只认归一化后的**精确**匹配：
 * 命中返回词条，没命中返回 null 让页面当纯文本渲染——宁可不给链接，也不能用模糊匹配
 * 硬凑出一个错误的对照。
 *
 * 归一化复用 search.ts 的 normalizeText：小写、去掉空白（含全角空格）与标点，
 * 所以大小写、全角空格、中英文标点都不影响匹配。
 * 匹配顺序先 nameZh / nameEn 再 aliases：别名可能在不同词条之间重复，正式名优先。
 */
export function resolveConfusionTarget(label: string, entries: EntryMeta[]): EntryMeta | null {
  // 签名虽然要求 string，但标签来自生成物内容，兜一手避免脏数据把详情页打崩
  if (typeof label !== 'string') return null
  const needle = normalizeText(label)
  if (!needle) return null

  for (const entry of entries) {
    if (normalizeText(entry.nameZh) === needle || normalizeText(entry.nameEn) === needle) return entry
  }
  for (const entry of entries) {
    for (const alias of entry.aliases) {
      if (normalizeText(alias) === needle) return entry
    }
  }
  return null
}
