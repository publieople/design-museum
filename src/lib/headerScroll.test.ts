import { describe, expect, it } from 'vitest'
import { resolveHidden } from './headerScroll'

describe('智能头部的收起判断', () => {
  it('往下滚过阈值就收起来', () => {
    expect(resolveHidden(400, 200, false)).toBe(true)
  })

  it('往上滚立刻回来', () => {
    expect(resolveHidden(180, 400, true)).toBe(false)
  })

  it('靠近顶部永远露出，哪怕是在往下滚', () => {
    expect(resolveHidden(40, 10, true)).toBe(false)
  })

  it('滚得太少不动，避免触控板微抖时来回闪', () => {
    expect(resolveHidden(203, 200, false)).toBe(false)
    expect(resolveHidden(197, 200, true)).toBe(true)
  })

  it('刚过顶部一小段（未到收起阈值）不收', () => {
    expect(resolveHidden(120, 60, false)).toBe(false)
  })
})
