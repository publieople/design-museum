import type { ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Layout } from './components/Layout'
import { NotFound } from './components/NotFound'
import { ToastProvider } from './components/Toast'
import { PREF_DEFAULTS, PrefsProvider } from './lib/prefs'
import { setServerRoute } from './lib/router'
import { AboutPage } from './pages/AboutPage'
import { AliasesPage } from './pages/AliasesPage'
import { BrowsePage } from './pages/BrowsePage'
import { CheatSheetPage } from './pages/CheatSheetPage'
import { ComparePage } from './pages/ComparePage'
import { EntryDetailPage } from './pages/EntryDetailPage'
import { FeelPage } from './pages/FeelPage'
import { HomePage } from './pages/HomePage'
import { LiveIndexPage } from './pages/LiveIndexPage'
import { LivePage } from './pages/LivePage'
import { ReversePage } from './pages/ReversePage'
const nodeFs = (await import(/* @vite-ignore */ 'node:' + 'fs')) as {
  readFileSync(path: URL, encoding: 'utf8'): string
}

/**
 * 读仓库里的源文件。不能用 ?raw 导入 CSS：vitest 默认 css:false，会把任何
 * 「.css + 查询串」的请求当样式文件替换成空模块（实测长度 0）。也不能直接
 * `import { readFileSync } from 'node:fs'`：tsconfig.app.json 的 types 只声明
 * 了 vite/client，没有 node，typecheck 会报 TS2591。所以 specifier 用运行时拼接
 * 绕开类型解析——这也避免了给这个测试单独开一份 node 类型。
 */
function readRepoFile(relativeToThisFile: string): string {
  try {
    return nodeFs.readFileSync(new URL(relativeToThisFile, import.meta.url), 'utf8')
  } catch (error) {
    throw new Error('读不到 ' + relativeToThisFile + '：' + String(error))
  }
}

const globalCss = readRepoFile('./styles/global.css')
const indexHtml = readRepoFile('../index.html')

/**
 * 零依赖无障碍自检：对比度（从 global.css 现读 token）+ 结构审计（SSR 渲染后
 * 用正则检查）+ 样式静态检查。不起浏览器、不用定时器，全部是确定性的。
 *
 * 页面组件自己不套站点头尾（那是 App.tsx 的 Shell 干的），所以内页这里用
 * Layout 包一层再审计——跳转正文链接、<main id="main">、页脚链接都在外壳里。
 * 现场页（/live/<slug>/）例外：它由 LivePage 自带 LiveShell，跳过站点头尾。
 *
 * 渲染方式与 src/smoke.test.tsx 一致：直接 import 页面组件，绕过 App 的 lazy。
 */

/* ────────────────────────── 文本 / 标签小工具 ────────────────────────── */

/** HTML 的空元素：SSR 里以 <br/>、<input/> 这种自闭合形态出现，不进标签栈 */
const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, body: string) => {
    const lower = body.toLowerCase()
    if (lower.startsWith('#x')) {
      const code = Number.parseInt(lower.slice(2), 16)
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole
    }
    if (lower.startsWith('#')) {
      const code = Number.parseInt(lower.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole
    }
    return ENTITIES[lower] ?? whole
  })
}

interface TagMatch {
  /** 标签内的属性串（不含尖括号） */
  attrs: string
  /** 开闭标签之间的内容；空元素为空串 */
  inner: string
  /** 在整段 HTML 中的起始下标，用来判断「是否被 <label> 包住」 */
  index: number
  /** 原始片段，报错时截一段给读者看 */
  raw: string
}

function pairedTags(html: string, tag: string): TagMatch[] {
  const re = new RegExp('<' + tag + '\\b([^>]*)>([\\s\\S]*?)</' + tag + '>', 'gi')
  return Array.from(html.matchAll(re), (match) => ({
    attrs: match[1] ?? '',
    inner: match[2] ?? '',
    index: match.index ?? 0,
    raw: match[0],
  }))
}

function voidTags(html: string, tag: string): TagMatch[] {
  const re = new RegExp('<' + tag + '\\b([^>]*?)/?>', 'gi')
  return Array.from(html.matchAll(re), (match) => ({
    attrs: match[1] ?? '',
    inner: '',
    index: match.index ?? 0,
    raw: match[0],
  }))
}

