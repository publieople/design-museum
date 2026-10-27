import { useEffect, useRef, useState } from 'react'
import type { DemoProps } from '../data/types'
import { boolValue, numberValue, stringValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'
import { pick } from '../i18n/pick'

const CHAPTERS = Array.from({ length: 8 }, (_, index) => index + 1)

const T = {
  eyebrow: { zh: '滚动进度条', en: 'Scroll progress' },
  blurb: {
    zh: '顶部这条线跟着阅读进度走：它在滚动容器里，没滚到底就不会满。',
    en: 'The line on top follows the reading position. It lives inside the scroller, so it only fills when you reach the end.',
  },
  aria: { zh: '带滚动进度条的阅读演示', en: 'Reading demo with a scroll progress bar' },
  hint: { zh: '↓ 在这个框里滚动', en: '↓ Scroll inside this box' },
  native: { zh: 'CSS 时间线', en: 'CSS timeline' },
  fallback: { zh: 'JS 兜底', en: 'JS fallback' },
  unsupported: { zh: '此浏览器没有 animation-timeline，切到 JS 兜底看效果', en: 'This browser has no animation-timeline; switch to the JS fallback' },
  chapter: { zh: '第 {n} 节', en: 'Section {n}' },
  body: {
    zh: '进度条不负责解释内容，它只回答一个问题：还剩多少。阅读类页面把这个问题答清楚，读者就不容易在中途放弃。',
    en: 'A progress bar does not explain the content; it answers one question: how much is left. Answer that clearly and readers are less likely to give up halfway.',
  },
  readout: { zh: '已读', en: 'Read' },
  done: { zh: '到底了', en: 'The end' },
} as const

function nativeSupport(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('animation-timeline: scroll()')
  )
}

const KEYFRAMES =
  '@keyframes dm-motion-progress-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }'

export default function ScrollProgressDemo({ values, replayKey, locale = 'zh' }: DemoProps) {
  const zh = locale !== 'en'
  const height = numberValue(values, 'height', 3)
  const showTrack = boolValue(values, 'track', true)
  const mode = stringValue(values, 'mode', 'auto')
  const reduced = usePrefersReducedMotion()

  const boxRef = useRef<HTMLDivElement | null>(null)
  const [supported] = useState(nativeSupport)
  const [progress, setProgress] = useState(0)

  const cssTimeline = supported && mode !== 'js'
  const percent = Math.round(progress * 100)

  useEffect(() => {
    // 滚动容器也可能是 .well 自己的内容；重播时把阅读位置放回开头。
    const node = boxRef.current
    if (node) node.scrollTop = 0
    // oxlint-disable-next-line react/set-state-in-effect -- 重播时把读数归零，属于同步外部滚动容器
    setProgress(0)
  }, [replayKey])

  const onScroll = () => {
    const node = boxRef.current
    if (!node) return
    const max = node.scrollHeight - node.clientHeight
    setProgress(max > 0 ? Math.min(1, Math.max(0, node.scrollTop / max)) : 0)
  }

  return (
    <div className="w-full max-w-sm">
      <style>{KEYFRAMES}</style>

      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">
          scroll progress
        </p>
        <span
          className="rounded border px-1.5 py-0.5 font-mono text-[9px]"
          style={{ borderColor: 'color-mix(in srgb, var(--stage-ink) 22%, transparent)' }}
        >
          {cssTimeline ? pick(T.native, locale) : pick(T.fallback, locale)}
        </span>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed opacity-70">{pick(T.blurb, locale)}</p>

      <div
        className="mt-3 overflow-hidden rounded-lg"
        style={{ border: '1px solid color-mix(in srgb, var(--stage-ink) 14%, transparent)' }}
      >
        <div
          ref={boxRef}
          key={'box-' + replayKey}
          data-scroller
          onScroll={onScroll}
          className="relative h-64 overflow-y-auto overscroll-contain"
          style={{ background: 'color-mix(in srgb, var(--stage-ink) 4%, transparent)' }}
          tabIndex={0}
          aria-label={pick(T.aria, locale)}
        >
          {/* 进度条必须在滚动容器里：animation-timeline: scroll() 找的是元素自己的
              最近滚动祖先。放到框外，时间线取不到，条子会一直停在 0。 */}
          <div
            className="sticky top-0 z-10 w-full"
            aria-hidden="true"
            style={{
              height,
              background: showTrack
                ? 'color-mix(in srgb, var(--stage-ink) 10%, transparent)'
                : 'transparent',
            }}
          >
            <span
              key={'bar-' + replayKey}
              data-progress-bar
              className="block h-full origin-left"
              style={{
                background: 'var(--stage-ink)',
                transform: cssTimeline ? 'scaleX(0)' : 'scaleX(' + progress.toFixed(3) + ')',
                animation: cssTimeline ? 'dm-motion-progress-fill linear both' : 'none',
                animationTimeline: cssTimeline ? 'scroll()' : 'auto',
                transition: reduced ? 'none' : undefined,
              }}
            />
          </div>

          <div className="px-4 pb-4 pt-3">
            <p className="font-mono text-[10px] opacity-50">{pick(T.hint, locale)}</p>
            <p className="mt-2 font-display text-[15px] font-semibold leading-snug">
              {zh ? '读完这一页，线就满了' : 'Reach the end and the line is full'}
            </p>
            <div className="mt-3 flex flex-col gap-3">
              {CHAPTERS.map((chapter) => (
                <section key={chapter} className="border-t pt-2" style={{ borderColor: 'color-mix(in srgb, var(--stage-ink) 10%, transparent)' }}>
                  <p className="font-mono text-[9px] uppercase tracking-widest opacity-45">
                    {pick(T.chapter, locale).replace('{n}', String(chapter))}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed opacity-75">{pick(T.body, locale)}</p>
                </section>
              ))}
            </div>
            <p className="mt-4 border-t pt-2 text-center font-mono text-[10px] uppercase tracking-widest opacity-50" style={{ borderColor: 'color-mix(in srgb, var(--stage-ink) 10%, transparent)' }}>
              {pick(T.done, locale)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2 font-mono text-[10px] opacity-60">
        <span>
          {pick(T.readout, locale)} {percent}%
        </span>
        <span>{height}px</span>
      </div>
      {!supported && mode !== 'js' ? (
        <p className="mt-1 font-mono text-[10px] leading-relaxed opacity-55">{pick(T.unsupported, locale)}</p>
      ) : null}
    </div>
  )
}
