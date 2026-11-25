import { describe, expect, it } from 'vitest'
import { resolveConfusionTarget } from '../lib/confusions'
import { ENTRIES } from './index'
import { metaOf } from './metaOf'

const METAS = ENTRIES.map(metaOf)
const BY_SLUG = new Map(ENTRIES.map((entry) => [entry.slug, entry]))

function list(items: string[]) {
  return items.length > 0 ? items.join('、') : '无'
}

/** 把 `confusions[].with` 解析成站内词条的 slug；解析不到的概念（如「半透明」）返回 null */
function resolvedSlugs(entry: (typeof ENTRIES)[number]) {
  return entry.confusions
    .map((item) => resolveConfusionTarget(item.with, METAS)?.slug ?? null)
    .filter((slug): slug is string => slug !== null)
}

describe('词条数据图', () => {
  describe('related', () => {
    it('每条词条至少有一条相关展品', () => {
      const empty = ENTRIES.filter((entry) => entry.related.length === 0).map((entry) => entry.slug)
      expect(empty, `这些词条的 related 是空的：${list(empty)}`).toEqual([])
    })

    it('不指向自己，也不重复', () => {
      const problems: string[] = []
      for (const entry of ENTRIES) {
        const seen = new Set<string>()
        for (const slug of entry.related) {
          if (slug === entry.slug) problems.push(`${entry.slug} 指向了自己`)
          if (seen.has(slug)) problems.push(`${entry.slug} 重复指向 ${slug}`)
          seen.add(slug)
        }
      }
      expect(problems, problems.join('；')).toEqual([])
    })

    it('全部是站内在册词条，没有死链', () => {
      const dangling: string[] = []
      for (const entry of ENTRIES) {
        for (const slug of entry.related) {
          if (!BY_SLUG.has(slug)) dangling.push(`${entry.slug} -> ${slug}`)
        }
      }
      expect(dangling, `这些 related 指向了不存在的词条：${list(dangling)}`).toEqual([])
    })
  })

  describe('confusions', () => {
    it('with 与 diff 都写了内容', () => {
      const problems: string[] = []
      for (const entry of ENTRIES) {
        for (const item of entry.confusions) {
          if (item.with.trim().length === 0) problems.push(`${entry.slug} 有一条易混项的 with 为空`)
          if (item.diff.trim().length === 0) problems.push(`${entry.slug} 的「${item.with}」diff 为空`)
        }
      }
      expect(problems, problems.join('；')).toEqual([])
    })

    it('同一条词条内不重复写同一个易混对象', () => {
      const problems: string[] = []
      for (const entry of ENTRIES) {
        const seen = new Set<string>()
        for (const item of entry.confusions) {
          const key = item.with.trim()
          if (seen.has(key)) problems.push(`${entry.slug} 重复写了「${key}」`)
          seen.add(key)
        }
      }
      expect(problems, problems.join('；')).toEqual([])
    })

    it('双向提及的易混条目，两边 diff 都非空', () => {
      const problems: string[] = []
      for (const entry of ENTRIES) {
        for (const item of entry.confusions) {
          const target = resolveConfusionTarget(item.with, METAS)
          if (!target) continue
          const other = BY_SLUG.get(target.slug)
          if (!other) continue
          const back = other.confusions.find(
            (candidate) => resolveConfusionTarget(candidate.with, METAS)?.slug === entry.slug,
          )
          if (!back) continue
          if (item.diff.trim().length === 0) {
            problems.push(`${entry.slug} 与 ${target.slug} 互相提及，但 ${entry.slug} 的 diff 为空`)
          }
          if (back.diff.trim().length === 0) {
            problems.push(`${entry.slug} 与 ${target.slug} 互相提及，但 ${target.slug} 的 diff 为空`)
          }
        }
      }
      expect(problems, problems.join('；')).toEqual([])
    })
  })

  describe('孤儿', () => {
    it('每条词条至少被另一条词条提到一次', () => {
      const mentioned = new Set<string>()
      for (const entry of ENTRIES) {
        for (const slug of entry.related) mentioned.add(slug)
        for (const slug of resolvedSlugs(entry)) mentioned.add(slug)
      }
      const orphans = ENTRIES.filter((entry) => !mentioned.has(entry.slug)).map((entry) => entry.slug)
      expect(orphans, `这些词条没有被任何其它词条在 related 或 confusions 里提到：${list(orphans)}`).toEqual([])
    })

    it('没有单边 confusions（双向提及是数据质量要求）', () => {
      const single: string[] = []
      for (const entry of ENTRIES) {
        for (const item of entry.confusions) {
          const target = resolveConfusionTarget(item.with, METAS)
          if (!target) continue
          const other = BY_SLUG.get(target.slug)
          if (!other) continue
          const back = other.confusions.some(
            (candidate) => resolveConfusionTarget(candidate.with, METAS)?.slug === entry.slug,
          )
          if (!back) single.push(`${entry.slug} -> ${target.slug}`)
        }
      }
      // 打印出来便于 Lead 核对；断言按 Lead 的要求收紧到 0
      console.log(
        `[数据图] 单边 confusions：${single.length} 条${single.length > 0 ? `（${single.join('；')}）` : ''}`,
      )
      expect(single, `这些 confusions 只有单向：${list(single)}`).toEqual([])
    })
  })
})
