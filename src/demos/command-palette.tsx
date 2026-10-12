import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { DemoProps } from '../data/types'
import { boolValue, numberValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'
import { pick } from '../i18n/pick'

const T = {
  open: { zh: '按 ⌘K 打开', en: 'Press meta+K' },
  placeholder: { zh: '输入命令或页面名…', en: 'Type a command or page...' },
  empty: { zh: '没有匹配的命令', en: 'No matching command' },
  chosen: { zh: '已执行', en: 'Ran' },
  reduced: { zh: '已开启减少动态效果，只做淡入', en: 'Reduced motion is on: fade only' },
  aria: { zh: '命令面板演示', en: 'Command palette demo' },
  list: { zh: '命令列表', en: 'Command list' },
} as const

const COMMANDS = [
  { id: 'new', zh: '新建条目', en: 'New entry', hint: 'N' },
  { id: 'gallery', zh: '去展厅', en: 'Go to gallery', hint: 'G' },
  { id: 'browse', zh: '浏览全部词条', en: 'Browse all entries', hint: 'B' },
  { id: 'search', zh: '搜索效果名', en: 'Search effect names', hint: '/' },
  { id: 'cheatsheet', zh: '打开速查表', en: 'Open cheat sheet', hint: 'C' },
  { id: 'theme', zh: '切换深浅主题', en: 'Toggle theme', hint: 'T' },
  { id: 'export', zh: '导出需求清单', en: 'Export the prompt list', hint: 'E' },
  { id: 'about', zh: '怎么用这座馆', en: 'How to use this museum', hint: '?' },
  { id: 'spec', zh: '看条目规范', en: 'Read the entry spec', hint: 'S' },
  { id: 'retired', zh: '已下架条目', en: 'Retired entries', hint: 'R' },
]

export default function CommandPaletteDemo({ values, locale = 'zh' }: DemoProps) {
  const maxResults = numberValue(values, 'results', 6)
  const withShortcut = boolValue(values, 'withShortcut', true)
  const fuzzy = boolValue(values, 'fuzzy', true)
  const reduced = usePrefersReducedMotion()

  const zh = locale !== 'en'
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const rows = COMMANDS.map((command, index) => ({ command, index })).filter(({ command }) => {
      if (!needle) return true
      const label = (zh ? command.zh : command.en).toLowerCase()
      const terms = needle.split(/\s+/)
      return fuzzy ? terms.every((term) => label.includes(term)) : label.startsWith(needle)
    })
    return rows.map(({ command }) => command)
  }, [fuzzy, query, zh])

  const visible = matches.slice(0, maxResults)

  const openPalette = () => {
    setQuery('')
    setActive(0)
    setOpen(true)
  }

  const closePalette = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const choose = (id: string) => {
    setChosen(id)
    closePalette()
  }

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // 输入把结果筛短以后高亮要跟着收敛：在渲染期算出来，而不是在 effect 里再 setState
  const activeIndex = visible.length === 0 ? 0 : Math.min(active, visible.length - 1)

  useEffect(() => {
    const node = listRef.current?.querySelector('[data-active="true"]')
    node?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey
      if (!meta || event.key.toLowerCase() !== 'k') return
      event.preventDefault()
      if (open) closePalette()
      else openPalette()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const onSearchKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closePalette()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive(visible.length === 0 ? 0 : (activeIndex + 1) % visible.length)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive(visible.length === 0 ? 0 : (activeIndex - 1 + visible.length) % visible.length)
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const row = visible[activeIndex]
      if (row) choose(row.id)
    }
  }

  const activeId = visible[activeIndex] ? 'dm-cp-' + visible[activeIndex].id : undefined
  const listboxId = 'dm-cp-listbox'

  return (
    <div className="w-full max-w-sm" aria-label={pick(T.aria, locale)}>
      <div
        className="relative h-64 overflow-hidden rounded-xl border p-3"
        style={{
          borderColor: 'color-mix(in srgb, var(--stage-ink) 18%, transparent)',
          background: 'color-mix(in srgb, var(--stage-ink) 4%, transparent)',
        }}
      >
        <button
          ref={triggerRef}
          type="button"
          onClick={openPalette}
          className="rounded-md px-3 py-1.5 text-xs"
          style={{
            border: '1px solid color-mix(in srgb, var(--stage-ink) 25%, transparent)',
            color: 'var(--stage-ink)',
          }}
        >
          {pick(T.open, locale)}
        </button>
        {chosen ? (
          <p className="mt-2 text-[11px]" style={{ color: 'var(--stage-muted)' }}>
            {pick(T.chosen, locale)}: {zh ? COMMANDS.find((c) => c.id === chosen)?.zh : COMMANDS.find((c) => c.id === chosen)?.en}
          </p>
        ) : null}

        <div
          aria-hidden={!open}
          className="absolute inset-x-3 top-3 rounded-lg p-2"
          style={{
            border: '1px solid color-mix(in srgb, var(--stage-ink) 22%, transparent)',
            background: 'color-mix(in srgb, var(--stage-ink) 8%, transparent)',
            backdropFilter: 'blur(6px)',
            opacity: open ? 1 : 0,
            transform: open || reduced ? 'scale(1)' : 'scale(0.96)',
            transition: reduced ? 'opacity 100ms ease-out' : 'opacity 150ms ease-out, transform 150ms ease-out',
            pointerEvents: open ? 'auto' : 'none',
          }}
        >
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActive(0)
            }}
            onKeyDown={onSearchKey}
            placeholder={pick(T.placeholder, locale)}
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-activedescendant={activeId}
            aria-label={pick(T.placeholder, locale)}
            tabIndex={open ? 0 : -1}
            className="w-full rounded border px-2 py-1.5 text-xs outline-none"
            style={{
              borderColor: 'color-mix(in srgb, var(--stage-ink) 20%, transparent)',
              background: 'var(--stage-bg, transparent)',
              color: 'var(--stage-ink)',
            }}
          />
          <ul ref={listRef} id={listboxId} role="listbox" aria-label={pick(T.list, locale)} className="mt-2 max-h-36 overflow-y-auto">
            {visible.length === 0 ? (
              <li className="px-2 py-1.5 text-[11px]" style={{ color: 'var(--stage-muted)' }}>
                {pick(T.empty, locale)}
              </li>
            ) : null}
            {visible.map((command, index) => (
              <li
                key={command.id}
                id={'dm-cp-' + command.id}
                role="option"
                aria-selected={index === activeIndex}
                data-active={index === activeIndex}
                onPointerDown={(event) => {
                  event.preventDefault()
                  choose(command.id)
                }}
                onPointerEnter={() => setActive(index)}
                className="flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-xs"
                style={{
                  color: 'var(--stage-ink)',
                  background:
                    index === activeIndex ? 'color-mix(in srgb, var(--stage-ink) 14%, transparent)' : 'transparent',
                }}
              >
                <span>{zh ? command.zh : command.en}</span>
                {withShortcut ? (
                  <span className="font-mono text-[10px]" style={{ color: 'var(--stage-muted)' }}>
                    {command.hint}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-2 text-[11px]" style={{ color: 'var(--stage-muted)' }}>
        {reduced ? pick(T.reduced, locale) : pick(T.open, locale)}
      </p>
    </div>
  )
}
