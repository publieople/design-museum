#!/usr/bin/env node
// 维护者查重：pnpm find:entry <口语说法 / 英文术语>
//
// 脚本名不叫 find：pnpm 自带 pnpm find（registry 搜索），会被它抢走。
//
// 回答的是「这条到底该新增，还是已经有一条了」。命中会打印理由，
// 所以不用猜分是怎么来的；一条都没命中才考虑动 pnpm new:entry。
import { withSite } from './load-site.mjs'

const query = process.argv.slice(2).join(' ').trim()
if (!query) {
  console.error('用法：pnpm find:entry <口语说法 / 英文术语>')
  process.exit(1)
}

function normalize(value) {
  return String(value)
    .toLowerCase()
    .replace(/[\s\-_/]+/g, '')
}

function truncate(value, max) {
  const text = String(value).replace(/\s+/g, ' ').trim()
  return text.length > max ? text.slice(0, max - 1) + '…' : text
}

const FIELDS = [
  { label: '名字', weight: 100, pick: (entry) => [entry.slug, entry.nameZh, entry.nameEn] },
  { label: '别名', weight: 80, pick: (entry) => entry.aliases },
  { label: '关键词', weight: 50, pick: (entry) => entry.keywords },
  { label: '正文', weight: 30, pick: (entry) => [entry.oneLiner, ...entry.whenToUse, ...entry.pitfalls] },
  { label: '易混项', weight: 30, pick: (entry) => entry.confusions.map((item) => item.with) },
  { label: '标签', weight: 15, pick: (entry) => [...entry.tags, entry.category] },
]

await withSite(async (load) => {
  const { ENTRIES } = await load('/src/data/index.ts')
  const { RETIRED } = await load('/src/data/retired.ts')
  const q = normalize(query)

  const hits = []
  for (const entry of ENTRIES) {
    let score = 0
    const reasons = []
    for (const field of FIELDS) {
      const hit = field.pick(entry).find((value) => normalize(value).includes(q))
      if (hit) {
        score += field.weight
        reasons.push(field.label + '「' + hit + '」')
      }
    }
    if (score > 0) hits.push({ entry, score, reasons })
  }
  hits.sort((a, b) => b.score - a.score)

  const tombs = RETIRED.filter(
    (item) => normalize(item.slug).includes(q) || normalize(item.nameZh).includes(q) || normalize(item.nameEn).includes(q),
  )

  console.log('查询：' + query)
  console.log('在册 ' + ENTRIES.length + ' 条，命中 ' + hits.length + ' 条')
  if (hits.length === 0) {
    console.log('')
    console.log('没有命中任何在册词条。可能是值得新增的一条——先按 docs/ENTRY-SPEC.md 第 1 节回答三问：')
    console.log('  和现有哪条最像？差异是哪一行属性？为什么那条装不下它？')
    console.log('生成骨架：pnpm new:entry <slug> --hall <厅> --shape <形态>')
  } else {
    for (const hit of hits.slice(0, 8)) {
      const entry = hit.entry
      console.log('')
      console.log('[' + hit.score + '] ' + entry.code + ' ' + entry.slug + ' · ' + entry.nameZh + ' / ' + entry.nameEn)
      console.log('    命中：' + hit.reasons.join('、'))
      console.log('    ' + truncate(entry.oneLiner, 96))
    }
    const top = hits[0].entry
    const first = top.confusions[0]
    if (first) console.log('\n别和「' + first.with + '」混：' + truncate(first.diff, 110))
    if (hits.length > 8) console.log('\n（还有 ' + (hits.length - 8) + ' 条更弱的命中）')
  }
  for (const item of tombs) {
    const target = item.replacedBy ? '/entry/' + item.replacedBy + '/' : '/browse/'
    console.log('\n已下架：/entry/' + item.slug + '/ → ' + target + '（' + item.retiredAt + '）')
  }
})
