import { useState } from 'react'
import { FACETS, TAGS } from '../data/taxonomy'
import type { FacetId } from '../data/types'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'

interface TagFilterProps {
  legend: string
  selected: string[]
  onToggle: (tag: string) => void
}

/**
 * 标签筛选。18 个标签一次摊开会把筛选区撑得很长，所以按 facet 分页：
 * 先选「从哪个角度看这个效果」（怎么实现 / 什么代价 / 无障碍 / 兼容性），
 * 再看那一面的标签。已选中的标签在 facet 按钮上带个数，换了页也不会漏看。
 */
export function TagFilter({ legend, selected, onToggle }: TagFilterProps) {
  const locale = useLocale()
  const facets = FACETS.filter((facet) => TAGS.some((tag) => tag.facet === facet.id))
  const [picked, setPicked] = useState<FacetId | undefined>(facets[0]?.id)
  const active = facets.find((facet) => facet.id === picked) ?? facets[0]
  if (!active) return null

  const tags = TAGS.filter((tag) => tag.facet === active.id)
  const countIn = (facet: FacetId) =>
    TAGS.filter((tag) => tag.facet === facet && selected.includes(tag.id)).length

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="label-mono">{legend}</span>
        {facets.map((facet) => {
          const on = facet.id === active.id
          const count = countIn(facet.id)
          return (
            <button
              key={facet.id}
              type="button"
              aria-pressed={on}
              title={pick(facet.hint, locale)}
              onClick={() => setPicked(facet.id)}
              className={`cursor-pointer rounded-full border px-2.5 py-1 font-mono text-[11px] tracking-wide transition-colors ${
                on ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-accent'
              }`}
            >
              {pick(facet.label, locale)}
              {count > 0 ? ` · ${count}` : null}
            </button>
          )
        })}
      </div>

      <fieldset className="flex flex-wrap items-center gap-x-3 gap-y-2 border-0 p-0">
        {/* 图例只给屏幕阅读器：facet 按钮上已经写了同一句话，再显示一遍是重复 */}
        <legend className="sr-only">{pick(active.label, locale)}</legend>
        {tags.map((tag) => {
          const on = selected.includes(tag.id)
          return (
            <button
              key={tag.id}
              type="button"
              aria-pressed={on}
              title={pick(tag.hint, locale)}
              onClick={() => onToggle(tag.id)}
              className={`surface-pill cursor-pointer rounded-full border px-3 py-1 text-xs ${
                on ? 'border-accent bg-accent/10 text-accent' : 'border-line text-muted'
              }`}
            >
              {pick(tag.label, locale)}
            </button>
          )
        })}
      </fieldset>
    </div>
  )
}
