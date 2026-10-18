import type { ReactNode } from 'react'
import { IconChevronDown } from './icons'

interface FilterDisclosureProps {
  /** 面板标题，例如「筛选」 */
  label: ReactNode
  /** 已选条件摘要，例如「3 个条件」；没有筛选时不传 */
  activeLabel?: ReactNode
  clearLabel?: ReactNode
  onClear?: () => void
  /** 有筛选时默认展开，让用户直接看到自己选了什么 */
  openByDefault?: boolean
  children: ReactNode
  className?: string
}

/**
 * 可折叠的筛选面板。
 *
 * 用原生 <details>：预渲染就能展开/收起，不依赖 JS，首屏也不会因为没有事件监听闪一下。
 */
export function FilterDisclosure({
  label,
  activeLabel,
  clearLabel,
  onClear,
  openByDefault = false,
  children,
  className = '',
}: FilterDisclosureProps) {
  return (
    <details className={`group rounded-[3px] border border-line bg-surface${className ? ` ${className}` : ''}`} open={openByDefault || undefined}>
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="label-mono text-ink">{label}</span>
        {activeLabel ? <span className="font-mono text-[11px] text-accent">{activeLabel}</span> : null}
        <span className="ml-auto flex items-center gap-3">
          {onClear && clearLabel ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onClear()
              }}
              className="cursor-pointer font-mono text-[11px] text-muted underline decoration-dotted underline-offset-4 transition-colors hover:text-accent"
            >
              {clearLabel}
            </button>
          ) : null}
          <span className="text-muted transition-transform duration-150 group-open:rotate-180">
            <IconChevronDown size={16} />
          </span>
        </span>
      </summary>
      <div className="flex flex-col gap-5 border-t border-line p-4">{children}</div>
    </details>
  )
}
