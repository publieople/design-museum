import { useEffect, useRef, useState } from 'react'
import type { DemoProps } from '../data/types'
import { boolValue, numberValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

interface Item {
  id: string
  label: string
  likes: number
}

const ITEMS: Item[] = [
  { id: 'a', label: '把交互稿标注成 token', likes: 12 },
  { id: 'b', label: '给 demo 补上 reduced-motion', likes: 7 },
  { id: 'c', label: '把踩坑写进 pitfalls', likes: 23 },
]

type Status = 'idle' | 'pending' | 'error'

const initialLikes = (): Record<string, number> =>
  Object.fromEntries(ITEMS.map((item) => [item.id, item.likes] as const))

export default function OptimisticUiDemo({ values, stage, replayKey }: DemoProps) {
  const latency = numberValue(values, 'latency', 1200)
  const failureRate = numberValue(values, 'failureRate', 30)
  const optimistic = boolValue(values, 'optimistic', true)
  const reduced = usePrefersReducedMotion()
  const dark = stage === 'dark' || stage === 'accent'

  const [likes, setLikes] = useState<Record<string, number>>(initialLikes)
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [status, setStatus] = useState<Record<string, Status>>({})
  const timers = useRef<number[]>([])

  useEffect(
    () => () => {
      for (const id of timers.current) window.clearTimeout(id)
    },
    [],
  )

  useEffect(() => {
    for (const id of timers.current) window.clearTimeout(id)
    timers.current = []
    setLikes(initialLikes())
    setLiked({})
    setStatus({})
  }, [replayKey])

  const toggle = (id: string) => {
    const nextLiked = !liked[id]
    if (optimistic) {
      setLiked((prev) => ({ ...prev, [id]: nextLiked }))
      setLikes((prev) => ({ ...prev, [id]: prev[id] + (nextLiked ? 1 : -1) }))
    }
    setStatus((prev) => ({ ...prev, [id]: 'pending' }))
    const timer = window.setTimeout(() => {
      if (Math.random() * 100 < failureRate) {
        if (optimistic) {
          setLiked((prev) => ({ ...prev, [id]: !nextLiked }))
          setLikes((prev) => ({ ...prev, [id]: prev[id] + (nextLiked ? -1 : 1) }))
        }
        setStatus((prev) => ({ ...prev, [id]: 'error' }))
      } else {
        if (!optimistic) {
          setLiked((prev) => ({ ...prev, [id]: nextLiked }))
          setLikes((prev) => ({ ...prev, [id]: prev[id] + (nextLiked ? 1 : -1) }))
        }
        setStatus((prev) => ({ ...prev, [id]: 'idle' }))
      }
    }, latency)
    timers.current.push(timer)
  }

  return (
    <div
      className="w-full max-w-xs rounded-xl p-3"
      style={{
        border: '1px solid color-mix(in srgb, var(--stage-ink) 18%, transparent)',
        background: dark
          ? 'color-mix(in srgb, var(--stage-ink) 6%, transparent)'
          : 'color-mix(in srgb, var(--stage-ink) 4%, transparent)',
        color: 'var(--stage-ink)',
      }}
    >
      <p className="font-mono text-[10px] opacity-60">
        乐观更新 {optimistic ? '开' : '关'} · 延迟 {latency}ms · 失败率 {failureRate}%
      </p>
      <ul className="mt-2 flex flex-col gap-2">
        {ITEMS.map((item) => {
          const isLiked = liked[item.id] === true
          const state = status[item.id]
          return (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2"
              style={{
                border: '1px solid color-mix(in srgb, var(--stage-ink) 20%, transparent)',
              }}
            >
              <span className="flex-1 text-[11px] leading-snug">{item.label}</span>
              {state === 'pending' ? (
                <span className="font-mono text-[9px] opacity-50">同步中</span>
              ) : null}
              {state === 'error' ? (
                <span className="font-mono text-[9px]" style={{ color: '#e0533f' }}>
                  失败，已撤销
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="cursor-pointer rounded-full px-2 py-1 text-[11px]"
                style={{
                  color: isLiked ? '#ffffff' : 'var(--stage-ink)',
                  background: isLiked
                    ? '#e0533f'
                    : 'color-mix(in srgb, var(--stage-ink) 12%, transparent)',
                  transform: isLiked && !reduced ? 'translateY(-1px)' : 'none',
                  transition: 'transform 180ms ease-out, background 180ms ease-out',
                }}
              >
                {isLiked ? '已赞' : '点赞'} {likes[item.id]}
              </button>
            </li>
          )
        })}
      </ul>
      <p className="mt-2 text-center font-mono text-[9px] opacity-45">点几次看看失败时怎么回滚</p>
    </div>
  )
}
