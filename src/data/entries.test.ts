import { describe, expect, it } from 'vitest'
import { ENTRIES } from './index'
import { CATEGORIES } from './taxonomy'
import { defaultValues } from '../lib/controls'
import { DEMO_SLUGS, hasDemo } from '../demos/registry'
import type { Control, Entry } from './types'

const CATEGORY_IDS = new Set(CATEGORIES.map((category) => category.id))

function expectFilled(value: string, where: string) {
  expect(value.trim().length, `${where} 不能为空`).toBeGreaterThan(0)
}

function checkControl(entry: Entry, control: Control) {
  expectFilled(control.id, `${entry.slug} 控件 id`)
  expectFilled(control.label, `${entry.slug} 控件 ${control.id} 的 label`)
  if (control.kind === 'range') {
    expect(control.min, `${entry.slug}/${control.id} min 应小于 max`).toBeLessThan(control.max)
    expect(control.def, `${entry.slug}/${control.id} def 应在 min..max 内`).toBeGreaterThanOrEqual(
      control.min,
    )
    expect(control.def).toBeLessThanOrEqual(control.max)
  }
  if (control.kind === 'select') {
    expect(control.options.length, `${entry.slug}/${control.id} 至少要有两个选项`).toBeGreaterThan(1)
    expect(
      control.options.some((option) => option.value === control.def),
      `${entry.slug}/${control.id} 的 def 必须是其中一个选项`,
    ).toBe(true)
  }
}

describe('每条词条自身合法（铺量阶段随时可跑）', () => {
  it('全馆至少有一条词条', () => {
    expect(ENTRIES.length).toBeGreaterThan(0)
  })

  it.each(ENTRIES.map((entry) => [entry.slug, entry] as const))('%s 结构完整', (slug, entry) => {
    expect(entry.slug).toBe(slug)
    expect(slug, 'slug 必须是 kebab-case').toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    expect(entry.code, 'code 形如 V-01').toMatch(/^[A-Z]-\d{2}$/)
    expect(CATEGORY_IDS.has(entry.category), `${slug} 的展厅 ${entry.category} 不存在`).toBe(true)

    expectFilled(entry.nameZh, `${slug} nameZh`)
    expectFilled(entry.nameEn, `${slug} nameEn`)
    expectFilled(entry.oneLiner, `${slug} oneLiner`)
    expectFilled(entry.reducedMotion, `${slug} reducedMotion`)

    expect(entry.oneLiner.length, `${slug} oneLiner 应在 40 字以内`).toBeLessThanOrEqual(48)
    expect(entry.aliases.length, `${slug} 至少要有一个口语别名`).toBeGreaterThan(0)
    expect(entry.whenToUse.length, `${slug} whenToUse 至少 2 条`).toBeGreaterThanOrEqual(2)
    expect(entry.whenToUse.length, `${slug} whenToUse 最多 4 条`).toBeLessThanOrEqual(4)
    expect(entry.confusions.length, `${slug} 至少一条易混淆对比`).toBeGreaterThanOrEqual(1)
    expect(entry.pitfalls.length, `${slug} 至少一条踩坑`).toBeGreaterThanOrEqual(1)
    expect(entry.keywords.length, `${slug} 至少一个英文关键词`).toBeGreaterThan(0)
    expect(entry.spec.length, `${slug} 至少一条推荐取值`).toBeGreaterThanOrEqual(1)
    expect(entry.refs.length, `${slug} 至少一条参考`).toBeGreaterThanOrEqual(1)
    expect(entry.scenes.length, `${slug} 至少一个场景`).toBeGreaterThan(0)
    expect(entry.feel.length, `${slug} 至少一种感觉`).toBeGreaterThan(0)
    expect(entry.intent.length, `${slug} 至少一个目的`).toBeGreaterThan(0)

    for (const ref of entry.refs) {
      expect(ref.url, `${slug} 的参考链接必须是 https`).toMatch(/^https:\/\//)
      expectFilled(ref.label, `${slug} 参考 ${ref.url} 的 label`)
    }

    for (const control of entry.controls) checkControl(entry, control)

    const prompt = entry.prompt(defaultValues(entry))
    expect(prompt.zh.trim().length, `${slug} 中文需求句不能为空`).toBeGreaterThan(10)
    expect(prompt.en.trim().length, `${slug} 英文关键词不能为空`).toBeGreaterThan(5)
  })

  it('slug 与 code 都是唯一的', () => {
    const slugs = ENTRIES.map((entry) => entry.slug)
    const codes = ENTRIES.map((entry) => entry.code)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('code 的展厅字母与 category 一致', () => {
    for (const entry of ENTRIES) {
      const expected = CATEGORIES.find((category) => category.id === entry.category)?.letter
      expect(entry.code.startsWith(`${expected}-`), `${entry.slug} 的编号应以 ${expected}- 开头`).toBe(true)
    }
  })

  it('每条词条都有对应的 demo，且没有孤儿 demo', () => {
    for (const entry of ENTRIES) {
      expect(hasDemo(entry.slug), `${entry.slug} 缺少 src/demos/${entry.slug}.tsx`).toBe(true)
    }
    const entrySlugs = new Set(ENTRIES.map((entry) => entry.slug))
    const orphans = DEMO_SLUGS.filter((slug) => !entrySlugs.has(slug))
    expect(orphans, `有 demo 但没有词条：${orphans.join(', ')}`).toEqual([])
  })
})

describe('英文覆盖层', () => {
  const translated = ENTRIES.filter((entry) => entry.en)

  it('如果提供了 en，字段要填全、条数对齐、不能有空串', () => {
    for (const entry of translated) {
      const en = entry.en!
      if (en.oneLiner !== undefined) expectFilled(en.oneLiner, `${entry.slug} en.oneLiner`)
      if (en.reducedMotion !== undefined) {
        expectFilled(en.reducedMotion, `${entry.slug} en.reducedMotion`)
      }
      if (en.whenToUse !== undefined) {
        expect(en.whenToUse.length, `${entry.slug} en.whenToUse 条数应与中文一致`).toBe(
          entry.whenToUse.length,
        )
        en.whenToUse.forEach((item, index) => expectFilled(item, `${entry.slug} en.whenToUse[${index}]`))
      }
      if (en.pitfalls !== undefined) {
        expect(en.pitfalls.length, `${entry.slug} en.pitfalls 条数应与中文一致`).toBe(
          entry.pitfalls.length,
        )
      }
      if (en.confusions !== undefined) {
        expect(en.confusions.length, `${entry.slug} en.confusions 条数应与中文一致`).toBe(
          entry.confusions.length,
        )
      }
      if (en.spec !== undefined) {
        expect(en.spec.length, `${entry.slug} en.spec 条数应与中文一致`).toBe(entry.spec.length)
      }
      if (en.controls !== undefined) {
        expect(en.controls.length, `${entry.slug} en.controls 条数应与中文一致`).toBe(
          entry.controls.length,
        )
      }
    }
  })
})
