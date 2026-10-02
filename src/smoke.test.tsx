import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ENTRIES, findEntry } from './data'
import { defaultValues } from './lib/controls'
import { demoFor } from './demos/registry'
import { STAGES } from './data/taxonomy'
import { ToastProvider } from './components/Toast'
import { EntryDetailPage } from './pages/EntryDetailPage'
import { HomePage } from './pages/HomePage'
import { BrowsePage } from './pages/BrowsePage'
import { FeelPage } from './pages/FeelPage'
import { CheatSheetPage } from './pages/CheatSheetPage'
import { AboutPage } from './pages/AboutPage'
import { DebugAllPage } from './pages/DebugAllPage'

/**
 * 没有浏览器时的渲染冒烟：任何页面或 demo 在渲染期抛错都会在这里被抓住。
 * 效果本身好不好看仍然需要人眼验收。
 */
function render(node: React.ReactElement): string {
  return renderToString(<ToastProvider>{node}</ToastProvider>)
}

describe('页面渲染冒烟', () => {
  it('首页', () => {
    expect(render(<HomePage />)).toContain('前端设计博物馆')
  })

  it('词条库 / 感觉导航 / 速查表 / 怎么用 / 冒烟页', () => {
    expect(render(<BrowsePage />)).toContain('词条库')
    expect(render(<FeelPage />)).toContain('感觉导航')
    expect(render(<CheatSheetPage />)).toContain('速查表')
    expect(render(<AboutPage />)).toContain('怎么用这份词典')
    expect(render(<DebugAllPage />)).toContain('冒烟测试')
  })

  it('每条词条的详情页都能渲染', () => {
    for (const entry of ENTRIES) {
      const html = render(<EntryDetailPage slug={entry.slug} />)
      expect(html, entry.slug).toContain(entry.nameZh)
      expect(html, `${entry.slug} 的详情页应包含中文需求句`).toContain('复制给 AI')
    }
  })

  it('找不到的词条给出友好提示', () => {
    expect(render(<EntryDetailPage slug="not-a-real-entry" />)).toContain('没有这件展品')
  })
})

describe('demo 渲染冒烟', () => {
  it.each(ENTRIES.map((entry) => [entry.slug, entry] as const))(
    '%s 在四种舞台下都能渲染',
    (slug, entry) => {
      const Demo = demoFor(slug)
      expect(Demo, `${slug} 缺少 demo`).toBeTruthy()
      if (!Demo) return
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
