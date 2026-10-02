import type { Locale } from './prefs'
import type {
  Control,
  ControlValues,
  Entry,
  PromptPair,
  Reference,
  Scene,
  Feel,
  Intent,
  CategoryId,
} from '../data/types'

/** 已按当前语言解析好的词条：组件只消费这个，不再关心回退逻辑 */
export interface ResolvedEntry {
  slug: string
  code: string
  nameZh: string
  nameEn: string
  aliases: string[]
  category: CategoryId
  oneLiner: string
  whenToUse: string[]
  confusions: { with: string; diff: string }[]
  pitfalls: string[]
  keywords: string[]
  spec: { label: string; value: string }[]
  reducedMotion: string
  refs: Reference[]
  related: string[]
  scenes: Scene[]
  feel: Feel[]
  intent: Intent[]
  controls: Control[]
  prompt: (values: ControlValues) => PromptPair
}

export function resolveEntry(entry: Entry, locale: Locale): ResolvedEntry {
  const t = entry.en
  const en = locale === 'en' && t ? t : undefined

  return {
    slug: entry.slug,
    code: entry.code,
    nameZh: entry.nameZh,
    nameEn: entry.nameEn,
    aliases: entry.aliases,
    category: entry.category,
    oneLiner: en?.oneLiner ?? entry.oneLiner,
    whenToUse: en?.whenToUse ?? entry.whenToUse,
    confusions: entry.confusions.map((item, index) => ({
      with: (en?.confusions?.[index]?.with ?? item.with) || item.with,
      diff: (en?.confusions?.[index]?.diff ?? item.diff) || item.diff,
    })),
    pitfalls: en?.pitfalls ?? entry.pitfalls,
    keywords: entry.keywords,
    spec: entry.spec.map((item, index) => ({
      label: en?.spec?.[index]?.label ?? item.label,
      value: item.value,
    })),
    reducedMotion: en?.reducedMotion ?? entry.reducedMotion,
    refs: entry.refs,
    related: entry.related,
    scenes: entry.scenes,
    feel: entry.feel,
    intent: entry.intent,
    controls: entry.controls.map((control, index) => {
      const translated = en?.controls?.[index]
      if (!translated) return control
      return {
        ...control,
        label: translated.label ?? control.label,
        ...('hint' in control ? { hint: translated.hint ?? control.hint } : {}),
      }
    }),
    prompt: entry.prompt,
  }
}
