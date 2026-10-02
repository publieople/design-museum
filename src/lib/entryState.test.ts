import { afterEach, describe, expect, it, vi } from 'vitest'
import { findEntry } from '../data'
import { defaultValues } from './controls'
import {
  buildEntryQuery,
  clearTunedValues,
  parseEntryState,
  readTunedValues,
  valuesForSheet,
  writeTunedValues,
} from './entryState'

const entry = findEntry('frosted-glass')!

function stubStorage() {
  const store = new Map<string, string>()
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    },
  })
  return store
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('URL 状态', () => {
  it('空 query 用默认值', () => {
    const state = parseEntryState(entry, new URLSearchParams(''))
    expect(state.values).toEqual(defaultValues(entry))
    expect(state.stage).toBeNull()
  })

  it('只把与默认值不同的参数写进 URL', () => {
    const values = { ...defaultValues(entry), blur: 24 }
    expect(buildEntryQuery(entry, values, null)).toBe('blur=24')
  })

  it('参数与舞台能往返', () => {
    const values = { ...defaultValues(entry), blur: 24, saturate: 200 }
    const query = buildEntryQuery(entry, values, 'photo')
    const parsed = parseEntryState(entry, new URLSearchParams(query))
    expect(parsed.values.blur).toBe(24)
    expect(parsed.values.saturate).toBe(200)
    expect(parsed.stage).toBe('photo')
  })

  it('越界的数值会被夹回控件范围', () => {
    expect(parseEntryState(entry, new URLSearchParams('blur=999')).values.blur).toBe(30)
  })

  it('非法 stage 当作没给', () => {
    expect(parseEntryState(entry, new URLSearchParams('stage=rainbow')).stage).toBeNull()
  })

  it('toggle 用 1/0 表示', () => {
    const toggleEntry = findEntry('sticky-header')!
    const values = { ...defaultValues(toggleEntry), hide: false }
    expect(buildEntryQuery(toggleEntry, values, null)).toContain('hide=0')
    expect(parseEntryState(toggleEntry, new URLSearchParams('hide=0')).values.hide).toBe(false)
  })
})

describe('记住调过的参数', () => {
  it('写进去能读回来', () => {
    stubStorage()
    writeTunedValues(entry.slug, { blur: 20 })
    expect(readTunedValues(entry.slug)).toEqual({ blur: 20 })
  })

  it('速查表拿到的是调过的值，缺的字段用默认值补齐', () => {
    stubStorage()
    writeTunedValues(entry.slug, { blur: 18 })
    const values = valuesForSheet(entry)
    expect(values.blur).toBe(18)
    expect(values.saturate).toBe(defaultValues(entry).saturate)
  })

  it('没调过就是默认值', () => {
    stubStorage()
    expect(valuesForSheet(entry)).toEqual(defaultValues(entry))
  })

  it('坏数据不会污染参数', () => {
    stubStorage()
    writeTunedValues(entry.slug, { blur: '不是数字' as never })
    expect(valuesForSheet(entry).blur).toBe(defaultValues(entry).blur)
  })

  it('清空后回到默认值', () => {
    stubStorage()
    writeTunedValues(entry.slug, { blur: 20 })
    clearTunedValues()
    expect(readTunedValues(entry.slug)).toBeNull()
  })
})
