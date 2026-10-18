import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md'

const VARIANTS: Record<ButtonVariant, string> = {
  // 主操作：墨底纸字，hover 转朱红印章
  primary: 'border-ink bg-ink text-canvas hover:border-accent hover:bg-accent hover:text-accent-ink',
  // 次操作：结构线框，hover 收深
  secondary: 'border-line-strong bg-transparent text-ink hover:border-ink hover:bg-surface',
  // 低优先：无框，hover 铺一层次级面
  ghost: 'border-transparent bg-transparent text-ink-2 hover:bg-surface hover:text-ink',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[12px]',
  md: 'px-4 py-2.5 text-[13px]',
}

export interface ButtonClassOptions {
  variant?: ButtonVariant
  size?: ButtonSize
}

/**
 * 让 <Link> 或别的元素长成同一套按钮时用这个函数取类名，
 * 保证 primary / secondary / ghost 只在这里定义一次。
 */
// oxlint-disable-next-line react/only-export-components
export function buttonClass({ variant = 'primary', size = 'md' }: ButtonClassOptions = {}): string {
  return [
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-[3px] border',
    'font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
  ].join(' ')
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ variant, size, className = '', type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={className ? `${buttonClass({ variant, size })} ${className}` : buttonClass({ variant, size })}
      {...rest}
    />
  )
}
