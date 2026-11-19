import { describe, expect, it } from 'vitest'
import catalogJsonRaw from '../../public/catalog.json?raw'
import catalogMarkdownRaw from '../../public/catalog.md?raw'
import catalogIndexRaw from '../../public/catalog/index.json?raw'
import catalogTagsRaw from '../../public/catalog/tags.json?raw'
import catalogAliasesRaw from '../../public/catalog/aliases.json?raw'
import motionHallJsonRaw from '../../public/catalog/motion.json?raw'
import motionHallMarkdownRaw from '../../public/catalog/motion.md?raw'
import feedbackHallJsonRaw from '../../public/catalog/feedback.json?raw'
import feedbackHallMarkdownRaw from '../../public/catalog/feedback.md?raw'
import layoutHallJsonRaw from '../../public/catalog/layout.json?raw'
import layoutHallMarkdownRaw from '../../public/catalog/layout.md?raw'
import visualHallJsonRaw from '../../public/catalog/visual.json?raw'
import visualHallMarkdownRaw from '../../public/catalog/visual.md?raw'
import typeHallJsonRaw from '../../public/catalog/type.json?raw'
import typeHallMarkdownRaw from '../../public/catalog/type.md?raw'
import llmsRaw from '../../public/llms.txt?raw'
import { ENTRIES } from './index'
import {
  buildAliasIndex,
  buildCatalog,
  buildCatalogIndex,
  buildHallCatalog,
  buildTagIndex,
  catalogMarkdown,
  CATALOG_VERSION,
  hallCatalogMarkdown,
  SITE_BASE,
} from './catalog'
import { CATEGORIES, DEMO_SHAPES, FACETS, TAGS } from './taxonomy'
import type { CategoryId } from './types'

/** 五个厅的分片产物用静态 import 读进来：?raw 是文本，才能逐字节比对生成结果 */
const HALL_SHARDS: Record<CategoryId, { json: string; markdown: string }> = {
  motion: { json: motionHallJsonRaw, markdown: motionHallMarkdownRaw },
  feedback: { json: feedbackHallJsonRaw, markdown: feedbackHallMarkdownRaw },
  layout: { json: layoutHallJsonRaw, markdown: layoutHallMarkdownRaw },
  visual: { json: visualHallJsonRaw, markdown: visualHallMarkdownRaw },
  type: { json: typeHallJsonRaw, markdown: typeHallMarkdownRaw },
}

/**
 * 机器可读目录（public/catalog.* 与 llms.txt）是 pnpm gen:catalog 的生成物。
 * 这里既守「没过期」，也守「内容够 AI 用」——少字段比过期更隐蔽。
 * 用 ?raw 读文件，免得为了 node:fs 去动 tsconfig 的 types。
 */
