import { useEffect, useRef, useState } from 'react'
import type { DemoProps } from '../data/types'
import { numberValue, stringValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

interface Notice {
  id: number
  text: string
  tone: 'ok' | 'error'
}

export default function ToastDemo({ values, stage, replayKey, locale = 'zh' }: DemoProps) {
  const duration = numberValue(values, 'duration', 3000)
  const position = stringValue(values, 'position', 'bottom')
  const distance = numberValue(values, 'distance', 12)
  const reduced = usePrefersReducedMotion()
  const [notices, setNotices] = useState<Notice[]>([])
  const nextId = useRef(1)
  const timers = useRef<number[]>([])
  const dark = stage === 'dark' || stage === 'accent'
  const zh = locale !== 'en'

  useEffect(
    () => () => {
      for (const id of timers.current) window.clearTimeout(id)
    },
    [],
  )

  useEffect(() => {
    for (const id of timers.current) window.clearTimeout(id)
    timers.current = []
    setNotices([])
  }, [replayKey])

  const push = (tone: 'ok' | 'error') => {
    const id = nextId.current
    nextId.current += 1
    const text =
      tone === 'ok'
        ? zh
          ? '已保存到词条库'
          : 'Saved to the library'
        : zh
          ? '保存失败，请重试'
          : 'Save failed, try again'
    setNotices((prev) => [...prev.slice(-2), { id, text, tone }])
    const timer = window.setTimeout(() => {
      setNotices((prev) => prev.filter((notice) => notice.id !== id))
    }, duration)
    timers.current.push(timer)
  }

  const align =
    position === 'bottom'
      ? 'justify-end items-center'
      : position === 'top'
        ? 'justify-start items-center'
        : 'justify-start items-end'
  const fromY = position === 'bottom' ? distance : -distance

  return (
    <div
      className="relative flex h-44 w-full max-w-xs flex-col items-center justify-center gap-3 rounded-xl p-3"
      style={{ border: '1px dashed color-mix(in srgb, var(--stage-ink) 25%, transparent)' }}
    >
      <style>
        {'@keyframes dm-feedback-toast-in { from { opacity: 0; transform: translateY(var(--dm-toast-from, 12px)); } to { opacity: 1; transform: translateY(0); } }'}
      </style>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => push('ok')}
          className="cursor-pointer rounded-full px-4 py-2 text-xs font-semibold"
          style={{ color: '#ffffff', background: 'linear-gradient(135deg, #2f6bff, #7b2ff7)' }}
        >
          {zh ? '保存' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => push('error')}
          className="cursor-pointer rounded-full px-4 py-2 text-xs font-semibold"
          style={{
            color: 'var(--stage-ink)',
            border: '1px solid color-mix(in srgb, var(--stage-ink) 30%, transparent)',
          }}
        >
          {zh ? '制造失败' : 'Force failure'}
        </button>
      </div>

      <div
        className={'pointer-events-none absolute inset-0 flex flex-col gap-1.5 p-2 ' + align}
      >
        {notices.map((notice) => (
          <div
            key={notice.id}
            role="status"
            className="pointer-events-auto w-56 rounded-lg px-3 py-2 text-xs shadow-sm"
            style={{
              background: dark ? 'rgba(20, 20, 24, 0.94)' : 'rgba(255, 255, 255, 0.97)',
              color: dark ? '#f2f2f5' : '#16161a',
              border:
                '1px solid ' +
                (notice.tone === 'error'
                  ? 'rgba(224, 83, 63, 0.55)'
                  : 'color-mix(in srgb, var(--stage-ink) 22%, transparent)'),
              ...(reduced
                ? {}
                : {
                    animation: 'dm-feedback-toast-in 220ms ease-out both',
                    '--dm-toast-from': fromY + 'px',
                  }),
            }}
          >
            <span style={{ color: notice.tone === 'error' ? '#e0533f' : 'inherit' }}>
              {notice.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
