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
    <section aria-label={t('control.title')} className="rounded-lg border border-line bg-raised p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="label-mono">{t('control.title')}</h2>
        <button
          type="button"
          onClick={onReset}
          className="cursor-pointer font-mono text-[11px] text-muted underline decoration-dotted hover:text-accent"
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
                <span className="flex items-baseline justify-between text-sm">
                  <span>{control.label}</span>
                  <span className="font-mono text-xs text-accent">
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
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line"
                  style={{ accentColor: 'var(--accent)' }}
                />
                {control.hint ? <span className="text-xs text-muted">{control.hint}</span> : null}
              </label>
            )
          }

          if (control.kind === 'select') {
            return (
              <label key={control.id} className="flex items-center justify-between gap-3 text-sm">
                <span>{control.label}</span>
                <select
                  value={String(values[control.id] ?? control.def)}
                  onChange={(event) => onChange(control.id, event.target.value)}
                  className="cursor-pointer rounded border border-line bg-surface px-2 py-1 font-mono text-xs"
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
            <label key={control.id} className="flex items-center justify-between gap-3 text-sm">
              <span>{control.label}</span>
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
