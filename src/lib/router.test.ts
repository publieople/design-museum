import { describe, expect, it } from 'vitest'
import { isPathChange, parseHash } from './router'

describe('路由', () => {
  it('路径分段与 query 分开解析', () => {
    const route = parseHash('#/entry/frosted-glass?blur=24&stage=photo')
    expect(route.path).toBe('/entry/frosted-glass')
    expect(route.segments).toEqual(['entry', 'frosted-glass'])
    expect(route.query.get('blur')).toBe('24')
  })

  it('空 hash 当首页', () => {
    expect(parseHash('').path).toBe('/')
  })

  it('路径变了才播转场，改 query 不播', () => {
    expect(isPathChange('#/browse', '/entry/toast')).toBe(true)
    expect(isPathChange('#/browse?cat=visual', '/browse')).toBe(false)
    expect(isPathChange('#/', '/')).toBe(false)
  })
})
