import { LIVE_DEMOS, LIVE_GROUPS } from '../data/live'
import { ENTRY_META } from '../data/meta'
import { useT } from '../i18n'
import { useLocale } from '../i18n'
import { resolveMeta } from '../lib/localize'
import { Link } from '../lib/router'
import { liveDemoPath } from '../lib/routes'
import { IconArrowUpRight } from '../components/icons'
import { PageHeader } from '../components/PageHeader'
import { Rule } from '../components/Meta'

const META_BY_SLUG = new Map(ENTRY_META.map((entry) => [entry.slug, entry]))

/**
 * 现场演示索引：/live/。按「为什么需要整页」分组，每组一条墨线压住。
 * 这里不放缩略 demo——整页效果塞进卡片就又是「盒子里的演示」了，
 * 只给名字、说明和入口。
 */
export function LiveIndexPage() {
  const t = useT()
  const locale = useLocale()

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        kicker={t('live.badge')}
        title={t('titles.live')}
        lede={t('live.lede')}
        meta={<span>{t('live.count', { n: LIVE_DEMOS.length })}</span>}
      />

      <p className="max-w-[64ch] text-caption text-ink-2">{t('live.indexLede')}</p>

      {LIVE_GROUPS.map((group) => {
        const rows = LIVE_DEMOS.filter((demo) => demo.group === group.id)
        if (rows.length === 0) return null
        return (
          <section key={group.id} className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-h3 text-ink">{t(group.titleKey)}</h2>
              <span className="label-mono">{rows.length}</span>
            </div>
            <Rule variant="strong" />
            <ul className="grid gap-4 md:grid-cols-2">
              {rows.map((demo) => {
                const meta = META_BY_SLUG.get(demo.slug)
                if (!meta) return null
                const resolved = resolveMeta(meta, locale)
                return (
                  <li key={demo.slug} className="h-full">
                    <Link
                      to={liveDemoPath(demo.slug)}
                      className="group flex h-full flex-col gap-2 border border-line bg-raised p-5 no-underline transition-colors hover:border-line-strong hover:bg-surface"
                    >
                      <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
                        <span className="stamp">{meta.code}</span>
                        <span>{meta.nameEn}</span>
                        <IconArrowUpRight
                          size={14}
                          className="ml-auto text-muted transition-colors group-hover:text-accent"
                        />
                      </div>
                      <h3 className="font-display text-h3 text-ink">{meta.nameZh}</h3>
                      <p className="text-caption text-ink-2">{resolved.oneLiner}</p>
                      <p className="mt-1 border-t border-dashed border-line pt-2 text-caption text-muted">
                        {t(demo.noteKey)}
                      </p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
