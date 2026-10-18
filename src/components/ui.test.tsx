import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Button, buttonClass } from './Button'
import { EmptyState, Skeleton } from './EmptyState'
import { Kbd, MetaLine, Rule, Tag } from './Meta'
import {
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconChevronDown,
  IconClose,
  IconCopy,
  IconExternal,
  IconMenu,
  IconReplay,
  IconSearch,
  IconSettings,
} from './icons'

/** P1 基础小件的冒烟：只保证 SSR 不炸、类名拼装正确；好不好看靠截图验收。 */

const ICONS = {
  IconSearch,
  IconMenu,
  IconClose,
  IconArrowRight,
  IconArrowUpRight,
  IconCopy,
  IconCheck,
  IconChevronDown,
  IconSettings,
  IconExternal,
  IconReplay,
}

describe('icons', () => {
  it('每个图标都是 16px 的内联描边 SVG，且对读屏隐藏', () => {
    for (const [name, Icon] of Object.entries(ICONS)) {
      const html = renderToString(<Icon />)
      expect(html, name).toContain('viewBox="0 0 24 24"')
      expect(html, name).toContain('width="16"')
      expect(html, name).toContain('height="16"')
      expect(html, name).toContain('fill="none"')
      expect(html, name).toContain('stroke="currentColor"')
      expect(html, name).toContain('stroke-width="1.5"')
      expect(html, name).toContain('stroke-linecap="round"')
      expect(html, name).toContain('stroke-linejoin="round"')
      expect(html, name).toContain('aria-hidden="true"')
    }
  })

  it('支持自定义尺寸与类名', () => {
    const html = renderToString(<IconSearch size={20} className="shrink-0" />)
    expect(html).toContain('width="20"')
    expect(html).toContain('height="20"')
    expect(html).toContain('class="shrink-0"')
  })
})

describe('Button', () => {
  it('buttonClass 默认 primary + md', () => {
    expect(buttonClass()).toBe(buttonClass({ variant: 'primary', size: 'md' }))
  })

  it('buttonClass 覆盖三种变体与两档尺寸', () => {
    const primary = buttonClass({ variant: 'primary' })
    expect(primary).toContain('bg-ink')
    expect(primary).toContain('text-canvas')
    expect(primary).toContain('hover:bg-accent')
    expect(primary).toContain('hover:text-accent-ink')
    expect(primary).toContain('rounded-[3px]')
    expect(primary).toContain('transition-colors')

    expect(buttonClass({ variant: 'secondary' })).toContain('border-line-strong')
    expect(buttonClass({ variant: 'ghost' })).toContain('text-ink-2')

    expect(buttonClass({ size: 'sm' })).toContain('px-3')
    expect(buttonClass({ size: 'sm' })).toContain('py-1.5')
    expect(buttonClass({ size: 'sm' })).toContain('text-[12px]')
    expect(buttonClass({ size: 'md' })).toContain('px-4')
    expect(buttonClass({ size: 'md' })).toContain('py-2.5')
    expect(buttonClass({ size: 'md' })).toContain('text-[13px]')
  })

  it('Button 透传原生属性，默认 type=button', () => {
    const plain = renderToString(<Button>确定</Button>)
    expect(plain).toContain('type="button"')
    expect(plain).toContain('确定')

    const html = renderToString(
      <Button type="submit" disabled variant="secondary" size="sm" className="w-full">
        提交
      </Button>,
    )
    expect(html).toContain('type="submit"')
    expect(html).toContain('disabled')
    expect(html).toContain('border-line-strong')
    expect(html).toContain('px-3')
    expect(html).toContain('w-full')
    expect(html).toContain('提交')
  })
})

describe('MetaLine / Rule / Tag / Kbd', () => {
  it('MetaLine 渲染 label 与 value，并接受 className', () => {
    const html = renderToString(
      <MetaLine
        className="mb-4"
        items={[{ label: '形态', value: 'stage' }, { label: '循环', value: 'infinite' }, { value: 'V-01' }]}
      />,
    )
    expect(html).toContain('<dl')
    expect(html).toContain('font-mono')
    expect(html).toContain('text-[11px]')
    expect(html).toContain('text-muted')
    expect(html).toContain('mb-4')
    expect(html).toContain('形态')
    expect(html).toContain('stage')
    expect(html).toContain('循环')
    expect(html).toContain('infinite')
    expect(html).toContain('V-01')
    // label 是 dt、value 是 dd
    expect(html.match(/<dt/g)?.length).toBe(2)
    expect(html.match(/<dd/g)?.length).toBe(3)
  })

  it('Rule 的四种结构线', () => {
    const line = renderToString(<Rule />)
    expect(line).toContain('border-t')
    expect(line).toContain('border-line')
    expect(line).toContain('aria-hidden="true"')

    expect(renderToString(<Rule variant="dotted" />)).toContain('border-dotted')
    expect(renderToString(<Rule variant="strong" />)).toContain('border-t-2')
    expect(renderToString(<Rule variant="strong" />)).toContain('border-ink')
    const double = renderToString(<Rule variant="double" className="mt-8" />)
    expect(double).toContain('border-double')
    expect(double).toContain('mt-8')
  })

  it('Tag 区分选中态', () => {
    const idle = renderToString(<Tag>毛玻璃</Tag>)
    expect(idle).toContain('毛玻璃')
    expect(idle).toContain('border-line')
    expect(idle).not.toContain('bg-accent-soft')

    const active = renderToString(<Tag active>毛玻璃</Tag>)
    expect(active).toContain('border-accent')
    expect(active).toContain('bg-accent-soft')
    expect(active).toContain('data-active="true"')
  })

  it('Kbd 渲染键帽', () => {
    const html = renderToString(<Kbd>/</Kbd>)
    expect(html).toContain('<kbd')
    expect(html).toContain('text-micro')
    expect(html).toContain('border-line')
    expect(html).toContain('/')
  })
})

describe('EmptyState / Skeleton', () => {
  it('EmptyState 渲染标题、解释与出口', () => {
    const html = renderToString(
      <EmptyState
        title="没有找到"
        body="换个说法或看看词条库。"
        action={<Button size="sm">清除筛选</Button>}
      />,
    )
    expect(html).toContain('没有找到')
    expect(html).toContain('换个说法或看看词条库。')
    expect(html).toContain('border-dashed')
    expect(html).toContain('<button')
    expect(html).toContain('清除筛选')
  })

  it('EmptyState 的 body 与 action 都可省略', () => {
    const html = renderToString(<EmptyState title="空" />)
    expect(html).toContain('空')
    expect(html).not.toContain('text-caption')
    expect(html).not.toContain('<button')
  })

  it('Skeleton 渲染占位块并接受尺寸类名', () => {
    const html = renderToString(<Skeleton className="h-20 w-full" />)
    expect(html).toContain('animate-pulse')
    expect(html).toContain('motion-reduce:animate-none')
    expect(html).toContain('bg-surface')
    expect(html).toContain('border-line')
    expect(html).toContain('h-20')
    expect(html).toContain('w-full')
    expect(html).toContain('aria-hidden="true"')
  })
})
