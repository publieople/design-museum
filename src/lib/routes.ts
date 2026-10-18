import type { StringKey } from '../i18n/strings'

/**
 * URL 是这一站对外的接口。
 *
 * 以前所有页面都塞在 hash 后面（`/#/entry/frosted-glass`），浏览器地址栏一变，
 * 爬虫看到的仍然只有一个空壳——搜索引擎和 AI 爬虫都不会执行 JS，每条词条
 * 对它们等于不存在。现在每个页面都有一个真实的、以 / 结尾的路径，构建时
 * 还会把同样的内容预渲染成静态 HTML（scripts/prerender.mjs）。
 *
 * 这份文件是路径规则的唯一来源：浏览器端路由、分享链接、预渲染脚本都用它。
 */

/** 站点域名。canonical、sitemap、分享链接靠它拼绝对地址 */
export const SITE_ORIGIN = 'https://publieople.github.io'

/**
 * 线上部署前缀。和 BASE_PATH 不同：BASE_PATH 跟着构建环境走（本地开发是 /），
 * 而这份值用来拼「发布出去以后一定成立」的绝对地址——机器可读目录
 * （public/catalog.*、llms.txt）必须与构建环境无关，否则本地生成和 CI 生成的不一样。
 */
export const SITE_BASE = `${SITE_ORIGIN}/design-museum`

/** 部署前缀：GitHub Pages 下是 /design-museum/，本地与测试环境是 / */
export const BASE_PATH: string = import.meta.env.BASE_URL

/** 地址变化的广播名。router 改完地址就广播一次，转场逻辑靠它知道该抓新快照了 */
export const ROUTE_EVENT = 'museum:route'

/** 去掉重复斜杠与结尾斜杠（首页除外）：路径比较与取值都用这个统一形状 */
export function normalizePath(input: string): string {
  const withSlash = input.startsWith('/') ? input : `/${input}`
  const collapsed = withSlash.replace(/\/{2,}/g, '/')
  if (collapsed === '/') return '/'
  return collapsed.replace(/\/+$/, '') || '/'
}

/** 站内路径接上部署前缀，并以 / 结尾——目录索引，省掉 GitHub Pages 的一次 301 */
export function withBase(path: string, base: string = BASE_PATH): string {
  const normalized = normalizePath(path)
  const prefixed = base.endsWith('/') ? base : `${base}/`
  if (normalized === '/') return prefixed
  return `${prefixed}${normalized.slice(1)}/`
}

/** 绝对地址：分享链接、canonical、sitemap 都用它 */
export function absoluteUrl(target: string, origin: string = SITE_ORIGIN): string {
  return `${origin.replace(/\/$/, '')}${hrefFor(target)}`
}

/** 浏览器地址栏里的路径去掉部署前缀，得到站点内部路径 */
export function stripBase(pathname: string, base: string = BASE_PATH): string {
  const prefix = base.endsWith('/') ? base.slice(0, -1) : base
  if (!prefix) return normalizePath(pathname)
  if (pathname === prefix) return '/'
  if (pathname.startsWith(`${prefix}/`)) return normalizePath(pathname.slice(prefix.length))
  return normalizePath(pathname)
}

/** 把 '/entry/x?blur=24' 拆成路径与 query（query 原样保留，不做解析） */
export function splitTarget(target: string): { path: string; query: string } {
  const [pathPart = '', queryPart = ''] = target.split('?')
  return { path: normalizePath(pathPart === '' ? '/' : pathPart), query: queryPart }
}

/** 站内链接的 href：带部署前缀与尾斜杠，query 跟在后面 */
export function hrefFor(target: string): string {
  const { path, query } = splitTarget(target)
  return query ? `${withBase(path)}?${query}` : withBase(path)
}

/** 词条详情页的路径 */
export function entryPath(slug: string): string {
  return `/entry/${slug}`
}

/** 各页面的标题文案键。App 与预渲染脚本共用，避免两处各写一份 */
export const TITLE_KEYS: Record<string, StringKey> = {
  browse: 'titles.browse',
  feel: 'titles.feel',
  cheatsheet: 'titles.cheatsheet',
  about: 'titles.about',
  reverse: 'titles.reverse',
  aliases: 'titles.aliases',
  entry: 'titles.entry',
  debug: 'titles.debug',
}

export interface StaticPage {
  path: string
  head: string | undefined
  titleKey: StringKey | undefined
  /** 预渲染写进 meta description 的键 */
  descKey: StringKey
}

/** 固定页面：预渲染脚本、robots/sitemap 与冒烟测试都按这份表走 */
export const STATIC_PAGES: readonly StaticPage[] = [
  { path: '/', head: undefined, titleKey: undefined, descKey: 'seo.home.desc' },
  { path: '/browse', head: 'browse', titleKey: TITLE_KEYS.browse, descKey: 'seo.browse.desc' },
  { path: '/feel', head: 'feel', titleKey: TITLE_KEYS.feel, descKey: 'seo.feel.desc' },
  {
    path: '/cheatsheet',
    head: 'cheatsheet',
    titleKey: TITLE_KEYS.cheatsheet,
    descKey: 'seo.cheatsheet.desc',
  },
  { path: '/about', head: 'about', titleKey: TITLE_KEYS.about, descKey: 'seo.about.desc' },
  { path: '/reverse', head: 'reverse', titleKey: TITLE_KEYS.reverse, descKey: 'seo.reverse.desc' },
  { path: '/aliases', head: 'aliases', titleKey: TITLE_KEYS.aliases, descKey: 'seo.aliases.desc' },
]
