import { describe, expect, it } from 'vitest'
import {
  STATIC_PAGES,
  TITLE_KEYS,
  absoluteUrl,
  entryPath,
  hrefFor,
  normalizePath,
  splitTarget,
  stripBase,
  withBase,
} from './routes'

describe('URL 规则', () => {
  it('normalizePath 补前导斜杠、折叠重复斜杠、去尾斜杠', () => {
    expect(normalizePath('browse')).toBe('/browse')
    expect(normalizePath('/browse/')).toBe('/browse')
    expect(normalizePath('//entry//x//')).toBe('/entry/x')
    expect(normalizePath('/')).toBe('/')
  })

  it('withBase 接部署前缀并以目录收尾', () => {
    expect(withBase('/', '/design-museum/')).toBe('/design-museum/')
    expect(withBase('/browse', '/design-museum/')).toBe('/design-museum/browse/')
    expect(withBase('/entry/frosted-glass', '/design-museum/')).toBe(
      '/design-museum/entry/frosted-glass/',
    )
    expect(withBase('/browse', '/')).toBe('/browse/')
  })

  it('stripBase 是 withBase 的反操作', () => {
    expect(stripBase('/design-museum/browse/', '/design-museum/')).toBe('/browse')
    expect(stripBase('/design-museum/', '/design-museum/')).toBe('/')
    expect(stripBase('/browse/', '/')).toBe('/browse')
  })

  it('hrefFor 保留 query，absoluteUrl 补域名', () => {
    expect(hrefFor('/entry/frosted-glass')).toBe('/entry/frosted-glass/')
    expect(hrefFor('/entry/frosted-glass?blur=24')).toBe('/entry/frosted-glass/?blur=24')
    expect(absoluteUrl('/entry/frosted-glass', 'https://example.com')).toBe(
      'https://example.com/entry/frosted-glass/',
    )
    expect(absoluteUrl('/entry/frosted-glass?blur=24', 'https://example.com/')).toBe(
      'https://example.com/entry/frosted-glass/?blur=24',
    )
  })

  it('splitTarget 把路径与 query 分开', () => {
    expect(splitTarget('/a/b?x=1')).toEqual({ path: '/a/b', query: 'x=1' })
    expect(splitTarget('')).toEqual({ path: '/', query: '' })
  })

  it('entryPath 与固定页面表的形状', () => {
    expect(entryPath('frosted-glass')).toBe('/entry/frosted-glass')
    expect(STATIC_PAGES.map((page) => page.path)).toEqual([
      '/',
      '/browse',
      '/feel',
      '/cheatsheet',
      '/about',
    ])
    for (const page of STATIC_PAGES) {
      // path 与 head 必须一致，否则预渲染出来的 HTML 会是另一个页面
      const head = page.path === '/' ? undefined : page.path.slice(1)
      expect(page.head).toBe(head)
      if (page.head) expect(page.titleKey).toBe(TITLE_KEYS[page.head])
      expect(page.descKey.startsWith('seo.')).toBe(true)
    }
  })
})
