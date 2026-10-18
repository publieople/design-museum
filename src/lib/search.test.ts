import { describe, expect, it } from 'vitest'
import { ENTRY_META } from '../data/meta'
import { normalizeText, searchEntries, suggestionsFor, tokenize } from './search'

function firstSlug(query: string): string | undefined {
  return searchEntries(ENTRY_META, query)[0]?.entry.slug
}

function topSlugs(query: string, count: number): string[] {
  return searchEntries(ENTRY_META, query)
    .slice(0, count)
    .map((hit) => hit.entry.slug)
}

describe('归一化与分词', () => {
  it('去空白、去标点、转小写', () => {
    expect(normalizeText('  Backdrop-Filter ')).toBe('backdropfilter')
    expect(normalizeText('毛玻璃效果！')).toBe('毛玻璃效果')
  })

  it('拉丁词按非字母数字切分，中文整串保留', () => {
    expect(tokenize('backdrop blur')).toEqual(['backdrop', 'blur'])
    expect(tokenize('毛玻璃')).toEqual(['毛玻璃'])
  })
})

describe('搜索', () => {
  it('空查询返回全部', () => {
    expect(searchEntries(ENTRY_META, '')).toHaveLength(ENTRY_META.length)
  })

  it('没有命中就返回空', () => {
    expect(searchEntries(ENTRY_META, 'zzzqqqxxx')).toEqual([])
  })

  it('中文正式名命中', () => {
    expect(firstSlug('毛玻璃')).toBe('frosted-glass')
  })

  it('口语说法也能命中', () => {
    expect(firstSlug('磨砂')).toBe('frosted-glass')
    expect(firstSlug('毛玻璃效果')).toBe('frosted-glass')
  })

  it('英文术语命中', () => {
    expect(firstSlug('backdrop blur')).toBe('frosted-glass')
    expect(firstSlug('backdrop-filter')).toBe('frosted-glass')
  })

  it('只说「玻璃」时毛玻璃排在玻璃拟态前面', () => {
    const slugs = searchEntries(ENTRY_META, '玻璃').map((hit) => hit.entry.slug)
    expect(slugs[0]).toBe('frosted-glass')
  })
})

describe('拼音搜索', () => {
  it('全拼命中：连写、空格、大写都对', () => {
    expect(firstSlug('maoboli')).toBe('frosted-glass')
    expect(firstSlug('mao bo li')).toBe('frosted-glass')
    expect(firstSlug('MAOBOLI')).toBe('frosted-glass')
    expect(firstSlug('MaoBoLi')).toBe('frosted-glass')
  })

  it('拼音少打一个字母（编辑距离 1）仍能命中', () => {
    expect(firstSlug('moboli')).toBe('frosted-glass')
  })

  it('首字母缩写出现在前 3', () => {
    expect(topSlugs('mbl', 3)).toContain('frosted-glass')
  })

  it('同音错别字靠拼音命中', () => {
    expect(firstSlug('磨沙玻璃')).toBe('frosted-glass')
  })

  it('英文 typo（编辑距离 1）仍能命中', () => {
    expect(firstSlug('backdop filter')).toBe('frosted-glass')
    expect(firstSlug('backdorp blur')).toBe('frosted-glass')
  })

  it('拼音兜底不改变原文命中的排序', () => {
    expect(firstSlug('玻璃')).toBe('frosted-glass')
    expect(firstSlug('磨砂玻璃')).toBe('frosted-glass')
  })

  it('拼音兜底不会让噪声查询命中', () => {
    expect(searchEntries(ENTRY_META, 'zzzqqqxxx')).toEqual([])
    expect(searchEntries(ENTRY_META, 'maobolizzz')).toEqual([])
  })

  it('空查询仍返回全部，分数为 0', () => {
    expect(searchEntries(ENTRY_META, '   ')).toHaveLength(ENTRY_META.length)
    expect(searchEntries(ENTRY_META, '   ').every((hit) => hit.score === 0)).toBe(true)
  })
})

describe('搜索建议（对话框与页面搜索框共用）', () => {
  it('空查询不给建议，避免弹出 40 条', () => {
    expect(suggestionsFor(ENTRY_META, '')).toEqual([])
    expect(suggestionsFor(ENTRY_META, '   ')).toEqual([])
  })

  it('建议顺序与 searchEntries 完全一致，只是截断', () => {
    const all = searchEntries(ENTRY_META, 'maoboli')
    const hits = suggestionsFor(ENTRY_META, 'maoboli', 8)
    expect(hits.map((hit) => hit.entry.slug)).toEqual(all.slice(0, 8).map((hit) => hit.entry.slug))
  })

  it('默认最多 8 条，传 limit 时按 limit 截断', () => {
    expect(suggestionsFor(ENTRY_META, '毛玻璃').length).toBeLessThanOrEqual(8)
    expect(suggestionsFor(ENTRY_META, '毛玻璃', 2)).toHaveLength(2)
    expect(suggestionsFor(ENTRY_META, '毛玻璃', 1)[0].entry.slug).toBe('frosted-glass')
  })

  it('没有命中时是空数组而不是抛错', () => {
    expect(suggestionsFor(ENTRY_META, 'zzzqqqxxx')).toEqual([])
  })
})

