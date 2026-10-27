import { describe, expect, it } from 'vitest'
import { ENTRY_META } from '../data/meta'
import { codeOrder } from '../data/taxonomy'
import type { EntryMeta } from '../data/types'
import { sortEntries } from './browseSort'

function makeEntry(slug: string, code: string, nameZh: string): EntryMeta {
  return {
    slug,
    code,
    nameZh,
    nameEn: slug,
    aliases: [],
    category: 'motion',
    oneLiner: '',
    whenToUse: [],
    confusions: [],
    pitfalls: [],
    keywords: [],
    scenes: [],
    feel: [],
    intent: [],
    tags: [],
    demo: { shape: 'stage' },
    defaults: {},
  }
}

describe('词条库排序', () => {
  it('编号默认按展厅动线：动效 → 交互 → 布局 → 质感 → 排版', () => {
    const input = [
      makeEntry('a', 'T-01', '大'),
      makeEntry('b', 'V-02', '玻'),
      makeEntry('c', 'M-02', '安'),
      makeEntry('d', 'F-01', '方'),
      makeEntry('e', 'L-01', '高'),
      makeEntry('f', 'M-01', '中'),
    ]
    expect(sortEntries(input, 'code').map((entry) => entry.code)).toEqual([
      'M-01',
      'M-02',
      'F-01',
      'L-01',
      'V-02',
      'T-01',
    ])
  })

  it('同展厅内按序号排，M-02 在 M-10 前面（不是字符串序）', () => {
    const input = [makeEntry('ten', 'M-10', '十'), makeEntry('two', 'M-02', '二')]
    expect(sortEntries(input, 'code').map((entry) => entry.code)).toEqual(['M-02', 'M-10'])
  })

  it('中文名按拼音序，而不是按编号', () => {
    const input = [
      makeEntry('big', 'M-01', '大'),
      makeEntry('glass', 'F-01', '玻'),
      makeEntry('an', 'T-01', '安'),
    ]
    const sorted = sortEntries(input, 'nameZh')
    expect(sorted.map((entry) => entry.nameZh)).toEqual(['安', '玻', '大'])
    expect(sorted.map((entry) => entry.slug)).toEqual(['an', 'glass', 'big'])
  })

  it('中文名排序稳定：同名条目保留入参顺序', () => {
    const dupA = makeEntry('dup-a', 'M-03', '安')
    const dupB = makeEntry('dup-b', 'M-04', '安')
    const sorted = sortEntries([dupA, makeEntry('mid', 'M-02', '玻'), dupB], 'nameZh')
    expect(sorted.map((entry) => entry.slug)).toEqual(['dup-a', 'dup-b', 'mid'])
  })

  it('编号排序稳定：同编号条目保留入参顺序', () => {
    const first = makeEntry('first', 'M-01', '甲')
    const second = makeEntry('second', 'M-01', '乙')
    expect(sortEntries([first, second], 'code').map((entry) => entry.slug)).toEqual(['first', 'second'])
    expect(sortEntries([second, first], 'code').map((entry) => entry.slug)).toEqual(['second', 'first'])
  })

  it('返回新数组、元素原样、不修改入参', () => {
    const input = [
      makeEntry('big', 'M-01', '大'),
      makeEntry('an', 'T-01', '安'),
      makeEntry('glass', 'F-01', '玻'),
    ]
    const before = input.map((entry) => entry.slug)
    const sorted = sortEntries(input, 'nameZh')
    expect(sorted).not.toBe(input)
    expect(sorted).toHaveLength(input.length)
    expect(new Set(sorted)).toEqual(new Set(input))
    expect(input.map((entry) => entry.slug)).toEqual(before)
  })

  it('空数组两种排序都返回空数组', () => {
    expect(sortEntries([], 'code')).toEqual([])
    expect(sortEntries([], 'nameZh')).toEqual([])
  })

  it('真实数据：编号排序单调不减且一条不丢', () => {
    const sorted = sortEntries(ENTRY_META, 'code')
    expect(sorted).toHaveLength(ENTRY_META.length)
    for (let index = 1; index < sorted.length; index += 1) {
      expect(codeOrder(sorted[index].code) >= codeOrder(sorted[index - 1].code)).toBe(true)
    }
    expect(sorted.map((entry) => entry.slug).sort()).toEqual(ENTRY_META.map((entry) => entry.slug).sort())
  })

  it('真实数据：中文名排序也是完整排列且前后有变化', () => {
    const sorted = sortEntries(ENTRY_META, 'nameZh')
    expect(sorted).toHaveLength(ENTRY_META.length)
    expect(sorted.map((entry) => entry.slug).sort()).toEqual(ENTRY_META.map((entry) => entry.slug).sort())
    // 至少证明 nameZh 排序不是原样返回：首条不应恰好是编号序的首条
    const byCode = sortEntries(ENTRY_META, 'code')
    expect(sorted.map((entry) => entry.slug)).not.toEqual(byCode.map((entry) => entry.slug))
  })
})
