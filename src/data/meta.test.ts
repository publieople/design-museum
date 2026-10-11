import { describe, expect, it } from 'vitest'
import { ENTRIES } from './index'
import { ENTRY_META } from './entryMeta'
import { featuredMeta } from './meta'
import { metaOf } from './metaOf'
import type { Entry } from './types'

const modules = import.meta.glob<{ default: Entry }>('./entries/**/*.ts', { eager: true })
const rawEntries = Object.values(modules).map((mod) => mod.default)

describe('首屏 meta 与完整词条同步', () => {
  it('每条词条都有一条 meta，字段逐项一致', () => {
    const bySlug = new Map(ENTRY_META.map((meta) => [meta.slug, meta]))
    expect(ENTRY_META.length).toBe(rawEntries.length)

    for (const entry of rawEntries) {
      const meta = bySlug.get(entry.slug)
      expect(meta, `${entry.slug} 缺 meta，改完词条要跑 npm run gen:meta`).toBeDefined()
      expect(meta, `${entry.slug} 的 meta 和词条对不上，跑 npm run gen:meta`).toEqual(metaOf(entry))
    }
  })

  it('顺序与完整词条一致（首页交错排序依赖它）', () => {
    expect(ENTRY_META.map((meta) => meta.slug)).toEqual(ENTRIES.map((entry) => entry.slug))
  })

  it('meta 里没有夹带只有详情页才用的字段', () => {
    for (const meta of ENTRY_META) {
      for (const key of ['spec', 'refs', 'related', 'reducedMotion', 'controls', 'prompt']) {
        expect(key in meta, `${meta.slug} 的 meta 不该带 ${key}`).toBe(false)
      }
      expect(Object.keys(meta.defaults).length).toBeGreaterThan(0)
    }
  })

  it('featuredMeta 取前 5 条能覆盖 5 个展厅', () => {
    const categories = new Set(featuredMeta().slice(0, 5).map((meta) => meta.category))
    expect(categories.size).toBe(5)
  })
})
