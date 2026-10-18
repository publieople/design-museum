import { useEffect, type ReactNode } from 'react'
import { findLiveDemo, liveNeighbours } from '../data/live'
import { ENTRY_META } from '../data/meta'
import { useLocale, useT } from '../i18n'
import { usePrefersReducedMotion } from '../lib/motion'
import { Link, navigate } from '../lib/router'
import { entryPath, liveDemoPath } from '../lib/routes'
import { IconArrowRight } from './icons'

/**
 * 现场页外壳：没有站点头尾，只有一条浮动导航。
 * 页面正文由演示自己占满；标题（h1）在这里以视觉隐藏的形式存在，
 * 演示组件里的巨幅标题一律用 h2 / p，避免一页两个 h1。
 */
export function LiveShell({
  slug,
  children,
}: {
  slug: string
  children: ReactNode
}) {
  const t = useT()
  const locale = useLocale()
  const demo = findLiveDemo(slug)
  const entry = ENTRY_META.find((item) => item.slug === slug)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      navigate(entryPath(slug))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [slug])

  if (!demo || !entry) return null
  const { prev, next } = liveNeighbours(demo.slug)

  return (
    <div className="min-h-svh bg-canvas text-ink">
      <a
        href="#live-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:border focus:border-ink focus:bg-raised focus:px-3 focus:py-2 focus:text-caption"
      >
        {t('nav.skip')}
      </a>

      <h1 className="sr-only">
        {entry.nameZh} · {t('live.badge')}
      </h1>

      <main id="live-main">{children}</main>

      <nav
        aria-label={t('live.badge')}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 sm:justify-start sm:px-4 sm:pb-4"
      >
        <div className="pointer-events-auto flex max-w-[calc(100vw-1.5rem)] flex-wrap items-center gap-x-3 gap-y-1.5 border border-line-strong bg-raised px-3 py-2 font-mono text-[11px] shadow-[var(--shadow-overlay)]">
          <Link
            to={entryPath(entry.slug)}
            className="no-underline text-ink-2 hover:text-accent"
            aria-label={t('live.backEntry')}
          >
            ← {t('live.backEntry')}
          </Link>
          <span aria-hidden="true" className="hidden text-line-strong sm:inline">
            |
          </span>
          <span className="hidden text-muted sm:inline">{t('live.badge')}</span>
          <span className="font-semibold text-ink">{entry.code}</span>
          <span className="text-ink">{locale === 'en' ? entry.nameEn : entry.nameZh}</span>
          {locale === 'en' ? null : (
            <span className="hidden text-muted md:inline">{entry.nameEn}</span>
          )}
          {reduced ? <span className="text-accent">{t('live.reduced')}</span> : null}

          <span aria-hidden="true" className="mx-1 hidden text-line-strong sm:inline">
            |
          </span>
          <Link
            to={liveDemoPath(prev.slug)}
            aria-label={t('live.prev')}
            title={t('live.prev')}
            className="flex items-center gap-1 no-underline text-ink-2 hover:text-accent"
          >
            <IconArrowRight size={13} className="rotate-180" />
          </Link>
          <Link
            to={liveDemoPath(next.slug)}
            aria-label={t('live.next')}
            title={t('live.next')}
            className="flex items-center gap-1 no-underline text-ink-2 hover:text-accent"
          >
            <IconArrowRight size={13} />
          </Link>
          <Link
            to="/live"
            className="ml-1 border border-line px-1.5 py-0.5 no-underline text-muted hover:border-ink hover:text-ink"
          >
            {t('live.index')}
          </Link>
          <span className="hidden text-muted lg:inline">{t('live.closeHint')}</span>
        </div>
      </nav>
    </div>
  )
}