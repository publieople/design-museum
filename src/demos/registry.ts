import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { DemoProps } from '../data/types'

/**
 * 非 eager：30 个 demo 各自一个 chunk，首页只下载真正挂出来的那几个。
 * eager 版本会把全部 demo 打进主包（实测单包 433KB）。
 */
const modules = import.meta.glob<{ default: ComponentType<DemoProps> }>('./*.tsx')

const LAZY_CACHE = new Map<string, LazyExoticComponent<ComponentType<DemoProps>>>()

function pathFor(slug: string): string {
  return `./${slug}.tsx`
}

/** 同步的加载器：懒加载渲染用它，测试也用它（测试里直接 await 拿组件） */
export function demoLoader(slug: string) {
  return modules[pathFor(slug)]
}

export function hasDemo(slug: string): boolean {
  return pathFor(slug) in modules
}

/** 拿一个按需加载的 demo 组件；同一个 slug 只创建一次 lazy 包装，避免每次渲染都重挂载 */
export function demoFor(slug: string): LazyExoticComponent<ComponentType<DemoProps>> | undefined {
  const cached = LAZY_CACHE.get(slug)
  if (cached) return cached

  const loader = demoLoader(slug)
  if (!loader) return undefined

  const Component = lazy(async () => {
    const mod = await loader()
    return { default: mod.default }
  })
  LAZY_CACHE.set(slug, Component)
  return Component
}

export const DEMO_SLUGS = Object.keys(modules)
  .map((path) => path.replace('./', '').replace(/\.tsx$/, ''))
  .sort()
