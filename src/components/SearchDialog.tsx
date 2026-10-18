import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { ENTRY_META } from '../data/meta'
import { useLocale, useT } from '../i18n'
import { useModal } from '../lib/useModal'
import { resolveMeta } from '../lib/localize'
import { navigate, useRoute } from '../lib/router'
import { suggestionsFor } from '../lib/search'
import { Kbd } from './Meta'
import { IconArrowRight, IconClose, IconSearch } from './icons'

/** 空查询时的示例：四个最常被口语描述的标本 */
const EXAMPLES = ['frosted-glass', 'glassmorphism', 'count-up', 'magnetic-button']

const MAX_HITS = 8

interface SearchDialogProps {
  open: boolean
  onClose: () => void
}

/**
 * 全站搜索对话框：⌘K / Ctrl+K 或点头部搜索打开。
 * 视觉上是一张档案卡（方角、2px 墨线、无圆角），键盘上是一个 combobox。
 * 这里不引对话框库——遮罩、焦点陷阱、滚动锁都在 useModal 里。
 */
export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const t = useT()
  const locale = useLocale()
  const route = useRoute()
  const panelRef = useModal(open, onClose)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(-1)
  const listId = useId()

  const hits = useMemo(() => suggestionsFor(ENTRY_META, query, MAX_HITS), [query])

  // 每次打开都从空查询开始，并把焦点放进输入框
  useEffect(() => {
    if (!open) return
    setQuery('')
    setActive(-1)
    const timer = window.setTimeout(() => inputRef.current?.focus(), 10)
    return () => window.clearTimeout(timer)
  }, [open])

  // 路由真变了就关掉：点建议、按 Enter 之后都不该留着一层遮罩
  useEffect(() => {
    if (open) onClose()
    // 只在 path 变化时收；open 变化时收会让「刚打开就关」
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.path])

  const go = useCallback(
    (slug: string) => {
      onClose()
      navigate(`/entry/${slug}`)
    },
    [onClose],
  )

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (hits.length === 0) return
      event.preventDefault()
      setActive((prev) => {
        const next = event.key === 'ArrowDown' ? prev + 1 : prev - 1
        if (next < -1) return hits.length - 1
        if (next >= hits.length) return -1
        return next
      })
      return
    }
    if (event.key === 'Enter') {
      const target = active >= 0 ? hits[active] : hits[0]
      if (!target) return
      event.preventDefault()
      go(target.entry.slug)
    }
  }

  if (!open) return null

  const examples = EXAMPLES.map((slug) => ENTRY_META.find((entry) => entry.slug === slug)).filter(
    (entry): entry is NonNullable<typeof entry> => Boolean(entry),
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]" role="presentation">
      <div
        className="absolute inset-0 bg-[var(--overlay)]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('search.dialogTitle')}
        tabIndex={-1}
        className="relative flex w-full max-w-2xl flex-col border border-ink bg-raised shadow-[var(--shadow-overlay)]"
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <span className="text-muted">
            <IconSearch size={18} />
          </span>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            value={query}
            aria-expanded={hits.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            aria-label={t('search.aria')}
            placeholder={t('search.placeholder')}
            onChange={(event) => {
              setQuery(event.target.value)
              setActive(-1)
            }}
            onKeyDown={onKeyDown}
            className="min-w-0 flex-1 bg-transparent py-1 text-body text-ink outline-none placeholder:text-muted"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="cursor-pointer rounded-[2px] p-1 text-muted transition-colors hover:text-ink"
          >
            <IconClose size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim().length === 0 ? (
            <div className="flex flex-col gap-4 px-4 py-4">
              <p className="label-mono">{t('search.examples')}</p>
              <div className="flex flex-wrap gap-2">
                {examples.map((entry) => {
                  const resolved = resolveMeta(entry, locale)
                  return (
                    <button
                      key={entry.slug}
                      type="button"
                      onClick={() => go(entry.slug)}
                      className="cursor-pointer rounded-[2px] border border-line px-2 py-1 font-mono text-[11px] text-ink-2 transition-colors hover:border-accent hover:text-accent"
                    >
                      {locale === 'en' ? resolved.nameEn : resolved.nameZh}
                    </button>
                  )
                })}
              </div>
              <p className="text-caption text-muted">{t('search.pinyinHint')}</p>
            </div>
          ) : hits.length === 0 ? (
            <div className="flex flex-col gap-2 px-4 py-6">
              <p className="text-body text-ink">{t('search.noResults')}</p>
              <p className="text-caption text-muted">{t('search.noResultsHint')}</p>
            </div>
          ) : (
            <ul id={listId} role="listbox" aria-label={t('search.suggest')} className="py-1">
              {hits.map(({ entry }, index) => {
                const resolved = resolveMeta(entry, locale)
                const selected = index === active
                return (
                  <li key={entry.slug} role="none">
                    <button
                      type="button"
                      id={`${listId}-${index}`}
                      role="option"
                      aria-selected={selected}
                      onClick={() => go(entry.slug)}
                      onMouseEnter={() => setActive(index)}
                      className={`flex w-full cursor-pointer items-baseline gap-3 px-4 py-2.5 text-left transition-colors ${
                        selected ? 'bg-surface' : ''
                      }`}
                    >
                      <span className="stamp shrink-0">{resolved.code}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-[15px] font-semibold text-ink">
                          {locale === 'en' ? resolved.nameEn : resolved.nameZh}
                        </span>
                        <span className="block truncate text-caption text-muted">
                          {resolved.oneLiner}
                        </span>
                      </span>
                      <span className="shrink-0 text-muted">
                        <IconArrowRight size={14} />
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2.5">
          <p className="font-mono text-[10px] text-muted">{t('search.dialogHint')}</p>
          <div className="flex items-center gap-1.5">
            <Kbd>Esc</Kbd>
            <span className="font-mono text-[10px] text-muted">{t('search.esc')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
