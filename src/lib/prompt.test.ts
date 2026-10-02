import { describe, expect, it } from 'vitest'
import { ENTRIES, findEntry } from '../data'
import { defaultValues } from './controls'
import { resolveEntry } from './localize'
import { buildCheatSheet, buildPrompt, formatValues } from './prompt'

const entry = findEntry('frosted-glass')!
const resolved = resolveEntry(entry, 'zh')

describe('提示词生成', () => {
  it('参数变化会进入中文需求句', () => {
    const values = { ...defaultValues(entry), blur: 24 }
    expect(buildPrompt(entry, values).zh).toContain('24px')
  })

  it('参数变化会进入英文关键词', () => {
    const values = { ...defaultValues(entry), saturate: 220 }
    expect(buildPrompt(entry, values).en).toContain('220%')
  })

  it('默认值能渲染成可读参数串', () => {
    const params = formatValues(resolved, defaultValues(entry))
    expect(params.join(' ')).toContain('模糊半径')
    expect(params.length).toBe(entry.controls.length)
  })
})

describe('速查表导出', () => {
  it('没选任何词条时返回空串', () => {
    expect(buildCheatSheet([], 'zh')).toBe('')
  })

  it('选中条目后包含标题、术语与参数', () => {
    const sheet = buildCheatSheet([{ entry: resolved, values: defaultValues(entry) }], 'zh')
    expect(sheet).toContain('# 设计需求清单')
    expect(sheet).toContain('毛玻璃')
    expect(sheet).toContain('Frosted Glass')
    expect(sheet).toContain('V-01')
    expect(sheet).toContain('backdrop-filter')
  })

  it('英文导出用英文标题与字段名', () => {
    const sheet = buildCheatSheet([{ entry: resolved, values: defaultValues(entry) }], 'en')
    expect(sheet).toContain('# Design brief')
    expect(sheet).toContain('Technical requirement')
  })

  it('按展厅分组，顺序稳定', () => {
    const items = ENTRIES.slice(0, 3).map((item) => ({
      entry: resolveEntry(item, 'zh'),
      values: defaultValues(item),
    }))
    expect(buildCheatSheet(items, 'zh')).toBe(buildCheatSheet(items, 'zh'))
  })
})
