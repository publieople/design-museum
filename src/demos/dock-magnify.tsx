import { useState, type PointerEvent } from 'react'
import type { DemoProps } from '../data/types'
import { boolValue, numberValue } from '../lib/controls'
import { usePrefersReducedMotion } from '../lib/motion'
import { pick } from '../i18n/pick'

const T = {
  aria: { zh: '停靠栏放大演示', en: 'Dock magnification demo' },
  hint: { zh: '把指针横向扫过图标', en: 'Sweep the pointer across the icons' },
  reduced: { zh: '已开启减少动态效果：图标保持原始大小', en: 'Reduced motion is on: the icons keep their size' },
  readout: { zh: '最大缩放', en: 'Max scale' },
  radius: { zh: '影响半径', en: 'Radius' },
} as const

// 图标只是几何字形，避免引入图标库；名字给读屏用
const ICONS = [
  { glyph: '✦', zh: '灵感', en: 'Ideas' },
  { glyph: '◧', zh: '图层', en: 'Layers' },
  { glyph: '⌘', zh: '命令', en: 'Command' },
  { glyph: '◎', zh: '预览', en: 'Preview' },
  { glyph: '▤', zh: '文稿', en: 'Docs' },
  { glyph: '✳', zh: '作品', en: 'Work' },
  { glyph: '◈', zh: '组件', en: 'Parts' },
]

export default function DockMagnifyDemo({ values, stage, locale = 'zh' }: DemoProps) {
  const maxScale = numberValue(values, 'maxScale', 1.55)
  const radius = numberValue(values, 'radius', 120)
  const labels = boolValue(values, 'labels', true)
  const reduced = usePrefersReducedMotion()
  const zh = locale !== 'en'
  const [pointer, setPointer] = useState<{ x: number; width: number } | null>(null)

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    // 触屏没有 hover，直接用原始大小，避免手指按住时整排乱跳
    if (reduced || event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    setPointer({ x: event.clientX - rect.left, width: rect.width })
  }

  const cellWidth = pointer ? pointer.width / ICONS.length : 0
  const scales = ICONS.map((_, index) => {
    if (!pointer) return { scale: 1, lift: 0 }
    const center = (index + 0.5) * cellWidth
    const distance = Math.abs(pointer.x - center)
    const influence = Math.max(0, 1 - distance / radius)
    const eased = influence * influence
    return { scale: 1 + (maxScale - 1) * eased, lift: -Math.round(eased * 8) }
  })
  const nearest = pointer
    ? scales.reduce((best, current, index) => (current.scale > scales[best].scale ? index : best), 0)
    : -1

  return (
    <div
      data-stage={stage}
      className="flex w-full max-w-sm flex-col items-center gap-4"
      aria-label={pick(T.aria, locale)}
    >
      <div
        onPointerMove={handleMove}
        onPointerLeave={() => setPointer(null)}
        onPointerCancel={() => setPointer(null)}
        className="flex w-full items-end gap-1 rounded-2xl px-3 pb-2 pt-12"
        style={{
          touchAction: 'pan-y',
          border: '1px solid color-mix(in srgb, var(--stage-ink) 12%, transparent)',
          background: 'color-mix(in srgb, var(--stage-ink) 5%, transparent)',
        }}
      >
        {ICONS.map((icon, index) => (
          <div key={icon.zh} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
              style={{
                color: 'var(--stage-ink)',
                background: 'color-mix(in srgb, var(--stage-ink) 12%, transparent)',
                border:
                  index === nearest
                    ? '1px solid color-mix(in srgb, var(--accent) 60%, transparent)'
                    : '1px solid transparent',
                transform:
                  'translate3d(0, ' + scales[index].lift + 'px, 0) scale(' + scales[index].scale.toFixed(3) + ')',
                transformOrigin: 'bottom center',
                transition: reduced ? 'none' : 'transform 80ms linear',
              }}
            >
              {icon.glyph}
            </span>
            {labels ? (
              <span className="truncate text-[10px]" style={{ color: 'var(--stage-muted, var(--stage-ink))' }}>
                {zh ? icon.zh : icon.en}
              </span>
            ) : (
              <span className="sr-only">{zh ? icon.zh : icon.en}</span>
            )}
          </div>
        ))}
      </div>
      <p className="text-center font-mono text-[10px] opacity-60">
        {reduced
          ? pick(T.reduced, locale)
          : pointer
            ? pick(T.readout, locale) +
              ' ' +
              maxScale.toFixed(2) +
              '× · ' +
              pick(T.radius, locale) +
              ' ' +
              radius +
              'px'
            : pick(T.hint, locale)}
      </p>
    </div>
  )
}