function attribute(attrs: string, name: string): string | null {
  const pattern = '(?:^|\\s)' + name + '\\s*=\\s*(?:"([^"]*)"|' + "'([^']*)')"
  const match = attrs.match(new RegExp(pattern, 'i'))
  if (!match) return null
  return match[1] ?? match[2] ?? ''
}

function hasAttribute(attrs: string, name: string): boolean {
  return new RegExp('(?:^|\\s)' + name + '(?=[\\s=/>]|$)', 'i').test(attrs)
}

/**
 * 可读文本：按标签栈剥掉 aria-hidden="true" 子树后剩下的文字。
 * 用栈而不是正则整块删除，避免同名标签嵌套时切错边界（<span aria-hidden><span>x</span>⌘</span>）。
 */
function visibleText(html: string): string {
  const tokens = html.match(/<[^>]*>|[^<]+/g) ?? []
  const stack: boolean[] = []
  let hidden = 0
  const pieces: string[] = []

  for (const token of tokens) {
    if (token.startsWith('</')) {
      if (stack.pop()) hidden = Math.max(0, hidden - 1)
      continue
    }
    if (token.startsWith('<')) {
      const selfClosing = /\/>$/.test(token)
      const hiddenAttr = /\saria-hidden\s*=\s*("|')true\1/i.test(token)
      const name = (token.match(/^<([a-zA-Z][\w:-]*)/)?.[1] ?? '').toLowerCase()
      const pushed = !selfClosing && !VOID_TAGS.has(name)
      stack.push(pushed && hiddenAttr)
      if (pushed && hiddenAttr) hidden += 1
      continue
    }
    if (hidden === 0) pieces.push(token)
  }

  return decodeEntities(pieces.join(' '))
    .replace(/[\u200b-\u200d\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function snippet(raw: string, max = 140): string {
  const flat = raw.replace(/\s+/g, ' ').trim()
  return flat.length > max ? flat.slice(0, max) + '…' : flat
}

/** 元素的程序化可读名称：aria-label → aria-labelledby（引用的 id 必须存在）→ 可见文本 */
function accessibleName(attrs: string, inner: string, ids: Set<string>): string {
  const label = attribute(attrs, 'aria-label')
  if (label && label.trim()) return label.trim()
  const labelledBy = attribute(attrs, 'aria-labelledby')
  if (labelledBy) {
    const refs = labelledBy.split(/\s+/).filter(Boolean)
    if (refs.length > 0 && refs.every((id) => ids.has(id))) return labelledBy.trim()
  }
  return visibleText(inner)
}

/* ────────────────────────── 页面清单 ────────────────────────── */

type Shell = 'layout' | 'live'

interface PageCase {
  label: string
  path: string
  shell: Shell
  node: ReactElement
  /** 这一页期望出现的跳转正文锚点 */
  skipTarget?: string
}

const PAGES: PageCase[] = [
  { label: '首页', path: '/', shell: 'layout', node: <HomePage /> },
  { label: '词条库', path: '/browse', shell: 'layout', node: <BrowsePage /> },
  { label: '俗称总表', path: '/aliases', shell: 'layout', node: <AliasesPage /> },
  { label: '别搞混', path: '/compare', shell: 'layout', node: <ComparePage /> },
  { label: '感觉导航', path: '/feel', shell: 'layout', node: <FeelPage /> },
  { label: '速查表', path: '/cheatsheet', shell: 'layout', node: <CheatSheetPage /> },
  { label: '反查', path: '/reverse', shell: 'layout', node: <ReversePage /> },
  { label: '怎么用', path: '/about', shell: 'layout', node: <AboutPage /> },
  { label: '现场索引', path: '/live', shell: 'layout', node: <LiveIndexPage /> },
  {
    label: '现场页',
    path: '/live/scroll-driven',
    shell: 'live',
    node: <LivePage slug="scroll-driven" />,
    skipTarget: '#live-main',
  },
  {
    label: '词条详情（固定舞台）',
    path: '/entry/frosted-glass',
    shell: 'layout',
    node: <EntryDetailPage slug="frosted-glass" />,
  },
  {
    label: '词条详情（滚动类）',
    path: '/entry/scroll-snap',
    shell: 'layout',
    node: <EntryDetailPage slug="scroll-snap" />,
  },
  { label: '404', path: '/no-such-page', shell: 'layout', node: <NotFound /> },
]

function renderPage(page: PageCase): string {
  setServerRoute(page.path)
  const tree = page.shell === 'live' ? page.node : <Layout>{page.node}</Layout>
  return renderToString(
    <PrefsProvider initial={PREF_DEFAULTS}>
      <ToastProvider>{tree}</ToastProvider>
    </PrefsProvider>,
  )
}

/* ────────────────────────── B. 结构审计 ────────────────────────── */

interface Rendered {
  html: string
  ids: Set<string>
}

function collectIds(html: string): Set<string> {
  const ids = new Set<string>()
  for (const match of html.matchAll(/\sid="([^"]*)"/g)) {
    if (match[1]) ids.add(match[1])
  }
  return ids
}

function labelRanges(html: string): { start: number; end: number }[] {
  const ranges: { start: number; end: number }[] = []
  for (const match of html.matchAll(/<label\b[^>]*>/gi)) {
    const start = match.index ?? 0
    const openEnd = start + match[0].length
    const close = html.indexOf('</label>', openEnd)
    if (close !== -1) ranges.push({ start, end: close })
  }
  return ranges
}

function labelTargets(html: string): Set<string> {
  const targets = new Set<string>()
  for (const label of pairedTags(html, 'label')) {
    const id = attribute(label.attrs, 'for')
    if (id) targets.add(id)
  }
  return targets
}

function structureViolations(page: PageCase, rendered: Rendered): string[] {
  const { html, ids } = rendered
  const where = page.label + '（' + page.path + '）'
  const out: string[] = []

  /* B1 恰好 1 个 h1；B2 标题层级不跳级（只看 h1–h3） */
  const headings = Array.from(html.matchAll(/<h([1-6])\b[^>]*>/gi), (match) => Number(match[1]))
  const h1Count = headings.filter((level) => level === 1).length
  if (h1Count !== 1) {
    out.push('[B1 唯一 h1] ' + where + '：h1 数量为 ' + h1Count + '（期望恰好 1）')
  }
  let previous = 0
  for (const level of headings) {
    if (level > 3) continue
    if (level > previous + 1) {
      out.push(
        '[B2 标题跳级] ' +
          where +
          '：' +
          (previous === 0
            ? '第一个标题就是 h' + level + '（应先用 h1 开头）'
            : 'h' + previous + ' 之后直接出现 h' + level + '（应逐级递增）'),
      )
      break
    }
    previous = level
  }

  /* B3 每个 <a> 有非空 href 且有可访问名 */
  for (const anchor of pairedTags(html, 'a')) {
    const href = attribute(anchor.attrs, 'href')
    if (href === null || href.trim() === '') {
      out.push('[B3 链接缺 href] ' + where + '：' + snippet(anchor.raw))
    }
    if (!accessibleName(anchor.attrs, anchor.inner, ids)) {
      out.push('[B3 链接无可访问名] ' + where + '：' + snippet(anchor.raw))
    }
  }

  /* B4 每个 <button> 有可访问名 */
  for (const button of pairedTags(html, 'button')) {
    if (!accessibleName(button.attrs, button.inner, ids)) {
      out.push('[B4 按钮无可访问名] ' + where + '：' + snippet(button.raw))
    }
  }

  /* B5 表单控件要么有 aria 名称，要么被 <label> 包住 / 用 for 关联 */
  const ranges = labelRanges(html)
  const targets = labelTargets(html)
  const controls: TagMatch[] = [
    ...voidTags(html, 'input'),
    ...pairedTags(html, 'textarea'),
    ...pairedTags(html, 'select'),
  ]
  for (const control of controls) {
    const hasAria =
      Boolean(attribute(control.attrs, 'aria-label')?.trim()) ||
      Boolean(attribute(control.attrs, 'aria-labelledby')?.trim())
    const id = attribute(control.attrs, 'id')
    const linkedByFor = Boolean(id && targets.has(id))
    const wrapped = ranges.some((range) => control.index > range.start && control.index < range.end)
    if (!hasAria && !linkedByFor && !wrapped) {
      out.push('[B5 表单控件没名字] ' + where + '：' + snippet(control.raw))
    }
  }

  /* B6 同页 id 不重复 */
  const seen = new Map<string, number>()
  for (const match of html.matchAll(/\sid="([^"]*)"/g)) {
    if (!match[1]) continue
    seen.set(match[1], (seen.get(match[1]) ?? 0) + 1)
  }
  for (const [id, count] of seen) {
    if (count > 1) out.push('[B6 重复 id] ' + where + '：id="' + id + '" 出现 ' + count + ' 次')
  }

  /* B7 跳转正文链接指向的锚点必须真实存在 */
  const hashLinks = pairedTags(html, 'a')
    .map((anchor) => attribute(anchor.attrs, 'href'))
    .filter((href): href is string => Boolean(href && /^#[A-Za-z][\w-]*$/.test(href)))
  const expected = page.skipTarget ?? '#main'
  if (!hashLinks.includes(expected)) {
    out.push('[B7 缺跳转正文链接] ' + where + '：找不到 <a href="' + expected + '">')
  }
  const targetId = expected.slice(1)
  if (!ids.has(targetId)) {
    out.push('[B7 跳转目标不存在] ' + where + '：页内没有 id="' + targetId + '"')
  }

  /* B8 未标 aria-hidden 的 <img>/<svg> 必须有可访问名 */
  for (const image of voidTags(html, 'img')) {
    if (hasAttribute(image.attrs, 'aria-hidden')) continue
    const named =
      Boolean(attribute(image.attrs, 'aria-label')?.trim()) ||
      Boolean(attribute(image.attrs, 'alt')?.trim())
    if (!named) out.push('[B8 图片无可访问名] ' + where + '：' + snippet(image.raw))
  }
  for (const svg of pairedTags(html, 'svg')) {
    if (hasAttribute(svg.attrs, 'aria-hidden')) continue
    if (!accessibleName(svg.attrs, svg.inner, ids)) {
      out.push('[B8 图标无可访问名] ' + where + '：' + snippet(svg.raw))
    }
  }

  return out
}

describe('B. 结构审计（SSR）', () => {
  it.each(PAGES.map((page) => [page.label, page] as const))('%s', (label, page) => {
    const html = renderPage(page)
    expect(html.length, label + ' 渲染为空').toBeGreaterThan(200)
    const violations = structureViolations(page, { html, ids: collectIds(html) })
    expect(violations, label + '（' + page.path + '）无障碍结构').toEqual([])
  })
})

/* 拿合成标记跑一遍审计：证明这些断言真的抓得到问题，而不是永远为绿的摆设 */
const SYNTHETIC_PAGE: PageCase = { label: '合成页', path: '/synthetic', shell: 'layout', node: <div /> }

function auditMarkup(html: string): string[] {
  return structureViolations(SYNTHETIC_PAGE, { html, ids: collectIds(html) })
}

const FULL_HOUSE = '<a href="#main">跳到正文</a><div id="main"></div>'

function failuresStartingWith(items: string[], prefix: string): string[] {
  return items.filter((item) => item.startsWith(prefix))
}

describe('B0. 结构审计器自检（防止断言形同虚设）', () => {
  it('合格标记不误报：字号类名不算标题、sr-only 文本算可访问名', () => {
    const markup =
      '<h1>标题</h1><h2>小标题</h2><p class="text-h3">关于 h3 的说明</p>' +
      FULL_HOUSE +
      '<button><span class="sr-only">关闭</span></button>' +
      '<label>音量<input type="range" /></label>' +
      '<img src="a.png" alt="示意图" />' +
      '<svg aria-hidden="true"></svg>' +
      '<a href="/x" aria-label="图标链接"><svg aria-hidden="true"></svg></a>'
    expect(auditMarkup(markup), '合格标记被误报').toEqual([])
  })

  it('标题数量与层级：缺 h1、h1 后直接 h3 都会被抓到', () => {
    const noH1 = auditMarkup('<h2>只有 h2</h2>' + FULL_HOUSE)
    expect(failuresStartingWith(noH1, '[B1 唯一 h1]').length, '缺断言：' + JSON.stringify(noH1)).toBe(1)

    const skipped = auditMarkup('<h1>标题</h1><h3>小标题</h3>' + FULL_HOUSE)
    expect(
      failuresStartingWith(skipped, '[B2 标题跳级]').length,
      'h1 之后直接 h3 应报跳级，实际：' + JSON.stringify(skipped),
    ).toBe(1)
  })

  it('链接：缺 href 与空可访问名都会被抓到', () => {
    const noHref = auditMarkup('<h1>t</h1><a>无地址</a>' + FULL_HOUSE)
    expect(failuresStartingWith(noHref, '[B3 链接缺 href]').length, '实际：' + JSON.stringify(noHref)).toBe(1)

    const noName = auditMarkup('<h1>t</h1><a href="/x"></a>' + FULL_HOUSE)
    expect(failuresStartingWith(noName, '[B3 链接无可访问名]').length, '实际：' + JSON.stringify(noName)).toBe(1)
  })

  it('按钮：只有 aria-hidden 图标的按钮算没有可访问名', () => {
    const nameless = auditMarkup('<h1>t</h1><button><svg aria-hidden="true"></svg></button>' + FULL_HOUSE)
    expect(
      failuresStartingWith(nameless, '[B4 按钮无可访问名]').length,
      '实际：' + JSON.stringify(nameless),
    ).toBe(1)

    const named = auditMarkup('<h1>t</h1><button aria-label="关闭"><svg aria-hidden="true"></svg></button>' + FULL_HOUSE)
    expect(failuresStartingWith(named, '[B4 按钮无可访问名]'), 'aria-label 已是可访问名').toEqual([])
  })

  it('表单控件：label 包裹、label for、aria-label 都算有名字', () => {
    const nameless = auditMarkup('<h1>t</h1><input type="range" />' + FULL_HOUSE)
    expect(
      failuresStartingWith(nameless, '[B5 表单控件没名字]').length,
      '实际：' + JSON.stringify(nameless),
    ).toBe(1)

    const wrapped = auditMarkup('<h1>t</h1><label>音量<input type="range" /></label>' + FULL_HOUSE)
    expect(failuresStartingWith(wrapped, '[B5 表单控件没名字]'), '被 <label> 包住不算违规').toEqual([])

    const viaFor = auditMarkup('<h1>t</h1><input id="vol" /><label for="vol">音量</label>' + FULL_HOUSE)
    expect(failuresStartingWith(viaFor, '[B5 表单控件没名字]'), 'label for 关联不算违规').toEqual([])

    const aria = auditMarkup('<h1>t</h1><input aria-label="音量" /><textarea aria-labelledby="cap"></textarea>' + FULL_HOUSE)
    expect(failuresStartingWith(aria, '[B5 表单控件没名字]'), 'aria-label / aria-labelledby 不算违规').toEqual([])
  })

  it('同页重复 id 会被抓到', () => {
    const dup = auditMarkup('<h1>t</h1><div id="main"></div><div id="main"></div><a href="#main">跳</a>')
    expect(failuresStartingWith(dup, '[B6 重复 id]').length, '实际：' + JSON.stringify(dup)).toBe(1)
  })

  it('跳转正文：缺链接、目标不存在都会被抓到', () => {
    const noLink = auditMarkup('<h1>t</h1><div id="main"></div>')
    expect(failuresStartingWith(noLink, '[B7 缺跳转正文链接]').length, '实际：' + JSON.stringify(noLink)).toBe(1)

    const noTarget = auditMarkup('<h1>t</h1><a href="#main">跳到正文</a>')
    expect(
      failuresStartingWith(noTarget, '[B7 跳转目标不存在]').length,
      '实际：' + JSON.stringify(noTarget),
    ).toBe(1)
  })

  it('图片与图标：没有 aria-hidden 就必须有可访问名', () => {
    const img = auditMarkup('<h1>t</h1><img src="a.png" />' + FULL_HOUSE)
    expect(failuresStartingWith(img, '[B8 图片无可访问名]').length, '实际：' + JSON.stringify(img)).toBe(1)

    const icon = auditMarkup('<h1>t</h1><svg></svg>' + FULL_HOUSE)
    expect(failuresStartingWith(icon, '[B8 图标无可访问名]').length, '实际：' + JSON.stringify(icon)).toBe(1)

    const fine = auditMarkup('<h1>t</h1><img src="a.png" alt="示意图" /><svg aria-label="图标"></svg>' + FULL_HOUSE)
    expect(failuresStartingWith(fine, '[B8 '), 'alt / aria-label 都算可访问名').toEqual([])
  })
})

/* ────────────────────────── A. 颜色对比度 ────────────────────────── */

interface Rule {
  selector: string
  body: string
}

/** 把样式表拆成扁平的「选择器 { 声明 }」列表（@media 里的规则也会被拆出来） */
function rules(cssText: string): Rule[] {
  const cleaned = cssText.replace(/\/\*[\s\S]*?\*\//g, '')
  return Array.from(cleaned.matchAll(/([^{}]+)\{([^{}]*)\}/g), (match) => ({
    selector: match[1].trim(),
    body: match[2] ?? '',
  }))
}

/** 按选择器精确取一条顶层规则的花括号内容（避免把 @media 里的同名选择器认成主题块） */
function ruleBody(cssText: string, selector: string): string | null {
  const escaped = selector.replace(/[.*+?^$()[\]{}\\]/g, '\\$&')
  const match = new RegExp('(?:^|\\n)\\s*' + escaped + '\\s*\\{', 'g').exec(cssText)
  if (!match) return null
  const open = match.index + match[0].length - 1
  let depth = 0
  for (let i = open; i < cssText.length; i += 1) {
    const ch = cssText[i]
    if (ch === '{') depth += 1
    else if (ch === '}') {
      depth -= 1
      if (depth === 0) return cssText.slice(open + 1, i)
    }
  }
  return null
}

function tokensOf(selector: string, cssText: string = globalCss): Map<string, string> {
  const body = ruleBody(cssText, selector)
  const tokens = new Map<string, string>()
  if (!body) return tokens
  const cleaned = body.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const match of cleaned.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    if (match[1] && match[2]) tokens.set(match[1], match[2].trim())
  }
  return tokens
}

function hexToRgb(value: string): [number, number, number] | null {
  const match = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!match) return null
  const hex = match[1] ?? ''
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : hex
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ]
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (raw: number): number => {
    const value = raw / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const [la, lb] = [relativeLuminance(a), relativeLuminance(b)]
  const [light, dark] = la >= lb ? [la, lb] : [lb, la]
  return (light + 0.05) / (dark + 0.05)
}

/** [前景 token, 背景 token, 最低对比度] —— 7 对应 AAA 正文，4.5 对应 AA */
const CONTRAST_PAIRS: [string, string, number][] = [
  ['ink', 'canvas', 7],
  ['ink-2', 'canvas', 4.5],
  ['muted', 'canvas', 4.5],
  ['accent', 'canvas', 4.5],
  ['accent-ink', 'accent', 4.5],
  ['ink', 'raised', 7],
  ['ink', 'surface', 7],
]

function contrastViolations(theme: 'light' | 'dark', cssText: string = globalCss): string[] {
  const selector = theme === 'light' ? ':root' : ":root[data-theme='dark']"
  const tokens = tokensOf(selector, cssText)
  if (tokens.size === 0) {
    return [
      '[A0 token 解析失败] 样式表里找不到 ' +
        selector +
        ' 规则块（或块内没有任何 --token）',
    ]
  }

  const out: string[] = []
  const required = new Set(CONTRAST_PAIRS.flatMap(([fg, bg]) => [fg, bg]))
  const missing = [...required].filter((name) => !tokens.has('--' + name))
  if (missing.length > 0) {
    out.push(
      '[A0 token 缺失] ' +
        theme +
        ' 主题缺少 token：' +
        missing.map((name) => '--' + name).join('、'),
    )
    return out
  }

  for (const [fg, bg, min] of CONTRAST_PAIRS) {
    const fgValue = tokens.get('--' + fg) ?? ''
    const bgValue = tokens.get('--' + bg) ?? ''
    const fgRgb = hexToRgb(fgValue)
    const bgRgb = hexToRgb(bgValue)
    if (!fgRgb || !bgRgb) {
      out.push(
        '[A0 token 不是十六进制色] ' +
          theme +
          '：--' +
          fg +
          ' = ' +
          fgValue +
          '、--' +
          bg +
          ' = ' +
          bgValue +
          '（对比度计算只接受 #rgb/#rrggbb）',
      )
      continue
    }
    const ratio = contrastRatio(fgRgb, bgRgb)
    if (ratio < min) {
      out.push(
        '[A1 对比度不足] ' +
          theme +
          ' 主题：--' +
          fg +
          ' 对 --' +
          bg +
          ' = ' +
          ratio.toFixed(2) +
          ':1，要求 ≥ ' +
          min +
          ':1',
      )
    }
  }
  return out
}

describe('A. 颜色对比度（WCAG 相对亮度）', () => {
  it('浅色主题的每一对前景 / 背景都达标', () => {
    expect(contrastViolations('light'), '浅色主题（:root）的对比度').toEqual([])
  })

  it('暗色主题的每一对前景 / 背景都达标', () => {
    expect(contrastViolations('dark'), '暗色主题的对比度').toEqual([])
  })

  it('审计器自检：低对比度、token 缺失、主题块读不到都会被报出来', () => {
    const weakCss =
      ':root {\n' +
      '  --canvas: #ffffff;\n' +
      '  --surface: #ffffff;\n' +
      '  --raised: #ffffff;\n' +
      '  --ink: #777777;\n' +
      '  --ink-2: #999999;\n' +
      '  --muted: #bbbbbb;\n' +
      '  --accent: #cccccc;\n' +
      '  --accent-ink: #dddddd;\n' +
      '}\n' +
      ":root[data-theme='dark'] {\n" +
      '  --canvas: #000000;\n' +
      '}\n'

    const light = contrastViolations('light', weakCss)
    expect(
      light.some((item) => item.startsWith('[A1 对比度不足]')),
      '#777 对 #fff 只有约 4.5:1，应被 7:1 的 AAA 门槛拦下，实际报出：' + JSON.stringify(light),
    ).toBe(true)

    const dark = contrastViolations('dark', weakCss)
    expect(
      dark.some((item) => item.startsWith('[A0 token 缺失]')),
      '暗色块只给了 --canvas，缺 token 应报错，实际报出：' + JSON.stringify(dark),
    ).toBe(true)

    const broken = contrastViolations('light', 'body { color: red }')
    expect(
      broken.some((item) => item.startsWith('[A0 token 解析失败]')),
      '样式表里没有 :root 主题块时也必须失败，而不是静默通过',
    ).toBe(true)
  })
})

/* ────────────────────────── C. 样式静态检查 ────────────────────────── */

/** C1：键盘焦点必须看得见——至少要有一条 :focus-visible 规则真的给了 outline */
function focusStyleViolations(cssText: string): string[] {
  const focusRules = rules(cssText).filter((rule) => rule.selector.includes(':focus-visible'))
  if (focusRules.length === 0) {
    return ['[C1 缺 :focus-visible] 样式表里没有任何 :focus-visible 规则，键盘用户看不到焦点']
  }
  const visible = focusRules.filter((rule) => {
    const declaration = rule.body.match(/outline\s*:\s*([^;]+)/)
    if (!declaration) return false
    const value = (declaration[1] ?? '').trim()
    return value !== 'none' && value !== '0' && value !== '0px'
  })
  if (visible.length === 0) {
    return [
      '[C1 焦点不可见] 所有 :focus-visible 规则都把 outline 关掉了，没有可见替代：' +
        focusRules.map((rule) => rule.selector).join(' / '),
    ]
  }
  return []
}

/** C2：动效偏好——必须同时有 reduce 分支，不能只写 no-preference */
function reducedMotionViolations(cssText: string): string[] {
  if (!/@media[^{]*prefers-reduced-motion[^{]*\{/.test(cssText)) {
    return ['[C2 缺 reduced-motion] 样式表里没有 prefers-reduced-motion 媒体查询']
  }
  if (!/@media[^{]*prefers-reduced-motion\s*:\s*reduce[^{]*\{/.test(cssText)) {
    return [
      '[C2 只有 no-preference] 缺 prefers-reduced-motion: reduce 分支，减少动效的用户没被照顾到',
    ]
  }
  return []
}

/** C3：文档语言与主题色 */
function documentViolations(html: string): string[] {
  const out: string[] = []
  const lang = html.match(/<html\b[^>]*\blang\s*=\s*"([^"]*)"/)
  if (!lang) out.push('[C3 缺 lang] index.html 的 <html> 没有 lang 属性')
  else if (!(lang[1] ?? '').trim()) out.push('[C3 lang 为空] index.html 的 <html lang> 是空串')

  const themeColors = Array.from(
    html.matchAll(/<meta\b[^>]*name="theme-color"[^>]*>/gi),
    (match) => match[0],
  )
  if (themeColors.length === 0) {
    out.push('[C3 缺 theme-color] index.html 没有 <meta name="theme-color">')
  }
  for (const tag of themeColors) {
    const content = tag.match(/\bcontent\s*=\s*"([^"]*)"/)
    if (!(content?.[1] ?? '').trim()) out.push('[C3 theme-color 为空] ' + tag)
  }
  return out
}

/** 取一条规则里所有 outline 声明的值（小写、去掉空白），用来判断「关掉后有没有替代」 */
function outlineValues(body: string): string[] {
  return body
    .split(';')
    .map((declaration) => declaration.trim())
    .filter((declaration) => /^outline\s*:/i.test(declaration))
    .map((declaration) => (declaration.slice(declaration.indexOf(':') + 1) ?? '').trim().toLowerCase())
}

/** C4：把 outline 关掉又没给可见替代（box-shadow / border / 背景 / outline-offset） */
function bareOutlineViolations(cssText: string): string[] {
  return rules(cssText)
    .filter((rule) => {
      const outlineDeclarations = outlineValues(rule.body)
      const turnedOff = outlineDeclarations.some(
        (value) => value === 'none' || value === '0' || value === '0px',
      )
      if (!turnedOff) return false
      const keptVisible = outlineDeclarations.some(
        (value) => value !== 'none' && value !== '0' && value !== '0px',
      )
      if (keptVisible) return false
      return !/(box-shadow|border|background|outline-offset)\s*:/i.test(rule.body)
    })
    .map((rule) => rule.selector)
}

describe('C. 样式静态检查', () => {
  it('有可见的 :focus-visible 焦点样式，而不是把 outline 关掉', () => {
    expect(focusStyleViolations(globalCss), 'src/styles/global.css 的焦点样式').toEqual([])
  })

  it('有 prefers-reduced-motion 媒体查询块（含 reduce 分支）', () => {
    expect(reducedMotionViolations(globalCss), 'src/styles/global.css 的动效偏好').toEqual([])
  })

  it('index.html 声明了非空 lang 与 theme-color', () => {
    expect(documentViolations(indexHtml), 'index.html 的语言与主题色').toEqual([])
  })

  it('没有只把 outline 关掉却不给可见替代的规则', () => {
    expect(
      bareOutlineViolations(globalCss),
      '这些规则把 outline 设为 none，却没有 box-shadow / border / background 之类可见替代',
    ).toEqual([])
  })

  it('审计器自检：缺焦点样式、只写 no-preference、关掉 outline 都会被报出来', () => {
    const noFocus = focusStyleViolations('body { color: red }')
    expect(
      noFocus.some((item) => item.startsWith('[C1 缺 :focus-visible]')),
      '没有 :focus-visible 时应报错，实际：' + JSON.stringify(noFocus),
    ).toBe(true)

    const invisibleFocus = focusStyleViolations(':focus-visible { outline: none }')
    expect(
      invisibleFocus.some((item) => item.startsWith('[C1 焦点不可见]')),
      '把 outline 设成 none 时应报「焦点不可见」，实际：' + JSON.stringify(invisibleFocus),
    ).toBe(true)
    expect(
      focusStyleViolations(':focus-visible { outline: none } a:focus-visible { outline: 2px solid red }'),
      '只要有一条可见的 :focus-visible 就不算问题',
    ).toEqual([])

    const onlyNoPreference = reducedMotionViolations(
      '@media (prefers-reduced-motion: no-preference) { a { color: red } }',
    )
    expect(
      onlyNoPreference.some((item) => item.startsWith('[C2 只有 no-preference]')),
      '只写 no-preference 时应提示缺 reduce 分支，实际：' + JSON.stringify(onlyNoPreference),
    ).toBe(true)
    expect(
      reducedMotionViolations('@media (prefers-reduced-motion: reduce) { a { animation: none } }'),
      '有 reduce 分支就不算问题',
    ).toEqual([])

    const badDocument = documentViolations(
      '<html><head><meta name="theme-color" content=""></head><body></body></html>',
    )
    expect(
      badDocument.some((item) => item.startsWith('[C3 缺 lang]')),
      '缺 lang 时应报错，实际：' + JSON.stringify(badDocument),
    ).toBe(true)
    expect(
      badDocument.some((item) => item.startsWith('[C3 theme-color 为空]')),
      'theme-color 的 content 为空时应报错，实际：' + JSON.stringify(badDocument),
    ).toBe(true)
    expect(
      documentViolations('<html lang="zh-CN"><head><meta name="theme-color" content="#f2f0e9"></head></html>'),
      '语言与主题色齐全时不应报错',
    ).toEqual([])

    expect(bareOutlineViolations('a:focus-visible { outline: none }'), '裸 outline:none 必须被抓到').toEqual([
      'a:focus-visible',
    ])
    expect(
      bareOutlineViolations('a:focus-visible { outline: none; box-shadow: 0 0 0 2px red }'),
      '有 box-shadow 替代时不应报错',
    ).toEqual([])
  })
})
