import { Suspense, useEffect } from 'react'
import { Layout } from './components/Layout'
import { ToastProvider } from './components/Toast'
import { translate } from './i18n'
import { lazyWithRetry } from './lib/lazyWithRetry'
import { pageFor } from './lib/pageFor'
import { PrefsProvider, usePrefs } from './lib/prefs'
import { useRoute } from './lib/router'
import { TITLE_KEYS } from './lib/routes'
import { ROUTE_MODULES, type PageComponents } from './pages/routeModules'

// 路由级分包：首页不该把速查表、冒烟页连同全部 demo 一起下载。
// 加载器表只有一份（src/pages/routeModules.ts），预渲染脚本用的是同一份。
// 走 lazyWithRetry：部署后旧 HTML 引用的 chunk 会 404，这时刷新一次能自愈。
const PAGES = {
  home: lazyWithRetry(ROUTE_MODULES.home),
  browse: lazyWithRetry(ROUTE_MODULES.browse),
  entry: lazyWithRetry(ROUTE_MODULES.entry),
  feel: lazyWithRetry(ROUTE_MODULES.feel),
  cheatsheet: lazyWithRetry(ROUTE_MODULES.cheatsheet),
  about: lazyWithRetry(ROUTE_MODULES.about),
  reverse: lazyWithRetry(ROUTE_MODULES.reverse),
  aliases: lazyWithRetry(ROUTE_MODULES.aliases),
  liveIndex: lazyWithRetry(ROUTE_MODULES.liveIndex),
  liveDetail: lazyWithRetry(ROUTE_MODULES.liveDetail),
  debug: lazyWithRetry(ROUTE_MODULES.debug),
} satisfies PageComponents

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

function Routes() {
  const route = useRoute()
  const { locale } = usePrefs()
  const [head, param] = route.segments
  // 调试台一次挂满全部 demo，只在开发构建里存在。
  // 生产环境它算未知路由：页面给 NotFound，标题也不许自称"冒烟测试"。
  const devOnly = head === 'debug' && !import.meta.env.DEV
  // 现场页自己写标题（要带词条名），别让外壳盖成「现场演示」
  const liveDetail = head === 'live' && Boolean(param)

  useEffect(() => {
    // 必须显式 'instant'：html 上有 scroll-behavior: smooth，
    // behavior: 'auto' 会被解析成「跟随 CSS」，于是变成平滑滚动——
    // 转场拍到的是滚到一半的画面，转完还要接着滚。
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [route.path])

  useEffect(() => {
    // 现场页的标题由页面自己写（要带词条名），这里别用站点标题盖掉它
    if (liveDetail) return
    const base = translate(locale, 'site.name')
    const titleKey = head && !devOnly ? TITLE_KEYS[head] : undefined
    document.title = titleKey
      ? `${translate(locale, titleKey)} · ${base}`
      : `${base} · ${translate(locale, 'site.tagline')}`
  }, [head, devOnly, liveDetail, locale])

  return <Suspense fallback={<RouteFallback />}>{pageFor(head, param, PAGES, devOnly)}</Suspense>
}

/**
 * 现场页（/live/<slug>）不套站点头尾：页面本身就是演示。
 * /live/ 索引仍然走正常外壳。
 */
function Shell() {
  const route = useRoute()
  const [head, param] = route.segments
  if (head === 'live' && param) return <Routes />
  return (
    <Layout>
      <Routes />
    </Layout>
  )
}

export default function App() {
  return (
    <PrefsProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </PrefsProvider>
  )
}