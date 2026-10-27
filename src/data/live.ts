import type { StringKey } from '../i18n/strings'

/**
 * 现场页注册表：有些效果在展台（DemoStage）里演不出来，它们依赖整页滚动、
 * 整个视口或真实指针。这些效果有第二个演示形态——/live/<slug>/，页面本身就是
 * 演示，不用站点头尾，只留一条浮动导航。
 *
 * 为什么不写进 Entry 字段：词条数据是「标本档案」，现场页是一种呈现方式，
 * 属于站点层；而且 Entry 加字段要联动 types → metaOf → entries.test → gen:meta
 * 一整条链，为一个可选演示不值当。这里只登记 slug 与说明文案 key，
 * 演示组件本体在 src/livedemos/<slug>.tsx，按路由懒加载。
 *
 * 注意：登记了现场页不等于词条可以依赖整页滚动。展台 demo 仍然必须自带
 * 滚动容器（见 docs/ENTRY-SPEC.md），只有 /live/ 页面允许用 window 滚动。
 */
export type LiveGroupId = 'scroll' | 'layout' | 'navigation' | 'overlay' | 'pointer'

export interface LiveGroup {
  id: LiveGroupId
  titleKey: StringKey
}

export const LIVE_GROUPS: readonly LiveGroup[] = [
  { id: 'scroll', titleKey: 'live.group.scroll' },
  { id: 'layout', titleKey: 'live.group.layout' },
  { id: 'navigation', titleKey: 'live.group.navigation' },
  { id: 'overlay', titleKey: 'live.group.overlay' },
  { id: 'pointer', titleKey: 'live.group.pointer' },
]

export interface LiveDemo {
  slug: string
  group: LiveGroupId
  /** 现场页顶部那句「这个效果为什么需要整页」 */
  noteKey: StringKey
}

/** 顺序即「上一个 / 下一个现场」的顺序，也是 /live/ 索引里的顺序 */
export const LIVE_DEMOS: readonly LiveDemo[] = [
  { slug: 'scroll-driven', group: 'scroll', noteKey: 'live.note.scroll-driven' },
  { slug: 'scroll-reveal', group: 'scroll', noteKey: 'live.note.scroll-reveal' },
  { slug: 'parallax', group: 'scroll', noteKey: 'live.note.parallax' },
  { slug: 'virtual-scrolling', group: 'scroll', noteKey: 'live.note.virtual-scrolling' },
  { slug: 'scroll-progress', group: 'scroll', noteKey: 'live.note.scroll-progress' },
  { slug: 'sticky-stack', group: 'layout', noteKey: 'live.note.sticky-stack' },
  { slug: 'sticky-header', group: 'layout', noteKey: 'live.note.sticky-header' },
  { slug: 'view-transitions', group: 'navigation', noteKey: 'live.note.view-transitions' },
  { slug: 'command-palette', group: 'overlay', noteKey: 'live.note.command-palette' },
  { slug: 'toast', group: 'overlay', noteKey: 'live.note.toast' },
  { slug: 'cursor-follower', group: 'pointer', noteKey: 'live.note.cursor-follower' },
]

const BY_SLUG = new Map(LIVE_DEMOS.map((demo) => [demo.slug, demo]))

export function findLiveDemo(slug: string | undefined): LiveDemo | undefined {
  return slug ? BY_SLUG.get(slug) : undefined
}

export function hasLiveDemo(slug: string): boolean {
  return BY_SLUG.has(slug)
}

/** 上一个 / 下一个现场（循环），浮动导航用 */
export function liveNeighbours(slug: string): { prev: LiveDemo; next: LiveDemo } {
  const index = LIVE_DEMOS.findIndex((demo) => demo.slug === slug)
  const safe = index === -1 ? 0 : index
  return {
    prev: LIVE_DEMOS[(safe - 1 + LIVE_DEMOS.length) % LIVE_DEMOS.length],
    next: LIVE_DEMOS[(safe + 1) % LIVE_DEMOS.length],
  }
}
