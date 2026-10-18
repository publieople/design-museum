import { describe, expect, it } from 'vitest'
import { ENTRY_META } from '../data/meta'
import { CATEGORIES } from '../data/taxonomy'
import { aliasRows, filterAliases, groupAliases, uniqueEntryCount } from './aliasIndex'

const rows = aliasRows(ENTRY_META)
const expectedTotal = ENTRY_META.reduce((sum, entry) => sum + entry.aliases.length, 0)

describe('俗称索引', () => {
  it('展开全部别名：行数等于别名字段总数', () => {
    expect(expectedTotal).toBeGreaterThan(0)
    expect(rows).toHaveLength(expectedTotal)
  })

  it('每行的别名非空，且指向真实存在的词条', () => {
    const slugs = new Set(ENTRY_META.map((entry) => entry.slug))
    for (const row of rows) {
      expect(row.alias.trim().length, row.entry.slug).toBeGreaterThan(0)
      expect(slugs.has(row.entry.slug), row.alias).toBe(true)
    }
  })

  it('uniqueEntryCount 数的是不同词条', () => {
    expect(uniqueEntryCount(rows)).toBe(ENTRY_META.length)
    expect(uniqueEntryCount([])).toBe(0)
  })

  describe('搜索', () => {
    it('空查询（含纯空格）原样返回', () => {
      expect(filterAliases(rows, '')).toHaveLength(rows.length)
      expect(filterAliases(rows, '   ')).toHaveLength(rows.length)
    })

    it('中文俗称命中词条名下的全部别名', () => {
      const hits = filterAliases(rows, '磨砂')
      expect(hits.length).toBeGreaterThan(0)
      expect(hits.some((row) => row.entry.slug === 'frosted-glass')).toBe(true)
      const frosted = rows.filter((row) => row.entry.slug === 'frosted-glass')
      const frostedHits = hits.filter((row) => row.entry.slug === 'frosted-glass')
      expect(frostedHits).toHaveLength(frosted.length)
    })

    it('英文术语命中', () => {
      const hits = filterAliases(rows, 'backdrop blur')
      expect(hits.some((row) => row.entry.slug === 'frosted-glass')).toBe(true)
    })

    it('大小写与前后空白不敏感', () => {
      const sign = (items: typeof rows) => items.map((row) => `${row.entry.slug}@${row.alias}`)
      expect(sign(filterAliases(rows, '  BACKDROP   BLUR  '))).toEqual(sign(filterAliases(rows, 'backdrop blur')))
    })

    it('词条名与藏品编号也能搜', () => {
      expect(filterAliases(rows, '毛玻璃').some((row) => row.entry.slug === 'frosted-glass')).toBe(true)
      expect(filterAliases(rows, 'v-01').some((row) => row.entry.slug === 'frosted-glass')).toBe(true)
    })

    it('查无此词返回空数组', () => {
      expect(filterAliases(rows, 'zzzqqq')).toEqual([])
    })
  })

  describe('分组', () => {
    it('覆盖全部展厅，且一行不丢', () => {
      const groups = groupAliases(rows)
      expect(groups.map((group) => group.category)).toEqual(CATEGORIES.map((category) => category.id))
      expect(groups.reduce((sum, group) => sum + group.rows.length, 0)).toBe(rows.length)
    })

    it('过滤后没有命中的展厅不出现，行数仍然守恒', () => {
      const hits = filterAliases(rows, '磨砂')
      const groups = groupAliases(hits)
      expect(groups.length).toBeGreaterThan(0)
      expect(groups.length).toBeLessThan(CATEGORIES.length)
      expect(groups.every((group) => group.rows.length > 0)).toBe(true)
      expect(groups.reduce((sum, group) => sum + group.rows.length, 0)).toBe(hits.length)
    })
  })
})
