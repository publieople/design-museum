import { codeOrder } from '../data/taxonomy'
import type { EntryMeta } from '../data/types'
import { searchEntries } from './search'

/** 一条命中理由：页面按 kind 换成对应的 i18n 文案 */
export interface ReverseReason {
  kind: 'css' | 'keyword' | 'text'
  value: string
}

export interface ReverseHit {
  entry: EntryMeta
  score: number
  reasons: ReverseReason[]
}

export interface ReverseResult {
  hits: ReverseHit[]
  properties: string[]
}

/**
 * 常见 CSS 属性名。两个用途：
 * 1) 从裸文本（没有冒号的写法）里认出属性，避免把普通英文词当成属性；
 * 2) 关键词分词时把「属性名 token」剔掉——属性本身由精确匹配负责，
 *    再当成关键词累加只会让 transition / transform 这种大词污染排序。
 */
const PROPERTY_NAMES = new Set<string>([
  'accent-color',
  'align-content',
  'align-items',
  'align-self',
  'all',
  'animation',
  'animation-delay',
  'animation-direction',
  'animation-duration',
  'animation-fill-mode',
  'animation-iteration-count',
  'animation-name',
  'animation-play-state',
  'animation-range',
  'animation-timeline',
  'animation-timing-function',
  'appearance',
  'aspect-ratio',
  'backdrop-filter',
  'background',
  'background-attachment',
  'background-clip',
  'background-color',
  'background-image',
  'background-position',
  'background-repeat',
  'background-size',
  'block-size',
  'border',
  'border-block',
  'border-bottom',
  'border-collapse',
  'border-color',
  'border-image',
  'border-left',
  'border-radius',
  'border-right',
  'border-spacing',
  'border-style',
  'border-top',
  'border-width',
  'bottom',
  'box-shadow',
  'box-sizing',
  'break-after',
  'break-before',
  'break-inside',
  'caret-color',
  'clip-path',
  'color',
  'color-scheme',
  'column-count',
  'column-gap',
  'column-rule',
  'column-span',
  'column-width',
  'columns',
  'contain',
  'container',
  'container-type',
  'content',
  'content-visibility',
  'cursor',
  'direction',
  'display',
  'filter',
  'flex',
  'flex-basis',
  'flex-direction',
  'flex-flow',
  'flex-grow',
  'flex-shrink',
  'flex-wrap',
  'float',
  'font',
  'font-family',
  'font-feature-settings',
  'font-kerning',
  'font-size',
  'font-size-adjust',
  'font-stretch',
  'font-style',
  'font-synthesis',
  'font-variant',
  'font-variant-numeric',
  'font-variation-settings',
  'font-weight',
  'gap',
  'grid',
  'grid-area',
  'grid-auto-columns',
  'grid-auto-flow',
  'grid-auto-rows',
  'grid-column',
  'grid-column-end',
  'grid-column-start',
  'grid-row',
  'grid-row-end',
  'grid-row-start',
  'grid-template',
  'grid-template-areas',
  'grid-template-columns',
  'grid-template-rows',
  'height',
  'hyphens',
  'inset',
  'inset-block',
  'inset-inline',
  'isolation',
  'justify-content',
  'justify-items',
  'justify-self',
  'left',
  'letter-spacing',
  'line-break',
  'line-height',
  'list-style',
  'margin',
  'margin-block',
  'margin-inline',
  'mask',
  'mask-composite',
  'mask-image',
  'mask-position',
  'mask-repeat',
  'mask-size',
  'max-block-size',
  'max-height',
  'max-inline-size',
  'max-width',
  'min-block-size',
  'min-height',
  'min-inline-size',
  'min-width',
  'mix-blend-mode',
  'object-fit',
  'object-position',
  'offset',
  'opacity',
  'order',
  'outline',
  'outline-offset',
  'overflow',
  'overflow-anchor',
  'overflow-wrap',
  'overflow-x',
  'overflow-y',
  'overscroll-behavior',
  'padding',
  'padding-block',
  'padding-inline',
  'paint-order',
  'perspective',
  'perspective-origin',
  'place-content',
  'place-items',
  'place-self',
  'pointer-events',
  'position',
  'resize',
  'right',
  'rotate',
  'row-gap',
  'scale',
  'scroll-behavior',
  'scroll-margin',
  'scroll-padding',
  'scroll-snap-align',
  'scroll-snap-stop',
  'scroll-snap-type',
  'scrollbar-color',
  'scrollbar-width',
  'shape-outside',
  'tab-size',
  'table-layout',
  'text-align',
  'text-decoration',
  'text-decoration-color',
  'text-decoration-line',
  'text-decoration-thickness',
  'text-fill-color',
  'text-overflow',
  'text-shadow',
  'text-stroke',
  'text-transform',
  'text-underline-offset',
  'text-wrap',
  'top',
  'touch-action',
  'transform',
  'transform-origin',
  'transform-style',
  'transition',
  'transition-delay',
  'transition-duration',
  'transition-property',
  'transition-timing-function',
  'translate',
  'unicode-bidi',
  'user-select',
  'vertical-align',
  'visibility',
  'white-space',
  'widows',
  'width',
  'will-change',
  'word-break',
  'word-spacing',
  'writing-mode',
  'z-index',
])

