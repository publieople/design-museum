import type { ReactNode } from 'react'

interface PageHeaderProps {
  /** 小号大写字距的栏目名，例如「词条库 · INDEX」 */
  kicker?: ReactNode
  title: ReactNode
  lede?: ReactNode
  /** 标题下方一行 mono 元数据：计数、当前筛选、区域编号等 */
  meta?: ReactNode
  /** 标题右侧的操作（排序、复制、清空之类） */
  actions?: ReactNode
  className?: string
}

/**
 * 索引页统一页头：上方 mono 栏目名，下方 2px 墨线压住内容。
 * 所有页面共用同一个基线，转页时标题位置不跳。
 */
export function PageHeader({
  kicker,
  title,
  lede,
  meta,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <header
      className={`mb-8 flex flex-col gap-4 border-b-2 border-ink pb-6${className ? ` ${className}` : ''}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-col gap-2">
          {kicker ? <p className="label-mono text-accent">{kicker}</p> : null}
          <h1 className="font-display text-h1 text-ink">{title}</h1>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {lede ? <p className="max-w-[52ch] text-body text-ink-2">{lede}</p> : null}
      {meta ? (
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 font-mono text-[11px] text-muted">
          {meta}
        </div>
      ) : null}
    </header>
  )
}
