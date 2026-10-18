import { describe, expect, it } from 'vitest'
import { ENTRY_META } from '../data/meta'
import { extractProperties, reverseLookup, type ReverseHit } from './reverseLookup'

function slugs(raw: string, limit = 6): string[] {
  return reverseLookup(ENTRY_META, raw, limit).hits.map((hit) => hit.entry.slug)
}

function topHits(raw: string, limit = 6): ReverseHit[] {
  return reverseLookup(ENTRY_META, raw, limit).hits
}

describe('extractProperties', () => {
  it('抽出声明里的属性名并去掉厂商前缀', () => {
    expect(
      extractProperties('-webkit-backdrop-filter: blur(8px);\n  backdrop-filter: blur(8px);'),
    ).toEqual(['backdrop-filter'])
  })

  it('多行声明按出现顺序去重', () => {
    expect(
      extractProperties(
        'scroll-snap-type: x mandatory;\n  transform: translateY(-8px);\n  scroll-snap-type: y proximity;',
      ),
    ).toEqual(['scroll-snap-type', 'transform'])
  })

  it('var()/函数值与自定义属性之外的声明都能识别', () => {
    expect(
      extractProperties(
        'animation-timeline: scroll();\n  animation-range: entry 0% cover 40%;\n  --gap: 12px;',
      ),
    ).toEqual(['animation-timeline', 'animation-range'])
  })

  it('口语描述里没有 CSS 属性', () => {
    expect(extractProperties('半透明磨砂玻璃')).toEqual([])
    expect(extractProperties('a frosted translucent panel')).toEqual([])
  })

  it('空输入不报错', () => {
    expect(extractProperties('')).toEqual([])
    expect(extractProperties('   \n  ')).toEqual([])
  })
})

describe('反查：CSS 声明', () => {
  it('backdrop-filter 命中毛玻璃，并留下命中理由', () => {
    const result = reverseLookup(ENTRY_META, 'backdrop-filter: blur(20px) saturate(140%)')
    expect(result.properties).toEqual(['backdrop-filter'])
    expect(result.hits[0]?.entry.slug).toBe('frosted-glass')
    expect(result.hits[0]?.score).toBeGreaterThan(0)
    expect(result.hits[0]?.reasons).toContainEqual({
      kind: 'css',
      value: 'backdrop-filter',
    })
  })

  it('scroll-snap-type 命中滚动捕捉', () => {
    expect(reverseLookup(ENTRY_META, 'scroll-snap-type: x mandatory').hits[0]?.entry.slug).toBe(
      'scroll-snap',
    )
  })
})

describe('反查：口语描述', () => {
  it('中文口语描述在前 3 条里找到毛玻璃', () => {
    expect(slugs('半透明磨砂玻璃', 3)).toContain('frosted-glass')
  })

  it('英文口语描述命中毛玻璃', () => {
    expect(reverseLookup(ENTRY_META, 'a frosted translucent panel').hits[0]?.entry.slug).toBe(
      'frosted-glass',
    )
  })

  it('乱码不命中', () => {
    expect(reverseLookup(ENTRY_META, 'zzzqqq').hits).toEqual([])
  })
})

describe('反查：边界与排序', () => {
  it('空输入与纯空白没有结果', () => {
    expect(reverseLookup(ENTRY_META, '').hits).toEqual([])
    expect(reverseLookup(ENTRY_META, '   \n  ').hits).toEqual([])
  })

  it('分数在 0–100 之间且按降序排列', () => {
    const hits = topHits('backdrop-filter: blur(20px)')
    expect(hits.length).toBeGreaterThan(0)
    for (const hit of hits) {
      expect(hit.score).toBeGreaterThan(0)
      expect(hit.score).toBeLessThanOrEqual(100)
    }
    const scores = hits.map((hit) => hit.score)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
  })

  it('limit 生效', () => {
    expect(topHits('backdrop-filter: blur(20px)', 2)).toHaveLength(2)
    expect(reverseLookup(ENTRY_META, 'backdrop-filter: blur(20px)', 0).hits).toEqual([])
  })

  it('重复的词条只出现一次', () => {
    const hits = reverseLookup([...ENTRY_META, ...ENTRY_META], 'backdrop-filter: blur(20px)').hits
    const resultSlugs = hits.map((hit) => hit.entry.slug)
    expect(new Set(resultSlugs).size).toBe(resultSlugs.length)
    expect(hits[0]?.entry.slug).toBe('frosted-glass')
  })

  it('理由都是人可读的命中证据', () => {
    for (const hit of topHits('backdrop-filter: blur(20px)')) {
      expect(hit.reasons.length).toBeGreaterThan(0)
      for (const reason of hit.reasons) {
        expect(['css', 'keyword', 'text']).toContain(reason.kind)
        expect(reason.value.length).toBeGreaterThan(0)
      }
    }
  })
})