describe('给机器看的目录', () => {
  it('catalog.json 与现场数据逐字段一致（过期就红）', () => {
    const data = buildCatalog(ENTRIES)
    expect(data.version).toBe(CATALOG_VERSION)
    expect(JSON.parse(catalogJsonRaw), '跑 pnpm gen:catalog').toEqual(data)
  })

  it('catalog.md 与生成结果一致', () => {
    expect(catalogMarkdownRaw, '跑 pnpm gen:catalog').toBe(catalogMarkdown(ENTRIES))
  })

  it('llms.txt 指向两份目录并列出全部词条', () => {
    expect(llmsRaw).toContain(`${SITE_BASE}/catalog.json`)
    expect(llmsRaw).toContain(`${SITE_BASE}/catalog.md`)
    for (const entry of ENTRIES) {
      expect(llmsRaw, `llms.txt 缺 ${entry.slug}`).toContain(`${SITE_BASE}/entry/${entry.slug}/`)
    }
  })

  it('每条词条都带上了 AI 定位与交付所需的字段', () => {
    const data = buildCatalog(ENTRIES)
    expect(data.entries).toHaveLength(ENTRIES.length)
    for (const entry of data.entries) {
      expect(entry.aliases.length, `${entry.slug} 缺别名`).toBeGreaterThan(0)
      expect(entry.keywords.length, `${entry.slug} 缺关键词`).toBeGreaterThan(0)
      expect(entry.prompt.zh.length, `${entry.slug} 的需求句太短`).toBeGreaterThan(20)
      expect(entry.prompt.en.length, `${entry.slug} 的英文关键词太短`).toBeGreaterThan(10)
      expect(entry.controls.length, `${entry.slug} 缺控件`).toBeGreaterThan(0)
      expect(entry.url).toBe(`${SITE_BASE}/entry/${entry.slug}/`)
      expect(entry.detail.markdown).toBe(`${SITE_BASE}/catalog.md#${entry.slug}`)
      expect(DEMO_SHAPES.some((shape) => shape.id === entry.demo.shape), `${entry.slug} 形态不在册`).toBe(true)
      for (const tag of entry.tags) {
        expect(TAGS.some((item) => item.id === tag), `${entry.slug} 的标签 ${tag} 不在词表里`).toBe(true)
      }
    }
  })

  it('Markdown 版给每条词条留了可跳转的锚点与全部细节', () => {
    const data = buildCatalog(ENTRIES)
    for (const entry of data.entries) {
      expect(catalogMarkdownRaw, `catalog.md 缺 ${entry.slug} 的锚点`).toContain(`<a id="${entry.slug}"></a>`)
      expect(catalogMarkdownRaw, `catalog.md 缺 ${entry.slug} 的易混项`).toContain('别搞混')
      expect(catalogMarkdownRaw, `catalog.md 缺 ${entry.slug} 的需求句`).toContain(entry.prompt.zh.slice(0, 24))
    }
  })

  it('词表完整：facet 覆盖全部标签，形态一个不少', () => {
    const data = buildCatalog(ENTRIES)
    const listed = data.facets.flatMap((facet) => facet.tags.map((tag) => tag.id))
    expect(new Set(listed)).toEqual(new Set(TAGS.map((tag) => tag.id)))
    expect(data.facets.map((facet) => facet.id)).toEqual(FACETS.map((facet) => facet.id))
    expect(data.vocab.demoShapes.map((shape) => shape.id)).toEqual(DEMO_SHAPES.map((shape) => shape.id))
  })

  it('地址用固定的线上前缀，不跟着构建环境变', () => {
    expect(SITE_BASE).toBe('https://publieople.github.io/design-museum')
    expect(catalogJsonRaw).not.toContain('localhost')
  })
})

/**
 * 分片（public/catalog/**）：把 130KB+ 的全量目录拆成「索引 + 5 厅 + 标签 + 别名」，
 * 机器按需取一小份。这里守住「没过期」与「拼回去等于全量」两件事。
 */
