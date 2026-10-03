import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { ENTRIES } from '../data'
import { useT } from '../i18n'
import { navigate } from '../lib/router'
import { searchEntries } from '../lib/search'

const MAX_SUGGESTIONS = 6

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
  className?: string
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable
}

export function SearchBox({ value, onChange, autoFocus = false, className = '' }: SearchBoxProps) {
  const t = useT()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const listId = useId()

  const hits = useMemo(
    () => (value.trim() ? searchEntries(ENTRIES, value).slice(0, MAX_SUGGESTIONS) : []),
    [value],
  )

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

  useEffect(() => {
    setActive(-1)
  }, [value])

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
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-muted"
      >
        /
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
        placeholder={t('search.placeholder')}
        onChange={(event) => {
          onChange(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        className="w-full rounded-xl border border-line bg-raised py-3 pl-9 pr-20 text-sm shadow-[var(--shadow-card)] outline-none transition-[box-shadow,border-color] duration-300 placeholder:text-muted focus:border-accent focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_14%,transparent),var(--shadow-card)]"
      />
      {value ? (
        <button
          type="button"
          aria-label={t('search.clear')}
          onClick={() => {
            onChange('')
            inputRef.current?.focus()
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer font-mono text-xs text-muted hover:text-accent"
        >
          ESC
        </button>
      ) : null}

      {listVisible ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('search.suggest')}
          className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-line bg-raised shadow-lg"
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
                  index === active ? 'bg-accent/10' : ''
                }`}
              >
                <span className="font-mono text-[11px] text-accent">{hit.entry.code}</span>
                <span className="font-display text-sm font-semibold">{hit.entry.nameZh}</span>
                <span className="font-mono text-[11px] text-muted">{hit.entry.nameEn}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {open && value.length === 0 ? (
        <p className="mt-1.5 px-1 font-mono text-[11px] text-muted">{t('search.hint')}</p>
      ) : null}
    </div>
  )
}
