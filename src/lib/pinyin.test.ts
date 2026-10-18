import { describe, expect, it } from 'vitest'
import { hasCjk, pinyinOf, readingsOfChar } from './pinyin'

describe('拼音', () => {
  it('汉字转主读音：全拼、首字母、逐字音节', () => {
    expect(pinyinOf('毛玻璃')).toEqual({
      full: 'maoboli',
      initials: 'mbl',
      syllables: ['mao', 'bo', 'li'],
    })
  })

  it('多音字返回全部读音，pinyinOf 取第一个主读音', () => {
    expect(readingsOfChar('长')).toEqual(['chang', 'zhang'])
    expect(readingsOfChar('重')).toEqual(['zhong', 'chong'])
    expect(pinyinOf('长').full).toBe('chang')
  })

  it('单字读音，非汉字与表外字返回空数组', () => {
    expect(readingsOfChar('毛')).toEqual(['mao'])
    expect(readingsOfChar('A')).toEqual([])
    expect(readingsOfChar('1')).toEqual([])
    expect(readingsOfChar('龘')).toEqual([])
  })

  it('非汉字不参与拼音，空串返回全空', () => {
    expect(hasCjk('backdrop blur')).toBe(false)
    expect(hasCjk('毛玻璃')).toBe(true)
    expect(pinyinOf('backdrop blur')).toEqual({ full: '', initials: '', syllables: [] })
    expect(pinyinOf('')).toEqual({ full: '', initials: '', syllables: [] })
    expect(pinyinOf('123 !?')).toEqual({ full: '', initials: '', syllables: [] })
  })

  it('同一文本重复调用结果稳定（缓存）', () => {
    const again = pinyinOf('磨砂玻璃')
    expect(again).toEqual(pinyinOf('磨砂玻璃'))
    expect(again.full).toBe('moshaboli')
    expect(again.initials).toBe('msbl')
    expect(again.syllables).toEqual(['mo', 'sha', 'bo', 'li'])
  })
})
