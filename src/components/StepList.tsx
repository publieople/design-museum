import type { ReactNode } from 'react'

interface StepItem {
  title?: ReactNode
  body: ReactNode
}

/**
 * 编号步骤列表：方角、1px 分隔线、mono 序号。
 * 首页的三步使用与 /about 的三步共用同一套排版，避免两处各写一遍走样。
 */
export function StepList({ items, className = '' }: { items: StepItem[]; className?: string }) {
  const classes = `flex flex-col border-t border-line${className ? ` ${className}` : ''}`
  return (
    <ol className={classes}>
      {items.map((item, index) => (
        <li
          key={index}
          className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-b border-line py-5 sm:grid-cols-[4rem_minmax(0,1fr)]"
        >
          <span
            aria-hidden="true"
            className="pt-0.5 font-mono text-[11px] tracking-[0.08em] text-accent"
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            {item.title ? (
              <h3 className="font-display text-h3 leading-tight text-ink">{item.title}</h3>
            ) : null}
            <p className="max-w-[62ch] text-caption text-ink-2">{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
