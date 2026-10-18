import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { ENTRY_META } from '../data/meta'
import { useT } from '../i18n'
import { navigate } from '../lib/router'
import { suggestionsFor } from '../lib/search'
import { IconClose, IconSearch } from './icons'

const MAX_SUGGESTIONS = 6

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
  placeholder?: string
  className?: string
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable
}

/**
 * 页面内搜索框：首页与索引页共用。
 * 与全站搜索对话框（SearchDialog）共用 suggestionsFor，两个入口排序一致。
 */
export function SearchBox({
  value,
  onChange,
  autoFocus = false,
  placeholder,
  className = '',
}: SearchBoxProps) {
  const t = useT()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const listId = useId()

  const hits = useMemo(() => suggestionsFor(ENTRY_META, value, MAX_SUGGESTIONS), [value])

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  // 斜杠聚焦：任何地方按 / 都能开始搜，除非正在别的输入框里打字
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingTarget(event.target)) return
      event.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
      setOpen(true)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const go = (slug: string) => {
    setOpen(false)
    setActive(-1)
    inputRef.current?.blur()
    navigate(`/entry/${slug}`)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      if (value) {
        onChange('')
        setOpen(true)
      } else {
        setOpen(false)
        inputRef.current?.blur()
      }
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (hits.length === 0) return
      event.preventDefault()
      setOpen(true)
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

  const listVisible = open && hits.length > 0

  return (
    <div className={`relative ${className}`}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
      >
        <IconSearch size={18} />
      </span>
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        value={value}
        aria-label={t('search.aria')}
        aria-expanded={listVisible}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        placeholder={placeholder ?? t('search.placeholder')}
        onChange={(event) => {
          onChange(event.target.value)
          setActive(-1)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        className="w-full rounded-[3px] border border-line-strong bg-raised py-3 pl-11 pr-16 text-body text-ink outline-none transition-colors placeholder:text-muted hover:border-ink focus:border-ink focus:ring-2 focus:ring-accent/25"
      />
      {value ? (
        <button
          type="button"
          aria-label={t('search.clear')}
          onClick={() => {
            onChange('')
            setActive(-1)
            inputRef.current?.focus()
          }}
          className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center gap-1 rounded-[2px] p-1 text-muted transition-colors hover:text-accent"
        >
          <IconClose size={14} />
          <span className="font-mono text-[10px]">ESC</span>
        </button>
      ) : null}

      {listVisible ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('search.suggest')}
          className="absolute inset-x-0 top-full z-30 mt-1 border border-line bg-raised shadow-[var(--shadow-overlay)]"
        >
          {hits.map((hit, index) => (
            <li key={hit.entry.slug} role="none">
              <button
                type="button"
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseDown={(event) => {
                  event.preventDefault()
                  go(hit.entry.slug)
                }}
                onMouseEnter={() => setActive(index)}
                className={`flex w-full cursor-pointer items-baseline gap-3 px-3 py-2 text-left transition-colors ${
                  index === active ? 'bg-surface' : ''
                }`}
              >
                <span className="stamp">{hit.entry.code}</span>
                <span className="font-display text-[15px] font-semibold text-ink">
                  {hit.entry.nameZh}
                </span>
                <span className="truncate font-mono text-[11px] text-muted">{hit.entry.nameEn}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {open && value.length === 0 ? (
        <p className="mt-2 pl-1 font-mono text-[11px] text-muted">{t('search.hint')}</p>
      ) : null}
    </div>
  )
}
