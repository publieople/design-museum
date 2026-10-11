import {
  useCallback,
  useMemo,
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { ROUTE_EVENT, hrefFor, splitTarget, stripBase } from './routes'
import { withRouteTransition } from './viewTransition'

export interface Route {
  /** 不含 query 的路径，如 "/entry/frosted-glass" */
  path: string
  /** 路径分段，如 ["entry", "frosted-glass"] */
  segments: string[]
  /** ?stage=dark&blur=12 */
  query: URLSearchParams
}

/** 预渲染（Node 里没有 location）时的当前地址，由 setServerRoute 写入 */
let serverPath = '/'

/** 预渲染脚本在 renderToStaticMarkup 之前调它，让 useRoute 拿到正在渲染的那条路径 */
export function setServerRoute(path: string) {
  serverPath = path
}

/**
 * 当前地址的站点内部形态，如 "/entry/frosted-glass?blur=24"。
 * 老链接（#/entry/...）优先认 hash，因为浏览器的 hash 不会随 pushState 变化——
 * 只有页面确实是从 hash 进来的那一次才会命中。
 */
function currentTarget(): string {
  if (typeof window === 'undefined') return serverPath
  const { hash, pathname, search } = window.location
  if (hash.startsWith('#/')) return hash.slice(1) || '/'
  return `${stripBase(pathname)}${search}`
}

function subscribe(onChange: () => void) {
  window.addEventListener(ROUTE_EVENT, onChange)
  // 前进/后退只发 popstate，不发我们自己的事件
  window.addEventListener('popstate', onChange)
  return () => {
    window.removeEventListener(ROUTE_EVENT, onChange)
    window.removeEventListener('popstate', onChange)
  }
}

export function parseRoute(target: string): Route {
  const { path, query } = splitTarget(target)
  return {
    path,
    segments: path.split('/').filter(Boolean),
    query: new URLSearchParams(query),
  }
}

export function useRoute(): Route {
  const target = useSyncExternalStore(subscribe, currentTarget, () => serverPath)
  return useMemo(() => parseRoute(target), [target])
}

/** 两次地址的「路径」是否不同（query 不算） */
export function isPathChange(from: string, to: string): boolean {
  return parseRoute(from).path !== parseRoute(to).path
}

export function navigate(to: string, options: { replace?: boolean } = {}) {
  const href = hrefFor(to)
  // 只有路径真的变了才播转场：同一个页面里改 query（筛选项、参数）不播
  if (isPathChange(currentTarget(), to)) {
    withRouteTransition(() => commit(href, options))
    return
  }
  commit(href, options)
}

function commit(href: string, options: { replace?: boolean }) {
  if (options.replace) window.history.replaceState(null, '', href)
  else window.history.pushState(null, '', href)
  // pushState/replaceState 不发事件，手动广播一次让订阅者同步
  window.dispatchEvent(new Event(ROUTE_EVENT))
}

/**
 * 把老链接（#/entry/frosted-glass?blur=24）在挂载前换成干净的路径地址。
 * README、issue 模板、历史分享链接都还是 hash 形态，它们得继续能用。
 */
export function normalizeLegacyHash() {
  if (typeof window === 'undefined') return
  const { hash } = window.location
  if (!hash.startsWith('#/')) return
  const { path, query } = parseRoute(hash.slice(1) || '/')
  const qs = query.toString()
  window.history.replaceState(null, '', hrefFor(qs ? `${path}?${qs}` : path))
}

/** 在保留当前路径的前提下改写 query（筛选项、舞台背景等） */
export function useQueryUpdater() {
  return useCallback((patch: Record<string, string | null>, path?: string) => {
    const route = parseRoute(currentTarget())
    const next = new URLSearchParams(route.query)
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    }
    const qs = next.toString()
    navigate(`${path ?? route.path}${qs ? `?${qs}` : ''}`, { replace: true })
  }, [])
}

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
  children: ReactNode
}

export function Link({ to, children, onClick, ...rest }: LinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (event.button !== 0) return
    event.preventDefault()
    navigate(to)
  }

  // href 是真实路径（带部署前缀与尾斜杠）：中键、右键「复制链接」拿到的都能直接打开
  return (
    <a href={hrefFor(to)} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
