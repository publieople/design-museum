import { useRef, useState } from 'react'
import type { DemoProps } from '../data/types'
import { boolValue, numberValue } from '../lib/controls'

const PARAGRAPHS = Array.from({ length: 14 }, (_, index) => index + 1)

export default function StickyHeaderDemo({ values, stage, replayKey }: DemoProps) {
  const threshold = numberValue(values, 'threshold', 60)
  const hide = boolValue(values, 'hide', true)
  const blur = numberValue(values, 'blur', 8)

  const boxRef = useRef<HTMLDivElement | null>(null)
  const lastY = useRef(0)
  const [state, setState] = useState({ scrolled: false, hidden: false })

  const onScroll = () => {
    const node = boxRef.current
    if (!node) return
    const y = node.scrollTop
    const goingDown = y > lastY.current
    const hidden = hide && goingDown && y > threshold
    lastY.current = y
    setState((prev) => {
      const next = { scrolled: y > threshold, hidden }
      return prev.scrolled === next.scrolled && prev.hidden === next.hidden ? prev : next
    })
  }

  const dark = stage === 'dark' || stage === 'accent'
  const surface = dark ? 'rgba(14,14,16,0.72)' : 'rgba(255,255,255,0.72)'

  return (
    <div className="w-full max-w-xs rounded-lg p-3" style={{ background: 'color-mix(in srgb, var(--stage-ink) 6%, transparent)' }}>
      <div
        ref={boxRef}
        key={replayKey}
        onScroll={onScroll}
        className="h-56 overflow-y-auto overscroll-contain rounded-md"
        style={{ background: stage === 'light' || stage === 'photo' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.28)' }}
        tabIndex={0}
        aria-label="可滚动的演示容器"
      >
        <header
          className="sticky top-0 z-10 transition-transform duration-250 ease-out"
          style={{
            transform: state.hidden ? 'translateY(-100%)' : 'translateY(0)',
            background: state.scrolled ? surface : 'transparent',
            backdropFilter: state.scrolled ? `blur(${blur}px)` : undefined,
            WebkitBackdropFilter: state.scrolled ? `blur(${blur}px)` : undefined,
            borderBottom: `1px solid ${state.scrolled ? 'color-mix(in srgb, var(--stage-ink) 22%, transparent)' : 'transparent'}`,
          }}
        >
          <div className="flex items-center justify-between px-3 py-2">
            <span className="font-display text-xs font-semibold">站点名</span>
            <span className="font-mono text-[10px] opacity-60">
              {state.hidden ? '已隐藏' : state.scrolled ? '已吸顶' : '在顶部'}
            </span>
          </div>
        </header>

        <div className="flex flex-col gap-2 p-3">
          {PARAGRAPHS.map((index) => (
            <p
              key={index}
              className="rounded border px-2 py-1.5 text-[11px] opacity-70"
              style={{ borderColor: 'color-mix(in srgb, var(--stage-ink) 16%, transparent)' }}
            >
              第 {index} 段内容 —— 往上滑试试，头部会藏起来；往下滑它会回来。
            </p>
          ))}
        </div>
      </div>
      <p className="mt-2 text-center font-mono text-[10px] opacity-60">↑↓ 在上面的框里滚动</p>
    </div>
  )
}
