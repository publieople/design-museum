import { useEffect, useRef, useState } from 'react'
import type { DemoProps } from '../data/types'
import { numberValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'

const PARAGRAPHS = Array.from({ length: 16 }, (_, index) => index + 1)

function nativeSupport(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('animation-timeline: scroll()')
  )
}

const KEYFRAMES =
  '@keyframes dm-motion-sda-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }' +
  '@keyframes dm-motion-sda-card { from { opacity: 0.25; } to { opacity: 1; } }'

export default function ScrollDrivenDemo({ values, replayKey }: DemoProps) {
  const rotate = numberValue(values, 'rotate', 30)
  const cover = numberValue(values, 'range', 60)
  const duration = numberValue(values, 'duration', 600)
  const reduced = usePrefersReducedMotion()

  const boxRef = useRef<HTMLDivElement | null>(null)
  const [supported] = useState(nativeSupport)
  const [progress, setProgress] = useState(0)

  const native = supported && !reduced

  const onScroll = () => {
    const node = boxRef.current
    if (!node) return
    const max = node.scrollHeight - node.clientHeight
    setProgress(max > 0 ? node.scrollTop / max : 0)
  }

  useEffect(() => {
    if (native || reduced) return
    const node = boxRef.current
    if (!node || typeof IntersectionObserver !== 'function') return
    const rows = Array.from(node.querySelectorAll('[data-card]'))
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const card = entry.target as HTMLElement
          card.style.opacity = '1'
          card.style.transform = 'perspective(600px) rotateY(0deg) scale(1)'
          observer.unobserve(entry.target)
        }
      },
      { root: node, threshold: 0.25 },
    )
    for (const row of rows) observer.observe(row)
    return () => observer.disconnect()
  }, [native, reduced, replayKey, duration])

  const clamp = (value: number) => Math.max(0, Math.min(1, value))

  return (
    <div className="w-full max-w-xs">
      <style>{KEYFRAMES}</style>

      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">scroll driven</p>
        <span
          className="rounded border px-1.5 py-0.5 font-mono text-[9px]"
          style={{ borderColor: 'color-mix(in srgb, var(--stage-ink) 22%, transparent)' }}
        >
          {native ? 'animation-timeline' : 'JS 兜底'}
        </span>
      </div>
      <p className="mt-0.5 text-[11px] opacity-70">
        滚动位置就是动画进度：卡片滚进来时转正并淡入，顶部进度条与滚动条同步。
      </p>

      <div
        className="mt-3 overflow-hidden rounded-lg"
        style={{ border: '1px solid color-mix(in srgb, var(--stage-ink) 14%, transparent)' }}
      >
        <div
          className="relative h-1.5"
          style={{ background: 'color-mix(in srgb, var(--stage-ink) 12%, transparent)' }}
        >
          <span
            key={'bar-' + replayKey}
            className="absolute inset-0 origin-left"
            style={{
              background: 'var(--stage-ink)',
              transform: native ? 'scaleX(0)' : 'scaleX(' + clamp(progress).toFixed(3) + ')',
              animation: native ? 'dm-motion-sda-progress linear both' : 'none',
              animationTimeline: native ? 'scroll()' : 'auto',
            }}
          />
        </div>

        <div
          ref={boxRef}
          key={'box-' + replayKey}
          onScroll={onScroll}
          className="h-56 overflow-y-auto overscroll-contain p-3"
          style={{ background: 'color-mix(in srgb, var(--stage-ink) 5%, transparent)' }}
          tabIndex={0}
          aria-label="可滚动的滚动驱动动画演示"
        >
          <p className="mb-3 font-mono text-[10px] opacity-60">↓ 在这个框里滚动</p>
          <div className="flex flex-col gap-2.5">
            {PARAGRAPHS.map((index, position) => (
              <div
                key={index}
                style={{ perspective: native ? undefined : '600px' }}
              >
                <div
                  data-card
                  className="rounded-lg border px-2.5 py-3"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--stage-ink) 16%, transparent)',
                    transform: native
                      ? 'perspective(600px) rotateY(' + rotate + 'deg) scale(0.86)'
                      : 'perspective(600px) rotateY(-42deg) scale(0.86)',
                    opacity: native ? undefined : 0.25,
                    transition: native
                      ? 'none'
                      : 'opacity ' + duration + 'ms ease-out, transform ' + duration + 'ms ease-out',
                    animation: native ? 'dm-motion-sda-card linear both' : 'none',
                    animationTimeline: native ? 'view()' : 'auto',
                    animationRange: native ? 'entry 0% cover ' + cover + '%' : 'normal',
                  }}
                >
                  <span className="font-mono text-[10px] opacity-50">0{position + 1}</span>
                  <span className="ml-2 text-[11px]">第 {index} 张卡片，滚到它就转正。</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-2 font-mono text-[10px] opacity-60">
        {native
          ? 'animation-timeline: scroll() / view() · 区间 cover ' + cover + '%'
          : (reduced ? '已减少动效 · ' : '此浏览器不支持 animation-timeline · ') +
            '进度 ' + Math.round(clamp(progress) * 100) + '%'}
      </p>
      <p className="mt-1 font-mono text-[10px] opacity-50">
        最大旋转 {rotate}deg · 降级时长 {duration}ms
      </p>
    </div>
  )
}
