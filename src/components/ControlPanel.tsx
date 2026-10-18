import type { Control, ControlValues } from '../data/types'
import { useT } from '../i18n'
import { formatControl } from '../lib/prompt'

interface ControlPanelProps {
  controls: Control[]
  values: ControlValues
  onChange: (id: string, value: number | string | boolean) => void
  onReset: () => void
}

export function ControlPanel({ controls, values, onChange, onReset }: ControlPanelProps) {
  const t = useT()
  if (controls.length === 0) return null

  return (
    <section aria-label={t('control.title')} className="plate p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
        <h2 className="label-mono">{t('control.title')}</h2>
        <button
          type="button"
          onClick={onReset}
          className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.08em] text-muted underline decoration-dotted underline-offset-2 hover:text-accent"
        >
          {t('control.reset')}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {controls.map((control) => {
          if (control.kind === 'range') {
            const value = Number(values[control.id] ?? control.def)
            return (
              <label key={control.id} className="flex flex-col gap-1.5">
                <span className="flex items-baseline justify-between gap-3 text-caption">
                  <span className="text-ink">{control.label}</span>
                  <span className="font-mono text-[11px] tabular-nums text-accent">
                    {formatControl(control, values)}
                  </span>
                </span>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={value}
                  onChange={(event) => onChange(control.id, Number(event.target.value))}
                  className="h-1 w-full cursor-pointer appearance-none rounded-[1px] bg-line"
                  style={{ accentColor: 'var(--accent)' }}
                />
                {control.hint ? <span className="text-micro text-muted">{control.hint}</span> : null}
              </label>
            )
          }

          if (control.kind === 'select') {
            return (
              <label key={control.id} className="flex items-center justify-between gap-3 text-caption">
                <span className="text-ink">{control.label}</span>
                <select
                  value={String(values[control.id] ?? control.def)}
                  onChange={(event) => onChange(control.id, event.target.value)}
                  className="cursor-pointer rounded-[2px] border border-line bg-surface px-2 py-1 font-mono text-[11px] text-ink outline-none focus:border-accent"
                >
                  {control.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            )
          }

          const checked = Boolean(values[control.id] ?? control.def)
          return (
            <label key={control.id} className="flex items-center justify-between gap-3 text-caption">
              <span className="text-ink">{control.label}</span>
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(control.id, event.target.checked)}
                className="size-4 cursor-pointer"
                style={{ accentColor: 'var(--accent)' }}
              />
            </label>
          )
        })}
      </div>
    </section>
  )
}
