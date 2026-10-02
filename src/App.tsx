import { useEffect } from 'react'
import { Layout } from './components/Layout'
import { ToastProvider } from './components/Toast'
import { Link, useRoute } from './lib/router'
import { AboutPage } from './pages/AboutPage'
import { BrowsePage } from './pages/BrowsePage'
import { CheatSheetPage } from './pages/CheatSheetPage'
import { DebugAllPage } from './pages/DebugAllPage'
import { EntryDetailPage } from './pages/EntryDetailPage'
import { FeelPage } from './pages/FeelPage'
import { HomePage } from './pages/HomePage'

const TITLES: Record<string, string> = {
  browse: '词条库',
  feel: '感觉导航',
  cheatsheet: '速查表',
  about: '怎么用',
  entry: '展品',
  debug: '冒烟测试',
}

function NotFound() {
  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="font-display text-2xl font-semibold">这里没有展品</h1>
      <p className="text-sm text-muted">
        地址可能写错了。回
        <Link to="/" className="mx-1 text-accent no-underline">
          首页
        </Link>
        重新开始。
      </p>
    </div>
  )
}

function Routes() {
  const route = useRoute()
  const [head, param] = route.segments

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [route.path])

  useEffect(() => {
    const base = '前端设计博物馆'
    const name = head ? TITLES[head] : undefined
    document.title = name ? `${name} · ${base}` : `${base} · 先给效果起个名字，再让 AI 实现它`
  }, [head])

  switch (head) {
    case undefined:
      return <HomePage />
    case 'browse':
      return <BrowsePage />
    case 'entry':
      return <EntryDetailPage key={param} slug={param} />
    case 'feel':
      return <FeelPage />
    case 'cheatsheet':
      return <CheatSheetPage />
    case 'about':
      return <AboutPage />
    case 'debug':
      return <DebugAllPage />
    default:
      return <NotFound />
  }
}

export default function App() {
  return (
    <ToastProvider>
      <Layout>
        <Routes />
      </Layout>
    </ToastProvider>
  )
}
