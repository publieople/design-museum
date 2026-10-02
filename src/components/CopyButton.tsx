import { useState } from 'react'
import { copyText } from '../lib/copy'
import { useToast } from './Toast'

interface CopyButtonProps {
  text: string
  label?: string
  toastMessage?: string
  className?: string
}

export function CopyButton({
  text,
  label = '复制',
  toastMessage = '已复制到剪贴板',
  className = '',
}: CopyButtonProps) {
  const { notify } = useToast()
  const [failed, setFailed] = useState(false)

  const handleClick = async () => {
    const ok = await copyText(text)
    setFailed(!ok)
    notify(ok ? toastMessage : '复制失败，请手动选择文本复制', ok ? 'ok' : 'error')
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        className={`cursor-pointer rounded border border-line px-3 py-1.5 font-mono text-xs tracking-wide transition-colors hover:border-accent hover:text-accent ${className}`}
      >
        {label}
      </button>
      {failed ? (
        <textarea
          readOnly
          value={text}
          onFocus={(event) => event.currentTarget.select()}
          className="h-20 w-full min-w-56 resize-none rounded border border-line bg-surface p-2 font-mono text-xs"
        />
      ) : null}
    </div>
  )
}
