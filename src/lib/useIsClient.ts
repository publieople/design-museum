import { useSyncExternalStore } from 'react'

/** 订阅一个永远不变的外部源：客户端返回 true，SSR 返回 false */
const subscribe = () => () => {}

/**
 * 当前是不是在浏览器里渲染。
 *
 * 现场页的演示要挂全局监听、读 window，SSR 里既没意义也容易炸；预渲染那份
 * HTML 由静态封面负责（标题、说明、返回链接），客户端再把演示挂上去。
 * 用 useSyncExternalStore 而不是 useEffect + setState：首帧就知道答案，不闪。
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
