import { describe, expect, it } from 'vitest'
import { STRINGS } from './strings'
import { translate } from './index'
import { pick } from './pick'

describe('界面文案', () => {
  it('每条文案都有中英两版，且都不是空串', () => {
    for (const [key, value] of Object.entries(STRINGS)) {
      expect(value.zh.trim().length, `${key} 缺中文`).toBeGreaterThan(0)
      expect(value.en.trim().length, `${key} 缺英文`).toBeGreaterThan(0)
    }
  })

  it('按语言取，并替换变量', () => {
    expect(translate('zh', 'home.hits', { n: 3 })).toBe('命中 3 条')
    expect(translate('en', 'home.hits', { n: 3 })).toBe('3 matches')
  })

  it('变量缺失时保留占位符，方便发现漏传', () => {
    expect(translate('zh', 'home.hits')).toBe('命中 {n} 条')
  })

  it('文案表规模没有意外缩水', () => {
    expect(Object.keys(STRINGS).length).toBeGreaterThan(60)
  })
})

describe('词条双语回退', () => {
  it('en 缺失时回退中文', () => {
    expect(pick({ zh: '毛玻璃' }, 'en')).toBe('毛玻璃')
    expect(pick({ zh: '毛玻璃', en: 'Frosted glass' }, 'en')).toBe('Frosted glass')
    expect(pick({ zh: '毛玻璃', en: 'Frosted glass' }, 'zh')).toBe('毛玻璃')
  })

  it('undefined 返回空串而不是崩', () => {
    expect(pick(undefined, 'en')).toBe('')
  })
})
