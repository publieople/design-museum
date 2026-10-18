import type { ComponentType } from 'react'

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
  liveIndex: () => import('./LiveIndexPage').then((m) => ({ default: m.LiveIndexPage })),
  liveDetail: () => import('./LivePage').then((m) => ({ default: m.LivePage })),
  debug: () => import('./DebugAllPage').then((m) => ({ default: m.DebugAllPage })),
} satisfies { [K in keyof PageComponents]: () => Promise<{ default: PageComponents[K] }> }