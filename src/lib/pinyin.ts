import { PINYIN_TABLE } from './pinyinTable'

/** 拼音检索结果：连续主读音、首字母串、逐字主读音。非汉字不参与。 */
export interface PinyinInfo {
  /** 连续无空格主读音，如「毛玻璃」→ "maoboli" */
  full: string
  /** 首字母串，如「毛玻璃」→ "mbl" */
  initials: string
  /** 逐字主读音，如「毛玻璃」→ ["mao", "bo", "li"] */
  syllables: string[]
}

const CJK = /[\u4e00-\u9fff]/u
const EMPTY: PinyinInfo = { full: '', initials: '', syllables: [] }

const READINGS = new Map<string, string[]>()
const TEXTS = new Map<string, PinyinInfo>()
const MAX_CACHE = 512

/** 是否含有汉字（拼音表只覆盖常用汉字区 U+4E00–U+9FFF） */
export function hasCjk(text: string): boolean {
  return CJK.test(text)
}

/** 单字的全部读音（多音字按拼音表里的顺序，第一个为主读音）；非汉字或表外字返回空数组 */
export function readingsOfChar(ch: string): string[] {
  if (!CJK.test(ch)) return []
  const cached = READINGS.get(ch)
  if (cached) return cached
  const row = PINYIN_TABLE[ch]
  const readings = row ? row.split('|') : []
  READINGS.set(ch, readings)
  return readings
}

/**
 * 把文本里每个汉字换成主读音。多音字只取第一个读音，
 * 表里没有的字直接跳过——查询里偶尔出现表外字时宁可少一节，也不要抛错。
 * 空串、纯拉丁/数字/标点都返回全空。
 */
export function pinyinOf(text: string): PinyinInfo {
  if (!text) return EMPTY
  const cached = TEXTS.get(text)
  if (cached) return cached

  const syllables: string[] = []
  for (const ch of text) {
    const readings = readingsOfChar(ch)
    if (readings.length > 0) syllables.push(readings[0])
  }

  const info: PinyinInfo =
    syllables.length === 0
      ? EMPTY
      : {
          full: syllables.join(''),
          initials: syllables.map((syllable) => syllable[0]).join(''),
          syllables,
        }

  if (TEXTS.size >= MAX_CACHE) TEXTS.clear()
  TEXTS.set(text, info)
  return info
}
