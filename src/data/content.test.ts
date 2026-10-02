import { describe, expect, it } from 'vitest'
import { ENTRIES, ENTRY_BY_SLUG } from './index'
import { CATEGORIES } from './taxonomy'

/** 全馆收齐后的整体校验。铺量阶段会红，收齐即绿。 */
describe('全馆收齐', () => {
  it('共有 30 条词条', () => {
    expect(ENTRIES.length).toBe(30)
  })

  it('五个展厅各 6 件', () => {
    for (const category of CATEGORIES) {
      const group = ENTRIES.filter((entry) => entry.category === category.id)
      expect(group.length, `${category.nameZh}（${category.id}）应为 6 件`).toBe(6)
    }
  })

  it('每件展品的编号在该展厅内连续且从 01 开始', () => {
    for (const category of CATEGORIES) {
      const codes = ENTRIES.filter((entry) => entry.category === category.id)
        .map((entry) => Number(entry.code.split('-')[1]))
        .sort((a, b) => a - b)
      expect(codes).toEqual([1, 2, 3, 4, 5, 6])
    }
  })

  it('related 里没有死链', () => {
    for (const entry of ENTRIES) {
      for (const slug of entry.related) {
        expect(ENTRY_BY_SLUG.get(slug), `${entry.slug} 的相关词条 ${slug} 不存在`).toBeTruthy()
        expect(slug, `${entry.slug} 不该把自己列为相关`).not.toBe(entry.slug)
      }
    }
  })

  it('每个展厅至少有一条词条被别的词条引用为相关', () => {
    for (const category of CATEGORIES) {
      const referenced = ENTRIES.some((entry) =>
        entry.related.some((slug) => ENTRY_BY_SLUG.get(slug)?.category === category.id),
      )
      expect(referenced, `${category.nameZh} 没有出现在任何 related 里`).toBe(true)
    }
  })
})
