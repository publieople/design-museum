/**
 * 生成 src/lib/pinyinTable.ts（拼音检索用的汉字读音表）。
 *
 * pinyin-pro 只是生成期工具，不进运行时依赖，所以装在临时目录里：
 *
 *   mkdir -p /tmp/pinyin-gen && cd /tmp/pinyin-gen
 *   npm init -y && npm i pinyin-pro@3
 *   node /home/po/design-museum/scripts/gen-pinyin.mjs
 *
 * 脚本按自身位置定位仓库根目录（读写都用绝对路径），
 * 从 process.cwd()（或 PINYIN_PRO_DIR）解析 pinyin-pro，
 * 所以必须在装了 pinyin-pro 的目录里执行。
 *
 * 取字范围：src/data/entries/**.ts 里 nameZh 与 aliases 出现的全部汉字，
 * 外加 EXTRA_CHARS 里少量常见同音错别字（用户会把「磨砂」打成「磨沙」这类）。
 * 只收无调拼音；多音字用 | 分隔，第一个为主读音。
 */
import { createRequire } from 'node:module'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = fileURLToPath(new URL('../', import.meta.url))
const ENTRIES_DIR = join(REPO, 'src/data/entries')
const OUT = join(REPO, 'src/lib/pinyinTable.ts')

/** 常见同音错别字：不在词条里出现，但用户会这么打（如「磨沙玻璃」的「沙」） */
const EXTRA_CHARS = '沙纱摩模魔摸茅猫离黎波拨播里理利力冻栋动镜静境光广影应台抬态边遍变数树竖'

const require = createRequire(join(process.env.PINYIN_PRO_DIR || process.cwd(), 'package.json'))
const { pinyin } = require('pinyin-pro')
const { version, license } = require('pinyin-pro/package.json')

const CJK = /[\u4e00-\u9fff]/u

function walk(dir) {
  const out = []
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, item.name)
    if (item.isDirectory()) out.push(...walk(full))
    else if (item.isFile() && item.name.endsWith('.ts')) out.push(full)
  }
  return out.sort()
}

function collectText(source) {
  const chunks = []
  const nameZh = source.match(/\bnameZh:\s*(['"])((?:\\.|(?!\1).)*)\1/s)
  if (nameZh) chunks.push(nameZh[2])
  const aliases = source.match(/\baliases:\s*\[([\s\S]*?)\]/)
  if (aliases) {
    for (const m of aliases[1].matchAll(/(['"])((?:\\.|(?!\1).)*)\1/gs)) chunks.push(m[2])
  }
  return chunks.join('\n')
}

function readingsOf(char) {
  const raw = pinyin(char, { toneType: 'none', type: 'array', multiple: true })
  const values = (Array.isArray(raw) ? raw : [raw])
    .flatMap((item) => String(item).split(/\s+/))
    .map((item) => item.toLowerCase())
    .filter((item) => /^[a-z]+$/.test(item))
  const unique = [...new Set(values)]
  return unique.length > 0 ? unique : null
}

const chars = new Set()
for (const file of walk(ENTRIES_DIR)) {
  for (const char of collectText(readFileSync(file, 'utf8')).match(new RegExp(CJK, 'gu')) ?? []) {
    chars.add(char)
  }
}
for (const char of EXTRA_CHARS.match(new RegExp(CJK, 'gu')) ?? []) chars.add(char)

const rows = []
for (const char of [...chars].sort((a, b) => a.codePointAt(0) - b.codePointAt(0))) {
  const readings = readingsOf(char)
  if (readings) rows.push([char, readings.join('|')])
}

const body = rows.map(([char, reading]) => `  '${char}': '${reading}',`).join('\n')
const table = new Set(rows.map(([, reading]) => reading.split('|')[0]))

const source = `/**
 * 自动生成，请勿手改。
 *
 * 重新生成（pinyin-pro 只装在临时目录，不进仓库依赖，也不进 package.json）：
 *   mkdir -p /tmp/pinyin-gen && cd /tmp/pinyin-gen
 *   npm init -y && npm i pinyin-pro@3
 *   node /home/po/design-museum/scripts/gen-pinyin.mjs
 *
 * 数据来源：src/data/entries/**.ts 的 nameZh 与 aliases 里出现的 {汉字}，
 * 外加 scripts/gen-pinyin.mjs 的 EXTRA_CHARS（少量常见同音错别字）。
 * 读音由 pinyin-pro ${version}（${license} License）生成，只保留无调拼音；
 * 多音字用 "|" 分隔，第一个为主读音。共 ${rows.length} 字。
 */
export const PINYIN_TABLE: Record<string, string> = {
${body}
}
`

writeFileSync(OUT, source, 'utf8')
console.log(`wrote ${OUT}: ${rows.length} chars, ${Buffer.byteLength(source)} bytes, pinyin-pro ${version} (${license})`)
console.log(`primary readings: ${table.size}`)
