import { CATEGORIES, categoryOf, DEMO_SHAPES, FACETS, FEELS, INTENTS, SCENES, TAGS } from './taxonomy'
import type { Bi } from './types'
import type { CategoryId, DemoShape, Entry, FacetId, TagId } from './types'
import { defaultValues } from '../lib/controls'
import { SITE_BASE } from '../lib/routes'

/**
 * 给机器（AI / 爬虫 / 脚本）看的目录。
 *
 * 为什么要单独做一份，而不是让 AI 直接读 HTML：词条页是给人看的排版，
 * 别名、易混项、标签、演示形态、控件默认值和「可以提给 AI 的需求句」散在各处，
 * 机器要在 30+ 条里挑一条，需要的是同构、可 grep、字段名稳定的文本。
 *
 * 内容是 buildCatalog() 生成的：public/catalog.json、public/catalog.md、public/llms.txt，
 * src/data/catalog.test.ts 守着它们别过期。
 *
 * 地址用固定的线上前缀拼，不走 absoluteUrl()——后者依赖构建时的 BASE_URL，
 * 会让同一条词条在本地和 CI 里生成不同 URL，产物就不可比对了。
 */
export const CATALOG_VERSION = 1

export { SITE_BASE }

export interface CatalogControl {
  id: string
  kind: 'range' | 'select' | 'toggle'
  label: string
  def: number | string | boolean
  unit?: string
  min?: number
  max?: number
  options?: { value: string; label: string }[]
}

/**
 * 目录里的词条是「索引 + 可直接交付」的字段，不是词条全文：
 * 长散文（whenToUse / confusions / pitfalls / spec / refs）留在 catalog.md 与词条页，
 * 需要时按 slug 去那两处取。JSON 全量塞进来会到 160KB+，机器每次都要读完，不值得。
 */
export interface CatalogEntry {
  slug: string
  code: string
  url: string
  category: CategoryId
  nameZh: string
  nameEn: string
  aliases: string[]
  oneLiner: string
  oneLinerEn: string
  keywords: string[]
  related: string[]
  scenes: string[]
  feel: string[]
  intent: string[]
  tags: TagId[]
  demo: { shape: DemoShape; minHeight?: number; thumb?: 'fit' | 'still' }
  controls: CatalogControl[]
  loop: 'replay' | 'continuous' | 'manual'
  /** 控件取默认值时的中英需求句：直接可粘贴给 AI */
  prompt: { zh: string; en: string }
  /** 想看细节去这里：词条页与 Markdown 里的对应小节 */
  detail: { page: string; markdown: string }
}

export interface Catalog {
  version: number
  site: string
  counts: { entries: number; perCategory: Record<string, number>; tags: number }
  facets: { id: FacetId; zh: string; en: string; hintZh: string; hintEn: string; tags: { id: TagId; zh: string; en: string }[] }[]
  vocab: {
    categories: { id: CategoryId; letter: string; zh: string; en: string }[]
    scenes: { id: string; zh: string; en: string }[]
    feel: { id: string; zh: string; en: string }[]
    intent: { id: string; zh: string; en: string }[]
    demoShapes: { id: DemoShape; zh: string; en: string; hintZh: string; hintEn: string }[]
  }
  entries: CatalogEntry[]
}

/** 一个展厅的分片元信息：JSON 与 Markdown 共用 */
export interface CatalogHallMeta {
  id: CategoryId
  letter: string
  nameZh: string
  nameEn: string
  count: number
}

/** public/catalog/<hallId>.json：只装一个展厅的词条，字段与全量 catalog.json 一致 */
export interface CatalogHallShard {
  version: number
  site: string
  hall: CatalogHallMeta
  entries: CatalogEntry[]
}

/** index.json 里的展厅条目：在 {@link CatalogHallMeta} 上补分片地址（相对站点根） */
export interface CatalogIndexHall extends CatalogHallMeta {
  json: string
  markdown: string
}

/** public/catalog/index.json：分片的目录，先读它再决定取哪一份，不必读全量 */
export interface CatalogIndex {
  version: number
  site: string
  counts: Catalog['counts']
  vocab: Catalog['vocab']
  halls: CatalogIndexHall[]
  tags: string
  aliases: string
  full: { json: string; markdown: string }
}

