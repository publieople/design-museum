import { useMemo, useState } from 'react'
import { ENTRY_META } from '../data/meta'
import { useLocale, useT } from '../i18n'
import { resolveMeta } from '../lib/localize'
import { reverseLookup, type ReverseReason, type ReverseResult } from '../lib/reverseLookup'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'
import { buttonClass } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { Tag } from '../components/Meta'
import { PageHeader } from '../components/PageHeader'

/** 把占位文案拆成两条可命中的示例：第一行是 CSS，第二行去掉口语连接词 */
function exampleFromPlaceholder(placeholder: string): { css: string; text: string } {
  const [first = '', second = ''] = placeholder.split('\n')
  return {
    css: first.trim(),
    text: second.replace(/^[^：:]{1,12}[：:]\s*/, '').trim(),
  }
}

const REASON_KEY = {
  css: 'reverse.whyCss',
  keyword: 'reverse.whyKeyword',
  text: 'reverse.whyText',
} as const

function ReasonList({ reasons }: { reasons: ReverseReason[] }) {
  const t = useT()
  return (
    <ul className="flex flex-wrap gap-1.5">
      {reasons.map((reason) => (
        <li key={`${reason.kind}:${reason.value}`}>
          <Tag>{t(REASON_KEY[reason.kind], { x: reason.value })}</Tag>
        </li>
      ))}
    </ul>
  )
}

export function ReversePage() {
  const t = useT()
  const locale = useLocale()
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState('')
  const result: ReverseResult | null = useMemo(
    () => (submitted ? reverseLookup(ENTRY_META, submitted) : null),
    [submitted],
  )

  const example = exampleFromPlaceholder(t('reverse.placeholder'))

  function run(raw: string) {
    setInput(raw)
    setSubmitted(raw.trim())
  }

  function clear() {
    setInput('')
    setSubmitted('')
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t('titles.reverse')} lede={t('reverse.lede')} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        {/* 输入舱：左边贴代码或口语描述，右边立刻给排名 */}
        <section className="plate flex flex-col gap-3 p-4 lg:sticky lg:top-20 lg:self-start">
          <label htmlFor="reverse-input" className="label-mono">
            {t('reverse.inputLabel')}
          </label>
          <textarea
            id="reverse-input"
            value={input}
            rows={6}
            placeholder={t('reverse.placeholder')}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault()
                run(input)
              }
            }}
            className="well min-h-[12rem] w-full resize-y bg-surface p-3 font-mono text-[13px] leading-relaxed text-ink outline-none placeholder:text-muted focus:border-accent"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => run(example.css)}
              className={buttonClass({ variant: 'secondary', size: 'sm' })}
            >
              {t('reverse.exampleCss')}
            </button>
            <button
              type="button"
              onClick={() => run(example.text)}
              className={buttonClass({ variant: 'secondary', size: 'sm' })}
            >
              {t('reverse.exampleText')}
            </button>
            <button
              type="button"
              onClick={() => run(input)}
              className={buttonClass({ variant: 'primary', size: 'sm' })}
            >
              {t('reverse.submit')}
            </button>
            <button
              type="button"
              onClick={clear}
              className={buttonClass({ variant: 'ghost', size: 'sm' })}
            >
              {t('reverse.clear')}
            </button>
          </div>
          <p className="text-micro text-muted">{t('reverse.hint')}</p>
        </section>

        <section className="flex min-w-0 flex-col gap-6">
          {result === null ? (
            <EmptyState
              title={t('reverse.empty')}
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Link to="/browse" className={buttonClass({ variant: 'secondary', size: 'sm' })}>
                    {t('reverse.tryBrowse')}
                  </Link>
                  <Link to="/feel" className={buttonClass({ variant: 'secondary', size: 'sm' })}>
                    {t('reverse.tryFeel')}
                  </Link>
                </div>
              }
            />
          ) : (
            <>
              {result.properties.length > 0 ? (
                <div className="flex flex-col gap-2 border-b border-line pb-4">
                  <p className="label-mono">{t('reverse.detected', { n: result.properties.length })}</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {result.properties.map((property) => (
                      <li key={property}>
                        <Tag>{property}</Tag>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {result.hits.length > 0 ? (
                <>
                  <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
                    <p className="label-mono">{t('reverse.results', { n: result.hits.length })}</p>
                    <p className="font-mono text-[10px] text-muted">{t('reverse.rank')}</p>
                  </div>
                  <ol className="flex flex-col gap-3">
                    {result.hits.map((hit, index) => {
                      const meta = resolveMeta(hit.entry, locale)
                      return (
                        <li key={hit.entry.slug} className="plate flex flex-col gap-3 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 flex-col gap-1">
                              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                <span className="font-mono text-[11px] tabular-nums text-accent">
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                                <h2 className="font-display text-h3 font-semibold text-ink">
                                  {meta.nameZh}
                                </h2>
                                <span className="truncate font-mono text-[11px] text-muted">
                                  {meta.nameEn}
                                </span>
                                <span className="stamp">{meta.code}</span>
                              </div>
                              <p className="text-caption text-muted">{meta.oneLiner}</p>
                            </div>
                            <p className="shrink-0 font-mono text-[11px] tabular-nums text-ink-2">
                              {t('reverse.score', { n: hit.score })}
                            </p>
                          </div>

                          <div className="h-1 w-full bg-line" aria-hidden="true">
                            <span
                              className="block h-full bg-accent"
                              style={{ width: `${Math.max(2, Math.min(100, hit.score))}%` }}
                            />
                          </div>

                          <ReasonList reasons={hit.reasons} />

                          <Link
                            to={entryPath(hit.entry.slug)}
                            className="text-link self-start font-mono text-[11px] text-accent no-underline"
                          >
                            {t('reverse.open')} →
                          </Link>
                        </li>
                      )
                    })}
                  </ol>
                </>
              ) : (
                <EmptyState
                  title={t('reverse.noMatch')}
                  action={
                    <Link to="/aliases" className={buttonClass({ variant: 'secondary', size: 'sm' })}>
                      {t('reverse.aliasLink')}
                    </Link>
                  }
                />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
