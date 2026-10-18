import { describe, expect, it } from 'vitest'
import { findEntry } from '../data'
import { translate } from '../i18n'
import { LIVE_DEMOS, LIVE_GROUPS, findLiveDemo, hasLiveDemo, liveNeighbours } from './live'
import { LIVE_MODULES } from '../livedemos/registry'

describe('现场页注册表', () => {
  it('slug 唯一、都能对上一条真实词条', () => {
    const slugs = LIVE_DEMOS.map((demo) => demo.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const demo of LIVE_DEMOS) {
      expect(findEntry(demo.slug), `${demo.slug} 没有对应词条`).toBeTruthy()
      expect(hasLiveDemo(demo.slug)).toBe(true)
    }
  })

  it('每个现场页都有说明文案，且中英文都不为空', () => {
    for (const demo of LIVE_DEMOS) {
      for (const locale of ['zh', 'en'] as const) {
        const text = translate(locale, demo.noteKey)
        expect(text.length, `${demo.slug} 的 ${locale} 说明是空的`).toBeGreaterThan(8)
      }
    }
  })

  it('分组声明与演示所属分组一致', () => {
    const ids = LIVE_GROUPS.map((group) => group.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const group of LIVE_GROUPS) {
      expect(translate('zh', group.titleKey).length).toBeGreaterThan(0)
      expect(translate('en', group.titleKey).length).toBeGreaterThan(0)
    }
    for (const demo of LIVE_DEMOS) {
      expect(ids, `${demo.slug} 的分组 ${demo.group} 没在 LIVE_GROUPS 里`).toContain(demo.group)
    }
  })

  it('每个现场页都有懒加载入口', () => {
    for (const demo of LIVE_DEMOS) {
      expect(typeof LIVE_MODULES[demo.slug], `${demo.slug} 缺少 livedemos 组件`).toBe('function')
    }
  })

  it('findLiveDemo 只认已登记的 slug', () => {
    expect(findLiveDemo('scroll-driven')?.slug).toBe('scroll-driven')
    expect(findLiveDemo('not-a-live-demo')).toBeUndefined()
    expect(findLiveDemo(undefined)).toBeUndefined()
    expect(hasLiveDemo('not-a-live-demo')).toBe(false)
  })

  it('上一个 / 下一个首尾相接', () => {
    const first = LIVE_DEMOS[0]
    const last = LIVE_DEMOS[LIVE_DEMOS.length - 1]
    expect(liveNeighbours(first.slug).prev.slug).toBe(last.slug)
    expect(liveNeighbours(last.slug).next.slug).toBe(first.slug)
  })
})