describe('catalog 分片', () => {
  const data = buildCatalog(ENTRIES)
  const index = buildCatalogIndex(ENTRIES)

  it('index.json 与生成结果一致，5 个厅按展陈顺序且分片地址固定', () => {
    expect(JSON.parse(catalogIndexRaw), '跑 pnpm gen:catalog').toEqual(index)
    expect(index.version).toBe(CATALOG_VERSION)
    expect(index.halls.map((hall) => hall.id)).toEqual(CATEGORIES.map((category) => category.id))
    expect(index.halls).toHaveLength(CATEGORIES.length)
    expect(index.counts).toEqual(data.counts)
    expect(index.vocab).toEqual(data.vocab)
    for (const hall of index.halls) {
      expect(hall.json).toBe(`catalog/${hall.id}.json`)
      expect(hall.markdown).toBe(`catalog/${hall.id}.md`)
    }
    expect(index.tags).toBe('catalog/tags.json')
    expect(index.aliases).toBe('catalog/aliases.json')
    expect(index.full).toEqual({ json: 'catalog.json', markdown: 'catalog.md' })
  })

  it('每厅的 JSON/Markdown 分片与生成器结果一致，且只装本厅词条', () => {
    for (const category of CATEGORIES) {
      const files = HALL_SHARDS[category.id]
      expect(files, `缺 ${category.id} 分片文件`).toBeDefined()
      const shard = buildHallCatalog(ENTRIES, category.id)
      expect(JSON.parse(files.json), `跑 pnpm gen:catalog：catalog/${category.id}.json 过期`).toEqual(shard)
      expect(files.markdown, `跑 pnpm gen:catalog：catalog/${category.id}.md 过期`).toBe(hallCatalogMarkdown(ENTRIES, category.id))
      expect(shard.version).toBe(CATALOG_VERSION)
      expect(shard.hall).toEqual({
        id: category.id,
        letter: category.letter,
        nameZh: category.nameZh,
        nameEn: category.nameEn,
        count: shard.entries.length,
      })
      expect(shard.entries.every((entry) => entry.category === category.id)).toBe(true)
      expect(shard.entries.length).toBe(index.halls.find((hall) => hall.id === category.id)?.count)
      for (const entry of shard.entries) {
        expect(files.markdown, `catalog/${category.id}.md 缺 ${entry.slug} 的锚点`).toContain(`<a id="${entry.slug}"></a>`)
      }
    }
  })

  it('分片拼回去等于全量：count 之和 = 词条数，slug 不重不漏', () => {
    expect(index.halls.reduce((sum, hall) => sum + hall.count, 0)).toBe(ENTRIES.length)
    expect(data.counts.entries).toBe(ENTRIES.length)
    const perHall = index.halls.reduce<Record<string, number>>((acc, hall) => {
      acc[hall.id] = hall.count
      return acc
    }, {})
    expect(perHall).toEqual(data.counts.perCategory)
    // 每厅分片里的 entries 按 CATEGORIES 顺序拼起来，恰好覆盖全量且没有重复
    const slugs = CATEGORIES.flatMap((category) => buildHallCatalog(ENTRIES, category.id).entries.map((entry) => entry.slug))
    expect(slugs).toHaveLength(ENTRIES.length)
    expect(new Set(slugs).size).toBe(ENTRIES.length)
  })

  it('tags.json 覆盖 taxonomy 全部标签，count 与 slugs 一致', () => {
    const tags = buildTagIndex(ENTRIES)
    expect(JSON.parse(catalogTagsRaw), '跑 pnpm gen:catalog').toEqual(tags)
    expect(tags.version).toBe(CATALOG_VERSION)
    expect(tags.tags.map((tag) => tag.id)).toEqual(TAGS.map((tag) => tag.id))
    const entriesBySlug = new Map(ENTRIES.map((entry) => [entry.slug, entry]))
    for (const tag of tags.tags) {
      const meta = TAGS.find((item) => item.id === tag.id)
      expect(meta, `tags.json 出现词表外的标签 ${tag.id}`).toBeDefined()
      expect(tag.facet).toBe(meta?.facet)
      expect(tag.nameZh).toBe(meta?.label.zh)
      expect(tag.nameEn).toBe(meta?.label.en)
      expect(tag.count).toBe(tag.slugs.length)
      expect(new Set(tag.slugs).size).toBe(tag.slugs.length)
      for (const slug of tag.slugs) {
        expect(entriesBySlug.get(slug)?.tags, `tags.json 的 ${tag.id} 指向没打这个标签的 ${slug}`).toContain(tag.id)
      }
    }
  })

  it('aliases.json 合并重复俗称，展开数与词条 aliases 总和一致', () => {
    const aliases = buildAliasIndex(ENTRIES)
    expect(JSON.parse(catalogAliasesRaw), '跑 pnpm gen:catalog').toEqual(aliases)
    expect(aliases.version).toBe(CATALOG_VERSION)
    const flat = ENTRIES.flatMap((entry) => entry.aliases)
    expect(aliases.aliases.reduce((sum, item) => sum + item.slugs.length, 0)).toBe(flat.length)
    expect(aliases.count).toBe(aliases.aliases.length)
    expect(new Set(flat).size).toBe(aliases.count)
    // 码位序，不依赖 ICU：换机器生成也要逐字节一致
    expect(aliases.aliases.map((item) => item.alias)).toEqual([...aliases.aliases.map((item) => item.alias)].sort())
    const entriesBySlug = new Map(ENTRIES.map((entry) => [entry.slug, entry]))
    for (const item of aliases.aliases) {
      expect(item.alias.length).toBeGreaterThan(0)
      expect(item.slugs.length).toBeGreaterThan(0)
      expect(new Set(item.slugs).size).toBe(item.slugs.length)
      for (const slug of item.slugs) {
        expect(entriesBySlug.get(slug)?.aliases, `${item.alias} 指向不含该俗称的 ${slug}`).toContain(item.alias)
      }
    }
  })

  it('llms.txt 先给分片索引，再给各厅与标签/别名分片地址', () => {
    expect(llmsRaw).toContain(`${SITE_BASE}/catalog/index.json`)
    for (const hall of index.halls) {
      expect(llmsRaw).toContain(`${SITE_BASE}/${hall.json}`)
      expect(llmsRaw).toContain(`${SITE_BASE}/${hall.markdown}`)
    }
    expect(llmsRaw).toContain(`${SITE_BASE}/catalog/tags.json`)
    expect(llmsRaw).toContain(`${SITE_BASE}/catalog/aliases.json`)
    // 分片索引排在两份全量目录之前：先读小的，再决定要不要读大的
    expect(llmsRaw.indexOf('/catalog/index.json')).toBeLessThan(llmsRaw.indexOf(`${SITE_BASE}/catalog.json`))
  })
})
