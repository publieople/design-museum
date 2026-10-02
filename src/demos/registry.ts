import type { ComponentType } from 'react'
import type { DemoProps } from '../data/types'

const modules = import.meta.glob<{ default: ComponentType<DemoProps> }>('./*.tsx', { eager: true })

/** slug → demo 组件。文件名必须与词条 slug 一致，内容校验会检查这一点。 */
export const DEMOS: Record<string, ComponentType<DemoProps>> = {}
for (const [path, mod] of Object.entries(modules)) {
  const slug = path.split('/').pop()!.replace(/\.tsx$/, '')
  DEMOS[slug] = mod.default
}

export function demoFor(slug: string): ComponentType<DemoProps> | undefined {
  return DEMOS[slug]
}

export const DEMO_SLUGS = Object.keys(DEMOS).sort()
