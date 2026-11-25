import { describe, expect, it } from 'vitest'
import { ENTRIES } from '../data'
import { metaOf } from '../data/metaOf'
import type { EntryMeta } from '../data/types'
import { similarEntries } from './similar'

const METAS = ENTRIES.map(metaOf)
const BY_SLUG = new Map(ENTRIES.map((entry) => [entry.slug, entry]))

function similarOf(slug: string, limit = 4) {
  const entry = BY_SLUG.get(slug)
  if (!entry) throw new Error(`测试数据里找不到 ${slug}`)
  return similarEntries(metaOf(entry), METAS, limit, entry.related)
}

function slugs(items: EntryMeta[]) {
  return items.map((item) => item.slug)
}

/** 只写测试真正关心的字段，其余按最小合法值补齐 */
function makeEntry(
  seed: Pick<EntryMeta, 'slug' | 'code' | 'category'> & Partial<Pick<EntryMeta, 'tags' | 'scenes' | 'feel' | 'intent'>>,
): EntryMeta {
  return {
    slug: seed.slug,
    code: seed.code,
    nameZh: seed.slug,
    nameEn: seed.slug,
    aliases: [],
    category: seed.category,
    oneLiner: '',
    whenToUse: [],
    confusions: [],
    pitfalls: [],
    keywords: [],
    scenes: seed.scenes ?? [],
    feel: seed.feel ?? [],
    intent: seed.intent ?? [],
    tags: seed.tags ?? [],
    demo: { shape: 'stage' },
    defaults: {},
  }
}

describe('相似展品推荐', () => {
  it('全部词条都能推荐出至少一条相似展品', () => {
    const missing = ENTRIES.filter(
      (entry) => similarEntries(metaOf(entry), METAS, 4, entry.related).length === 0,
    ).map((entry) => entry.slug)
    expect(missing, `这些词条没有相似展品：${missing.join('、')}`).toEqual([])
  })

  it('不推荐自己、不重复、数量不超过 limit', () => {
    for (const entry of ENTRIES) {
      for (const limit of [1, 2, 4]) {
        const result = similarEntries(metaOf(entry), METAS, limit, entry.related)
        expect(result.length, `${entry.slug} 的推荐数量超过 ${limit}`).toBeLessThanOrEqual(limit)
        expect(slugs(result), `${entry.slug} 把自己推荐了出来`).not.toContain(entry.slug)
        expect(new Set(slugs(result)).size, `${entry.slug} 的推荐里有重复`).toBe(result.length)
      }
    }
  })

  it('同样的输入给出同样的顺序', () => {
    for (const entry of ENTRIES) {
      const first = slugs(similarEntries(metaOf(entry), METAS, 4, entry.related))
      const second = slugs(similarEntries(metaOf(entry), METAS, 4, entry.related))
      expect(second, `${entry.slug} 的推荐顺序不稳定`).toEqual(first)
    }
  })

  it('总分相同时按词条编号排序', () => {
    const self = makeEntry({ slug: 'self', code: 'M-01', category: 'motion', tags: ['css-only'] })
    const later = makeEntry({ slug: 'later', code: 'M-05', category: 'motion', tags: ['css-only'] })
    const earlier = makeEntry({ slug: 'earlier', code: 'M-02', category: 'motion', tags: ['css-only'] })
    // 两条候选的分数完全一致（同厅 +12、共享 1 个 tag +3），只能靠 codeOrder 决定先后
    const result = similarEntries(self, [self, later, earlier], 4)
    expect(slugs(result)).toEqual(['earlier', 'later'])
  })

  it('只靠手写 related 也能把毫无交集的词条拉进来', () => {
    const self = makeEntry({ slug: 'self', code: 'M-01', category: 'motion' })
    const stranger = makeEntry({ slug: 'stranger', code: 'T-01', category: 'type' })
    expect(similarEntries(self, [self, stranger], 4)).toEqual([])
    expect(slugs(similarEntries(self, [self, stranger], 4, ['stranger']))).toEqual(['stranger'])
  })

  describe('具体推荐样例', () => {
    it('毛玻璃的第一名是玻璃拟态（同厅 + 手写 related，最像的一对）', () => {
      const top = similarOf('frosted-glass')
      expect(top.length).toBeGreaterThan(0)
      expect(top[0].slug).toBe('glassmorphism')
    })

    it('视差滚动的推荐里包含滚动驱动动画（易混且同厅）', () => {
      const top = similarOf('parallax')
      expect(slugs(top)).toContain('scroll-driven')
    })

    it('交错进场的推荐里能找到逐字显现（易混邻居，跨厅所以排在第六）', () => {
      const top = similarOf('stagger', 6)
      expect(slugs(top)).toContain('char-reveal')
    })
  })
})
