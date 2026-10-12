import { describe, expect, it } from 'vitest'
import { ENTRIES } from './data'
import { translate } from './i18n'
import { STATIC_PAGES, entryPath } from './lib/routes'
import { loadPages, renderPage } from './prerenderApp'

describe('预渲染', () => {
  it('每个固定页面都渲染出自己的正文', async () => {
    const pages = await loadPages()
    for (const page of STATIC_PAGES) {
      const html = renderPage(page.path, pages)
      if (page.titleKey) expect(html, page.path).toContain(translate('zh', page.titleKey))
      else expect(html, page.path).toContain(translate('zh', 'site.tagline'))
    }
  })

  it('每条词条都渲染出自己的名字（不是空舞台）', async () => {
    const pages = await loadPages()
    for (const entry of ENTRIES) {
      const html = renderPage(entryPath(entry.slug), pages)
      expect(html, entry.slug).toContain(entry.nameZh)
    }
  })

  it('未知路径渲染成 404，而不是悄悄给首页', async () => {
    const pages = await loadPages()
    const html = renderPage('/nope', pages)
    expect(html).toContain(`<h1 class="font-display text-2xl font-semibold">${translate('zh', 'notFound.title')}</h1>`)
    // 首页的大标题有自己的一套字号，404 里不该出现
    expect(html).not.toContain('text-display mt-3')
  })
}, 30000)
