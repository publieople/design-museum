import { describe, expect, it } from 'vitest'
import { findEntry } from '../data'
import type { Entry } from '../data/types'
import { resolveEntry } from './localize'

// 基线必须显式没有英文覆盖层：frosted-glass 是英文样板，它自己是带 en 的
const source = findEntry('frosted-glass')!
const base: Entry = { ...source, en: undefined }

const withTranslation: Entry = {
  ...base,
  en: {
    oneLiner: 'A panel that blurs whatever sits behind it.',
    whenToUse: ['Over scrolling content', 'On top of a photo', 'To show layering without a solid fill'],
    confusions: [{ with: 'translucency', diff: 'Translucency keeps the backdrop sharp.' }],
    pitfalls: ['Needs something behind it', 'Breaks under a transformed parent'],
    reducedMotion: 'Static effect, nothing to disable.',
    controls: [{ label: 'Blur radius', hint: 'At 0px it is just transparency' }],
  },
}

describe('词条按语言解析', () => {
  it('中文取中文', () => {
    const resolved = resolveEntry(withTranslation, 'zh')
    expect(resolved.oneLiner).toBe(base.oneLiner)
    expect(resolved.controls[0].label).toBe(base.controls[0].label)
  })

  it('英文取覆盖层', () => {
    const resolved = resolveEntry(withTranslation, 'en')
    expect(resolved.oneLiner).toContain('blurs whatever sits behind it')
    expect(resolved.whenToUse).toHaveLength(3)
    expect(resolved.controls[0].label).toBe('Blur radius')
    expect(resolved.confusions[0].with).toBe('translucency')
  })

  it('没有覆盖层时逐字段回退中文', () => {
    const resolved = resolveEntry(base, 'en')
    expect(resolved.oneLiner).toBe(base.oneLiner)
    expect(resolved.pitfalls).toEqual(base.pitfalls)
  })

  it('只覆盖一部分时，没覆盖的字段仍是中文', () => {
    const partial: Entry = { ...base, en: { oneLiner: 'Only this one line is translated.' } }
    const resolved = resolveEntry(partial, 'en')
    expect(resolved.oneLiner).toBe('Only this one line is translated.')
    expect(resolved.reducedMotion).toBe(base.reducedMotion)
  })

  it('关键词与术语不翻译，中英都要留着', () => {
    const resolved = resolveEntry(withTranslation, 'en')
    expect(resolved.keywords).toEqual(base.keywords)
    expect(resolved.nameZh).toBe(base.nameZh)
    expect(resolved.nameEn).toBe(base.nameEn)
  })
})
