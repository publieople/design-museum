import { afterEach, describe, expect, it, vi } from 'vitest'
import { isPathChange, normalizeLegacyHash, parseRoute } from './router'

describe('路由', () => {
  it('路径分段与 query 分开解析', () => {
    const route = parseRoute('/entry/frosted-glass?blur=24&stage=photo')
    expect(route.path).toBe('/entry/frosted-glass')
    expect(route.segments).toEqual(['entry', 'frosted-glass'])
    expect(route.query.get('blur')).toBe('24')
  })

  it('空地址当首页', () => {
    expect(parseRoute('').path).toBe('/')
    expect(parseRoute('/').segments).toEqual([])
  })

  it('路径变了才播转场，改 query 不播', () => {
    expect(isPathChange('/browse', '/entry/toast')).toBe(true)
    expect(isPathChange('/browse?cat=visual', '/browse')).toBe(false)
    expect(isPathChange('/', '/')).toBe(false)
  })

  describe('老 hash 链接', () => {
    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('挂载前换成真实路径，query 保留', () => {
      const replaceState = vi.fn()
      vi.stubGlobal('window', {
        location: { hash: '#/entry/frosted-glass?blur=24', pathname: '/', search: '' },
        history: { replaceState },
      })
      normalizeLegacyHash()
      expect(replaceState).toHaveBeenCalledWith(null, '', '/entry/frosted-glass/?blur=24')
    })

    it('不是 hash 地址就不动地址栏', () => {
      const replaceState = vi.fn()
      vi.stubGlobal('window', {
        location: { hash: '', pathname: '/browse/', search: '' },
        history: { replaceState },
      })
      normalizeLegacyHash()
      expect(replaceState).not.toHaveBeenCalled()
    })
  })
})
