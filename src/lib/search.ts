import { codeOrder } from '../data/taxonomy'
import type { Entry } from '../data/types'

export interface SearchHit {
  entry: Entry
  score: number
}

interface Field {
  weight: number
  compact: string
}

interface Indexed {
  fields: Field[]
  blob: string
}

const INDEX = new WeakMap<Entry, Indexed>()

/** 归一化：去空白与标点、小写。中英混排查询都走这一层 */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\s\u3000]+/g, '')
    .replace(/[.,，。、·・!！?？:：;；'"“”‘’`()（）\[\]【】{}<>《》/\\|+_~^*#$%@=—-]/g, '')
}

/** 拉丁词按非字母数字切分；中文整串保留 */
export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map(normalizeText)
    .filter(Boolean)
}

function gramSet(input: string): Set<string> {
  const out = new Set<string>()
  if (!input) return out
  if (input.length <= 2) {
    out.add(input)
    return out
  }
  for (let i = 0; i < input.length - 1; i += 1) out.add(input.slice(i, i + 2))
  return out
}

function indexEntry(entry: Entry): Indexed {
  const cached = INDEX.get(entry)
  if (cached) return cached

  const raw: { weight: number; text: string }[] = [
    { weight: 8, text: entry.nameZh },
    { weight: 8, text: entry.nameEn },
    { weight: 6, text: entry.aliases.join(' ') },
    { weight: 5, text: entry.keywords.join(' ') },
    { weight: 4, text: entry.code },
    { weight: 3, text: entry.oneLiner },
    { weight: 3, text: entry.whenToUse.join(' ') },
    { weight: 2, text: entry.confusions.map((c) => `${c.with}${c.diff}`).join(' ') },
    { weight: 1, text: entry.pitfalls.join(' ') },
  ]

  const fields = raw
    .map((f) => ({ weight: f.weight, compact: normalizeText(f.text) }))
    .filter((f) => f.compact.length > 0)

  const indexed: Indexed = { fields, blob: fields.map((f) => f.compact).join('\u0000') }
  INDEX.set(entry, indexed)
  return indexed
}

/**
 * 加权检索：先整体短语匹配（命中名称/别名权重最高），再退到逐词匹配。
 * 数据量只有几十条，正则 + 内存打分足够，不引入检索库。
 */
export function searchEntries(entries: Entry[], rawQuery: string): SearchHit[] {
  const compact = normalizeText(rawQuery)
  if (!compact) return entries.map((entry) => ({ entry, score: 0 }))

  const tokens = tokenize(rawQuery)
  const queryGrams = gramSet(compact)
  const hits: SearchHit[] = []

  for (const entry of entries) {
    const indexed = indexEntry(entry)
    let score = 0
    let phraseHit = false

    for (const field of indexed.fields) {
      if (field.compact.includes(compact)) {
        phraseHit = true
        const coverage = compact.length / field.compact.length
        score += field.weight * (1 + coverage)
      }
    }

    const matchedTokens = tokens.filter((token) => indexed.blob.includes(token))
    const allTokensHit = tokens.length > 0 && matchedTokens.length === tokens.length

    if (allTokensHit) {
      for (const token of matchedTokens) {
        for (const field of indexed.fields) {
          if (field.compact.includes(token)) {
            score += field.weight * 0.4 * (token.length / field.compact.length)
          }
        }
      }
    }

    if (!phraseHit && !allTokensHit) continue

    // 字形兜底：查询里多少字对（2-gram）能在词条里找到，用来给近似说法加权
    let gramHits = 0
    for (const gram of queryGrams) {
      if (indexed.blob.includes(gram)) gramHits += 1
    }
    if (queryGrams.size > 0) score += (gramHits / queryGrams.size) * 2

    if (score > 0) hits.push({ entry, score })
  }

  return hits.sort(
    (a, b) =>
      b.score - a.score || codeOrder(a.entry.code).localeCompare(codeOrder(b.entry.code)),
  )
}
