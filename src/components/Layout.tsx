import { type ReactNode } from 'react'
import { Link, useRoute } from '../lib/router'

const NAV = [
  { to: '/browse', label: '词条库' },
  { to: '/feel', label: '感觉导航' },
  { to: '/cheatsheet', label: '速查表' },
  { to: '/about', label: '怎么用' },
]

export function Layout({ children }: { children: ReactNode }) {
  const route = useRoute()

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line py-4">
        <Link to="/" className="flex items-baseline gap-2 font-display no-underline">
          <span className="text-[15px] font-semibold tracking-tight text-ink">前端设计博物馆</span>
          <span className="hidden font-mono text-[10px] tracking-[0.18em] text-muted sm:inline">
            DESIGN MUSEUM
          </span>
        </Link>
        <nav aria-label="主导航" className="flex items-center gap-3 text-sm">
          {NAV.map((item) => {
            const active = route.path === item.to || route.path.startsWith(`${item.to}/`)
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={`no-underline transition-colors ${
                  active ? 'text-accent' : 'text-muted hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>

      <main className="flex-1 py-8">{children}</main>

      <footer className="flex flex-col gap-2 border-t border-line py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          先给效果起个名字，再让 AI 实现它。词条内容参考 MDN 与 web.dev，欢迎补充。
        </p>
        <a
          href="https://github.com/publieople/design-museum"
          className="font-mono no-underline hover:text-accent"
          target="_blank"
          rel="noreferrer"
        >
          github.com/publieople/design-museum
        </a>
      </footer>
    </div>
  )
}
