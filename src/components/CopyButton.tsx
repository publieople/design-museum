import { useState } from 'react'
import { useT } from '../i18n'
import { copyText } from '../lib/copy'
import { useToast } from './Toast'

interface CopyButtonProps {
  text: string
  label?: string
  toastMessage?: string
  className?: string
}

export function CopyButton({ text, label, toastMessage, className = '' }: CopyButtonProps) {
  const t = useT()
  const { notify } = useToast()
  const [failed, setFailed] = useState(false)

  const handleClick = async () => {
    const ok = await copyText(text)
    setFailed(!ok)
    notify(ok ? (toastMessage ?? t('toast.copied')) : t('copy.manual'), ok ? 'ok' : 'error')
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        className={`cursor-pointer rounded border border-line px-3 py-1.5 font-mono text-xs tracking-wide transition-colors hover:border-accent hover:text-accent ${className}`}
      >
        {label ?? t('prompt.copyZh')}
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
