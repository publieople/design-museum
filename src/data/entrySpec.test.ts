import { describe, expect, it } from 'vitest'
import { ENTRIES } from './index'
import { CATEGORIES, DEMO_SHAPES, FACETS, TAGS } from './taxonomy'
import type { Entry } from './types'

const modules = import.meta.glob<{ default: Entry }>('./entries/**/*.ts', { eager: true })

/**
 * docs/ENTRY-SPEC.md 里「能自动测」的那部分。
 *
 * 规范文档会漂移，测试不会：文档里写下的每条硬规矩，只要机器能判，就落在这里。
 * 改规范如果动了这些规矩，先改这里的测试和文档，再改数据。
 */
describe('条目规范', () => {
  it('文件路径必须等于 <category>/<slug>.ts', () => {
    for (const [file, mod] of Object.entries(modules)) {
      const entry = mod.default
      expect(file, `${entry.slug} 放错展厅目录了`).toBe(`./entries/${entry.category}/${entry.slug}.ts`)
    }
  })

  it('标签只准用词表里的 id，每条 2–6 个、不重复、至少 1 个 tech', () => {
    const byId = new Map(TAGS.map((tag) => [tag.id, tag]))
    for (const entry of ENTRIES) {
      expect(entry.tags.length, `${entry.slug} 的标签数量`).toBeGreaterThanOrEqual(2)
      expect(entry.tags.length, `${entry.slug} 的标签数量`).toBeLessThanOrEqual(6)
      expect(new Set(entry.tags).size, `${entry.slug} 有重复标签`).toBe(entry.tags.length)
      for (const tag of entry.tags) {
        expect(byId.has(tag), `${entry.slug} 用了词表外的标签 ${tag}`).toBe(true)
      }
      const tech = entry.tags.filter((tag) => byId.get(tag)?.facet === 'tech')
      expect(tech.length, `${entry.slug} 至少要有一个 tech 标签`).toBeGreaterThanOrEqual(1)
    }
  })

  it('每个标签至少被 2 条词条用到——用不上的要合并或删掉', () => {
    const used = new Map(TAGS.map((tag) => [tag.id, 0]))
    for (const entry of ENTRIES) {
      for (const tag of entry.tags) used.set(tag, (used.get(tag) ?? 0) + 1)
    }
    for (const tag of TAGS) {
      expect(used.get(tag.id) ?? 0, `标签 ${tag.id} 只有 ${used.get(tag.id) ?? 0} 条在用`).toBeGreaterThanOrEqual(2)
    }
  })

  it('词表不超 40 个标签，每个都有双语标签与说明，facet 都在册', () => {
    expect(TAGS.length).toBeLessThanOrEqual(40)
    const facets = new Set(FACETS.map((facet) => facet.id))
    for (const tag of TAGS) {
      expect(tag.label.zh.length, tag.id).toBeGreaterThan(0)
      expect(tag.label.en?.length ?? 0, `${tag.id} 缺英文标签`).toBeGreaterThan(0)
      expect(tag.hint.zh.length, tag.id).toBeGreaterThan(0)
      expect(tag.hint.en?.length ?? 0, `${tag.id} 缺英文说明`).toBeGreaterThan(0)
      expect(facets.has(tag.facet), `${tag.id} 的 facet ${tag.facet} 不在 FACETS 里`).toBe(true)
    }
  })

  it('每个 facet 至少有一个标签', () => {
    for (const facet of FACETS) {
      expect(TAGS.filter((tag) => tag.facet === facet.id).length, facet.id).toBeGreaterThan(0)
    }
  })

  it('演示形态在册；非固定舞台的形态必须给 thumb: still', () => {
    const shapes = new Set(DEMO_SHAPES.map((shape) => shape.id))
    for (const entry of ENTRIES) {
      expect(shapes.has(entry.demo.shape), `${entry.slug} 的 demo.shape 不在册`).toBe(true)
      const minHeight = entry.demo.minHeight
      if (minHeight !== undefined) {
        expect(Number.isInteger(minHeight) && minHeight >= 120 && minHeight <= 800, `${entry.slug} 的 minHeight=${minHeight}`).toBe(true)
      }
      if (entry.demo.shape !== 'stage') {
        expect(entry.demo.thumb, `${entry.slug} 是 ${entry.demo.shape}，缩略图要给 thumb: 'still'`).toBe('still')
      }
    }
  })

  it('自带滚动的演示必须声明 manual 循环策略', () => {
    for (const entry of ENTRIES) {
      if (entry.demo.shape === 'scroll') {
        expect(entry.loop ?? 'replay', `${entry.slug} 自带滚动，不该被自动重播重置`).toBe('manual')
      }
    }
  })

  it('展厅词表与 entries 目录对得上', () => {
    const halls = new Set(CATEGORIES.map((category) => category.id))
    for (const entry of ENTRIES) expect(halls.has(entry.category), entry.slug).toBe(true)
  })
})
