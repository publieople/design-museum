import { describe, expect, it } from 'vitest'
import { ENTRIES, ENTRY_BY_SLUG } from './index'
import { CATEGORIES } from './taxonomy'

/**
 * 全馆的整体校验。
 *
 * 这里刻意不写死「共 40 条」「每厅 8 件」：铺量阶段每加一条词条都要来改测试，
 * 改多了就会顺手把断言删掉。现在改成「每厅至少 6 件 + 编号连续」，
 * 加词条不需要动测试，删词条或搬厅才会红。
 */
describe('全馆结构', () => {
  it('每个展厅至少 6 件', () => {
    for (const category of CATEGORIES) {
      const group = ENTRIES.filter((entry) => entry.category === category.id)
      expect(group.length, `${category.nameZh}（${category.id}）至少 6 件`).toBeGreaterThanOrEqual(6)
    }
  })

  it('每件展品的编号在该展厅内连续且从 01 开始', () => {
    for (const category of CATEGORIES) {
      const codes = ENTRIES.filter((entry) => entry.category === category.id)
        .map((entry) => Number(entry.code.split('-')[1]))
        .sort((a, b) => a - b)
      expect(codes, `${category.id} 的编号必须从 01 开始连续`).toEqual(codes.map((_, index) => index + 1))
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
