import { useMemo, useState } from 'react'
import { ENTRIES } from '../data'
import { FEELS, INTENTS, SCENES } from '../data/taxonomy'
import { EntryCard } from '../components/EntryCard'
import { FilterChips } from '../components/FilterChips'

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function FeelPage() {
  const [scenes, setScenes] = useState<string[]>([])
  const [feels, setFeels] = useState<string[]>([])
  const [intents, setIntents] = useState<string[]>([])

  const results = useMemo(
    () =>
      ENTRIES.filter(
        (entry) =>
          (scenes.length === 0 || entry.scenes.some((item) => scenes.includes(item))) &&
          (feels.length === 0 || entry.feel.some((item) => feels.includes(item))) &&
          (intents.length === 0 || entry.intent.some((item) => intents.includes(item))),
      ),
    [scenes, feels, intents],
  )

  const answered = scenes.length + feels.length + intents.length > 0

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight">感觉导航</h1>
        <p className="max-w-2xl text-muted">
          不知道叫什么，就从感觉开始。三个问题都是可选的，选得越多候选越少。
        </p>
      </header>

      <div className="flex flex-col gap-6 rounded-lg border border-line bg-raised p-5">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-accent">01</span>
          <FilterChips
            legend="用在哪里"
            options={SCENES.map((s) => ({ value: s.id, label: s.label }))}
            selected={scenes}
            onToggle={(value) => setScenes((prev) => toggle(prev, value))}
          />
        </div>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-accent">02</span>
          <FilterChips
            legend="想要什么感觉"
            options={FEELS.map((f) => ({ value: f.id, label: f.label, hint: f.hint }))}
            selected={feels}
            onToggle={(value) => setFeels((prev) => toggle(prev, value))}
          />
        </div>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-accent">03</span>
          <FilterChips
            legend="想达到什么"
            options={INTENTS.map((i) => ({ value: i.id, label: i.label, hint: i.hint }))}
            selected={intents}
            onToggle={(value) => setIntents((prev) => toggle(prev, value))}
          />
        </div>
        {answered ? (
          <button
            type="button"
            onClick={() => {
              setScenes([])
              setFeels([])
              setIntents([])
            }}
            className="cursor-pointer self-start font-mono text-[11px] text-muted underline decoration-dotted hover:text-accent"
          >
            重新回答
          </button>
        ) : null}
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-2">
          <h2 className="label-mono">{answered ? '候选展品' : '全部展品'}</h2>
          <span className="font-mono text-xs text-muted">{results.length} 件</span>
        </div>
        {results.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">
            这个组合下没有展品，去掉一个条件试试。
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((entry) => (
              <EntryCard key={entry.slug} entry={entry} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
