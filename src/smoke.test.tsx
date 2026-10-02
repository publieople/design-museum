import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ENTRIES, findEntry } from './data'
import { defaultValues } from './lib/controls'
import { demoLoader, hasDemo } from './demos/registry'
import { STAGES } from './data/taxonomy'
import { PrefsProvider, PREF_DEFAULTS, type Prefs } from './lib/prefs'
import { ToastProvider } from './components/Toast'
import { AboutPage } from './pages/AboutPage'
import { BrowsePage } from './pages/BrowsePage'
import { CheatSheetPage } from './pages/CheatSheetPage'
import { DebugAllPage } from './pages/DebugAllPage'
import { EntryDetailPage } from './pages/EntryDetailPage'
import { FeelPage } from './pages/FeelPage'
import { HomePage } from './pages/HomePage'

/**
 * 没有浏览器时的渲染冒烟：任何页面或 demo 在渲染期抛错都会在这里被抓住。
 * 效果本身好不好看仍然需要人眼验收。
 *
 * 页面直接 import（不经过 App 的 lazy），这样页面本身同步渲染；
 * 页面里那些懒加载的 demo 会走各自的 Suspense 骨架，不会卡住测试。
 */
function render(node: React.ReactElement, prefs: Partial<Prefs> = {}) {
  return renderToString(
    <PrefsProvider initial={{ ...PREF_DEFAULTS, ...prefs }}>
      <ToastProvider>{node}</ToastProvider>
    </PrefsProvider>,
  )
}

describe('页面渲染冒烟', () => {
  it('首页（中文）', () => {
    const html = render(<HomePage />)
    expect(html).toContain('先给效果起个名字')
    expect(html).toContain('五个展厅')
  })

  it('首页（英文）', () => {
    const html = render(<HomePage />, { locale: 'en' })
    expect(html).toContain('Name the effect first')
    expect(html).toContain('Five halls')
  })

  it('词条库 / 感觉导航 / 速查表 / 怎么用 / 冒烟页', () => {
    expect(render(<BrowsePage />)).toContain('词条库')
    expect(render(<FeelPage />)).toContain('感觉导航')
    expect(render(<CheatSheetPage />)).toContain('速查表')
    expect(render(<AboutPage />)).toContain('怎么用这份词典')
    expect(render(<AboutPage />, { locale: 'en' })).toContain('How to use this glossary')
    expect(render(<DebugAllPage />)).toContain('冒烟测试')
  })

  it('每条词条的详情页都能渲染，并带上复制给 AI 的出口', () => {
    for (const entry of ENTRIES) {
      const html = render(<EntryDetailPage slug={entry.slug} />)
      expect(html, entry.slug).toContain(entry.nameZh)
      expect(html, `${entry.slug} 的详情页应包含需求句区块`).toContain('复制给 AI')
      expect(html, `${entry.slug} 的详情页应包含分享链接`).toContain('复制分享链接')
    }
  })

  it('英文界面下详情页是英文外壳', () => {
    const html = render(<EntryDetailPage slug="frosted-glass" />, { locale: 'en' })
    expect(html).toContain('Copy for your AI')
    expect(html).toContain('Not to be confused with')
  })

  it('找不到的词条给出友好提示', () => {
    expect(render(<EntryDetailPage slug="not-a-real-entry" />)).toContain('没有这件展品')
    expect(render(<EntryDetailPage slug="not-a-real-entry" />, { locale: 'en' })).toContain(
      'No such specimen',
    )
  })
})

describe('demo 渲染冒烟', () => {
  it.each(ENTRIES.map((entry) => [entry.slug, entry] as const))(
    '%s 在四种舞台下都能渲染，并且是懒加载的',
    async (slug, entry) => {
      expect(hasDemo(slug), `${slug} 缺少 demo`).toBe(true)
      const loader = demoLoader(slug)
      expect(loader).toBeTruthy()
      if (!loader) return

      const mod = await loader()
      const Demo = mod.default
      const values = defaultValues(entry)
      for (const stage of STAGES) {
        const html = renderToString(<Demo values={values} stage={stage.id} replayKey={0} />)
        expect(html.length, `${slug} 在 ${stage.id} 舞台下渲染为空`).toBeGreaterThan(0)
      }
    },
  )

  it('词条一律能被找到', () => {
    for (const entry of ENTRIES) {
      expect(findEntry(entry.slug)?.code).toBe(entry.code)
    }
  })
})
