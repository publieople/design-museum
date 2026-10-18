import { codeOrder } from '../data/taxonomy'
import type { EntryMeta } from '../data/types'
import { pinyinOf } from './pinyin'

export interface SearchHit {
  entry: EntryMeta
  score: number
}

interface Field {
  weight: number
  compact: string
}

/** 拼音索引字段：full 是全拼串（maoboli），initials 是首字母串（mbl） */
interface PinyinField extends Field {
  kind: 'full' | 'initials'
}

/** 拉丁错别字容错候选词（原文里切出来的词，以及整条拼音串） */
interface Word {
  word: string
  weight: number
}

interface Indexed {
  fields: Field[]
  pinyin: PinyinField[]
  /** 原文字段拼接（拼音不进来），供 token 精确命中与 2-gram 兜底 */
  blob: string
  words: Word[]
}

const INDEX = new WeakMap<EntryMeta, Indexed>()

// 拼音字段权重略低于原文名（8）/别名（6）：原文命中始终优先，「maoboli」这类
// 拼音命中能排到前面，但不会把只沾到一两个音节的词条抬到原文命中之上。
const PY_NAME_FULL = 7
const PY_NAME_INITIALS = 3
const PY_ALIAS_FULL = 5
const PY_ALIAS_INITIALS = 2.5

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

/** 有界编辑距离：超过 max 就提前返回 max + 1，避免给每条查询做全量 DP */
function editDistance(a: string, b: string, max: number): number {
  const la = a.length
  const lb = b.length
  if (Math.abs(la - lb) > max) return max + 1
  let prev = new Array<number>(lb + 1)
  let curr = new Array<number>(lb + 1)
  for (let j = 0; j <= lb; j += 1) prev[j] = j
  for (let i = 1; i <= la; i += 1) {
    curr[0] = i
    let rowMin = curr[0]
    for (let j = 1; j <= lb; j += 1) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
      if (curr[j] < rowMin) rowMin = curr[j]
    }
    if (rowMin > max) return max + 1
    const swap = prev
    prev = curr
    curr = swap
  }
  return prev[lb] <= max ? prev[lb] : max + 1
}

/** 从原文切拉丁词：按非字母数字断开，保留原始词形给编辑距离用 */
function latinWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3)
}

function pinyinFieldsOf(text: string, fullWeight: number, initialsWeight: number): PinyinField[] {
  const info = pinyinOf(text)
  if (!info.full) return []
  const fields: PinyinField[] = [{ kind: 'full', weight: fullWeight, compact: info.full }]
  if (info.initials) fields.push({ kind: 'initials', weight: initialsWeight, compact: info.initials })
  return fields
}

function indexEntry(entry: EntryMeta): Indexed {
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

  // 拼音索引：中文正式名与每条中文别名各出一条全拼、一条首字母。
  // 逐条别名拆开索引，避免别名的拼音首尾相连后出现跨别名的假命中。
  const pinyin: PinyinField[] = [
    ...pinyinFieldsOf(entry.nameZh, PY_NAME_FULL, PY_NAME_INITIALS),
    ...entry.aliases.flatMap((alias) =>
      pinyinFieldsOf(alias, PY_ALIAS_FULL, PY_ALIAS_INITIALS),
    ),
  ]

  // 编辑距离候选：原文里的拉丁词 + 整条拼音串（给 moboli → maoboli 这种拼音 typo 用）
  const wordMap = new Map<string, number>()
  const addWord = (word: string, weight: number) => {
    if (word.length < 3) return
    wordMap.set(word, Math.max(weight, wordMap.get(word) ?? 0))
  }
  for (const { weight, text } of raw) {
    for (const word of latinWords(text)) addWord(word, weight)
  }
  for (const field of pinyin) {
    if (field.kind === 'full') addWord(field.compact, field.weight)
  }
  const words: Word[] = [...wordMap].map(([word, weight]) => ({ word, weight }))

  // blob 只拼原文字段：拼音是「原文没命中」时的兜底层，不能反过来影响原文命中的词条
  const indexed: Indexed = {
    fields,
    pinyin,
    blob: fields.map((f) => f.compact).join('\u0000'),
    words,
  }
  INDEX.set(entry, indexed)
  return indexed
}

