import { CATEGORIES, categoryOf, sceneLabel } from '../data/taxonomy'
import { boolValue, numberValue, stringValue } from './controls'
import { translate } from '../i18n'
import { pick } from '../i18n/pick'
import type { Locale } from './prefs'
import type { ResolvedEntry } from './localize'
import type { Control, ControlValues, Entry, PromptPair } from '../data/types'

/** buildPrompt 只依赖 prompt 本身，所以传入 ResolvedEntry 或 Entry 都行 */
type PromptSource = Pick<Entry, 'prompt'>

/** formatValues 只依赖 controls */
type ControlSource = Pick<Entry, 'controls'>

export function buildPrompt(entry: PromptSource, values: ControlValues): PromptPair {
  return entry.prompt(values)
}

/** 把当前滑块取值渲染成 “模糊半径 12px / 时长 300ms” 这样的短串 */
export function formatValues(entry: ControlSource, values: ControlValues): string[] {
  const parts: string[] = []
  for (const control of entry.controls) {
    parts.push(`${control.label} ${formatControl(control, values)}`)
  }
  return parts
}

export function formatControl(control: Control, values: ControlValues): string {
  if (control.kind === 'range') {
    return `${numberValue(values, control.id, control.def)}${control.unit ?? ''}`
  }
  if (control.kind === 'toggle') {
    return boolValue(values, control.id, control.def) ? 'on' : 'off'
  }
  const value = stringValue(values, control.id, control.def)
  return control.options.find((option) => option.value === value)?.label ?? value
}

export interface CheatSheetItem {
  entry: ResolvedEntry
  values: ControlValues
}

/**
 * 速查表导出的整段需求：一段话开头 + 按展厅分组的条目，
 * 目标是「复制 → 粘给 AI → 直接开始干活」。
 */
export function buildCheatSheet(items: CheatSheetItem[], locale: Locale): string {
  if (items.length === 0) return ''

  const t = (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) =>
    translate(locale, key, vars)

  const lines: string[] = []
  lines.push(t('sheet.exportTitle'))
  lines.push('')
  lines.push(t('sheet.exportIntro'))
  lines.push('')

  for (const category of CATEGORIES) {
    const group = items.filter((item) => item.entry.category === category.id)
    if (group.length === 0) continue
    lines.push(`## ${category.nameZh} / ${category.nameEn}（${pick(category.blurb, locale)}）`)
    lines.push('')
    group.forEach((item, index) => {
      const { entry, values } = item
      const prompt = buildPrompt(entry, values)
      lines.push(`${index + 1}. ${entry.nameZh} · ${entry.nameEn}（${entry.code}）`)
      lines.push(`   - ${t('sheet.fx.effect')}：${entry.oneLiner}`)
      lines.push(
        `   - ${t('sheet.fx.where')}：${entry.scenes.map((scene) => sceneLabel(scene, locale)).join(' / ')}`,
      )
      lines.push(`   - ${t('sheet.fx.params')}：${formatValues(entry, values).join('；')}`)
      lines.push(`   - ${t('sheet.fx.tech')}：${prompt.zh}`)
      lines.push(`   - ${t('sheet.fx.keywords')}：${entry.keywords.join(', ')}`)
      lines.push('')
    })
  }

  lines.push('---')
  lines.push(t('sheet.exportFooter', { n: items.length }))
  return lines.join('\n')
}

export function categoryNameZh(id: Entry['category']): string {
  return categoryOf(id).nameZh
}
