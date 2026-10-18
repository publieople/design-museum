import { describe, expect, it } from 'vitest'
import { ENTRY_META } from '../data/meta'
import type { CategoryId, EntryMeta } from '../data/types'
import { resolveConfusionTarget } from './confusions'

type Seed = Pick<EntryMeta, 'slug' | 'nameZh' | 'nameEn'> & {
  code?: string
  category?: CategoryId
  aliases?: string[]
}

/** 只写命名相关的字段，其余按最小合法值补齐，测试才看得清在测什么 */
function makeEntry({ slug, nameZh, nameEn, code = 'M-01', category = 'motion', aliases = [] }: Seed): EntryMeta {
  return {
    slug,
    code,
    nameZh,
    nameEn,
    aliases,
    category,
    oneLiner: '',
    whenToUse: [],
    confusions: [],
    pitfalls: [],
    keywords: [],
    scenes: [],
    feel: [],
    intent: [],
    tags: [],
    demo: { shape: 'stage' },
    defaults: {},
  }
}

const frosted = makeEntry({
  slug: 'frosted-glass',
  code: 'V-01',
  nameZh: '毛玻璃',
  nameEn: 'Frosted Glass',
  aliases: ['磨砂玻璃', '毛玻璃效果', 'backdrop blur'],
})
const glassmorphism = makeEntry({
  slug: 'glassmorphism',
  code: 'V-02',
  nameZh: '玻璃拟态',
  nameEn: 'Glassmorphism',
  aliases: ['玻璃态', 'glass UI'],
})
const entries = [frosted, glassmorphism]

describe('易混项名称解析', () => {
  it('中文正式名精确命中', () => {
    expect(resolveConfusionTarget('毛玻璃', entries)).toBe(frosted)
    expect(resolveConfusionTarget('玻璃拟态', entries)).toBe(glassmorphism)
  })

  it('英文正式名命中，大小写不敏感', () => {
    expect(resolveConfusionTarget('Frosted Glass', entries)).toBe(frosted)
    expect(resolveConfusionTarget('FROSTED GLASS', entries)).toBe(frosted)
    expect(resolveConfusionTarget('glassmorphism', entries)).toBe(glassmorphism)
  })

  it('别名命中', () => {
    expect(resolveConfusionTarget('磨砂玻璃', entries)).toBe(frosted)
    expect(resolveConfusionTarget('毛玻璃效果', entries)).toBe(frosted)
    expect(resolveConfusionTarget('backdrop blur', entries)).toBe(frosted)
  })

  it('全角空格、前后空白与标点容错', () => {
    expect(resolveConfusionTarget('\u3000毛玻璃\u3000', entries)).toBe(frosted)
    expect(resolveConfusionTarget(' Frosted\u3000Glass ', entries)).toBe(frosted)
    // normalizeText 会去掉连字符，所以写对英文名的连字符形式也能命中
    expect(resolveConfusionTarget('frosted-glass', entries)).toBe(frosted)
    expect(resolveConfusionTarget('磨砂玻璃。', entries)).toBe(frosted)
    expect(resolveConfusionTarget('（玻璃拟态）', entries)).toBe(glassmorphism)
  })

  it('未命中返回 null，不抛错', () => {
    // 数据里真实存在、但站内没有词条的概念
    expect(resolveConfusionTarget('半透明', entries)).toBeNull()
    expect(resolveConfusionTarget('模糊滤镜 blur()', entries)).toBeNull()
    expect(resolveConfusionTarget('hover 换底色', entries)).toBeNull()
    expect(resolveConfusionTarget('', entries)).toBeNull()
    expect(resolveConfusionTarget('   ', entries)).toBeNull()
    expect(resolveConfusionTarget('——', entries)).toBeNull()
    expect(resolveConfusionTarget('毛玻璃', [])).toBeNull()
    expect(() => resolveConfusionTarget('不存在的名字', entries)).not.toThrow()
  })

  it('只做精确匹配，不做包含或模糊匹配', () => {
    expect(resolveConfusionTarget('玻璃', entries)).toBeNull()
    expect(resolveConfusionTarget('frosted', entries)).toBeNull()
    expect(resolveConfusionTarget('毛玻璃效果预览', entries)).toBeNull()
  })

  it('正式名优先于别名：别名先出现也不抢', () => {
    const named = makeEntry({ slug: 'named', code: 'V-03', nameZh: '玻璃', nameEn: 'Glass' })
    const aliased = makeEntry({
      slug: 'aliased',
      code: 'V-04',
      nameZh: '别的',
      nameEn: 'Other',
      aliases: ['玻璃'],
    })
    expect(resolveConfusionTarget('玻璃', [aliased, named])).toBe(named)
  })
})

describe('真实词条数据', () => {
  it('毛玻璃 / frosted glass / 磨砂玻璃 都解析到 V-01', () => {
    for (const label of ['毛玻璃', 'frosted glass', 'FROSTED  GLASS', '磨砂玻璃']) {
      expect(resolveConfusionTarget(label, ENTRY_META)?.slug, label).toBe('frosted-glass')
    }
  })

  it('全站 confusions.with 都能安全解析：命中就是真实词条，未命中就是 null', () => {
    const slugs = new Set(ENTRY_META.map((entry) => entry.slug))
    let resolved = 0
    for (const entry of ENTRY_META) {
      for (const item of entry.confusions) {
        const target = resolveConfusionTarget(item.with, ENTRY_META)
        if (target === null) continue
        resolved += 1
        expect(slugs.has(target.slug), item.with).toBe(true)
      }
    }
    // 至少「毛玻璃」这几条能跳转，助手不是摆设
    expect(resolved).toBeGreaterThan(0)
  })
})
