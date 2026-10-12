#!/usr/bin/env node
// 新增词条脚手架：pnpm new:entry <slug> --hall <category> --shape <shape>
//
// 骨架只放 TODO：tsc 能过，pnpm test 一定红——那些红就是待办清单。
// 规范（什么算一条、标签怎么挑、形态怎么定）见 docs/ENTRY-SPEC.md。
import { access, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { root, withSite } from './load-site.mjs'

const USAGE =
  '用法：pnpm new:entry <slug> --hall <motion|feedback|layout|visual|type> --shape <stage|interactive|scroll|sequence|page>'

function parseArgs(argv) {
  const flags = {}
  const positional = []
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--hall' || arg === '-h') {
      flags.hall = argv[i + 1]
      i += 1
    } else if (arg === '--shape' || arg === '-s') {
      flags.shape = argv[i + 1]
      i += 1
    } else if (!arg.startsWith('-')) {
      positional.push(arg)
    }
  }
  return { flags, positional }
}

const { flags, positional } = parseArgs(process.argv.slice(2))
const slug = positional[0]

if (!slug || typeof flags.hall !== 'string' || typeof flags.shape !== 'string') {
  console.error(USAGE)
  process.exit(1)
}
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error('slug 必须是 kebab-case（小写字母 / 数字 / 单个连字符）：' + slug)
  process.exit(1)
}

const camel = slug
  .split('-')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('')

function entrySource({ slug, code, hall, shape }) {
  const demoLine = shape === 'stage' ? "  demo: { shape: 'stage' }," : "  demo: { shape: '" + shape + "', thumb: 'still' },"
  return [
    "import type { ControlValues, Entry } from '../../types'",
    '',
    '/**',
    ' * TODO: 先用 docs/ENTRY-SPEC.md 第 1 节的四条判据确认这确实算一条。',
    ' * TODO: 把下面每个 TODO 换掉——骨架让 tsc 过，但 pnpm test 会一路报红。',
    ' */',
    'const entry: Entry = {',
    "  slug: '" + slug + "',",
    "  code: '" + code + "',",
    "  nameZh: 'TODO：中文名',",
    "  nameEn: 'TODO English name',",
    '  aliases: [], // TODO: 口语俗称与英文别名（搜索主要靠它）',
    "  category: '" + hall + "',",
    "  oneLiner: 'TODO：一句话说清它是什么。',",
    '  whenToUse: [], // TODO: 2–4 条适用场景',
    '  confusions: [], // TODO: 至少 1 条：和哪条最像、差在哪一行属性',
    '  pitfalls: [], // TODO: 至少 1 条常见误用',
    '  keywords: [], // TODO: 英文技术关键词 / CSS 属性名',
    '  spec: [], // TODO: 推荐取值表 { label, value }',
    "  reducedMotion: 'TODO：prefers-reduced-motion 下怎么降级。',",
    '  refs: [], // TODO: ≥1 条 MDN / web.dev / W3C',
    '  related: [], // TODO: 相关词条的 slug（互相指认）',
    '  scenes: [], // TODO: taxonomy.ts 的 SCENES',
    '  feel: [], // TODO: FEELS',
    '  intent: [], // TODO: INTENTS',
    '  tags: [], // TODO: TAGS 的闭集 id，2–6 个且至少 1 个 tech',
    demoLine,
    '  controls: [], // TODO: range / select / toggle（prompt 与速查表都从它派生）',
    '  prompt: (values: ControlValues) => ({',
    "    zh: 'TODO：按控件值写一句能直接提给 AI 的中文需求。当前参数：' + JSON.stringify(values),",
    "    en: 'TODO: the English request generated from the control values.',",
    '  }),',
    "  loop: 'manual', // TODO: 按 demo 的实际行为选 replay / continuous / manual",
    '}',
    '',
    'export default entry',
    '',
  ].join('\n')
}

