/**
 * 粘性堆叠的几何。单独一个模块：组件文件只导出组件（否则 fast refresh 会退化），
 * 测试也直接拿这里的公式算，不用去渲染。
 */

/** 滚动框的可视高度（clientHeight）。几何公式和容器高度必须是同一个数 */
export const STACK_VIEW = 240
export const CARD_HEIGHT = 76
export const CARD_GAP = 10
export const PAD = 12

/** 不含尾部留白的内容高度（含上下内边距） */
function bodyHeight(count: number) {
  return PAD * 2 + count * CARD_HEIGHT + (count - 1) * CARD_GAP
}

export interface StackLayout {
  /** scrollHeight */
  contentHeight: number
  maxScroll: number
  /** 最后一张卡片开始吸附的滚动位置 */
  lastStick: number
  spacer: number
}

/**
 * 这组卡片演得完演不完，只看一件事：可滚动距离追不追得上最后一张的吸附点。
 * 只放卡片本身的话内容不够长——默认参数下曾经 4 张里只有 2 张压得上来。
 * 尾部留白就是拿来补这个差值的（真实页面里这段是后续内容）。
 */
export function stackLayout(count: number, offset: number): StackLayout {
  const body = bodyHeight(count)
  const lastStick = PAD + (count - 1) * (CARD_HEIGHT + CARD_GAP - offset)
  const spacer = Math.max(STACK_VIEW, lastStick + CARD_HEIGHT - (body - STACK_VIEW) + 24)
  return {
    contentHeight: body + spacer,
    maxScroll: body + spacer - STACK_VIEW,
    lastStick,
    spacer,
  }
}
