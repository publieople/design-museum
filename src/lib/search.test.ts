import { describe, expect, it } from 'vitest'
import { ENTRIES } from '../data'
import { normalizeText, searchEntries, tokenize } from './search'

function firstSlug(query: string): string | undefined {
  return searchEntries(ENTRIES, query)[0]?.entry.slug
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
    expect(searchEntries(ENTRIES, '')).toHaveLength(ENTRIES.length)
  })

  it('没有命中就返回空', () => {
    expect(searchEntries(ENTRIES, 'zzzqqqxxx')).toEqual([])
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
    const hits = searchEntries(ENTRIES, '玻璃').map((hit) => hit.entry.slug)
    expect(hits[0]).toBe('frosted-glass')
  })
})