/**
 * 加权检索：原文整串 / 原文分词 / 拼音（全拼、首字母、同音错字）/ 拉丁错别字，
 * 四层叠加打分。数据量只有几十条，正则 + 内存打分足够，不引入检索库。
 */
export function searchEntries(entries: EntryMeta[], rawQuery: string): SearchHit[] {
  const compact = normalizeText(rawQuery)
  if (!compact) return entries.map((entry) => ({ entry, score: 0 }))

  const tokens = tokenize(rawQuery)
  const queryGrams = gramSet(compact)
  const queryPinyin = pinyinOf(compact).full
  // 纯拉丁查询（含数字）才能和拼音串比；带汉字的查询走上面的 queryPinyin
  const latinNeedle = /^[a-z0-9]+$/.test(compact) ? compact : ''
  const hits: SearchHit[] = []

  for (const entry of entries) {
    const indexed = indexEntry(entry)
    let score = 0
    let matched = false

    // 1. 原文短语命中
    let phraseHit = false
    for (const field of indexed.fields) {
      if (field.compact.includes(compact)) {
        phraseHit = true
        const coverage = compact.length / field.compact.length
        score += field.weight * (1 + coverage)
      }
    }

    // 2. 原文分词命中
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

    // 原文这层命中就不再加拼音分：拼音是兜底层，不能把「玻璃」这种原文命中
    // 的词条排序改乱（玻璃拟态有三条「玻璃×」别名，叠加拼音会反超毛玻璃）。
    const rawMatched = phraseHit || allTokensHit
    matched = rawMatched

    // 3. 拼音短语命中（只在原文没命中时兜底）
    //    - 汉字查询：磨沙玻璃 → moshaboli，和「磨砂玻璃」的拼音串相等（同音错字靠这层）
    //    - 拉丁查询：maoboli / mao bo li / MAOBOLI 归一后直接和拼音串比，mbl 命中的是首字母串
    if (!rawMatched) {
      if (queryPinyin) {
        for (const field of indexed.pinyin) {
          if (field.kind !== 'full') continue
          if (field.compact.includes(queryPinyin)) {
            matched = true
            score += field.weight * (1 + queryPinyin.length / field.compact.length)
          }
        }
      } else if (latinNeedle.length >= 2) {
        for (const field of indexed.pinyin) {
          if (field.compact.includes(latinNeedle)) {
            matched = true
            score += field.weight * (1 + latinNeedle.length / field.compact.length)
          }
        }
      }

      // 4. 拉丁错别字容错：没精确命中的 token 去和词条的拉丁词/拼音串算编辑距离
      //    4–7 字母容 1 个错，8 个以上容 2 个；只加一次最像的那个词，避免堆分。
      for (const token of tokens) {
        if (!/^[a-z]+$/.test(token) || indexed.blob.includes(token)) continue
        const max = token.length >= 8 ? 2 : token.length >= 4 ? 1 : 0
        if (max === 0) continue

        let best: Word | null = null
        let bestDistance = max + 1
        for (const word of indexed.words) {
          if (Math.abs(word.word.length - token.length) > max) continue
          const distance = editDistance(token, word.word, max)
          if (distance <= max && distance < bestDistance) {
            best = word
            bestDistance = distance
          }
        }
        if (best !== null) {
          matched = true
          const similarity = 1 - bestDistance / Math.max(token.length, best.word.length)
          score += best.weight * (1 + similarity)
        }
      }
    }

    if (!matched) continue

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

/**
 * 搜索建议：空查询返回空数组（调用方自己决定要不要显示热门/示例），
 * 非空就按 searchEntries 的排序截前 limit 条。对话框与输入框共用这一层，
 * 保证「输入框里看到的顺序」和「全量搜索页的顺序」不会两套。
 */
export function suggestionsFor(entries: EntryMeta[], raw: string, limit = 8): SearchHit[] {
  if (raw.trim().length === 0) return []
  return searchEntries(entries, raw).slice(0, limit)
}
