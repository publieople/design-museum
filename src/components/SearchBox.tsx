import { useEffect, useRef } from 'react'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
  ariaLabel?: string
}

export function SearchBox({
  value,
  onChange,
  placeholder = '试试「毛玻璃」「磨砂」「backdrop blur」…',
  autoFocus = false,
  ariaLabel = '搜索效果',
}: SearchBoxProps) {
  const ref = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (autoFocus) ref.current?.focus()
  }, [autoFocus])

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-muted"
      >
        /
      </span>
      <input
        ref={ref}
        type="search"
        value={value}
        aria-label={ariaLabel}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-line bg-raised py-3 pl-9 pr-10 text-sm outline-none placeholder:text-muted focus:border-accent"
      />
      {value ? (
        <button
          type="button"
          aria-label="清空搜索"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer font-mono text-xs text-muted hover:text-accent"
        >
          ESC
        </button>
      ) : null}
    </div>
  )
}
