import { CATEGORIES, categoryOf, sceneLabel } from '../data/taxonomy'
import { boolValue, numberValue, stringValue } from './controls'
import type { Control, ControlValues, Entry, PromptPair } from '../data/types'

export function buildPrompt(entry: Entry, values: ControlValues): PromptPair {
  return entry.prompt(values)
}

/** 把当前滑块取值渲染成 “模糊半径 12px / 时长 300ms” 这样的短串 */
export function formatValues(entry: Entry, values: ControlValues): string[] {
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
    return boolValue(values, control.id, control.def) ? '开' : '关'
  }
  const value = stringValue(values, control.id, control.def)
  return control.options.find((option) => option.value === value)?.label ?? value
}

export interface CheatSheetItem {
  entry: Entry
  values: ControlValues
}

/**
 * 速查表导出的整段需求：一段话开头 + 按类别分组的条目，
 * 目标是「复制 → 粘给 AI → 直接开始干活」。
 */
export function buildCheatSheet(items: CheatSheetItem[]): string {
  if (items.length === 0) return ''

  const lines: string[] = []
  lines.push('# 设计需求清单（来自「前端设计博物馆」）')
  lines.push('')
  lines.push(
    '下面每条效果都已经有公认的名字。请按这些术语的标准做法实现，不要用相近但不同的做法替代；参数按给出的取值来。',
  )
  lines.push('')

  for (const category of CATEGORIES) {
    const group = items.filter((item) => item.entry.category === category.id)
    if (group.length === 0) continue
    lines.push(`## ${category.nameZh}（${category.nameEn}）`)
    lines.push('')
    group.forEach((item, index) => {
      const { entry, values } = item
      const prompt = buildPrompt(entry, values)
      lines.push(`${index + 1}. ${entry.nameZh} · ${entry.nameEn}（${entry.code}）`)
      lines.push(`   - 效果：${entry.oneLiner}`)
      lines.push(`   - 用在：${entry.scenes.map(sceneLabel).join('、')}`)
      lines.push(`   - 参数：${formatValues(entry, values).join('；')}`)
      lines.push(`   - 技术要求：${prompt.zh}`)
      lines.push(`   - 关键词：${entry.keywords.join(', ')}`)
      lines.push('')
    })
  }

  lines.push('---')
  lines.push(`共 ${items.length} 条。如果有不理解的名字，按括号里的英文术语去查标准实现。`)
  return lines.join('\n')
}

export function categoryNameZh(id: Entry['category']): string {
  return categoryOf(id).nameZh
}
