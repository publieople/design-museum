// 生成 public/catalog.json、public/catalog.md、public/llms.txt。
// 跑法：pnpm gen:catalog（改了任何词条或 taxonomy.ts 之后都要跑；CI 会跑，
// src/data/catalog.test.ts 会在 CI 里检查这三份产物是否过期）。
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { root, withSite } from './load-site.mjs'

await withSite(async (load) => {
  const { ENTRIES } = await load('/src/data/index.ts')
  const { buildCatalog, catalogMarkdown, SITE_BASE } = await load('/src/data/catalog.ts')

  const data = buildCatalog(ENTRIES)
  const markdown = catalogMarkdown(ENTRIES)
  // 两空格缩进：这份 JSON 是给 AI 的行式 read 工具读的，单行版本会被截断到 2000 字符读不出，
  // 缩进后体积变大但仍是全文里最小的一份，加上换行还顺带让 PR diff 可读。
  const json = JSON.stringify(data, null, 2) + '\n'

  const lines = [
    '# 前端设计博物馆 Design Museum',
    '',
    `> 把说不出口的前端效果做成可交互标本：${data.counts.entries} 条中英术语对照、参数可调、一键复制成给 AI 的设计需求。`,
    '',
    '## 数据',
    '',
    `- [catalog.json](${SITE_BASE}/catalog.json)：机器可读索引 + 现成需求句（中英名字、口语别名、关键词、标签、演示形态、控件默认值、中英需求句）`,
    `- [catalog.md](${SITE_BASE}/catalog.md)：逐条全文（什么时候用、别搞混、踩坑、推荐取值、无障碍降级、参考链接）——上面 JSON 里没有这些长散文，每条一个 #<slug> 锚点`,
    `- [sitemap.xml](${SITE_BASE}/sitemap.xml)：全部页面地址`,
    '',
    '## 给 AI 的用法',
    '',
    '配套 skill：https://github.com/publieople/design-museum/blob/main/skills/design-museum/SKILL.md',
    '（教模型怎么用上面的目录：先按别名/关键词定位词条，再取该条的 prompt 与 controls 生成设计需求。）',
    '',
    '## 词条',
    '',
  ]
  for (const entry of data.entries) {
    lines.push(`- [${entry.nameZh} ${entry.nameEn}](${entry.url})：${entry.oneLiner}`)
  }
  lines.push('')

  await writeFile(path.join(root, 'public/catalog.json'), json, 'utf8')
  await writeFile(path.join(root, 'public/catalog.md'), markdown, 'utf8')
  await writeFile(path.join(root, 'public/llms.txt'), lines.join('\n'), 'utf8')

  console.log(
    `catalog.json ${Math.round(Buffer.byteLength(json) / 1024)}KB / catalog.md ${Math.round(Buffer.byteLength(markdown) / 1024)}KB / llms.txt ${data.counts.entries + 8} 行，共 ${data.counts.entries} 条`,
  )
})
