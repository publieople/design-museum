import { useMemo, useState } from 'react'
import { ENTRIES } from '../data'
import { CATEGORIES } from '../data/taxonomy'
import { defaultValues } from '../lib/controls'
import { buildCheatSheet } from '../lib/prompt'
import { CopyButton } from '../components/CopyButton'

export function CheatSheetPage() {
  const [selected, setSelected] = useState<string[]>([])

  const items = useMemo(
    () =>
      ENTRIES.filter((entry) => selected.includes(entry.slug)).map((entry) => ({
        entry,
        values: defaultValues(entry),
      })),
    [selected],
  )

  const sheet = useMemo(() => buildCheatSheet(items), [items])

  const toggle = (slug: string) => {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]))
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight">速查表</h1>
        <p className="max-w-2xl text-muted">
          勾选这次页面要用到的效果，导出一段需求清单。「中文说法 → 英文术语 → 参数 → 技术要求」
          一次给全，AI 不用猜。
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3">
            <span className="label-mono">选展品（{selected.length} / {ENTRIES.length}）</span>
            <div className="flex gap-3 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setSelected(ENTRIES.map((entry) => entry.slug))}
                className="cursor-pointer text-muted underline decoration-dotted hover:text-accent"
              >
                全选
              </button>
              <button
                type="button"
                onClick={() => setSelected([])}
                className="cursor-pointer text-muted underline decoration-dotted hover:text-accent"
              >
                清空
              </button>
            </div>
          </div>

          {CATEGORIES.map((category) => {
            const group = ENTRIES.filter((entry) => entry.category === category.id)
            if (group.length === 0) return null
            return (
              <fieldset key={category.id} className="rounded-lg border border-line bg-raised p-4">
                <legend className="label-mono px-1">{category.nameZh}</legend>
                <ul className="flex flex-col gap-2">
                  {group.map((entry) => (
                    <li key={entry.slug}>
                      <label className="flex cursor-pointer items-baseline gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selected.includes(entry.slug)}
                          onChange={() => toggle(entry.slug)}
                          style={{ accentColor: 'var(--accent)' }}
                        />
                        <span className="font-mono text-[11px] text-accent">{entry.code}</span>
                        <span>{entry.nameZh}</span>
                        <span className="font-mono text-[11px] text-muted">{entry.nameEn}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 lg:sticky lg:top-4 lg:self-start">
          <div className="flex items-center justify-between gap-3">
            <span className="label-mono">导出预览</span>
            {sheet ? (
              <CopyButton text={sheet} label="复制整段" toastMessage="需求清单已复制" />
            ) : null}
          </div>
          {sheet ? (
            <textarea
              readOnly
              value={sheet}
              className="h-[36rem] w-full resize-y rounded-lg border border-line bg-raised p-4 font-mono text-xs leading-relaxed"
              onFocus={(event) => event.currentTarget.select()}
            />
          ) : (
            <p className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">
              左边勾几个效果，这里会生成可以整段粘给 AI 的需求清单。
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
