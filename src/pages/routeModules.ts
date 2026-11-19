import type { ComponentType } from 'react'
import { NotFound } from '../components/NotFound'

/** 页面组件在这两处被用到：浏览器的懒加载、预渲染的同步渲染 */
export type PageComponent = ComponentType<{ slug?: string }>

export interface PageComponents {
  home: PageComponent
  browse: PageComponent
  entry: PageComponent
  feel: PageComponent
  cheatsheet: PageComponent
  about: PageComponent
  reverse: PageComponent
  aliases: PageComponent
  compare: PageComponent
  liveIndex: PageComponent
  liveDetail: PageComponent
  debug: PageComponent
}

/**
 * 路由级分包的唯一来源。
 *
 * 首页不该把速查表、冒烟页连同全部 demo 一起下载，所以每个页面都是一条
 * 动态 import；预渲染脚本则先 await 这些加载器、再同步渲染——React.lazy 在
 * 同步渲染里只会吐骨架，拿不到正文。
 */
export const ROUTE_MODULES = {
  home: () => import('./HomePage').then((m) => ({ default: m.HomePage })),
  browse: () => import('./BrowsePage').then((m) => ({ default: m.BrowsePage })),
  entry: () => import('./EntryDetailPage').then((m) => ({ default: m.EntryDetailPage })),
  feel: () => import('./FeelPage').then((m) => ({ default: m.FeelPage })),
  cheatsheet: () => import('./CheatSheetPage').then((m) => ({ default: m.CheatSheetPage })),
  about: () => import('./AboutPage').then((m) => ({ default: m.AboutPage })),
  reverse: () => import('./ReversePage').then((m) => ({ default: m.ReversePage })),
  aliases: () => import('./AliasesPage').then((m) => ({ default: m.AliasesPage })),
  compare: () => import('./ComparePage').then((m) => ({ default: m.ComparePage })),
  liveIndex: () => import('./LiveIndexPage').then((m) => ({ default: m.LiveIndexPage })),
  liveDetail: () => import('./LivePage').then((m) => ({ default: m.LivePage })),
  // 调试台只在开发构建里存在：生产构建把这条动态 import 摇掉，不再产出死 chunk。
  // 预渲染时 loadPages 仍需要一个 debug 占位组件，给 NotFound 即可（NotFound 本来就在主包里，
  // 这里再用动态 import 只会让打包器报 INEFFECTIVE_DYNAMIC_IMPORT）。
  debug: import.meta.env.DEV
    ? () => import('./DebugAllPage').then((m) => ({ default: m.DebugAllPage }))
    : () => Promise.resolve({ default: NotFound }),
} satisfies { [K in keyof PageComponents]: () => Promise<{ default: PageComponents[K] }> }