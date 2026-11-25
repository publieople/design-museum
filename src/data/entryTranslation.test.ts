import { describe, expect, it } from 'vitest'
import { ENTRIES } from './index'
import type { Control } from './types'

/**
 * H1 的验收闸门：英文覆盖层不是「能翻多少翻多少」，而是与中文同等深度。
 * 新增词条必须一次写全，存量词条由 H1 补齐。
 */
const CJK = /[\u3400-\u9fff\u3000-\u303f]/u

function expectEnglish(value: string, where: string) {
  expect(value.trim().length, where + ' 不能为空').toBeGreaterThan(0)
  expect(CJK.test(value), where + ' 不应出现中文字符：' + value).toBe(false)
}

function expectAligned<A, B>(zh: A[], en: B[] | undefined, where: string) {
  expect(en, where + ' 缺失').toBeDefined()
  expect(en!.length, where + ' 条数应与中文一致').toBe(zh.length)
}

function expectControlHints(zh: Control[], en: { label?: string; hint?: string }[], where: string) {
  zh.forEach((control, index) => {
    const translated = en[index]!
    expectEnglish(translated.label ?? '', where + '[' + index + '].label')
    if ('hint' in control && control.hint) {
      expectEnglish(translated.hint ?? '', where + '[' + index + '].hint')
    }
  })
}

describe('英文覆盖层与中文同等深度', () => {
  it('每条词条的 en 字段齐全且与中文一一对应', () => {
    for (const entry of ENTRIES) {
      const where = entry.slug
      expect(entry.en, where + ' 缺 en 覆盖层').toBeDefined()
      const en = entry.en!

      expectEnglish(en.oneLiner ?? '', where + ' en.oneLiner')
      expectEnglish(en.reducedMotion ?? '', where + ' en.reducedMotion')

      expectAligned(entry.whenToUse, en.whenToUse, where + ' en.whenToUse')
      en.whenToUse!.forEach((item, index) => expectEnglish(item, where + ' en.whenToUse[' + index + ']'))

      expectAligned(entry.confusions, en.confusions, where + ' en.confusions')
      en.confusions!.forEach((item, index) => {
        expectEnglish(item.with ?? '', where + ' en.confusions[' + index + '].with')
        expectEnglish(item.diff ?? '', where + ' en.confusions[' + index + '].diff')
        expect((item.diff ?? '').length, where + ' en.confusions[' + index + '].diff 太短，像占位符').toBeGreaterThan(40)
      })

      expectAligned(entry.pitfalls, en.pitfalls, where + ' en.pitfalls')
      en.pitfalls!.forEach((item, index) => expectEnglish(item, where + ' en.pitfalls[' + index + ']'))

      expectAligned(entry.spec, en.spec, where + ' en.spec')
      en.spec!.forEach((item, index) => expectEnglish(item.label ?? '', where + ' en.spec[' + index + '].label'))

      expectAligned(entry.controls, en.controls, where + ' en.controls')
      expectControlHints(entry.controls, en.controls!, where + ' en.controls')
    }
  })

  it('英文覆盖层之间不残留中文', () => {
    for (const entry of ENTRIES) {
      const raw = JSON.stringify(entry.en ?? {})
      expect(CJK.test(raw), entry.slug + ' 的 en 覆盖层里还有中文：' + raw.slice(0, 120)).toBe(false)
    }
  })

  it('英文正文覆盖率是 100%', () => {
    const complete = ENTRIES.filter((entry) => {
      const en = entry.en
      return Boolean(
        en?.oneLiner &&
          en.whenToUse?.length === entry.whenToUse.length &&
          en.confusions?.length === entry.confusions.length &&
          en.pitfalls?.length === entry.pitfalls.length &&
          en.spec?.length === entry.spec.length &&
          en.reducedMotion &&
          en.controls?.length === entry.controls.length,
      )
    })
    expect(complete.length, '还有词条没补完英文：' + ENTRIES.filter((entry) => !complete.includes(entry)).map((entry) => entry.slug).join(', ')).toBe(ENTRIES.length)
  })
})
