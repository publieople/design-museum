import {
  useCallback,
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'

export interface Route {
  /** 不含 query 的路径，如 "/entry/frosted-glass" */
  path: string
  /** 路径分段，如 ["entry", "frosted-glass"] */
  segments: string[]
  /** ?stage=dark&blur=12 */
  query: URLSearchParams
}

const EMPTY_HASH = '#/'

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function getHash() {
  return window.location.hash || EMPTY_HASH
}

/** 非浏览器环境下的稳定快照，避免读到 undefined */
function getServerHash() {
  return EMPTY_HASH
}

export function parseHash(hash: string): Route {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  const [pathPart = '/', queryPart = ''] = raw.split('?')
  const path = pathPart === '' ? '/' : pathPart
  return {
    path,
    segments: path.split('/').filter(Boolean),
    query: new URLSearchParams(queryPart),
  }
}

export function useRoute(): Route {
  return parseHash(useSyncExternalStore(subscribe, getHash, getServerHash))
}

export function navigate(to: string, options: { replace?: boolean } = {}) {
  const target = to.startsWith('/') ? to : `/${to}`
  if (options.replace) {
    const url = `${window.location.pathname}${window.location.search}#${target}`
    window.history.replaceState(null, '', url)
    // replaceState 不触发 hashchange，手动广播一次让订阅者同步
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    return
  }
  window.location.hash = target
}

/** 在保留当前路径的前提下改写 query（筛选项、舞台背景等） */
export function useQueryUpdater() {
  return useCallback((patch: Record<string, string | null>, path?: string) => {
    const route = parseHash(getHash())
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

  return (
    <a href={`#${to.startsWith('/') ? to : `/${to}`}`} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
