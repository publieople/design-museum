import type { ComponentType } from 'react'

/**
 * 现场页演示的唯一加载表：src/pages/LivePage.tsx 按 slug 取加载器，
 * 页面级 lazy 保证 /live/ 索引不会把五个整页演示一起下载。
 * 注册表与 src/data/live.ts 的一致性由 src/data/live.test.ts 守着。
 */
export type LiveDemoComponent = ComponentType

export const LIVE_MODULES: Record<string, () => Promise<{ default: LiveDemoComponent }>> = {
  'scroll-driven': () => import('./scroll-driven'),
  'scroll-reveal': () => import('./scroll-reveal'),
  parallax: () => import('./parallax'),
  'sticky-stack': () => import('./sticky-stack'),
  'cursor-follower': () => import('./cursor-follower'),
}

export function liveDemoLoader(slug: string): (() => Promise<{ default: LiveDemoComponent }>) | undefined {
  return LIVE_MODULES[slug]
}
