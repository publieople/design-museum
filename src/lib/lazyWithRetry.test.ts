import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RELOAD_FLAG, retryingLoader } from './lazyWithRetry'

const component = () => null

function stubBrowser(options: { throwing?: boolean } = {}) {
  const store = new Map<string, string>()
  const reload = vi.fn()
  const sessionStorage = options.throwing
    ? undefined
    : {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
        removeItem: (key: string) => store.delete(key),
      }
  vi.stubGlobal('window', { sessionStorage, location: { reload } })
  return { store, reload }
}

beforeEach(() => {
  vi.unstubAllGlobals()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('chunk 加载失败时自愈', () => {
  it('第一次失败会刷新一次，并且不再往下抛错', async () => {
    const { reload } = stubBrowser()
    const loader = retryingLoader(() => Promise.reject(new Error('Failed to fetch dynamically imported module')))

    // 不 resolve 也不 reject：刷新期间挂住
    const pending = loader()
    await Promise.resolve()
    expect(reload).toHaveBeenCalledTimes(1)
    const settled = await Promise.race([pending.then(() => 'resolved'), Promise.resolve('pending')])
    expect(settled).toBe('pending')
  })

  it('已经刷新过还失败，就把错误抛出去（避免刷新死循环）', async () => {
    const { store, reload } = stubBrowser()
    store.set(RELOAD_FLAG, '1')
    const loader = retryingLoader(() => Promise.reject(new Error('still broken')))

    await expect(loader()).rejects.toThrow('still broken')
    expect(reload).not.toHaveBeenCalled()
  })

  it('加载成功会清掉标记，下一次部署还能再自愈一次', async () => {
    const { store, reload } = stubBrowser()
    store.set(RELOAD_FLAG, '1')
    const loader = retryingLoader(() => Promise.resolve({ default: component }))

    await loader()
    expect(store.has(RELOAD_FLAG)).toBe(false)
    expect(reload).not.toHaveBeenCalled()
  })

  it('隐私模式下拿不到 sessionStorage 时，不刷新而是老实报错', async () => {
    const { reload } = stubBrowser({ throwing: true })
    const loader = retryingLoader(() => Promise.reject(new Error('no storage')))

    await expect(loader()).rejects.toThrow('no storage')
    expect(reload).not.toHaveBeenCalled()
  })
})
