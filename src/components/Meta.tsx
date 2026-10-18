import type { ReactNode } from 'react'

export interface MetaItem {
  label?: ReactNode
  value: ReactNode
}

/**
 * 图注式元数据行：编号 / 形态 / loop / 别名数之类。
 * label 是小号大写字距标签，value 稍亮一档保证可读。
 */
export function MetaLine({ items, className = '' }: { items: MetaItem[]; className?: string }) {
  return (
    <dl
      className={`flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-muted${className ? ` ${className}` : ''}`}
    >
      {items.map((item, index) => (
        <div key={index} className="inline-flex items-baseline gap-1.5">
          {item.label ? (
            <dt className="shrink-0 whitespace-nowrap text-[10px] uppercase tracking-[0.1em]">{item.label}</dt>
          ) : null}
          <dd className="text-ink-2">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export type RuleVariant = 'line' | 'dotted' | 'strong' | 'double'

const RULES: Record<RuleVariant, string> = {
  line: 'border-t border-line',
  dotted: 'border-t border-dotted border-line',
  strong: 'border-t-2 border-ink',
  double: 'border-t-[3px] border-double border-line',
}

/** 结构线：line 常规、dotted 索引分隔、strong 页标题下 2px、double 页脚上方双细线 */
export function Rule({ variant = 'line', className = '' }: { variant?: RuleVariant; className?: string }) {
  return <div aria-hidden="true" className={`${RULES[variant]}${className ? ` ${className}` : ''}`} />
}

/** 方角标签；active 用朱红描边 + accent-soft 底表示已选 */
export function Tag({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      data-active={active ? 'true' : undefined}
      className={`inline-flex items-center rounded-[2px] border px-1.5 py-0.5 font-mono text-micro transition-colors ${
        active ? 'border-accent bg-accent-soft text-accent' : 'border-line text-muted'
      }`}
    >
      {children}
    </span>
  )
}

/** 键帽：/ Ctrl K 之类 */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-[2px] border border-line bg-raised px-1 font-mono text-micro text-muted">
      {children}
    </kbd>
  )
}
