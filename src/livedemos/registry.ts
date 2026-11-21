import type { ComponentType } from 'react'

/**
 * 现场页演示的唯一加载表：src/pages/LivePage.tsx 按 slug 取加载器，
 * 页面级 lazy 保证 /live/ 索引不会把所有整页演示一起下载。
 * 注册表与 src/data/live.ts 的一致性由 src/data/live.test.ts 守着。
 */
export type LiveDemoComponent = ComponentType

export const LIVE_MODULES: Record<string, () => Promise<{ default: LiveDemoComponent }>> = {
  'scroll-driven': () => import('./scroll-driven'),
  'scroll-reveal': () => import('./scroll-reveal'),
  parallax: () => import('./parallax'),
  'scroll-snap': () => import('./scroll-snap'),
  'virtual-scrolling': () => import('./virtual-scrolling'),
  'scroll-progress': () => import('./scroll-progress'),
  'aurora-gradient': () => import('./aurora-gradient'),
  'mesh-gradient': () => import('./mesh-gradient'),
  'grain-noise': () => import('./grain-noise'),
  'spotlight-glow': () => import('./spotlight-glow'),
  'fluid-type': () => import('./fluid-type'),
  'gradient-text': () => import('./gradient-text'),
  'text-stroke': () => import('./text-stroke'),
  'variable-font': () => import('./variable-font'),
  'sticky-stack': () => import('./sticky-stack'),
  'sticky-header': () => import('./sticky-header'),
  marquee: () => import('./marquee'),
  'count-up': () => import('./count-up'),
  'char-reveal': () => import('./char-reveal'),
  'skeleton-shimmer': () => import('./skeleton-shimmer'),
  'view-transitions': () => import('./view-transitions'),
  'command-palette': () => import('./command-palette'),
  toast: () => import('./toast'),
  'cursor-follower': () => import('./cursor-follower'),
}

export function liveDemoLoader(slug: string): (() => Promise<{ default: LiveDemoComponent }>) | undefined {
  return LIVE_MODULES[slug]
}
