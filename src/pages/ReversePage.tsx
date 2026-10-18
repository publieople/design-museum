import { useMemo, useState } from 'react'
import { ENTRY_META } from '../data/meta'
import { useLocale, useT } from '../i18n'
import { resolveMeta } from '../lib/localize'
import { reverseLookup, type ReverseReason, type ReverseResult } from '../lib/reverseLookup'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

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
    <ul className="mt-3 flex flex-wrap gap-1.5">
      {reasons.map((reason) => (
        <li
          key={`${reason.kind}:${reason.value}`}
          className="rounded-full border border-line px-2 py-0.5 font-mono text-[11px] text-muted"
        >
          {t(REASON_KEY[reason.kind], { x: reason.value })}
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
      <header className="max-w-2xl">
        <p className="label-mono">{t('reverse.eyebrow')}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">{t('reverse.title')}</h1>
        <p className="mt-3 text-muted">{t('reverse.lede')}</p>
      </header>

      <section className="flex flex-col gap-3">
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
          className="w-full resize-y rounded-xl border border-line bg-raised px-4 py-3 font-mono text-sm text-ink outline-none placeholder:text-muted focus:border-accent"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => run(example.css)}
            className="cursor-pointer rounded-full border border-line px-3 py-1 font-mono text-[11px] text-muted hover:border-accent hover:text-accent"
          >
            {t('reverse.exampleCss')}
          </button>
          <button
            type="button"
            onClick={() => run(example.text)}
            className="cursor-pointer rounded-full border border-line px-3 py-1 font-mono text-[11px] text-muted hover:border-accent hover:text-accent"
          >
            {t('reverse.exampleText')}
          </button>
          <button
            type="button"
            onClick={() => run(input)}
            className="cursor-pointer rounded-full border border-accent bg-accent/10 px-4 py-1.5 font-mono text-[11px] font-semibold text-accent hover:bg-accent/20"
          >
            {t('reverse.submit')}
          </button>
          <button
            type="button"
            onClick={clear}
            className="cursor-pointer rounded-full border border-line px-3 py-1 font-mono text-[11px] text-muted hover:border-accent hover:text-accent"
          >
            {t('reverse.clear')}
          </button>
        </div>
      </section>

      <section className="min-h-24">
        {result === null ? (
          <p className="text-sm text-muted">{t('reverse.empty')}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {result.properties.length > 0 ? (
              <p className="label-mono">{t('reverse.detected', { n: result.properties.length })}</p>
            ) : null}

            {result.hits.length > 0 ? (
              <>
                <p className="label-mono">{t('reverse.results', { n: result.hits.length })}</p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {result.hits.map((hit) => {
                    const meta = resolveMeta(hit.entry, locale)
                    return (
                      <li
                        key={hit.entry.slug}
                        className="surface-card rounded-xl border border-line bg-raised p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-display text-lg font-semibold">{meta.nameZh}</p>
                            <p className="font-mono text-[11px] text-muted">{meta.nameEn}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-[11px] text-accent">{meta.code}</p>
                            <p className="font-mono text-xs text-muted">
                              {t('reverse.score', { n: hit.score })}
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-muted">{meta.oneLiner}</p>
                        <ReasonList reasons={hit.reasons} />
                        <div className="mt-3">
                          <Link
                            to={entryPath(hit.entry.slug)}
                            className="font-mono text-[11px] text-accent no-underline hover:underline"
                          >
                            {t('reverse.open')} →
                          </Link>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted">{t('reverse.noMatch')}</p>
                <Link
                  to="/aliases"
                  className="font-mono text-[11px] text-accent no-underline hover:underline"
                >
                  {t('reverse.aliasLink')}
                </Link>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
