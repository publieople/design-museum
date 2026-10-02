import { useEffect, useRef, useState } from 'react'
import type { DemoProps } from '../data/types'
import { numberValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

const PARAGRAPHS = Array.from({ length: 12 }, (_, index) => index + 1)

function supported(): boolean {
  return typeof window !== 'undefined' && typeof window.IntersectionObserver === 'function'
}

export default function ScrollRevealDemo({ values, replayKey }: DemoProps) {
  const distance = numberValue(values, 'distance', 24)
  const duration = numberValue(values, 'duration', 550)
  const threshold = numberValue(values, 'threshold', 20)
  const delay = numberValue(values, 'delay', 60)
  const reduced = usePrefersReducedMotion()

  const containerRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<(HTMLParagraphElement | null)[]>([])
  const [revealed, setRevealed] = useState<boolean[]>(() => PARAGRAPHS.map(() => !supported()))
  const [seen, setSeen] = useState(0)
  const animated = !reduced && supported()

  useEffect(() => {
    const nodes = itemRefs.current
    if (!animated) {
      setRevealed(PARAGRAPHS.map(() => true))
      setSeen(PARAGRAPHS.length)
      return
    }
    setRevealed(PARAGRAPHS.map(() => false))
    setSeen(0)
    const ratio = Math.min(0.9, Math.max(0.05, threshold / 100))
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const index = nodes.indexOf(entry.target as HTMLParagraphElement)
          if (index < 0) continue
          observer.unobserve(entry.target)
          setRevealed((prev) => {
            if (prev[index]) return prev
            const next = prev.slice()
            next[index] = true
            setSeen(next.filter(Boolean).length)
            return next
          })
        }
      },
      { root: containerRef.current, threshold: ratio, rootMargin: '0px 0px -8% 0px' },
    )
    for (const node of nodes) {
      if (node) observer.observe(node)
    }
    return () => observer.disconnect()
  }, [animated, threshold, replayKey])

  const timing = (position: number) =>
    'opacity ' +
    duration +
    'ms cubic-bezier(0.22, 1, 0.36, 1) ' +
    position * delay +
    'ms, transform ' +
    duration +
    'ms cubic-bezier(0.22, 1, 0.36, 1) ' +
    position * delay +
    'ms'

  return (
    <div className="w-full max-w-xs">
      <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">scroll reveal</p>
      <p className="mt-0.5 text-[11px] opacity-70">
        内容先藏起来，滚进视口才淡入上移。往下滑试试。
      </p>

      <div
        ref={containerRef}
        className="mt-3 h-56 overflow-y-auto overscroll-contain rounded-lg p-3"
        style={{
          background: 'color-mix(in srgb, var(--stage-ink) 6%, transparent)',
          border: '1px solid color-mix(in srgb, var(--stage-ink) 14%, transparent)',
        }}
        tabIndex={0}
        aria-label="可滚动的滚动揭示演示"
      >
        <p className="mb-3 font-mono text-[10px] opacity-60">↓ 在这个框里滚动</p>
        <ul className="flex flex-col gap-2">
          {PARAGRAPHS.map((index, position) => (
            <li key={index}>
              <p
                ref={(node) => {
                  itemRefs.current[position] = node
                }}
                className="rounded-md border px-2.5 py-2 text-[11px] leading-relaxed"
                style={{
                  borderColor: 'color-mix(in srgb, var(--stage-ink) 16%, transparent)',
                  opacity: revealed[position] ? 1 : 0,
                  transform: revealed[position] ? 'translateY(0)' : 'translateY(' + distance + 'px)',
                  transition: animated ? timing(position) : 'none',
                }}
              >
                <span className="font-mono text-[10px] opacity-50">0{position + 1}</span>
                <span className="ml-2">第 {index} 段内容，滚动到这里才会出现。</span>
              </p>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-2 font-mono text-[10px] opacity-60">
        {reduced
          ? '已减少动效：内容直接显示'
          : '已出现 ' + seen + '/' + PARAGRAPHS.length + ' · 阈值 ' + threshold + '% · 位移 ' + distance + 'px'}
      </p>
    </div>
  )
}
