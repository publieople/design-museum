import { describe, expect, it } from 'vitest'
import { CARD_HEIGHT, STACK_VIEW, stackLayout } from './sticky-stack.layout'

/**
 * 这组卡片最容易悄悄坏掉的地方：内容不够长，后面的卡片永远滚不到吸附点，
 * 看上去就是"卡片太少、看不出效果"。默认参数下曾经 4 张里只有 2 张压得上来。
 * 所以这里把滑块范围内的每一种组合都算一遍。
 */
describe('粘性堆叠的几何', () => {
  it('任何控件组合下，最后一张卡片都能吸附并停住', () => {
    for (let count = 3; count <= 6; count += 1) {
      for (let offset = 0; offset <= 44; offset += 2) {
        const layout = stackLayout(count, offset)
        const label = `count=${count} offset=${offset}`
        expect(layout.contentHeight, label).toBeGreaterThan(STACK_VIEW)
        expect(layout.maxScroll, label).toBeGreaterThanOrEqual(layout.lastStick + CARD_HEIGHT)
      }
    }
  })

  it('尾部留白至少一屏，最后一张吸附后还停得住', () => {
    expect(stackLayout(6, 18).spacer).toBeGreaterThanOrEqual(STACK_VIEW)
  })
})
