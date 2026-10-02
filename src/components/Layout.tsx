import { type ReactNode } from 'react'
import { useT } from '../i18n'
import { Link, useRoute } from '../lib/router'
import { SettingsMenu } from './SettingsMenu'

export function Layout({ children }: { children: ReactNode }) {
  const t = useT()
  const route = useRoute()

  const nav = [
    { to: '/browse', label: t('nav.browse') },
    { to: '/feel', label: t('nav.feel') },
    { to: '/cheatsheet', label: t('nav.cheatsheet') },
    { to: '/about', label: t('nav.about') },
  ]

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line py-4">
        <Link to="/" className="flex items-baseline gap-2 font-display no-underline">
          <span className="text-[15px] font-semibold tracking-tight text-ink">{t('site.name')}</span>
          <span className="hidden font-mono text-[10px] tracking-[0.18em] text-muted sm:inline">
            {t('site.latin')}
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <nav aria-label="main" className="flex items-center gap-3 text-sm">
            {nav.map((item) => {
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
          <SettingsMenu />
        </div>
      </header>

      <main className="flex-1 py-8">{children}</main>

      <footer className="flex flex-col gap-2 border-t border-line py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>{t('site.footer')}</p>
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