/** 关键词/别名分词时丢掉的泛词与通用值，避免「none」「auto」这种把排序搅乱 */
const STOPWORDS = new Set<string>([
  'a',
  'about',
  'above',
  'after',
  'again',
  'against',
  'all',
  'also',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'being',
  'below',
  'between',
  'both',
  'but',
  'by',
  'can',
  'could',
  'did',
  'do',
  'does',
  'doing',
  'down',
  'during',
  'each',
  'every',
  'few',
  'for',
  'from',
  'further',
  'get',
  'gets',
  'had',
  'has',
  'have',
  'having',
  'he',
  'her',
  'here',
  'hers',
  'him',
  'his',
  'how',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'just',
  'like',
  'make',
  'makes',
  'many',
  'may',
  'might',
  'more',
  'most',
  'much',
  'must',
  'need',
  'needs',
  'no',
  'nor',
  'not',
  'now',
  'of',
  'off',
  'on',
  'once',
  'only',
  'or',
  'other',
  'our',
  'out',
  'over',
  'own',
  'per',
  'same',
  'she',
  'should',
  'so',
  'some',
  'such',
  'than',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'to',
  'too',
  'under',
  'until',
  'up',
  'use',
  'used',
  'using',
  'very',
  'via',
  'vs',
  'want',
  'wants',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'while',
  'who',
  'why',
  'will',
  'with',
  'without',
  'would',
  'you',
  'your',
  // CSS 通用值 / 单位：它们出现在代码里不说明是哪条词条
  'auto',
  'block',
  'hidden',
  'inherit',
  'initial',
  'inline',
  'none',
  'revert',
  'transparent',
  'unset',
  'visible',
  'important',
  'px',
  'rem',
  'em',
  'ms',
  'deg',
  'vh',
  'vw',
  'dvh',
  'svh',
  'lvh',
  'cqw',
  'fr',
])

const VENDOR_PREFIX = /^-(?:webkit|moz|ms|o)-/
const VENDOR_PREFIX_BARE = /^(?:webkit|moz|ms|o)-/

/** 属性名统一：小写 + 去厂商前缀（-webkit-backdrop-filter → backdrop-filter） */
function normalizeProperty(name: string): string {
  return name.trim().toLowerCase().replace(VENDOR_PREFIX, '')
}

function normalizeToken(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^[-_]+/, '')
    .replace(VENDOR_PREFIX_BARE, '')
}

/** 文本压缩：只留字母、数字、汉字，用来做包含与 2-gram 比较 */
function compactText(input: string): string {
  return input.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
}

function splitTokens(input: string): string[] {
  return input
    .split(/[^\p{L}\p{N}-]+/u)
    .map((token) => token.replace(/^-+|-+$/g, ''))
    .filter(Boolean)
}

const DECLARATION = /(?:^|[;{}\r\n])\s*(-{0,2}[a-zA-Z][\w-]*)\s*:(?!\s*\/\/)/g
const BARE_PROPERTY = /-?[a-z][a-z0-9]*(?:-[a-z0-9]+)+/g

function acceptDeclaration(rawName: string): string | null {
  if (rawName.startsWith('--')) return null
  const name = normalizeProperty(rawName)
  if (!name) return null
  if (PROPERTY_NAMES.has(name)) return name
  // 未知但形如 foo-bar 的属性也收下：CSS 每年都在长，别把新属性当噪声
  if (/^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/.test(name)) return name
  return null
}

/**
 * 从一段文本里抽出 CSS 属性名。
 * 两种来源：带冒号的声明（含多行、-webkit- 前缀、var()/函数值），
 * 以及单独出现的复合属性名（如「position sticky」里没有冒号的写法）。
 * 识别不了的输入返回空数组，不抛错。
 */
