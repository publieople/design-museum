import { useEffect, useState, type ReactNode } from 'react'
import { useT } from '../i18n'
import { useHeaderHidden } from '../lib/headerScroll'
import { Link, useRoute } from '../lib/router'
import { useModal } from '../lib/useModal'
import { Kbd } from './Meta'
import { SearchDialog } from './SearchDialog'
import { SettingsMenu } from './SettingsMenu'
import { IconClose, IconMenu, IconSearch } from './icons'

/** 外壳宽度：索引与工具页放宽，阅读页由页面自己收窄 */
const SHELL = 'max-w-[88rem]'

interface NavItem {
  to: string
  label: string
}

function isActive(path: string, to: string): boolean {
  return path === to || path.startsWith(`${to}/`)
}

/**
 * 全站外壳：报头（wordmark / 索引导航 / 搜索 / 设置）、主栏、页脚。
 * 移动端导航收进右侧抽屉；搜索在桌面是按钮，移动端是图标。
 */
export function Layout({ children }: { children: ReactNode }) {
  const t = useT()
  const route = useRoute()
  const [headerHidden, setHeaderHidden] = useHeaderHidden()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRef = useModal(drawerOpen, () => setDrawerOpen(false))

  const nav: NavItem[] = [
    { to: '/browse', label: t('nav.browse') },
    { to: '/reverse', label: t('nav.reverse') },
    { to: '/aliases', label: t('nav.aliases') },
    { to: '/feel', label: t('nav.feel') },
    { to: '/cheatsheet', label: t('nav.cheatsheet') },
  ]

  // 路由一变就把覆盖层收掉，别让抽屉跨页留着。
  // 这是同步外部系统（路由），不是从 props 派生 state，故显式豁免该规则。
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    setDrawerOpen(false)
    setSearchOpen(false)
  }, [route.path])

  // ⌘K / Ctrl+K 打开全站搜索；斜杠留给页面里的搜索框
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      setSearchOpen((prev) => !prev)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-ink focus:bg-raised focus:px-3 focus:py-2 focus:text-caption"
      >
        {t('nav.skip')}
      </a>

      <header
        className="site-header sticky top-0 z-40 border-b border-line backdrop-blur-md"
        data-hidden={headerHidden && !settingsOpen && !drawerOpen ? 'true' : undefined}
        onFocusCapture={() => setHeaderHidden(false)}
      >
        <div
          className={`mx-auto flex h-14 w-full items-center justify-between gap-4 px-5 sm:px-8 ${SHELL}`}
        >
          <Link to="/" className="flex shrink-0 items-baseline gap-2 font-display no-underline">
            <span className="text-[15px] font-semibold tracking-tight text-ink">
              {t('site.name')}
            </span>
            <span className="hidden font-mono text-[10px] tracking-[0.18em] text-muted sm:inline">
              {t('site.latin')}
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <nav aria-label={t('nav.menu')} className="hidden items-center gap-1 md:flex">
              {nav.map((item) => {
                const active = isActive(route.path, item.to)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    className={`border-b-2 px-2 py-1 text-[13px] no-underline transition-colors ${
                      active
                        ? 'border-accent text-accent'
                        : 'border-transparent text-ink-2 hover:border-line-strong hover:text-ink'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-[2px] border border-line px-2 py-1.5 text-[12px] text-ink-2 transition-colors hover:border-ink hover:text-ink"
              aria-label={t('nav.search')}
            >
              <IconSearch size={14} />
              <span className="hidden sm:inline">{t('nav.search')}</span>
              <span className="hidden sm:inline">
                <Kbd>⌘K</Kbd>
              </span>
            </button>

            <div className="hidden md:block">
              <SettingsMenu onOpenChange={setSettingsOpen} />
            </div>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={t('nav.menu')}
              aria-expanded={drawerOpen}
              className="cursor-pointer rounded-[2px] border border-line p-1.5 text-ink-2 transition-colors hover:border-ink hover:text-ink md:hidden"
            >
              <IconMenu size={16} />
            </button>
          </div>
        </div>
      </header>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-[var(--overlay)]"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu')}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex w-[min(20rem,86vw)] flex-col overflow-y-auto border-l border-ink bg-raised px-5 py-4 focus:outline-none"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="label-mono">{t('nav.menu')}</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label={t('nav.close')}
                className="cursor-pointer rounded-[2px] p-1 text-muted transition-colors hover:text-accent"
              >
                <IconClose size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setDrawerOpen(false)
                setSearchOpen(true)
              }}
              className="mb-4 flex w-full cursor-pointer items-center gap-2 border border-line-strong px-3 py-2 text-left text-caption text-ink-2 transition-colors hover:border-ink hover:text-ink"
            >
              <IconSearch size={15} />
              {t('nav.search')}
            </button>

            <nav aria-label={t('nav.menu')} className="flex flex-col border-t border-line">
              {[...nav, { to: '/about', label: t('nav.about') }].map((item) => {
                const active = isActive(route.path, item.to)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    className={`border-b border-line py-3 font-display text-[17px] no-underline ${
                      active ? 'text-accent' : 'text-ink hover:text-accent'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="mt-4">
              <SettingsMenu onOpenChange={setSettingsOpen} inDrawer />
            </div>

            <div className="mt-auto flex flex-col gap-2 border-t border-line pt-4 font-mono text-[11px] text-muted">
              <Link to="/about" className="no-underline hover:text-accent">
                {t('site.license')}
              </Link>
              <a
                href="https://github.com/publieople/design-museum"
                target="_blank"
                rel="noreferrer"
                className="no-underline hover:text-accent"
              >
                github.com/publieople/design-museum
              </a>
            </div>
          </aside>
        </div>
      ) : null}

      <main id="main" className={`mx-auto w-full flex-1 px-5 py-8 sm:px-8 ${SHELL}`}>
        {children}
      </main>

      <footer className="mt-8 border-t-2 border-ink">
        <div
          className={`mx-auto grid w-full gap-6 px-5 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 ${SHELL}`}
        >
          <div className="flex flex-col gap-1">
            <span className="font-display text-[15px] font-semibold text-ink">{t('site.name')}</span>
            <span className="font-mono text-[10px] tracking-[0.18em] text-muted">
              {t('site.latin')}
            </span>
            <span className="mt-1 max-w-[30ch] text-caption text-muted">{t('site.footer')}</span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="label-mono">{t('footer.index')}</span>
            <Link to="/browse" className="text-caption text-ink-2 no-underline hover:text-accent">
              {t('nav.browse')}
            </Link>
            <Link to="/aliases" className="text-caption text-ink-2 no-underline hover:text-accent">
              {t('nav.aliases')}
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <span className="label-mono">{t('footer.tools')}</span>
            <Link to="/reverse" className="text-caption text-ink-2 no-underline hover:text-accent">
              {t('nav.reverse')}
            </Link>
            <Link to="/feel" className="text-caption text-ink-2 no-underline hover:text-accent">
              {t('nav.feel')}
            </Link>
            <Link
              to="/cheatsheet"
              className="text-caption text-ink-2 no-underline hover:text-accent"
            >
              {t('nav.cheatsheet')}
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <span className="label-mono">{t('footer.source')}</span>
            <Link to="/about" className="text-caption text-ink-2 no-underline hover:text-accent">
              {t('site.license')}
            </Link>
            <a
              href="https://github.com/publieople/design-museum"
              target="_blank"
              rel="noreferrer"
              className="text-caption text-ink-2 no-underline hover:text-accent"
            >
              github.com/publieople/design-museum
            </a>
          </div>
        </div>
      </footer>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
