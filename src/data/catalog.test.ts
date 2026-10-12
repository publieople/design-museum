import { describe, expect, it } from 'vitest'
import catalogJsonRaw from '../../public/catalog.json?raw'
import catalogMarkdownRaw from '../../public/catalog.md?raw'
import llmsRaw from '../../public/llms.txt?raw'
import { ENTRIES } from './index'
import { buildCatalog, catalogMarkdown, CATALOG_VERSION, SITE_BASE } from './catalog'
import { DEMO_SHAPES, FACETS, TAGS } from './taxonomy'

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