export function extractProperties(raw: string): string[] {
  if (!raw.trim()) return []
  const text = raw.toLowerCase()
  const found: string[] = []
  const seen = new Set<string>()
  const add = (name: string) => {
    if (seen.has(name)) return
    seen.add(name)
    found.push(name)
  }

  DECLARATION.lastIndex = 0
  let match: RegExpExecArray | null = DECLARATION.exec(text)
  while (match !== null) {
    const declared = acceptDeclaration(match[1])
    if (declared) add(declared)
    match = DECLARATION.exec(text)
  }

  BARE_PROPERTY.lastIndex = 0
  match = BARE_PROPERTY.exec(text)
  while (match !== null) {
    const start = match.index
    const end = start + match[0].length
    const before = start > 0 ? text[start - 1] : ''
    const after = end < text.length ? text[end] : ''
    // 前后必须断开：不能从 --custom-prop / foo-bar-baz 中间切一半
    if (before === '-' || /[\w-]/.test(before) || /[\w.-]/.test(after)) {
      match = BARE_PROPERTY.exec(text)
      continue
    }
    const name = normalizeProperty(match[0])
    if (PROPERTY_NAMES.has(name)) add(name)
    match = BARE_PROPERTY.exec(text)
  }

  return found
}

interface Phrase {
  text: string
  compact: string
}

interface TextField {
  text: string
  compact: string
  weight: number
}

interface Indexed {
  /** 归一化属性名 → 原始 keyword（如 backdrop-filter → backdrop-filter） */
  properties: Map<string, string>
  keywordTokens: Map<string, string>
  aliasTokens: Map<string, string>
  nameTokens: Map<string, string>
  nameZh: Phrase | null
  nameEn: Phrase | null
  aliases: Phrase[]
  keywordPhrases: Phrase[]
  fields: TextField[]
  keywordsCompact: string
}

const INDEX = new WeakMap<EntryMeta, Indexed>()

function toPhrase(text: string): Phrase | null {
  const compact = compactText(text)
  return compact.length >= 2 ? { text, compact } : null
}

function isPropertyToken(token: string): boolean {
  return PROPERTY_NAMES.has(normalizeProperty(token))
}

function addToken(map: Map<string, string>, rawToken: string): void {
  const token = normalizeToken(rawToken)
  if (token.length < 2) return
  if (/^\d/.test(token)) return
  if (STOPWORDS.has(token)) return
  if (isPropertyToken(token)) return
  if (!map.has(token)) map.set(token, rawToken.trim())
}

function buildIndex(entry: EntryMeta): Indexed {
  const cached = INDEX.get(entry)
  if (cached) return cached

  const properties = new Map<string, string>()
  const keywordTokens = new Map<string, string>()
  const aliasTokens = new Map<string, string>()
  const nameTokens = new Map<string, string>()
  const keywordPhrases: Phrase[] = []

  for (const keyword of entry.keywords) {
    const colon = keyword.indexOf(':')
    if (colon > 0) {
      const rawName = keyword.slice(0, colon).trim()
      const name = normalizeProperty(rawName)
      if (name && !name.startsWith('--')) {
        if (isPropertyToken(name) || /^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/.test(name)) {
          properties.set(name, keyword)
        }
      }
    } else if (isPropertyToken(keyword)) {
      properties.set(normalizeProperty(keyword), keyword)
    }
    for (const token of splitTokens(keyword)) addToken(keywordTokens, token)
    if (keyword.includes(' ')) {
      const phrase = toPhrase(keyword)
      if (phrase) keywordPhrases.push(phrase)
    }
  }

  for (const alias of entry.aliases) {
    for (const token of splitTokens(alias)) addToken(aliasTokens, token)
  }
  for (const token of splitTokens(entry.nameEn)) addToken(nameTokens, token)
  for (const token of splitTokens(entry.nameZh)) addToken(nameTokens, token)

  const fields: TextField[] = []
  const pushField = (text: string | undefined, weight: number) => {
    if (!text) return
    const compact = compactText(text)
    if (compact.length > 0) fields.push({ text, compact, weight })
  }
  pushField(entry.nameZh, 1)
  pushField(entry.nameEn, 0.95)
  pushField(entry.aliases.join(' '), 0.9)
  pushField(entry.keywords.join(' '), 0.75)
  pushField(entry.oneLiner, 0.6)
  pushField(entry.en?.oneLiner, 0.6)

  const indexed: Indexed = {
    properties,
    keywordTokens,
    aliasTokens,
    nameTokens,
    nameZh: toPhrase(entry.nameZh),
    nameEn: toPhrase(entry.nameEn),
    aliases: entry.aliases.map(toPhrase).filter((phrase): phrase is Phrase => phrase !== null),
    keywordPhrases,
    fields,
    keywordsCompact: compactText(entry.keywords.join(' ')),
  }
  INDEX.set(entry, indexed)
  return indexed
}

