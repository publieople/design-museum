import { describe, expect, it } from 'vitest'
import { ENTRIES } from './index'
import { RETIRED, retiredFor, tombstoneTarget, type RetiredEntry } from './retired'
import { CATEGORIES } from './taxonomy'

const RETIRED_SLUGS = new Set(RETIRED.map((item) => item.slug))

describe('墓碑（下架的词条）', () => {
  it('slug 与 code 都不与在册词条或别的墓碑冲突', () => {
    const liveSlugs = new Set(ENTRIES.map((entry) => entry.slug))
    const liveCodes = new Set(ENTRIES.map((entry) => entry.code))
    const slugs = new Set<string>()
    const codes = new Set<string>()
    for (const item of RETIRED) {
      expect(item.slug, item.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(item.code, item.slug).toMatch(/^[A-Z]-\d{2}$/)
      expect(liveSlugs.has(item.slug), `${item.slug} 与在册词条重名`).toBe(false)
      expect(liveCodes.has(item.code), `${item.code} 与在册词条撞号`).toBe(false)
      expect(slugs.has(item.slug), `${item.slug} 墓碑重名`).toBe(false)
      expect(codes.has(item.code), `${item.code} 墓碑撞号`).toBe(false)
      slugs.add(item.slug)
      codes.add(item.code)
    }
  })

  it('每个墓碑都写清名字、下架时间与原因', () => {
    for (const item of RETIRED) {
      expect(item.nameZh.length, item.slug).toBeGreaterThan(0)
      expect(item.nameEn.length, item.slug).toBeGreaterThan(0)
      expect(item.retiredAt, item.slug).toMatch(/^\d{4}-\d{2}$/)
      expect(item.reason.length, item.slug).toBeGreaterThan(10)
    }
  })

  it('编号字母必须是某个展厅的字母', () => {
    const letters = new Set(CATEGORIES.map((category) => category.letter))
    for (const item of RETIRED) {
      expect(letters.has(item.code[0] ?? ''), `${item.slug} 的编号字母不合法`).toBe(true)
    }
  })

  it('replacedBy 必须指向在册词条，否则跳转页会落到 404', () => {
    const liveSlugs = new Set(ENTRIES.map((entry) => entry.slug))
    for (const item of RETIRED) {
      if (!item.replacedBy) continue
      expect(liveSlugs.has(item.replacedBy), `${item.slug} 的 replacedBy「${item.replacedBy}」不在册`).toBe(true)
      expect(item.replacedBy, item.slug).not.toBe(item.slug)
    }
  })

  it('跳转目标：有替代词条就去它那儿，没有就回词条库', () => {
    const fixture: RetiredEntry = {
      slug: 'fixture-retired',
      code: 'V-99',
      nameZh: '样例',
      nameEn: 'Fixture',
      retiredAt: '2026-01',
      replacedBy: 'frosted-glass',
      reason: '这条只活在测试里，用来固定跳转目标的形状。',
    }
    expect(tombstoneTarget(fixture)).toBe('/entry/frosted-glass')
    expect(tombstoneTarget({ ...fixture, replacedBy: undefined })).toBe('/browse')
  })

  it('在册词条的 related 不指向墓碑', () => {
    for (const entry of ENTRIES) {
      for (const slug of entry.related) {
        expect(RETIRED_SLUGS.has(slug), `${entry.slug} 的 related 指向了墓碑 ${slug}`).toBe(false)
      }
    }
  })

  it('retiredFor 按 slug 能查到墓碑，查在册词条返回空', () => {
    for (const item of RETIRED) expect(retiredFor(item.slug)).toBe(item)
    expect(retiredFor('frosted-glass')).toBeUndefined()
  })
})