function demoSource(camel) {
  return [
    "import type { DemoProps } from '../data/types'",
    '',
    '/**',
    ' * TODO: 真正的演示。规范见 docs/ENTRY-SPEC.md 第 4 节：',
    ' * 不依赖整页滚动、不写死颜色（用 var(--stage-ink) / var(--stage-muted)）、',
    ' * 会动的效果走 usePrefersReducedMotion()、示例文案按 locale 切换。',
    ' */',
    'export default function ' + camel + "Demo({ locale = 'zh' }: DemoProps) {",
    '  return (',
    '    <div',
    '      className="w-full max-w-xs rounded-xl border p-4 text-center text-[11px] opacity-70"',
    "      style={{ borderColor: 'color-mix(in srgb, var(--stage-ink) 20%, transparent)' }}",
    '    >',
    "      {locale === 'en' ? 'TODO: demo' : 'TODO：演示'}",
    '    </div>',
    '  )',
    '}',
    '',
  ].join('\n')
}

await withSite(async (load) => {
  const { CATEGORIES, DEMO_SHAPES } = await load('/src/data/taxonomy.ts')
  const { ENTRIES } = await load('/src/data/index.ts')
  const { RETIRED } = await load('/src/data/retired.ts')

  const category = CATEGORIES.find((item) => item.id === flags.hall)
  if (!category) {
    console.error('未知展厅 --hall ' + flags.hall + '；可选：' + CATEGORIES.map((item) => item.id).join(' / '))
    process.exitCode = 1
    return
  }
  if (!DEMO_SHAPES.some((item) => item.id === flags.shape)) {
    console.error('未知形态 --shape ' + flags.shape + '；可选：' + DEMO_SHAPES.map((item) => item.id).join(' / '))
    process.exitCode = 1
    return
  }

  const taken = [...ENTRIES.map((entry) => entry.slug), ...RETIRED.map((item) => item.slug)]
  if (taken.includes(slug)) {
    console.error('slug「' + slug + '」已被占用（在册或墓碑）。改名 = 删 + 增 + 墓碑，见规范第 5 节')
    process.exitCode = 1
    return
  }

  const numbers = ENTRIES.filter((entry) => entry.category === category.id).map((entry) => Number(entry.code.slice(2)))
  const next = Math.max(0, ...numbers) + 1
  if (next > 99) {
    console.error(category.nameZh + '厅编号用完了（' + category.letter + '-99），先重排编号')
    process.exitCode = 1
    return
  }
  const code = category.letter + '-' + String(next).padStart(2, '0')

  const entryFile = path.join(root, 'src/data/entries', category.id, slug + '.ts')
  const demoFile = path.join(root, 'src/demos', slug + '.tsx')
  for (const file of [entryFile, demoFile]) {
    try {
      await access(file)
      console.error('文件已存在，没有覆盖：' + path.relative(root, file))
      process.exitCode = 1
      return
    } catch {
      // 不存在才是我们要的
    }
  }

  await writeFile(entryFile, entrySource({ slug, code, hall: category.id, shape: flags.shape }), 'utf8')
  await writeFile(demoFile, demoSource(camel), 'utf8')

  console.log('生成 ' + path.relative(root, entryFile))
  console.log('生成 ' + path.relative(root, demoFile))
  console.log('编号 ' + code + '（' + category.nameZh + '厅原本 ' + numbers.length + ' 条）')
  console.log('')
  console.log('接下来：')
  console.log('  1. 填 src/data/entries/' + category.id + '/' + slug + '.ts，每个 TODO 都是测试会查的字段')
  console.log('  2. 写 src/demos/' + slug + '.tsx')
  console.log('  3. pnpm gen:meta（首屏 meta 是生成物）')
  console.log('  4. pnpm check（现在应该是红的，填完才绿）')
  console.log('  5. 人眼验收：pnpm dev 打开 /entry/' + slug + '/，四个舞台都看一遍')
})
