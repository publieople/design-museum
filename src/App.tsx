import { lazy, Suspense, useEffect } from 'react'
import { Layout } from './components/Layout'
import { ToastProvider } from './components/Toast'
import { PrefsProvider, usePrefs } from './lib/prefs'
import { translate } from './i18n'
import { Link, useRoute } from './lib/router'
import type { StringKey } from './i18n'

// 路由级分包：首页不该把速查表、冒烟页连同 30 个 demo 一起下载
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })))
const BrowsePage = lazy(() => import('./pages/BrowsePage').then((m) => ({ default: m.BrowsePage })))
const EntryDetailPage = lazy(() =>
  import('./pages/EntryDetailPage').then((m) => ({ default: m.EntryDetailPage })),
)
const FeelPage = lazy(() => import('./pages/FeelPage').then((m) => ({ default: m.FeelPage })))
const CheatSheetPage = lazy(() =>
  import('./pages/CheatSheetPage').then((m) => ({ default: m.CheatSheetPage })),
)
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const DebugAllPage = lazy(() =>
  import('./pages/DebugAllPage').then((m) => ({ default: m.DebugAllPage })),
)

const TITLES: Record<string, StringKey> = {
  browse: 'titles.browse',
  feel: 'titles.feel',
  cheatsheet: 'titles.cheatsheet',
  about: 'titles.about',
  entry: 'titles.entry',
  debug: 'titles.debug',
}

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" aria-busy="true">
      <span
        className="h-2 w-24 rounded-full bg-line"
        style={{ animation: 'museum-pulse 1.4s ease-in-out infinite' }}
      />
    </div>
  )
}

function NotFound() {
  const { locale } = usePrefs()
  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="font-display text-2xl font-semibold">{translate(locale, 'notFound.title')}</h1>
      <p className="text-sm text-muted">
        {translate(locale, 'notFound.desc')}
        <Link to="/" className="mx-1 text-accent no-underline">
          {translate(locale, 'notFound.home')}
        </Link>
      </p>
    </div>
  )
}

function Routes() {
  const route = useRoute()
  const { locale } = usePrefs()
  const [head, param] = route.segments

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [route.path])

  useEffect(() => {
    const base = translate(locale, 'site.name')
    const titleKey = head ? TITLES[head] : undefined
    document.title = titleKey
      ? `${translate(locale, titleKey)} · ${base}`
      : `${base} · ${translate(locale, 'site.tagline')}`
  }, [head, locale])

  let page
  switch (head) {
    case undefined:
      page = <HomePage />
      break
    case 'browse':
      page = <BrowsePage />
      break
    case 'entry':
      page = <EntryDetailPage key={param} slug={param} />
      break
    case 'feel':
      page = <FeelPage />
      break
    case 'cheatsheet':
      page = <CheatSheetPage />
      break
    case 'about':
      page = <AboutPage />
      break
    case 'debug':
      page = <DebugAllPage />
      break
    default:
      page = <NotFound />
  }

  return <Suspense fallback={<RouteFallback />}>{page}</Suspense>
}

export default function App() {
  return (
    <PrefsProvider>
      <ToastProvider>
        <Layout>
          <Routes />
        </Layout>
      </ToastProvider>
    </PrefsProvider>
  )
}
