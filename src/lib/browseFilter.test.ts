import { describe, expect, it } from 'vitest'
import { ENTRY_META } from '../data/meta'
import { filterEntries, hasBrowseFilter, parseTags, serializeTags, toggleTag } from './browseFilter'

const empty = { q: '', cat: '', scene: '', feel: '', tags: [] }

describe('词条库筛选', () => {
  it('不传条件时原样返回', () => {
    expect(filterEntries(ENTRY_META, empty)).toHaveLength(ENTRY_META.length)
  })

  it('标签之间是「都要满足」', () => {
    const one = filterEntries(ENTRY_META, { ...empty, tags: ['css-only'] })
    const two = filterEntries(ENTRY_META, { ...empty, tags: ['css-only', 'composited'] })
    expect(one.length).toBeGreaterThan(0)
    expect(one.every((entry) => entry.tags.includes('css-only'))).toBe(true)
    expect(two.length).toBeGreaterThan(0)
    expect(two.every((entry) => entry.tags.includes('css-only') && entry.tags.includes('composited'))).toBe(true)
    expect(two.length).toBeLessThanOrEqual(one.length)
  })

  it('拿一个没人用的标签筛，结果是空', () => {
    expect(filterEntries(ENTRY_META, { ...empty, tags: ['nope-not-a-tag'] })).toHaveLength(0)
  })

  it('标签和展厅、搜索叠加', () => {
    const hits = filterEntries(ENTRY_META, { ...empty, cat: 'visual', tags: ['paint-heavy'], q: '玻璃' })
    expect(hits.length).toBeGreaterThan(0)
    expect(hits.every((entry) => entry.category === 'visual')).toBe(true)
  })

  it('parseTags / serializeTags 处理空串与空格', () => {
    expect(parseTags(null)).toEqual([])
    expect(parseTags('')).toEqual([])
    expect(parseTags(' css-only , ,scroll-linked ')).toEqual(['css-only', 'scroll-linked'])
    expect(serializeTags([])).toBeNull()
    expect(serializeTags(['a', 'b'])).toBe('a,b')
  })

  it('toggleTag 增删，不重复', () => {
    expect(toggleTag([], 'js')).toEqual(['js'])
    expect(toggleTag(['js'], 'css-only')).toEqual(['js', 'css-only'])
    expect(toggleTag(['js', 'css-only'], 'js')).toEqual(['css-only'])
  })

  it('hasBrowseFilter 覆盖标签', () => {
    expect(hasBrowseFilter(empty)).toBe(false)
    expect(hasBrowseFilter({ ...empty, tags: ['js'] })).toBe(true)
  })
})
