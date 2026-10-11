import type { ReactElement } from 'react'
import { NotFound } from '../components/NotFound'
import type { PageComponents } from '../pages/routeModules'

/**
 * 「路径 → 页面元素」的唯一映射：浏览器端（App.tsx）与预渲染脚本共用它，
 * 免得两边的路由表各写一份然后慢慢长歪。
 *
 * devOnly 为真表示调试台在当前构建里不存在，它算未知路由。
 */
export function pageFor(
  head: string | undefined,
  param: string | undefined,
  pages: PageComponents,
  devOnly: boolean,
): ReactElement {
  switch (head) {
    case undefined:
      return <pages.home />
    case 'browse':
      return <pages.browse />
    case 'entry':
      return <pages.entry key={param} slug={param} />
    case 'feel':
      return <pages.feel />
    case 'cheatsheet':
      return <pages.cheatsheet />
    case 'about':
      return <pages.about />
    case 'debug':
      return devOnly ? <NotFound /> : <pages.debug />
    default:
      return <NotFound />
  }
}
