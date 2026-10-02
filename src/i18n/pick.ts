import type { Locale } from '../lib/prefs'
import type { Bi } from '../data/types'

/** 取双语文案的当前语言；en 缺失时回退中文 */
export function pick(value: Bi | undefined, locale: Locale): string {
  if (!value) return ''
  if (locale === 'en' && value.en) return value.en
  return value.zh
}