function grams(input: string): Set<string> {
  const out = new Set<string>()
  if (input.length <= 2) {
    out.add(input)
    return out
  }
  for (let i = 0; i < input.length - 1; i += 1) out.add(input.slice(i, i + 2))
  return out
}

const CJK = /[\u3400-\u9fff]/

/**
 * 查询与某个字段的相似度（0–1）。
 * 包含关系优先；拉丁文本看 2-gram 覆盖率（覆盖率不够就当作无关，
 * 免得「zzzqqq」这种乱码靠一个碎 gram 蹭到分数）；中文再补一层单字覆盖率，
 * 因为中文的口语说法常常字对上了但顺序不同。
 */
function similarity(query: string, field: string): number {
  if (!query || !field) return 0
  if (query === field) return 1
  if (field.includes(query)) return 0.9
  if (query.includes(field)) {
    return Math.min(0.85, 0.55 + (field.length / query.length) * 0.3)
  }

  let score = 0
  const queryGrams = grams(query)
  if (queryGrams.size > 0) {
    let shared = 0
    for (const gram of queryGrams) {
      if (field.includes(gram)) shared += 1
    }
    const ratio = shared / queryGrams.size
    if (ratio >= 0.5) score = ratio * 0.7
  }

  if (CJK.test(query)) {
    const chars = new Set(Array.from(query))
    let sharedChars = 0
    for (const char of chars) {
      if (field.includes(char)) sharedChars += 1
    }
    const coverage = sharedChars / chars.size
    score = Math.max(score, coverage * 0.75)
  }

  return score
}

function clip(value: string, max = 40): string {
  return value.length <= max ? value : `${value.slice(0, max)}…`
}

/** 查询分词：原文分词 + 复合词再拆成片段（scroll-snap-type → scroll / snap / type） */
function queryTokens(raw: string): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  const push = (token: string) => {
    if (token.length < 2) return
    if (/^\d/.test(token)) return
    if (STOPWORDS.has(token)) return
    if (seen.has(token)) return
    seen.add(token)
    out.push(token)
  }
  for (const term of splitTokens(raw)) {
    push(normalizeToken(term))
    const parts = term.split('-')
    if (parts.length > 1) {
      for (const part of parts) {
        const normalized = normalizeToken(part)
        if (normalized.length >= 3) push(normalized)
      }
    }
  }
  return out
}

interface Scored {
  entry: EntryMeta
  score: number
  reasons: ReverseReason[]
}

