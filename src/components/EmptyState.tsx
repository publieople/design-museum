import type { ReactNode } from 'react'

/** 空态：虚线框 + 标题 + 一句解释 + 可选出口 */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: ReactNode
  body?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="rounded-[3px] border border-dashed border-line bg-surface px-6 py-12 text-center">
      <p className="text-base text-ink">{title}</p>
      {body ? <p className="mx-auto mt-2 max-w-[44ch] text-caption text-muted">{body}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}

/** 加载占位：纸面色块 + 描边，reduced-motion 下不闪 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-[2px] border border-line bg-surface motion-reduce:animate-none${className ? ` ${className}` : ''}`}
    />
  )
}
