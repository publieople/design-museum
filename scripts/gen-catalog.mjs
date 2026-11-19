// 生成 public/catalog.json、public/catalog.md、public/catalog/**（分片）与 public/llms.txt。
// 跑法：pnpm gen:catalog（改了任何词条或 taxonomy.ts 之后都要跑；CI 会跑，
// src/data/catalog.test.ts 会在 CI 里检查这些产物是否过期）。
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { root, withSite } from './load-site.mjs'

// 两空格缩进：这份 JSON 是给 AI 的行式 read 工具读的，单行版本会被截断到 2000 字符读不出。
// 末尾固定换行、不写时间戳，保证同样的数据每次都生成同样的字节。
const twoSpaceJson = (value) => JSON.stringify(value, null, 2) + '\n'

await withSite(async (load) => {
  const { ENTRIES } = await load('/src/data/index.ts')
  const {
    buildAliasIndex,
    buildCatalog,
    buildCatalogIndex,
    buildHallCatalog,
    buildTagIndex,
    catalogMarkdown,
    hallCatalogMarkdown,
    SITE_BASE,
  } = await load('/src/data/catalog.ts')

  const data = buildCatalog(ENTRIES)
  const markdown = catalogMarkdown(ENTRIES)
  const index = buildCatalogIndex(ENTRIES)
  const tags = buildTagIndex(ENTRIES)
  const aliases = buildAliasIndex(ENTRIES)

  const catalogDir = path.join(root, 'public/catalog')
  await mkdir(catalogDir, { recursive: true })

  /** 写一份产物并记下字节数 */
  const bytes = {}
  const write = async (relPath, content) => {
    await writeFile(path.join(root, relPath), content, 'utf8')
    bytes[relPath] = Buffer.byteLength(content)
  }

  await write('public/catalog.json', twoSpaceJson(data))
  await write('public/catalog.md', markdown)
  await write('public/catalog/index.json', twoSpaceJson(index))
  await write('public/catalog/tags.json', twoSpaceJson(tags))
  await write('public/catalog/aliases.json', twoSpaceJson(aliases))
  for (const hall of index.halls) {
    await write(`public/catalog/${hall.id}.json`, twoSpaceJson(buildHallCatalog(ENTRIES, hall.id)))
    await write(`public/catalog/${hall.id}.md`, hallCatalogMarkdown(ENTRIES, hall.id))
  }

  const lines = [
    '# 前端设计博物馆 Design Museum',
    '',
    `> 把说不出口的前端效果做成可交互标本：${data.counts.entries} 条中英术语对照、参数可调、一键复制成给 AI 的设计需求。`,
    '',
    '## 数据',
    '',
    `- [catalog/index.json](${SITE_BASE}/catalog/index.json)：分片索引（先读这份）——词表、${index.halls.length} 个展厅、标签与别名分片的地址；按需再取小份，不必读全量`,
    `- [catalog.json](${SITE_BASE}/catalog.json)：全量机器可读索引 + 现成需求句（中英名字、口语别名、关键词、标签、演示形态、控件默认值、中英需求句）`,
    `- [catalog.md](${SITE_BASE}/catalog.md)：逐条全文（什么时候用、别搞混、踩坑、推荐取值、无障碍降级、参考链接）——上面 JSON 里没有这些长散文，每条一个 #<slug> 锚点`,
    `- [sitemap.xml](${SITE_BASE}/sitemap.xml)：全部页面地址`,
    '',
    '## 分片（按展厅）',
    '',
  ]
  for (const hall of index.halls) {
    lines.push(
      `- [${hall.nameZh} ${hall.nameEn}](${SITE_BASE}/${hall.json})（${hall.count} 条）· [Markdown](${SITE_BASE}/${hall.markdown})`,
    )
  }
  lines.push(
    '',
    '## 分片（标签与别名）',
    '',
    `- [catalog/tags.json](${SITE_BASE}/catalog/tags.json)：${tags.tags.length} 个受控标签 × 词条 slug（含 facet 与计数）`,
    `- [catalog/aliases.json](${SITE_BASE}/catalog/aliases.json)：${aliases.count} 条俗称 → 词条 slug（重复 alias 已合并）`,
    '',
    '## 给 AI 的用法',
    '',
    '配套 skill：https://github.com/publieople/design-museum/blob/main/skills/design-museum/SKILL.md',
    '（教模型怎么用上面的目录：先按别名/关键词定位词条，再取该条的 prompt 与 controls 生成设计需求。）',
    '',
    '## 词条',
    '',
  )
  for (const entry of data.entries) {
    lines.push(`- [${entry.nameZh} ${entry.nameEn}](${entry.url})：${entry.oneLiner}`)
  }
  lines.push('')
  await write('public/llms.txt', lines.join('\n'))

  const kb = (n) => `${Math.round(n / 1024)}KB`
  const shardNames = Object.keys(bytes).filter((name) => name.startsWith('public/catalog/'))
  const shardBytes = shardNames.reduce((sum, name) => sum + bytes[name], 0)
  console.log(
    `catalog.json ${kb(bytes['public/catalog.json'])} / catalog.md ${kb(bytes['public/catalog.md'])} / ` +
      `分片 ${shardNames.length} 份共 ${kb(shardBytes)}（index ${kb(bytes['public/catalog/index.json'])}）/ ` +
      `llms.txt ${kb(bytes['public/llms.txt'])}，共 ${data.counts.entries} 条`,
  )
})
