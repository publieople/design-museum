import { afterEach, describe, expect, it, vi } from 'vitest'
import { PREF_DEFAULTS, PREFS_STORAGE_KEY, loadPrefs } from './prefs'

function stubWindow(raw: string | null) {
  const store = new Map<string, string>()
  if (raw !== null) store.set(PREFS_STORAGE_KEY, raw)
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

describe('偏好读取', () => {
  it('没有存过就用默认值', () => {
    stubWindow(null)
    expect(loadPrefs()).toEqual(PREF_DEFAULTS)
  })

  it('坏 JSON 不会把站点搞崩', () => {
    stubWindow('{ 这不是 json')
    expect(loadPrefs()).toEqual(PREF_DEFAULTS)
  })

  it('非对象也走默认值', () => {
    stubWindow('"字符串"')
    expect(loadPrefs()).toEqual(PREF_DEFAULTS)
  })

  it('只接受合法取值，非法字段逐个回退', () => {
    stubWindow(
      JSON.stringify({ theme: 'neon', locale: 'fr', stage: 'rainbow', slow: 'yes', loop: true }),
    )
    expect(loadPrefs()).toEqual({ ...PREF_DEFAULTS, loop: true })
  })

  it('合法取值原样读回', () => {
    stubWindow(
      JSON.stringify({ theme: 'dark', locale: 'en', stage: 'photo', slow: true, loop: true }),
    )
    expect(loadPrefs()).toEqual({ theme: 'dark', locale: 'en', stage: 'photo', slow: true, loop: true })
  })

  it('站点主题与展品背景是分开的两个字段', () => {
    stubWindow(JSON.stringify({ theme: 'light', stage: 'dark' }))
    const prefs = loadPrefs()
    expect(prefs.theme).toBe('light')
    expect(prefs.stage).toBe('dark')
  })
})
