import { describe, expect, it } from 'vitest'
import { ENTRIES, findEntry } from './data'
import { LIVE_DEMOS } from './data/live'
import { translate } from './i18n'
import { STATIC_PAGES, entryPath, liveDemoPath } from './lib/routes'
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

  it('每个现场页都渲染出词条名与「为什么需要整页」的说明', async () => {
    const pages = await loadPages()
    for (const demo of LIVE_DEMOS) {
      const entry = findEntry(demo.slug)
      expect(entry, demo.slug).toBeTruthy()
      if (!entry) continue
      const html = renderPage(liveDemoPath(demo.slug), pages)
      expect(html, demo.slug).toContain(entry.nameZh)
      expect(html, demo.slug).toContain(translate('zh', demo.noteKey))
      // 现场页不套站点头尾：不应出现全站页脚的许可行
      expect(html, demo.slug).not.toContain(translate('zh', 'footer.source'))
    }
  })

  it('未知路径渲染成 404，而不是悄悄给首页', async () => {
    const pages = await loadPages()
    const html = renderPage('/nope', pages)
    // 404 用自己的 h1（标题前面还有一个装饰性的大号 404，所以只断言 h1 本身）
    expect(html).toMatch(new RegExp(`<h1 class="[^"]*font-display[^"]*">${translate('zh', 'notFound.title')}</h1>`))
    // 首页正文的标志性说明不该跟着 404 一起出现
    expect(html).not.toContain(translate('zh', 'home.lede'))
  })
}, 30000)