/** public/catalog/tags.json 的一个标签：覆盖 taxonomy 全部标签，用不到的 count 为 0 */
export interface CatalogTag {
  id: TagId
  nameZh: string
  nameEn: string
  facet: FacetId
  count: number
  slugs: string[]
}

export interface CatalogTagIndex {
  version: number
  tags: CatalogTag[]
}

/** public/catalog/aliases.json 的一条俗称：重复 alias 合并成一条，slugs 保持词条顺序 */
export interface CatalogAlias {
  alias: string
  slugs: string[]
}

export interface CatalogAliasIndex {
  version: number
  /** 去重后的俗称条数（不是各词条 aliases 展开数之和） */
  count: number
  aliases: CatalogAlias[]
}

const zh = (bi: Bi | undefined) => bi?.zh ?? ''
const en = (bi: Bi | undefined) => bi?.en ?? bi?.zh ?? ''

function controlOf(entry: Entry, index: number): CatalogControl {
  const control = entry.controls[index]
  const base = {
    id: control.id,
    kind: control.kind,
    label: entry.en?.controls?.[index]?.label ?? control.label,
    def: control.def,
  }
  if (control.kind === 'range') {
    return { ...base, unit: control.unit, min: control.min, max: control.max }
  }
  if (control.kind === 'select') {
    return { ...base, options: control.options }
  }
  return base
}

export function buildCatalog(entries: Entry[]): Catalog {
  const perCategory: Record<string, number> = {}
  for (const category of CATEGORIES) {
    perCategory[category.id] = entries.filter((entry) => entry.category === category.id).length
  }

  return {
    version: CATALOG_VERSION,
    site: SITE_BASE,
    counts: { entries: entries.length, perCategory, tags: TAGS.length },
    facets: FACETS.map((facet) => ({
      id: facet.id,
      zh: zh(facet.label),
      en: en(facet.label),
      hintZh: zh(facet.hint),
      hintEn: en(facet.hint),
      tags: TAGS.filter((tag) => tag.facet === facet.id).map((tag) => ({
        id: tag.id,
        zh: zh(tag.label),
        en: en(tag.label),
      })),
    })),
    vocab: {
      categories: CATEGORIES.map((category) => ({
        id: category.id,
        letter: category.letter,
        zh: category.nameZh,
        en: category.nameEn,
      })),
      scenes: SCENES.map((scene) => ({ id: scene.id, zh: zh(scene.label), en: en(scene.label) })),
      feel: FEELS.map((item) => ({ id: item.id, zh: zh(item.label), en: en(item.label) })),
      intent: INTENTS.map((item) => ({ id: item.id, zh: zh(item.label), en: en(item.label) })),
      demoShapes: DEMO_SHAPES.map((shape) => ({
        id: shape.id,
        zh: zh(shape.label),
        en: en(shape.label),
        hintZh: zh(shape.hint),
        hintEn: en(shape.hint),
      })),
    },
    entries: entries.map((entry) => ({
      slug: entry.slug,
      code: entry.code,
      url: `${SITE_BASE}/entry/${entry.slug}/`,
      category: entry.category,
      nameZh: entry.nameZh,
      nameEn: entry.nameEn,
      aliases: entry.aliases,
      oneLiner: entry.oneLiner,
      oneLinerEn: entry.en?.oneLiner ?? entry.oneLiner,
      keywords: entry.keywords,
      related: entry.related,
      scenes: entry.scenes,
      feel: entry.feel,
      intent: entry.intent,
      tags: entry.tags,
      demo: entry.demo,
      controls: entry.controls.map((_, index) => controlOf(entry, index)),
      loop: entry.loop ?? 'replay',
      prompt: entry.prompt(defaultValues(entry)),
      detail: {
        page: `${SITE_BASE}/entry/${entry.slug}/`,
        markdown: `${SITE_BASE}/catalog.md#${entry.slug}`,
      },
    })),
  }
}

