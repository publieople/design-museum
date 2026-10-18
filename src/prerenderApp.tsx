import { renderToStaticMarkup } from 'react-dom/server'
import { Layout } from './components/Layout'
import { ToastProvider } from './components/Toast'
import { PrefsProvider } from './lib/prefs'
import { pageFor } from './lib/pageFor'
import { parseRoute, setServerRoute } from './lib/router'
import { ROUTE_MODULES, type PageComponents } from './pages/routeModules'

/**
 * 预渲染入口。只在 Node 里跑（scripts/prerender.mjs 通过 vite ssrLoadModule 加载）：
 * 先把每个页面模块 await 成真组件，再用 renderToStaticMarkup 同步渲染成 HTML，
 * 塞进 dist 里对应路径的 index.html。浏览器侧不水合，仍用 createRoot 重新渲染
 * （localStorage 里的主题/语言和 SSR 默认值可能不同，水合只会带来错配）。
 */

export async function loadPages(): Promise<PageComponents> {
  const [home, browse, entry, feel, cheatsheet, about, reverse, aliases, debug] = await Promise.all([
    ROUTE_MODULES.home(),
    ROUTE_MODULES.browse(),
    ROUTE_MODULES.entry(),
    ROUTE_MODULES.feel(),
    ROUTE_MODULES.cheatsheet(),
    ROUTE_MODULES.about(),
    ROUTE_MODULES.reverse(),
    ROUTE_MODULES.aliases(),
    ROUTE_MODULES.debug(),
  ])
  return {
    home: home.default,
    browse: browse.default,
    entry: entry.default,
    feel: feel.default,
    cheatsheet: cheatsheet.default,
    about: about.default,
    reverse: reverse.default,
    aliases: aliases.default,
    debug: debug.default,
  }
}

export function renderPage(target: string, pages: PageComponents): string {
  // useRoute 在读不到 location 时用这个值当快照，Layout 的宽窄与 aria-current 靠它
  setServerRoute(target)
  const route = parseRoute(target)
  const [head, param] = route.segments
  return renderToStaticMarkup(
    <PrefsProvider>
      <ToastProvider>
        <Layout>{pageFor(head, param, pages, false)}</Layout>
      </ToastProvider>
    </PrefsProvider>,
  )
}
