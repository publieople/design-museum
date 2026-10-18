import { describe, expect, it } from 'vitest'
import { ENTRY_META } from '../data/meta'
import { CATEGORIES } from '../data/taxonomy'
import type { CategoryId } from '../data/types'
import { groupRowsByHall, hallSummaries, totalAliases } from './indexData'

describe('索引数据助手', () => {
  describe('hallSummaries', () => {
    it('按展陈顺序返回五个厅', () => {
      const halls = hallSummaries(ENTRY_META)
      expect(halls).toHaveLength(5)
      expect(halls.map((hall) => hall.id)).toEqual(CATEGORIES.map((category) => category.id))
    })

    it('编号字母与中英名取自 CATEGORIES', () => {
      expect(hallSummaries(ENTRY_META)).toEqual(
        CATEGORIES.map((category) => ({
          id: category.id,
          letter: category.letter,
          nameZh: category.nameZh,
          nameEn: category.nameEn,
          count: ENTRY_META.filter((entry) => entry.category === category.id).length,
          aliases: ENTRY_META.filter((entry) => entry.category === category.id).reduce(
            (sum, entry) => sum + entry.aliases.length,
            0,
          ),
        })),
      )
    })

    it('count 合计 40', () => {
      expect(hallSummaries(ENTRY_META).reduce((sum, hall) => sum + hall.count, 0)).toBe(40)
    })

    it('aliases 合计 251', () => {
      expect(hallSummaries(ENTRY_META).reduce((sum, hall) => sum + hall.aliases, 0)).toBe(251)
    })

    it('逐厅计数与按 category 过滤的结果一致', () => {
      for (const hall of hallSummaries(ENTRY_META)) {
        const entries = ENTRY_META.filter((entry) => entry.category === hall.id)
        expect(hall.count, hall.id).toBe(entries.length)
        expect(hall.aliases, hall.id).toBe(
          entries.reduce((sum, entry) => sum + entry.aliases.length, 0),
        )
      }
    })

    it('空数组返回五个全零的厅，而不是空列表', () => {
      const halls = hallSummaries([])
      expect(halls).toHaveLength(CATEGORIES.length)
      expect(halls.every((hall) => hall.count === 0 && hall.aliases === 0)).toBe(true)
    })
  })

  describe('groupRowsByHall', () => {
    const rows = ENTRY_META.map((entry) => ({ entry, label: entry.code }))

    it('组顺序按展陈顺序，一行不丢', () => {
      const groups = groupRowsByHall(rows)
      expect(groups.map((group) => group.hall)).toEqual(CATEGORIES.map((category) => category.id))
      expect(groups.reduce((sum, group) => sum + group.rows.length, 0)).toBe(rows.length)
    })

    it('组内保持传入顺序，并原样保留行上的额外字段', () => {
      const groups = groupRowsByHall(rows)
      for (const group of groups) {
        const expected = rows.filter((row) => row.entry.category === group.hall)
        expect(group.rows.map((row) => row.label)).toEqual(expected.map((row) => row.label))
      }
    })

    it('过滤后没有命中的厅不出现，空组被丢弃', () => {
      const remainder = rows.filter((row) => row.entry.category !== ('type' satisfies CategoryId))
      const groups = groupRowsByHall(remainder)
      expect(groups).toHaveLength(CATEGORIES.length - 1)
      expect(groups.map((group) => group.hall)).not.toContain('type')
      expect(groups.every((group) => group.rows.length > 0)).toBe(true)
    })

    it('空数组返回 []', () => {
      expect(groupRowsByHall([])).toEqual([])
    })
  })

  describe('totalAliases', () => {
    it('全站别名合计 251', () => {
      expect(totalAliases(ENTRY_META)).toBe(251)
    })

    it('与逐条累加一致，空数组为 0', () => {
      const expected = ENTRY_META.reduce((sum, entry) => sum + entry.aliases.length, 0)
      expect(totalAliases(ENTRY_META)).toBe(expected)
      expect(totalAliases([])).toBe(0)
    })
  })
})