/** 供 AI 阅读的 Markdown 版：结构固定、可 grep、每条词条自洽 */
export function catalogMarkdown(entries: Entry[]): string {
  const data = buildCatalog(entries)
  const lines: string[] = []
  const push = (...items: string[]) => lines.push(...items)

  push(
    `# 前端设计博物馆 · 词条目录 v${data.version}`,
    '',
    `> ${data.counts.entries} 条前端效果词条，中英双语名字 + 口语别名 + 易混项 + 踩坑 + 推荐取值 + 控件默认值 + 可直接提给 AI 的中英需求句。`,
    `> 站点：${data.site}/ · 机器可读版：${data.site}/catalog.json`,
    '',
    '## 怎么用它',
    '',
    '1. 用户用「人话」描述想要的效果时，先拿他的话去匹配 aliases / keywords / oneLiner / names，命中即定位词条。',
    '2. 需要按维度筛：tags（facet 见下）、category（展厅）、demo.shape（演示形态）、scenes / feel / intent。',
    '3. 给用户交付设计需求时，优先用该词条的 prompt.zh（中文）与 prompt.en（英文关键词），并把 controls 的当前取值写进句子。',
    '4. 拿不准两个概念的区别时看 confusions；容易翻车的地方看 pitfalls；无障碍降级看 reducedMotion。',
    '',
    '## 词表',
    '',
  )

  for (const facet of data.facets) {
    push(`- **${facet.zh} / ${facet.en}**（${facet.hintZh}）：` + facet.tags.map((tag) => `${tag.id}=${tag.zh}`).join('、'))
  }
  push(
    '- **展厅 / gallery**：' + data.vocab.categories.map((item) => `${item.id}=${item.zh}`).join('、'),
    '- **演示形态 / demo shape**：' + data.vocab.demoShapes.map((item) => `${item.id}=${item.zh}`).join('、'),
    '- **用在什么界面 / scenes**：' + data.vocab.scenes.map((item) => `${item.id}=${item.zh}`).join('、'),
    '- **什么感觉 / feel**：' + data.vocab.feel.map((item) => `${item.id}=${item.zh}`).join('、'),
    '- **什么目的 / intent**：' + data.vocab.intent.map((item) => `${item.id}=${item.zh}`).join('、'),
    '',
    '## 词条',
    '',
  )

  for (const entry of entries) {
    push(...entryMarkdownLines(entry))
  }

  return lines.join('\n')
}

// 全量目录与单厅目录共用同一段词条 Markdown：锚点、字段顺序、措辞必须一字不差，
// 否则「catalog.md#<slug> 跳过去」和「单厅分片里的同一段」会对不上。
function entryMarkdownLines(entry: Entry): string[] {
  const prompt = entry.prompt(defaultValues(entry))
  const lines = [
    // 显式锚点：raw Markdown 里可 grep，渲染成 HTML 后 `catalog.md#<slug>` 也能跳
    `<a id="${entry.slug}"></a>`,
    '',
    `### ${entry.code} ${entry.nameZh} · ${entry.nameEn}`,
    '',
    `- 地址：${SITE_BASE}/entry/${entry.slug}/`,
    `- 展厅：${entry.category} · 标签：${entry.tags.join(', ')} · 形态：${entry.demo.shape}`,
    `- 一句话：${entry.oneLiner}`,
    `- 别名：${entry.aliases.join('、')}`,
    `- 关键词：${entry.keywords.join(', ')}`,
    `- 什么时候用：${entry.whenToUse.join(' / ')}`,
  ]
  for (const item of entry.confusions) {
    lines.push(`- 别搞混 · ${item.with}：${item.diff}`)
  }
  for (const pitfall of entry.pitfalls) {
    lines.push(`- 坑：${pitfall}`)
  }
  if (entry.spec.length > 0) {
    lines.push('- 推荐取值：' + entry.spec.map((item) => `${item.label}=${item.value}`).join('；'))
  }
  if (entry.controls.length > 0) {
    lines.push(
      '- 控件默认值：' +
        entry.controls
          .map((control) => `${control.id}(${control.label})=${String(control.def)}${'unit' in control ? (control.unit ?? '') : ''}`)
          .join('；'),
    )
  }
  lines.push(
    `- 无障碍降级：${entry.reducedMotion}`,
    `- 提给 AI（中文）：${prompt.zh}`,
    `- Ask for it (English keywords): ${prompt.en}`,
    `- 相关：${entry.related.join(', ') || '—'}`,
    `- 参考：${entry.refs.map((ref) => `[${ref.label}](${ref.url})`).join(' · ')}`,
    '',
  )
  return lines
}

