import { type ReactNode } from 'react'
import { useT } from '../i18n'
import { Link, useRoute } from '../lib/router'
import { SettingsMenu } from './SettingsMenu'

/** 以「看展品」为主的页面放宽外壳；以「读文字」为主的页面保持易读行宽 */
const WIDE_ROUTES = new Set(['browse', 'feel', 'cheatsheet', 'debug'])

export function Layout({ children }: { children: ReactNode }) {
  const t = useT()
  const route = useRoute()
  const wide = WIDE_ROUTES.has(route.segments[0] ?? '')
  const shell = wide ? 'max-w-[90rem]' : 'max-w-5xl'

  const nav = [
    { to: '/browse', label: t('nav.browse') },
    { to: '/feel', label: t('nav.feel') },
    { to: '/cheatsheet', label: t('nav.cheatsheet') },
    { to: '/about', label: t('nav.about') },
  ]

  // 粘性头部要通栏（不然只有中间一条有底色，两侧内容会从旁边穿过去），
  // 所以外壳拆成三层：header 通栏、里面各自居中限宽。样式在 global.css 的 .site-header。
  return (
    <div className="flex min-h-screen flex-col">
      <header className="site-header backdrop-blur-md backdrop-saturate-150">
        <div
          className={`mx-auto flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-1.5 px-4 py-2.5 sm:gap-x-4 sm:px-6 sm:py-3.5 ${shell}`}
        >
          <Link to="/" className="flex items-baseline gap-2 font-display no-underline">
            <span className="text-[15px] font-semibold tracking-tight text-ink">
              {t('site.name')}
            </span>
            <span className="hidden font-mono text-[10px] tracking-[0.18em] text-muted sm:inline">
              {t('site.latin')}
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <nav
              aria-label="main"
              className="flex items-center gap-2 text-[13px] sm:gap-3 sm:text-sm"
            >
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
        </div>
      </header>

      <main className={`mx-auto w-full flex-1 px-4 py-8 sm:px-6 ${shell}`}>{children}</main>

      <footer
        className={`mx-auto flex w-full flex-col gap-2 border-t border-line px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 ${shell}`}
      >
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
