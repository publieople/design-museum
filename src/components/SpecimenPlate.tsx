import { useMemo } from 'react'
import { DEMO_SHAPES } from '../data/taxonomy'
import type { EntryMeta } from '../data/types'
import { useLocale, useT } from '../i18n'
import { aliasesFor, resolveMeta } from '../lib/localize'
import { shouldAutoLoop, thumbnailIsStill, thumbHintKey } from '../lib/loop'
import { usePrefs } from '../lib/prefs'
import { Link } from '../lib/router'
import { useReplayKey } from '../lib/replay'
import { useInView } from '../lib/viewport'
import { hasDemo } from '../demos/registry'
import { DemoRunner } from './DemoRunner'
import { DemoStage } from './DemoStage'
import { ErrorBoundary } from './ErrorBoundary'
import { resolveStage } from './stageStyles'
import { IconArrowRight } from './icons'

export type SpecimenVariant = 'grid' | 'featured' | 'row'

interface SpecimenPlateProps {
  entry: EntryMeta
  variant?: SpecimenVariant
  /** 缩略演示：默认开启；不在视口里时只挂占位，不挂 demo */
  showDemo?: boolean
}

/**
 * 索引卡片：一张图（活演示）+ 一段图注。
 * 方角、1px 线、无投影；hover 只把线换成半朱红，不位移——
 * 索引页一屏几十张，位移会变成视觉噪音。
 */
export function SpecimenPlate({ entry, variant = 'grid', showDemo = true }: SpecimenPlateProps) {
  const t = useT()
  const locale = useLocale()
  const { stage: stagePref } = usePrefs()
  const { ref, inView } = useInView<HTMLLIElement>({ rootMargin: '240px' })
  const [replayKey, replay] = useReplayKey()

  const resolved = useMemo(() => resolveMeta(entry, locale), [entry, locale])
  const values = useMemo(() => entry.defaults, [entry])
  const aliases = useMemo(() => aliasesFor(resolved.aliases, locale), [resolved.aliases, locale])
  const stage = resolveStage(entry, stagePref)
  const shape = DEMO_SHAPES.find((item) => item.id === entry.demo.shape)
  const shapeLabel = shape ? (locale === 'en' ? shape.label.en : shape.label.zh) : entry.demo.shape

  const title = locale === 'en' ? resolved.nameEn : resolved.nameZh
  const subtitle = locale === 'en' ? resolved.nameZh : resolved.nameEn
  const demo = showDemo && hasDemo(entry.slug)

  const stageNode = demo ? (
    <ErrorBoundary label={entry.slug} message={t('error.renderFailed')}>
      <DemoStage
        compact
        flush
        shape={entry.demo.shape}
        still={thumbnailIsStill(entry)}
        stage={stage}
        loopable={shouldAutoLoop(entry)}
        hint={thumbHintKey(entry)}
        onStageChange={() => {}}
        onReplay={replay}
        className={variant === 'row' ? 'h-full w-full' : ''}
      >
        {inView ? (
          <DemoRunner slug={entry.slug} values={values} stage={stage} replayKey={replayKey} fit />
        ) : null}
      </DemoStage>
    </ErrorBoundary>
  ) : (
    <div aria-hidden="true" className="h-full w-full bg-surface" />
  )

  if (variant === 'row') {
    return (
      <li ref={ref} className="plate plate-interactive group relative flex items-stretch gap-4 p-3">
        <div className="relative hidden h-24 w-32 shrink-0 overflow-hidden rounded-[3px] border border-line sm:block">
          {stageNode}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <div className="flex items-baseline gap-2">
            <span className="stamp">{resolved.code}</span>
            <span className="label-mono">{shapeLabel}</span>
          </div>
          <h3 className="font-display text-h3 leading-tight">
            <Link to={`/entry/${resolved.slug}`} className="text-link text-ink no-underline">
              {title}
              <span className="absolute inset-0" aria-hidden="true" />
            </Link>
          </h3>
          <p className="line-clamp-1 text-caption text-muted">{resolved.oneLiner}</p>
        </div>
        <div className="flex items-center pr-1 text-muted transition-colors group-hover:text-accent">
          <IconArrowRight size={18} />
        </div>
      </li>
    )
  }

  const featured = variant === 'featured'

  return (
    <li ref={ref} className="plate plate-interactive group relative flex flex-col overflow-hidden">
      {demo ? <div className="relative border-b border-line">{stageNode}</div> : null}
      <div className={`flex flex-1 flex-col gap-2 ${featured ? 'p-5' : 'p-4'}`}>
        <div className="flex items-center justify-between gap-3">
          <span className="stamp">{resolved.code}</span>
          <span className="label-mono truncate">{shapeLabel}</span>
        </div>
        <h3
          className={`font-display leading-tight text-ink ${featured ? 'text-h2' : 'text-h3'}`}
        >
          <Link to={`/entry/${resolved.slug}`} className="no-underline">
            {title}
            <span className="absolute inset-0" aria-hidden="true" />
          </Link>
        </h3>
        {subtitle !== title ? <p className="label-mono -mt-1 truncate">{subtitle}</p> : null}
        <p className={`text-caption text-muted ${featured ? 'line-clamp-3' : 'line-clamp-2'}`}>
          {resolved.oneLiner}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <p className="truncate font-mono text-[11px] text-muted">
            {aliases.slice(0, 2).join(' / ')}
          </p>
          <span className="shrink-0 text-muted transition-colors group-hover:text-accent">
            <IconArrowRight size={16} />
          </span>
        </div>
      </div>
    </li>
  )
}