/* ------------------------------------------------------------------------- *
 * 分片：全量 catalog.json / catalog.md 有 130KB+，机器按需取一小份
 *
 * public/catalog/index.json 是分片的目录：先读它拿词表与分片地址，再只取需要的
 * 厅 / 标签 / 别名，不必读完整个目录。全量文件继续保留，旧链接不坏。
 * 分片地址都是相对站点根的路径（catalog/<id>.json），和 site 拼起来才是完整 URL。
 * ------------------------------------------------------------------------- */

/** public/catalog/index.json：5 个厅按 CATEGORIES 展陈顺序，外加标签与别名分片入口 */
export function buildCatalogIndex(entries: Entry[]): CatalogIndex {
  const data = buildCatalog(entries)
  return {
    version: data.version,
    site: data.site,
    counts: data.counts,
    vocab: data.vocab,
    halls: CATEGORIES.map((category) => ({
      id: category.id,
      letter: category.letter,
      nameZh: category.nameZh,
      nameEn: category.nameEn,
      count: data.counts.perCategory[category.id] ?? 0,
      json: `catalog/${category.id}.json`,
      markdown: `catalog/${category.id}.md`,
    })),
    tags: 'catalog/tags.json',
    aliases: 'catalog/aliases.json',
    full: { json: 'catalog.json', markdown: 'catalog.md' },
  }
}

/** public/catalog/<hallId>.json：只装一个展厅，entries 字段与全量一致，词条顺序也一致 */
export function buildHallCatalog(entries: Entry[], hall: CategoryId): CatalogHallShard {
  const data = buildCatalog(entries)
  const category = categoryOf(hall)
  const hallEntries = data.entries.filter((entry) => entry.category === hall)
  return {
    version: data.version,
    site: data.site,
    hall: {
      id: category.id,
      letter: category.letter,
      nameZh: category.nameZh,
      nameEn: category.nameEn,
      count: hallEntries.length,
    },
    entries: hallEntries,
  }
}

/** public/catalog/<hallId>.md：标题 + 简介 + 该厅词条段落，锚点与全量 catalog.md 相同 */
export function hallCatalogMarkdown(entries: Entry[], hall: CategoryId): string {
  const category = categoryOf(hall)
  const hallEntries = entries.filter((entry) => entry.category === hall)
  const lines: string[] = []
  const push = (...items: string[]) => lines.push(...items)

  push(
    `# 前端设计博物馆 · ${category.nameZh} / ${category.nameEn}（${category.letter} 厅）`,
    '',
    `> ${category.blurb.zh}`,
    '',
    `> 本厅 ${hallEntries.length} 条词条。全量目录见 ${SITE_BASE}/catalog.md（锚点与本文一致），分片索引见 ${SITE_BASE}/catalog/index.json。`,
    '',
    '## 词条',
    '',
  )
  for (const entry of hallEntries) {
    push(...entryMarkdownLines(entry))
  }
  return lines.join('\n')
}

/** public/catalog/tags.json：按 TAGS 定义顺序覆盖全部标签，没被用到的也保留（count = 0） */
export function buildTagIndex(entries: Entry[]): CatalogTagIndex {
  return {
    version: CATALOG_VERSION,
    tags: TAGS.map((tag) => {
      const slugs = entries.filter((entry) => entry.tags.includes(tag.id)).map((entry) => entry.slug)
      return { id: tag.id, nameZh: tag.label.zh, nameEn: en(tag.label), facet: tag.facet, count: slugs.length, slugs }
    }),
  }
}

// 判定顺序用码位比较，不依赖 ICU 的 zh 排序：生成物在本地与 CI 必须逐字节一致。
const byCodepoint = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

/** public/catalog/aliases.json：全部俗称按码位排序，重复 alias 合并 slugs（保持词条顺序） */
export function buildAliasIndex(entries: Entry[]): CatalogAliasIndex {
  const byAlias = new Map<string, string[]>()
  for (const entry of entries) {
    for (const alias of entry.aliases) {
      const slugs = byAlias.get(alias)
      if (slugs) {
        if (!slugs.includes(entry.slug)) slugs.push(entry.slug)
      } else {
        byAlias.set(alias, [entry.slug])
      }
    }
  }
  const aliases = [...byAlias.entries()]
    .map(([alias, slugs]) => ({ alias, slugs }))
    .sort((a, b) => byCodepoint(a.alias, b.alias))
  return { version: CATALOG_VERSION, count: aliases.length, aliases }
}