function scoreEntry(
  entry: EntryMeta,
  properties: string[],
  tokens: string[],
  compactQuery: string,
  searchNorm: number,
): Scored | null {
  const index = buildIndex(entry)
  const reasons: ReverseReason[] = []

  // 1. CSS 属性精确匹配：最高权重
  const matchedProperties: string[] = []
  for (const property of properties) {
    if (index.properties.has(property)) matchedProperties.push(property)
  }
  let cssScore = 0
  if (matchedProperties.length > 0) {
    cssScore = 44 + (matchedProperties.length - 1) * 26
    if (cssScore > 90) cssScore = 90
    for (const property of matchedProperties) reasons.push({ kind: 'css', value: property })
  }

  // 2. 关键词 / 别名 / 英文名的 token 与短语匹配
  let keywordScore = 0
  const phraseHits: { value: string; weight: number }[] = []
  const addPhrase = (phrase: Phrase | null, weight: number) => {
    if (!phrase) return
    if (!compactQuery.includes(phrase.compact)) return
    phraseHits.push({ value: phrase.text, weight })
  }
  addPhrase(index.nameZh, 28)
  addPhrase(index.nameEn, 26)
  for (const alias of index.aliases) addPhrase(alias, 24)
  for (const phrase of index.keywordPhrases) addPhrase(phrase, 18)
  // 中文/英文短语可能同时命中几条别名，只取最高的一条，避免重复堆分
  phraseHits.sort((a, b) => b.weight - a.weight)
  if (phraseHits.length > 0) {
    keywordScore += phraseHits[0].weight
    if (phraseHits.length > 1) keywordScore += 4
    reasons.push({ kind: 'keyword', value: phraseHits[0].value })
  }

  let keywordTokenScore = 0
  let aliasTokenScore = 0
  const tokenReasons: ReverseReason[] = []
  for (const token of tokens) {
    if (index.keywordTokens.has(token)) {
      keywordTokenScore += 10
      tokenReasons.push({ kind: 'keyword', value: index.keywordTokens.get(token) ?? token })
    } else if (index.aliasTokens.has(token)) {
      aliasTokenScore += 7
      tokenReasons.push({ kind: 'keyword', value: index.aliasTokens.get(token) ?? token })
    } else if (index.nameTokens.has(token)) {
      aliasTokenScore += 7
      tokenReasons.push({ kind: 'keyword', value: index.nameTokens.get(token) ?? token })
    }
  }
  keywordScore += Math.min(keywordTokenScore, 45)
  keywordScore += Math.min(aliasTokenScore, 21)
  if (keywordScore > 60) keywordScore = 60
  for (const reason of tokenReasons) reasons.push(reason)

  // 3. 描述相似度兜底：字段包含 / 2-gram 覆盖率 + search.ts 的分数
  let bestField: TextField | null = null
  let bestWeighted = 0
  let bestSim = 0
  for (const field of index.fields) {
    const sim = similarity(compactQuery, field.compact)
    if (sim <= 0) continue
    const weighted = sim * field.weight
    if (weighted > bestWeighted) {
      bestWeighted = weighted
      bestField = field
      bestSim = sim
    }
  }
  const textScore = Math.min(40, bestWeighted * 30 + searchNorm * 10)
  if (bestField && bestSim >= 0.3) {
    reasons.push({ kind: 'text', value: clip(bestField.text) })
  }

  const score = Math.round(Math.min(100, Math.max(0, cssScore + keywordScore + textScore)))
  if (score <= 0) return null

  // 理由去重（同 kind + 同 value），页面上最多展示几条
  const unique: ReverseReason[] = []
  const seenReasons = new Set<string>()
  for (const reason of reasons) {
    const key = `${reason.kind}:${reason.value}`
    if (seenReasons.has(key)) continue
    seenReasons.add(key)
    unique.push(reason)
  }

  return { entry, score, reasons: unique.slice(0, 6) }
}

/**
 * 反查：给一段 CSS 或口语描述，按 CSS 属性、关键词、描述相似度给词条打分。
 * 返回按分数降序的候选与命中理由，以及识别出的 CSS 属性名。
 */
export function reverseLookup(entries: EntryMeta[], raw: string, limit = 6): ReverseResult {
  const properties = extractProperties(raw)
  if (!raw.trim()) return { hits: [], properties: [] }

  const unique: EntryMeta[] = []
  const seenSlugs = new Set<string>()
  for (const entry of entries) {
    if (seenSlugs.has(entry.slug)) continue
    seenSlugs.add(entry.slug)
    unique.push(entry)
  }

  const tokens = queryTokens(raw)
  const compactQuery = compactText(raw)

  // search.ts 只作最后兜底：CSS 片段一般不会命中它，口语描述能借它的拼音/容错
  const searchHits = searchEntries(unique, raw)
  let maxSearch = 0
  for (const hit of searchHits) {
    if (hit.score > maxSearch) maxSearch = hit.score
  }
  const searchByEntry = new Map<EntryMeta, number>()
  if (maxSearch > 0) {
    for (const hit of searchHits) searchByEntry.set(hit.entry, hit.score / maxSearch)
  }

  const scored: Scored[] = []
  for (const entry of unique) {
    const result = scoreEntry(
      entry,
      properties,
      tokens,
      compactQuery,
      searchByEntry.get(entry) ?? 0,
    )
    if (result) scored.push(result)
  }

  scored.sort(
    (a, b) =>
      b.score - a.score || codeOrder(a.entry.code).localeCompare(codeOrder(b.entry.code)),
  )

  const capped = limit > 0 ? scored.slice(0, Math.floor(limit)) : []
  const hits: ReverseHit[] = capped.map((hit) => ({
    entry: hit.entry,
    score: hit.score,
    reasons: hit.reasons,
  }))
  return { hits, properties }
}
