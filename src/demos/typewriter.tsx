import { useEffect, useState } from 'react'
import type { DemoProps } from '../data/types'
import { boolValue, numberValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'
import { pick } from '../i18n/pick'

const T = {
  aria: { zh: '打字机效果演示', en: 'Typewriter demo' },
  reduced: { zh: '已开启减少动态效果：整句一次显示，不循环', en: 'Reduced motion is on: the whole line appears at once and does not loop' },
  progress: { zh: '第 %n / %total 字', en: 'Character %n of %total' },
  holding: { zh: '打完了，停一下再重来', en: 'Done, holding before it retypes' },
} as const

const LINES = {
  zh: '把想法一个字一个字敲进屏幕里。',
  en: 'Type an idea onto the screen, one character at a time.',
}

const PUNCTUATION = /[，。！？、；：,.!?;:]/

export default function TypewriterDemo({ values, stage, replayKey, locale = 'zh' }: DemoProps) {
  const speed = numberValue(values, 'speed', 70)
  const hold = numberValue(values, 'hold', 1600)
  const caret = boolValue(values, 'caret', true)
  const reduced = usePrefersReducedMotion()
  const zh = locale !== 'en'
  const line = zh ? LINES.zh : LINES.en
  const total = Array.from(line).length
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (reduced) return
    const characters = Array.from(line)
    let cancelled = false
    let timer = 0
    let index = 0

    const step = () => {
      if (cancelled) return
      index += 1
      setCount(index)
      if (index < characters.length) {
        const pause = PUNCTUATION.test(characters[index - 1]) ? 180 : 0
        timer = window.setTimeout(step, speed + pause)
        return
      }
      timer = window.setTimeout(() => {
        if (cancelled) return
        index = 0
        setCount(0)
        timer = window.setTimeout(step, speed)
      }, hold)
    }

    // 换参数或重播时先归零，再进入逐字节奏；归零放进 0ms 定时器，避免在 effect 里同步 setState
    timer = window.setTimeout(() => {
      if (cancelled) return
      index = 0
      setCount(0)
      timer = window.setTimeout(step, speed)
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [line, speed, hold, reduced, replayKey])

  const visible = reduced ? line : Array.from(line).slice(0, count).join('')
  const done = reduced || count >= total

  return (
    <div
      data-stage={stage}
      className="flex w-full max-w-sm flex-col items-center gap-3"
      aria-label={pick(T.aria, locale)}
    >
      <style>
        {'@keyframes dm-typewriter-caret { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }'}
      </style>
      <p
        className="w-full font-mono text-lg leading-relaxed"
        style={{ color: 'var(--stage-ink)', minHeight: '4.5em' }}
      >
        <span className="sr-only">{line}</span>
        <span aria-hidden="true">
          {visible}
          {caret ? (
            <span
              style={{
                display: 'inline-block',
                width: '0.5em',
                height: '1.05em',
                marginLeft: '2px',
                verticalAlign: '-0.12em',
                background: 'var(--stage-ink)',
                animation: reduced ? undefined : 'dm-typewriter-caret 1.05s steps(1) infinite',
              }}
            />
          ) : null}
        </span>
      </p>
      <p className="text-center font-mono text-[10px] opacity-60">
        {reduced
          ? pick(T.reduced, locale)
          : done
            ? pick(T.holding, locale)
            : (zh ? '第 ' + count + ' / ' + total + ' 字' : 'Character ' + count + ' of ' + total) +
              ' · ' +
              speed +
              'ms'}
      </p>
    </div>
  )
}
