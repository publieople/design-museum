interface Option {
  value: string
  label: string
  hint?: string
}

interface FilterChipsProps {
  legend: string
  options: Option[]
  selected: string[]
  onToggle: (value: string) => void
  /** 单选时点击同一项不取消 */
  single?: boolean
}

export function FilterChips({ legend, options, selected, onToggle, single = false }: FilterChipsProps) {
  return (
    <fieldset className="flex flex-wrap items-center gap-x-3 gap-y-2 border-0 p-0">
      <legend className="label-mono float-left mr-1 py-1">{legend}</legend>
      {options.map((option) => {
        const active = selected.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            title={option.hint}
            onClick={() => {
              if (single && active) return
              onToggle(option.value)
            }}
            className={`cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors ${
              active
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-line text-muted hover:border-ink/40 hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </fieldset>
  )
}
