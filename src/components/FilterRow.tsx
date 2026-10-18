import type { ReactNode } from 'react'

export interface FilterOption {
  value: string
  label: string
  /** 悬停时用原生 title 补一句解释，不额外占版面 */
  hint?: string
}

interface FilterRowProps {
  /** 这一组的标题，通常是问题或分类名 */
  legend: ReactNode
  options: FilterOption[]
  selected: string[]
  onToggle: (value: string) => void
  className?: string
}

/**
 * 一组可多选的方角筛选片。
 *
 * 单选组也用它：已选项再点一次即取消，由页面决定把哪个 URL 参数删掉。
 * 选中态只给朱红描边 + 浅底，保持索引档案的克制。
 */
export function FilterRow({ legend, options, selected, onToggle, className = '' }: FilterRowProps) {
  return (
    <fieldset className={`min-w-0 border-0 p-0${className ? ` ${className}` : ''}`}>
      <legend className="label-mono mb-2">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = selected.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              title={option.hint}
              onClick={() => onToggle(option.value)}
              className={
                active
                  ? 'cursor-pointer rounded-[2px] border border-accent bg-accent-soft px-2 py-1 font-mono text-micro text-accent transition-colors'
                  : 'cursor-pointer rounded-[2px] border border-line px-2 py-1 font-mono text-micro text-muted transition-colors hover:border-line-strong hover:text-ink'
              }
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
