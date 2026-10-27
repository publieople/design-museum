import { Suspense, useEffect, useMemo } from 'react'
import { findLiveDemo } from '../data/live'
import { ENTRY_META } from '../data/meta'
import { useLocale, useT, type Translate } from '../i18n'
import { useIsClient } from '../lib/useIsClient'
import { usePrefersReducedMotion } from '../lib/motion'
import { lazyWithRetry } from '../lib/lazyWithRetry'
import { resolveMeta } from '../lib/localize'
import { liveDemoLoader } from '../livedemos/registry'
import { LiveShell } from '../components/LiveShell'
import { NotFound } from '../components/NotFound'

function Cover({
  t,
  code,
  nameZh,
  nameEn,
  oneLiner,
  note,
  reduced,
}: {
  t: Translate
  code: string
  nameZh: string
  nameEn: string
  oneLiner: string
  note: string
  reduced: boolean
}) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[88rem] flex-col justify-between gap-16 px-5 pb-28 pt-16 sm:px-8">
      <div className="flex flex-col gap-5">
        <p className="label-mono text-accent">
          {t('live.badge')} · {code} · {nameEn}
        </p>
        <p className="max-w-[16ch] font-display text-display font-semibold leading-[1.06] text-ink">
          {nameZh}
        </p>
        <p className="max-w-[52ch] text-body text-ink-2">{oneLiner}</p>
        <p className="max-w-[58ch] border-l-2 border-accent pl-4 text-caption text-ink-2">
          {note}
        </p>
        {reduced ? <p className="font-mono text-[11px] text-accent">{t('live.reduced')}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4 font-mono text-[11px] text-muted">
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 bg-accent"
          style={{ animation: 'museum-pulse 1.4s ease-in-out infinite' }}
        />
        <span>{t('live.loading')}</span>
        <span className="ml-auto">{t('live.scrollHint')} ↓</span>
      </div>
    </div>
  )
}

/**
 * 现场页：/live/<slug>/。页面本身就是演示，外壳只有浮动导航。
 *
 * 预渲染与首帧由静态封面承担（标题、说明、返回链接都在），客户端挂载后
 * 再把整页演示渲染出来——滚动类演示要读 window，SSR 里没有意义。
 */
export function LivePage({ slug }: { slug?: string }) {
  const t = useT()
  const locale = useLocale()
  const isClient = useIsClient()
  const reduced = usePrefersReducedMotion()
  const demo = findLiveDemo(slug)
  const meta = slug ? ENTRY_META.find((item) => item.slug === slug) : undefined
  const loader = slug ? liveDemoLoader(slug) : undefined
  const Demo = useMemo(() => (loader ? lazyWithRetry(loader) : null), [loader])

  useEffect(() => {
    if (!meta) return
    document.title = `${meta.nameZh} · ${t('live.badge')} · ${t('site.name')}`
  }, [meta, t])

  if (!demo || !meta || !loader || !Demo) {
    return (
      <div className="mx-auto w-full max-w-[88rem] px-5 py-12 sm:px-8">
        <NotFound />
      </div>
    )
  }

  const resolved = resolveMeta(meta, locale)
  const cover = (
    <Cover
      t={t}
      code={meta.code}
      nameZh={meta.nameZh}
      nameEn={meta.nameEn}
      oneLiner={resolved.oneLiner}
      note={t(demo.noteKey)}
      reduced={reduced}
    />
  )

  return (
    <LiveShell slug={demo.slug}>
      {isClient ? (
        <Suspense fallback={cover}>
          {/* oxlint-disable-next-line react/static-components -- lazy component is created once per slug */}
          <Demo />
        </Suspense>
      ) : (
        cover
      )}
    </LiveShell>
  )
}
