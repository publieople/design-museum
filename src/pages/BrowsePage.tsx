import { useMemo } from 'react'
import { ENTRIES } from '../data'
import { CATEGORIES, FEELS, SCENES } from '../data/taxonomy'
import { Link, useQueryUpdater, useRoute } from '../lib/router'
import { searchEntries } from '../lib/search'
import { EntryCard } from '../components/EntryCard'
import { FilterChips } from '../components/FilterChips'
import { SearchBox } from '../components/SearchBox'

export function BrowsePage() {
  const route = useRoute()
  const updateQuery = useQueryUpdater()

  const q = route.query.get('q') ?? ''
  const cat = route.query.get('cat') ?? ''
  const scene = route.query.get('scene') ?? ''
  const feel = route.query.get('feel') ?? ''

  const results = useMemo(() => {
    const base = q ? searchEntries(ENTRIES, q).map((hit) => hit.entry) : ENTRIES
    return base.filter((entry) => {
      if (cat && entry.category !== cat) return false
      if (scene && !entry.scenes.includes(scene as never)) return false
      if (feel && !entry.feel.includes(feel as never)) return false
      return true
    })
  }, [q, cat, scene, feel])

  const hasFilter = Boolean(q || cat || scene || feel)

  const toggle = (key: 'cat' | 'scene' | 'feel') => (value: string) => {
    const current = route.query.get(key)
    updateQuery({ [key]: current === value ? null : value })
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-display text-2xl font-semibold tracking-tight">词条库</h1>
          <span className="font-mono text-xs text-muted">
            {results.length} / {ENTRIES.length} 件
          </span>
        </div>
        <SearchBox value={q} onChange={(value) => updateQuery({ q: value || null })} />
      </header>

      <div className="flex flex-col gap-3 rounded-lg border border-line bg-raised p-4">
        <FilterChips
          legend="展厅"
          options={[
            { value: '', label: '全部' },
            ...CATEGORIES.map((c) => ({ value: c.id, label: c.nameZh, hint: c.nameEn })),
          ]}
          selected={[cat]}
          onToggle={(value) => updateQuery({ cat: value || null })}
          single
        />
        <FilterChips
          legend="用在哪"
          options={SCENES.map((s) => ({ value: s.id, label: s.label }))}
          selected={scene ? [scene] : []}
          onToggle={toggle('scene')}
        />
        <FilterChips
          legend="什么感觉"
          options={FEELS.map((f) => ({ value: f.id, label: f.label, hint: f.hint }))}
          selected={feel ? [feel] : []}
          onToggle={toggle('feel')}
        />
        {hasFilter ? (
          <button
            type="button"
            onClick={() => updateQuery({ q: null, cat: null, scene: null, feel: null })}
            className="cursor-pointer self-start font-mono text-[11px] text-muted underline decoration-dotted hover:text-accent"
          >
            清空筛选
          </button>
        ) : null}
      </div>

      {results.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">
          这一组筛选下没有展品。
          <Link to="/feel" className="ml-1 text-accent no-underline">
            试试按感觉找 →
          </Link>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((entry) => (
            <EntryCard key={entry.slug} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  )
}
