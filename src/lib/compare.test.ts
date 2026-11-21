import { describe, expect, it } from 'vitest'
import { ENTRY_META } from '../data/meta'
import { codeOrder } from '../data/taxonomy'
import type { EntryMeta } from '../data/types'
import {
  comparePair,
  comparePairs,
  confusionDiff,
  filterPairs,
  pairKey,
  type ComparePair,
} from './compare'

type Confusion = EntryMeta['confusions'][number]

function makeEntry(
  slug: string,
  code: string,
  confusions: Confusion[] = [],
  names: { nameZh?: string; nameEn?: string; aliases?: string[] } = {},
): EntryMeta {
  return {
    slug,
    code,
    nameZh: names.nameZh ?? slug,
    nameEn: names.nameEn ?? slug,
    aliases: names.aliases ?? [],
    category: 'motion',
    oneLiner: '',
    whenToUse: [],
    confusions,
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

function bySlug(slug: string): EntryMeta {
  const found = ENTRY_META.find((entry) => entry.slug === slug)
  if (!found) throw new Error('测试依赖的词条不存在：' + slug)
  return found
}

describe('pairKey', () => {
  it('与顺序无关：a~b 和 b~a 得到同一个键', () => {
    expect(pairKey('glassmorphism', 'frosted-glass')).toBe('frosted-glass~glassmorphism')
    expect(pairKey('frosted-glass', 'glassmorphism')).toBe('frosted-glass~glassmorphism')
    expect(pairKey('z', 'a')).toBe('a~z')
  })

  it('slug 相同时也稳定，不返回空串', () => {
    expect(pairKey('same', 'same')).toBe('same~same')
  })
})

describe('comparePairs', () => {
  it('空数据返回空数组', () => {
    expect(comparePairs([])).toEqual([])
  })

  it('合成数据：互相提到只算一对，没提到的和不存在的标签不产生对照', () => {
    const a = makeEntry('alpha', 'M-01', [{ with: 'Beta', diff: 'Alpha 看 Beta' }], {
      nameEn: 'Alpha',
      nameZh: '甲',
    })
    const b = makeEntry('beta', 'M-02', [{ with: 'Alpha', diff: 'Beta 看 Alpha' }], {
      nameEn: 'Beta',
      nameZh: '乙',
    })
    const lonely = makeEntry('lonely', 'M-03', [{ with: '不存在的说法', diff: '不必出现' }], {
      nameEn: 'Lonely',
    })
    const self = makeEntry('self', 'M-04', [{ with: 'Self', diff: '自己不算' }], {
      nameEn: 'Self',
    })

    const pairs = comparePairs([a, b, lonely, self])
    expect(pairs).toHaveLength(1)
    expect(pairs[0].key).toBe('alpha~beta')
    // 编号小的在 a，方向固定
    expect(pairs[0].a.slug).toBe('alpha')
    expect(pairs[0].b.slug).toBe('beta')
  })

  it('合成数据：大小写与全角空格不影响解析', () => {
    const a = makeEntry('alpha', 'M-01', [{ with: '　ＢＥＴＡ　', diff: 'a-b' }], {
      nameEn: 'Alpha',
    })
    const b = makeEntry('beta', 'M-02', [], { nameEn: 'Beta' })
    const pairs = comparePairs([a, b])
    expect(pairs).toHaveLength(1)
    expect(pairs[0].key).toBe('alpha~beta')
  })

  it('真实数据：非空、键唯一、每一对都是真实词条且不指向自己', () => {
    const pairs = comparePairs(ENTRY_META)
    expect(pairs.length).toBeGreaterThan(0)

    const slugs = new Set(ENTRY_META.map((entry) => entry.slug))
    const keys = pairs.map((pair) => pair.key)
    expect(new Set(keys).size).toBe(keys.length)

    for (const pair of pairs) {
      expect(slugs.has(pair.a.slug)).toBe(true)
      expect(slugs.has(pair.b.slug)).toBe(true)
      expect(pair.a.slug).not.toBe(pair.b.slug)
      expect(pair.key).toBe(pairKey(pair.a.slug, pair.b.slug))
    }
  })

  it('真实数据：按 a.code 再 b.code 升序，与词条库动线一致', () => {
    const pairs = comparePairs(ENTRY_META)
    for (let index = 1; index < pairs.length; index += 1) {
      const previous = pairs[index - 1]
      const current = pairs[index]
      const left = codeOrder(previous.a.code)
      const right = codeOrder(current.a.code)
      if (left !== right) {
        expect(left < right).toBe(true)
        continue
      }
      expect(codeOrder(previous.b.code) <= codeOrder(current.b.code)).toBe(true)
    }
  })

  it('真实数据：包含毛玻璃与玻璃拟态这一对，编号小的在 a', () => {
    const pair = comparePairs(ENTRY_META).find(
      (item) => item.key === pairKey('frosted-glass', 'glassmorphism'),
    )
    expect(pair).toBeDefined()
    expect(pair?.a.slug).toBe('frosted-glass')
    expect(pair?.b.slug).toBe('glassmorphism')
  })
})

describe('comparePair', () => {
  it('真实数据：a/b 两种顺序都能命中，且保留请求的左右方向', () => {
    const forward = comparePair(ENTRY_META, 'frosted-glass', 'glassmorphism')
    const backward = comparePair(ENTRY_META, 'glassmorphism', 'frosted-glass')

    expect(forward).not.toBeNull()
    expect(backward).not.toBeNull()
    expect(forward?.a.slug).toBe('frosted-glass')
    expect(forward?.b.slug).toBe('glassmorphism')
    expect(backward?.a.slug).toBe('glassmorphism')
    expect(backward?.b.slug).toBe('frosted-glass')
    expect(forward?.key).toBe(backward?.key)
  })

  it('未知 slug、相同 slug、彼此没写过 confusions 都返回 null', () => {
    expect(comparePair(ENTRY_META, 'frosted-glass', 'not-a-real-entry')).toBeNull()
    expect(comparePair(ENTRY_META, 'frosted-glass', 'frosted-glass')).toBeNull()
    expect(comparePair(ENTRY_META, '', 'glassmorphism')).toBeNull()

    const a = makeEntry('alpha', 'M-01')
    const b = makeEntry('beta', 'M-02')
    expect(comparePair([a, b], 'alpha', 'beta')).toBeNull()
    expect(comparePair([], 'alpha', 'beta')).toBeNull()
  })
})

describe('confusionDiff', () => {
  it('合成数据：各自返回自己写的那条 diff，没写的一侧返回 null', () => {
    const a = makeEntry('alpha', 'M-01', [{ with: 'Beta', diff: 'Alpha 看 Beta' }])
    const b = makeEntry('beta', 'M-02', [{ with: 'Alpha', diff: 'Beta 看 Alpha' }])
    const entries = [a, b]

    expect(confusionDiff(a, b, entries)).toBe('Alpha 看 Beta')
    expect(confusionDiff(b, a, entries)).toBe('Beta 看 Alpha')

    const oneWay = makeEntry('gamma', 'M-03', [])
    expect(confusionDiff(oneWay, a, [a, oneWay])).toBeNull()
  })

  it('真实数据：玻璃拟态写了与毛玻璃的区别', () => {
    const frosted = bySlug('frosted-glass')
    const glass = bySlug('glassmorphism')
    const diff = confusionDiff(glass, frosted, ENTRY_META)
    expect(typeof diff).toBe('string')
    expect(diff).toContain('模糊')
  })

  it('真实数据：毛玻璃与玻璃拟态两侧都写了区别', () => {
    const frosted = bySlug('frosted-glass')
    const glass = bySlug('glassmorphism')
    expect(confusionDiff(frosted, glass, ENTRY_META)).not.toBeNull()
    expect(confusionDiff(glass, frosted, ENTRY_META)).not.toBeNull()
  })

  it('真实数据：每一对两侧都有 diff，不留单边档案', () => {
    const pairs = comparePairs(ENTRY_META)
    for (const pair of pairs) {
      expect(confusionDiff(pair.a, pair.b, ENTRY_META), pair.key).not.toBeNull()
      expect(confusionDiff(pair.b, pair.a, ENTRY_META), pair.key).not.toBeNull()
    }
  })
})

describe('filterPairs', () => {
  function fixture(): ComparePair[] {
    const alpha = makeEntry('alpha', 'M-01', [{ with: '乙效果', diff: 'a 看 b' }], {
      nameEn: 'Alpha Effect',
      nameZh: '甲效果',
      aliases: ['第一种', 'the first one'],
    })
    const beta = {
      ...makeEntry('beta', 'V-02', [], { nameEn: 'Beta Effect', nameZh: '乙效果' }),
      category: 'visual' as const,
    }
    return comparePairs([alpha, beta])
  }

  it('空查询与空展厅返回全部，不过滤', () => {
    const pairs = fixture()
    expect(filterPairs(pairs, '')).toHaveLength(1)
    expect(filterPairs(pairs, '   ')).toHaveLength(1)
    expect(filterPairs(pairs, '', 'all')).toHaveLength(1)
  })

  it('查询命中中文名、英文名、别名与编号，大小写与空白不敏感', () => {
    const pairs = fixture()
    expect(filterPairs(pairs, '甲效果')).toHaveLength(1)
    expect(filterPairs(pairs, 'ALPHA')).toHaveLength(1)
    expect(filterPairs(pairs, '第一种')).toHaveLength(1)
    expect(filterPairs(pairs, 'thefirstone')).toHaveLength(1)
    expect(filterPairs(pairs, 'v-02')).toHaveLength(1)
    expect(filterPairs(pairs, 'm 01')).toHaveLength(1)
  })

  it('查不到时返回空数组', () => {
    expect(filterPairs(fixture(), 'zzz')).toEqual([])
  })

  it('展厅按「左边那条」的 category 过滤', () => {
    const pairs = fixture()
    expect(filterPairs(pairs, '', 'motion')).toHaveLength(1)
    // 右边那条属于 visual，但分组口径看左边（alpha 在 motion），所以被筛掉
    expect(filterPairs(pairs, '', 'visual')).toEqual([])
  })
})
