import type { ControlValues, Entry, EntryMeta } from './types'

/**
 * 从完整词条里挑出首屏要用的字段。
 *
 * 生成脚本（scripts/gen-entry-meta.mjs）、生成物（src/data/entryMeta.ts）和
 * 同步测试（src/data/meta.test.ts）共用这一份定义，避免三处各挑各的。
 */
export function metaOf(entry: Entry): EntryMeta {
  const defaults: ControlValues = {}
  for (const control of entry.controls) defaults[control.id] = control.def

  const en = entry.en?.oneLiner ? { oneLiner: entry.en.oneLiner } : undefined

  return {
    slug: entry.slug,
    code: entry.code,
    nameZh: entry.nameZh,
    nameEn: entry.nameEn,
    aliases: entry.aliases,
    category: entry.category,
    oneLiner: entry.oneLiner,
    whenToUse: entry.whenToUse,
    confusions: entry.confusions,
    pitfalls: entry.pitfalls,
    keywords: entry.keywords,
    scenes: entry.scenes,
    feel: entry.feel,
    intent: entry.intent,
    ...(entry.loop ? { loop: entry.loop } : {}),
    ...(en ? { en } : {}),
    defaults,
  }
}
