import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { usePrefersReducedMotion } from '../lib/motion'
import { Link, navigate } from '../lib/router'
import { entryPath } from '../lib/routes'
import { useModal } from '../lib/useModal'

/**
 * 整页版「命令面板」：这一页就是被面板接管的那一页。
 *
 * 面板不是页面里的一个输入框。打开时遮罩铺满视口、body 停止滚动、
 * 焦点锁进面板，关闭后焦点还给触发它的按钮。展台里的 320px 盒子
 * 做不出这三件事，所以命令面板只在 /live/ 里演。
 */

const T = {
  eyebrow: { zh: '现场 · 浮层', en: 'LIVE · OVERLAY' },
  title: { zh: '按一个键，整页变成搜索框', en: 'One key turns the page into a search box' },
  lede: {
    zh: '命令面板不是页面里的输入框，而是临时接管视口的一层：遮罩压住整页，焦点锁在面板里，背后的页面停止滚动。这一页就在演示这件事——按 ⌘K / Ctrl+K，或点下面的按钮。',
    en: 'A command palette is not an input inside the page; it briefly takes over the viewport: a backdrop covers everything, focus is trapped in the panel, and the page behind stops scrolling. This page is the demo - press meta+K / ctrl+K, or use the button below.',
  },
  hint: { zh: '⌘K / Ctrl+K 打开 · Esc 关闭 · / 也能打开', en: 'meta+K / ctrl+K to open · Esc to close · / also opens it' },
  trigger: { zh: '打开命令面板', en: 'Open the command palette' },
  statusHint: {
    zh: '面板里的命令会真的执行：跳转、打开词条、复制 CSS、切换列表密度。',
    en: 'Commands really run: jump, open an entry, copy the CSS, toggle list density.',
  },
  copiedOk: { zh: '已复制面板 CSS 到剪贴板。', en: 'Panel CSS copied to the clipboard.' },
  copiedFail: { zh: '剪贴板不可用：滚到下面选中代码块手动复制。', en: 'Clipboard unavailable: scroll down and select the code block to copy it by hand.' },
  density: { zh: '当前密度：{mode}', en: 'Current density: {mode}' },
  dense: { zh: '紧凑', en: 'compact' },
  roomy: { zh: '宽松', en: 'roomy' },
  cardLabel: { zh: '面板解剖', en: 'Panel anatomy' },
  cardNote: {
    zh: '三层叠在视口上：遮罩、面板、列表。列表最多 8 行，键盘高亮当前行。',
    en: 'Three layers over the viewport: backdrop, panel, listbox. At most 8 rows; the keyboard marks the active one.',
  },
  layerBackdrop: { zh: '遮罩 backdrop', en: 'backdrop' },
  layerPanel: { zh: '面板 panel', en: 'panel' },
  layerInput: { zh: '搜索行 input', en: 'search row' },
  layerList: { zh: '列表 listbox', en: 'listbox' },
  dialog: { zh: '命令面板', en: 'Command palette' },
  dialogClose: { zh: '关闭命令面板', en: 'Close the command palette' },
  placeholder: { zh: '输入命令或页面名…', en: 'Type a command or a page name...' },
  empty: { zh: '没有匹配的命令', en: 'No matching command' },
  listLabel: { zh: '命令列表', en: 'Command list' },
  footer: { zh: '↑↓ 移动 · Enter 执行 · Esc 关闭', en: 'arrows move · Enter runs · Esc closes' },
  resultsLabel: { zh: '结果', en: 'Results' },
  sections: [
    {
      title: { zh: '它盖住的不是盒子，是整页', en: 'It covers the page, not a box' },
      body: {
        zh: '展台里的面板只能在一个 320px 高的框里弹，遮罩也只盖住那个框。这里，遮罩 fixed inset-0，body 停止滚动，连底部浮动条都被盖住。盒子里做不到这三件事：盒子的遮罩出不了盒子，盒子的滚动锁不住整页，盒子的层级也压不住站点外壳。',
        en: 'A staged palette can only open inside a 320px box, and its backdrop only covers that box. Here the backdrop is fixed inset-0, body scrolling stops, and even the floating bar at the bottom is covered. A box cannot do any of the three: its backdrop cannot leave the box, its scroll lock cannot hold the page, and its z-index cannot outrank the site shell.',
      },
      figure: [
        'backdrop { position: fixed; inset: 0 }',
        'body     { overflow: hidden }',
        'z-index above the page chrome',
      ],
    },
    {
      title: { zh: '四层，各管一件事', en: 'Four layers, four jobs' },
      body: {
        zh: '遮罩接点击关闭，面板接对话框语义与焦点陷阱，搜索行接输入与组合框语义，列表接上下键与当前项。层级越往里越具体：任何一层缺席，剩下的看起来都像「一个搜索框」。',
        en: 'The backdrop handles click-to-close, the panel carries dialog semantics and the focus trap, the search row owns input and combobox semantics, and the listbox owns arrow keys and the active row. Each layer inward is more specific; remove one and the rest just look like a search box.',
      },
      figure: [
        '[backdrop]      click to close',
        '  [panel]       role="dialog" aria-modal',
        '    [input]     role="combobox"',
        '    [listbox]   role="listbox", 8 rows',
      ],
    },
    {
      title: { zh: '键盘是主线，不是附加', en: 'Keyboard is the main path, not an extra' },
      body: {
        zh: '打开就把焦点放进输入框；↑↓ 移动、Enter 执行、Esc 关闭，Tab 不会跑出面板。关闭时焦点还给触发它的按钮，键盘用户不会掉到页面顶上。Esc 的处理要 preventDefault：外壳也有一个 Esc（回词条），不拦下来就会一次关两层。',
        en: 'Opening moves focus into the input; arrows move, Enter runs, Esc closes, and Tab never leaves the panel. On close, focus returns to the trigger so keyboard users do not fall back to the top of the page. The Esc handler must call preventDefault: the shell also listens for Esc (back to the entry), and without it one key closes two layers.',
      },
      figure: [
        'meta / ctrl + K   open',
        'ArrowUp / Down    move the highlight',
        'Enter             run the active row',
        'Escape            close, restore focus',
        'Tab               cycle inside the panel',
      ],
    },
    {
      title: { zh: '功能多到导航放不下时才值得', en: 'Worth it when navigation no longer fits' },
      body: {
        zh: '面板解决的是「入口太多」而不是「页面太好看」。功能少、层级浅的站点加一个面板，等于给每个用户多发一把用不上的钥匙。',
        en: 'A palette solves "too many entry points", not "the page could look cooler". On a small site with shallow navigation it hands every visitor a key they will never use.',
      },
      figure: [],
    },
  ],
  worthTitle: { zh: '值得用', en: 'Worth it' },
  worth: [
    { zh: '后台、编辑器、工具型产品：功能多到侧栏塞不下', en: 'Dashboards, editors and tools whose features no longer fit a sidebar' },
    { zh: '熟练用户想完全不离开键盘就能跳转', en: 'Power users who want to move without leaving the keyboard' },
    { zh: '「命令」和「跳转」可以放进同一个入口检索', en: 'Commands and navigation can share one searchable entry point' },
  ],
  gimmickTitle: { zh: '只是耍花招', en: 'Just a trick' },
  gimmick: [
    { zh: '只有三五个页面的站点：侧栏就够了', en: 'A site with three or five pages: the sidebar is enough' },
    { zh: '键盘导航没做全：那就只是一个搜索框', en: 'Without full keyboard navigation it is only a search box' },
    { zh: '关掉焦点还原：键盘用户每次都要重新找位置', en: 'No focus restore: keyboard users have to find their place again every time' },
    { zh: '给不常用面板的访客硬塞一个 ⌘K 提示', en: 'Pushing a meta+K hint at visitors who will never use it' },
  ],
  paramsTitle: { zh: '参数与判断', en: 'Parameters and judgement' },
  params: [
    { label: { zh: '快捷键', en: 'Shortcut' }, value: { zh: '⌘K / Ctrl+K，另附 /', en: 'meta+K / ctrl+K, plus /' } },
    { label: { zh: '结果上限', en: 'Result cap' }, value: { zh: '8 行，超出滚动而不是全塞', en: '8 rows, scroll instead of cramming' } },
    { label: { zh: '过滤', en: 'Filter' }, value: { zh: '空格分词，全部命中', en: 'space-separated terms, all must match' } },
    { label: { zh: '键盘', en: 'Keyboard' }, value: { zh: '↑↓ 移动、Enter 执行、Esc 关闭、Tab 循环', en: 'arrows move, Enter runs, Esc closes, Tab cycles' } },
    { label: { zh: '进出场', en: 'Enter / exit' }, value: { zh: '160ms 淡入加轻微缩放；减少动态时直接出现', en: '160ms fade with a slight scale; instant under reduced motion' } },
    { label: { zh: '层级', en: 'Z-index' }, value: { zh: '盖住页面内容与底部浮动条', en: 'Above page content and the floating bar' } },
    { label: { zh: '滚动', en: 'Scroll' }, value: { zh: '打开时锁 body，关闭后恢复', en: 'Lock body while open, restore on close' } },
    { label: { zh: '无障碍', en: 'A11y' }, value: { zh: 'dialog + combobox + listbox + aria-activedescendant', en: 'dialog + combobox + listbox + aria-activedescendant' } },
  ],
  codeTitle: { zh: '这一页实际在用的', en: 'What this page actually uses' },
  codeNote: {
    zh: '左边是面板与列表的结构，右边是打开热键与焦点流程的骨架。焦点陷阱、滚动锁与 Esc 由 useModal 收口，页面只负责「打开」与「执行命令」。',
    en: 'Left: the panel and listbox structure. Right: the skeleton of the shortcut, focus flow and command dispatch. The focus trap, scroll lock and Esc live in useModal; the page only opens and runs commands.',
  },
  reducedNote: {
    zh: '开启减少动态时，面板直接出现，不做缩放与淡入；其余行为不变。',
    en: 'When reduced motion is on, the panel appears instantly, with no scale or fade; everything else behaves the same.',
  },
  back: { zh: '回到词条：命令面板', en: 'Back to the entry: Command Palette' },
} as const

const COMMAND_CODES = ['01', '02', '03', '04', '05'] as const

const LAYERS = [
  { action: { zh: '遮罩：点击关闭', en: 'Backdrop: click to close' }, key: 'inset-0' },
  { action: { zh: '面板：对话框语义', en: 'Panel: dialog semantics' }, key: 'role=dialog' },
  { action: { zh: '搜索行：组合框', en: 'Search row: combobox' }, key: 'aria-expanded' },
  { action: { zh: '列表：8 行封顶', en: 'Listbox: eight rows max' }, key: 'role=listbox' },
] as const

const CSS_TEXT = [
  '@keyframes live-cpv-fade { from { opacity: 0 } to { opacity: 1 } }',
  '@keyframes live-cpv-pop {',
  '  from { opacity: 0; transform: translateY(8px) scale(0.985) }',
  '  to   { opacity: 1; transform: none }',
  '}',
  '.live-cpv-fade { animation: live-cpv-fade 160ms ease-out both }',
  '.live-cpv-pop { animation: live-cpv-pop 180ms ease-out both }',
  '@media (prefers-reduced-motion: reduce) {',
  '  .live-cpv-fade, .live-cpv-pop { animation: none }',
  '}',
].join('\n')

const CSS_SNIPPET = [
  '.palette-backdrop {',
  '  position: fixed;',
  '  inset: 0;',
  '  z-index: 60;',
  '  background: color-mix(in srgb, var(--ink) 35%, transparent);',
  '}',
  '',
  '.palette-panel {',
  '  width: min(36rem, calc(100vw - 2rem));',
  '  margin: 12vh auto 0;',
  '  border: 1px solid var(--line-strong);',
  '  background: var(--raised);',
  '}',
  '',
  '@media (prefers-reduced-motion: reduce) {',
  '  .palette-panel { animation: none; }',
  '}',
].join('\n')

const JS_SNIPPET = [
  'useEffect(() => {',
  '  const onKeyDown = (event) => {',
  '    if ((event.metaKey || event.ctrlKey) && event.key === "k") {',
  '      event.preventDefault()',
  '      setOpen(true)',
  '    }',
  '  }',
  '  window.addEventListener("keydown", onKeyDown)',
  '  return () => window.removeEventListener("keydown", onKeyDown)',
  '}, [])',
  '',
  '// focus trap, scroll lock and Esc live in useModal()',
  'const panelRef = useModal(open, close)',
  '',
  'const onInputKeyDown = (event) => {',
  '  if (event.key === "ArrowDown") setActive(next)',
  '  if (event.key === "ArrowUp") setActive(previous)',
  '  if (event.key === "Enter") runCommand(visible[active])',
  '}',
].join('\n')

type CommandId =
  | 'jump-why'
  | 'jump-anatomy'
  | 'jump-keys'
  | 'jump-fit'
  | 'jump-params'
  | 'jump-code'
  | 'entry-self'
  | 'entry-toast'
  | 'live-index'
  | 'copy'
  | 'toggle-density'
  | 'close'

interface CommandSpec {
  id: CommandId
  zh: string
  en: string
  hint: string
}

const COMMANDS: readonly CommandSpec[] = [
  { id: 'jump-why', zh: '跳到：为什么必须整页', en: 'Jump to: why the whole page', hint: COMMAND_CODES[0] },
  { id: 'jump-anatomy', zh: '跳到：面板的四层', en: 'Jump to: the four layers', hint: COMMAND_CODES[1] },
  { id: 'jump-keys', zh: '跳到：键盘与焦点', en: 'Jump to: keyboard and focus', hint: COMMAND_CODES[2] },
  { id: 'jump-fit', zh: '跳到：什么时候值得', en: 'Jump to: when it is worth it', hint: COMMAND_CODES[3] },
  { id: 'jump-params', zh: '跳到：参数', en: 'Jump to: parameters', hint: COMMAND_CODES[4] },
  { id: 'jump-code', zh: '跳到：代码', en: 'Jump to: the code', hint: 'CODE' },
  { id: 'entry-self', zh: '打开词条：命令面板', en: 'Open the entry: Command Palette', hint: 'F-08' },
  { id: 'entry-toast', zh: '打开词条：轻提示', en: 'Open the entry: Toast', hint: 'F-06' },
  { id: 'live-index', zh: '回到现场索引', en: 'Back to the live index', hint: '/live' },
  { id: 'copy', zh: '复制面板 CSS', en: 'Copy the panel CSS', hint: 'COPY' },
  { id: 'toggle-density', zh: '切换列表密度：{mode}', en: 'Toggle row density: {mode}', hint: 'STATE' },
  { id: 'close', zh: '关闭面板', en: 'Close the palette', hint: 'Esc' },
]

const SECTION_IDS = {
  'jump-why': 'live-cpv-why',
  'jump-anatomy': 'live-cpv-anatomy',
  'jump-keys': 'live-cpv-keys',
  'jump-fit': 'live-cpv-fit',
  'jump-params': 'live-cpv-params',
  'jump-code': 'live-cpv-code',
} as const

export default function CommandPaletteLive() {
  const locale = useLocale()
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [dense, setDense] = useState(false)
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const jumpTimer = useRef<number | null>(null)

  const closePalette = useCallback(() => setOpen(false), [])
  const openPalette = useCallback(() => {
    setQuery('')
    setActive(0)
    setCopied('idle')
    setOpen(true)
  }, [])
  const panelRef = useModal(open, closePalette)

  const densityMode = pick(dense ? T.dense : T.roomy, locale)

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const terms = needle ? needle.split(/\s+/) : []
    return COMMANDS.filter((command) => {
      if (terms.length === 0) return true
      const haystack = (command.zh + ' ' + command.en + ' ' + command.hint).toLowerCase()
      return terms.every((term) => haystack.includes(term))
    })
  }, [query])

  const visible = matches.slice(0, 8)
  const activeIndex = visible.length === 0 ? -1 : Math.min(active, visible.length - 1)

  const labelOf = (command: CommandSpec) => {
    const text = pick({ zh: command.zh, en: command.en }, locale)
    return command.id === 'toggle-density' ? text.replace('{mode}', densityMode) : text
  }

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey
      if (meta && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (open) closePalette()
        else openPalette()
        return
      }
      if (event.key !== '/' || open) return
      const target = event.target
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      if (typing) return
      event.preventDefault()
      openPalette()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, closePalette, openPalette])

  useEffect(
    () => () => {
      if (jumpTimer.current !== null) window.clearTimeout(jumpTimer.current)
    },
    [],
  )

  const jumpTo = (id: string) => {
    setOpen(false)
    if (jumpTimer.current !== null) window.clearTimeout(jumpTimer.current)
    jumpTimer.current = window.setTimeout(() => {
      jumpTimer.current = null
      const target = document.getElementById(id)
      if (!target) return
      target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
      target.scrollIntoView({
        block: 'start',
        behavior: reduced ? 'auto' : 'smooth',
      })
    }, 0)
  }

  const copyCss = async () => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(CSS_SNIPPET)
        setCopied('ok')
        return
      }
    } catch {
      // fall through to the legacy path
    }
    try {
      const area = document.createElement('textarea')
      area.value = CSS_SNIPPET
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.top = '-1000px'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(area)
      setCopied(ok ? 'ok' : 'fail')
    } catch {
      setCopied('fail')
    }
  }

  const runCommand = (id: CommandId) => {
    const section = SECTION_IDS[id as keyof typeof SECTION_IDS]
    if (section) {
      jumpTo(section)
      return
    }
    if (id === 'entry-self') {
      closePalette()
      navigate(entryPath('command-palette'))
      return
    }
    if (id === 'entry-toast') {
      closePalette()
      navigate(entryPath('toast'))
      return
    }
    if (id === 'live-index') {
      closePalette()
      navigate('/live')
      return
    }
    if (id === 'copy') {
      closePalette()
      void copyCss()
      return
    }
    if (id === 'toggle-density') {
      setDense((value) => !value)
      closePalette()
      return
    }
    closePalette()
  }

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closePalette()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (visible.length > 0) setActive((activeIndex + 1) % visible.length)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (visible.length > 0) setActive((activeIndex - 1 + visible.length) % visible.length)
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const row = visible[activeIndex]
      if (row) runCommand(row.id)
    }
  }

  return (
    <div className="relative bg-canvas pb-28">
      <style>{CSS_TEXT}</style>

      <section
        aria-label={pick(T.title, locale)}
        className="flex min-h-[92svh] items-center px-5 py-16 sm:px-8"
      >
        <div className="mx-auto grid w-full max-w-[88rem] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-center">
          <div className="flex flex-col gap-5">
            <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
            <h2 className="max-w-[15ch] font-display text-display font-semibold leading-[1.05] text-ink">
              {pick(T.title, locale)}
            </h2>
            <p className="max-w-[56ch] text-body text-ink-2">{pick(T.lede, locale)}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={openPalette}
                className="cursor-pointer border border-ink bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-canvas transition-colors hover:border-accent hover:bg-accent"
              >
                {pick(T.trigger, locale)}
              </button>
              <span className="border border-line px-2 py-1 font-mono text-[10px] text-muted">
                meta + K
              </span>
            </div>
            <p className="flex items-center gap-2 font-mono text-[11px] text-muted">
              <span aria-hidden="true" className="inline-block h-2 w-2 bg-accent" />
              {pick(T.hint, locale)}
            </p>
            <p aria-live="polite" className="max-w-[52ch] text-caption text-ink-2">
              {copied === 'ok'
                ? pick(T.copiedOk, locale)
                : copied === 'fail'
                  ? pick(T.copiedFail, locale)
                  : pick(T.statusHint, locale)}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              {densityMode}
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm border border-line-strong bg-raised p-6">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                <span>{pick(T.cardLabel, locale)}</span>
                <span className="stamp">F-08</span>
              </div>
              <ul aria-hidden="true" className="mt-6 flex flex-col gap-3">
                <li className="border border-line px-3 py-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                    {pick(T.layerBackdrop, locale)}
                  </p>
                  <span className="mt-1 block h-px w-full bg-line-strong" />
                </li>
                <li className="ml-3 border border-line-strong bg-surface px-3 py-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                    {pick(T.layerPanel, locale)}
                  </p>
                  <div className="mt-2 border border-line bg-canvas px-2 py-1 font-mono text-[10px] text-ink">
                    {pick(T.layerInput, locale)}
                  </div>
                  <div className="mt-1 border border-line bg-canvas px-2 py-1 font-mono text-[10px] text-ink">
                    {pick(T.layerList, locale)}
                  </div>
                </li>
              </ul>
              <p className="mt-6 border-t border-line pt-3 text-caption text-muted">
                {pick(T.cardNote, locale)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {T.sections.map((section, index) => {
        const id = 'live-cpv-' + (['why', 'anatomy', 'keys', 'fit'] as const)[index]
        return (
          <section
            key={section.title.zh}
            id={id}
            aria-labelledby={id + '-title'}
            className="flex min-h-[62vh] scroll-mt-8 items-center px-5 py-16 sm:px-8"
          >
            <div className="mx-auto grid w-full max-w-[88rem] gap-6 border-t border-line pt-6 md:grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,15rem)] md:gap-10">
              <div className="flex items-baseline gap-3 md:flex-col md:gap-2">
                <span aria-hidden="true" className="font-display text-h1 leading-none text-line-strong">
                  {'0' + (index + 1)}
                </span>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                  {index + 1} / {T.sections.length}
                </p>
              </div>
              <div className="flex max-w-[58ch] flex-col gap-3">
                <h2 id={id + '-title'} className="font-display text-h2 text-ink">
                  {pick(section.title, locale)}
                </h2>
                <p className="text-body text-ink-2">{pick(section.body, locale)}</p>

                {index === 1 ? (
                  <ul className="mt-2 flex flex-col border-t border-line">
                    {LAYERS.map((layer) => (
                      <li
                        key={layer.key}
                        className={
                          'flex items-baseline justify-between gap-4 border-b border-line font-mono text-[11px] text-ink-2 ' +
                          (dense ? 'py-1.5' : 'py-3')
                        }
                      >
                        <span>{pick(layer.action, locale)}</span>
                        <span className="text-muted">{layer.key}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {index === 3 ? (
                  <div className="mt-2 grid gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="label-mono text-accent">{pick(T.worthTitle, locale)}</h3>
                      <ul className="mt-2 flex flex-col gap-2">
                        {T.worth.map((item) => (
                          <li key={item.zh} className="flex gap-2 text-caption text-ink-2">
                            <span aria-hidden="true" className="mt-2 inline-block h-1 w-1 shrink-0 bg-accent" />
                            {pick(item, locale)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="label-mono text-muted">{pick(T.gimmickTitle, locale)}</h3>
                      <ul className="mt-2 flex flex-col gap-2">
                        {T.gimmick.map((item) => (
                          <li key={item.zh} className="flex gap-2 text-caption text-muted">
                            <span aria-hidden="true" className="mt-2 inline-block h-1 w-1 shrink-0 bg-line-strong" />
                            {pick(item, locale)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
              {section.figure.length > 0 ? (
                <pre className="self-start overflow-x-auto border-l-2 border-accent pl-3 font-mono text-[10px] leading-relaxed text-muted">
                  {section.figure.join('\n')}
                </pre>
              ) : (
                <p className="self-start font-mono text-[10px] leading-relaxed text-muted">
                  {densityMode}
                </p>
              )}
            </div>
          </section>
        )
      })}

      <section
        id="live-cpv-params"
        aria-labelledby="live-cpv-params-title"
        className="flex min-h-[52vh] scroll-mt-8 items-center px-5 py-16 sm:px-8"
      >
        <div className="mx-auto grid w-full max-w-[88rem] gap-6 border-t border-line pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <h2 id="live-cpv-params-title" className="font-display text-h2 text-ink">
              {pick(T.paramsTitle, locale)}
            </h2>
            <dl className="flex flex-col">
              {T.params.map((row) => (
                <div
                  key={row.label.zh}
                  className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-line py-2.5"
                >
                  <dt className="label-mono">{pick(row.label, locale)}</dt>
                  <dd className="text-caption text-ink">{pick(row.value, locale)}</dd>
                </div>
              ))}
            </dl>
          </div>
          <pre className="well self-start overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
            {CSS_SNIPPET}
          </pre>
        </div>
      </section>

      <section
        id="live-cpv-code"
        aria-labelledby="live-cpv-code-title"
        className="scroll-mt-8 px-5 py-20 pb-28 sm:px-8"
      >
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-5">
          <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
            <h2 id="live-cpv-code-title" className="font-display text-h3 text-ink">
              {pick(T.codeTitle, locale)}
            </h2>
            <span className="label-mono">CSS + JS</span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
              {CSS_SNIPPET}
            </pre>
            <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
              {JS_SNIPPET}
            </pre>
          </div>
          <div className="flex max-w-[62ch] flex-col gap-3">
            <p className="text-caption text-ink-2">{pick(T.codeNote, locale)}</p>
            <p className="text-caption text-muted">{pick(T.reducedNote, locale)}</p>
            <Link
              to={entryPath('command-palette')}
              className="text-link self-start font-mono text-[11px] text-accent no-underline"
            >
              {pick(T.back, locale)} -&gt;
            </Link>
          </div>
        </div>
      </section>

      {open ? (
        <div
          className={
            'fixed inset-0 z-[60] overflow-y-auto px-4 ' + (reduced ? '' : 'live-cpv-fade')
          }
          style={{ backgroundColor: 'color-mix(in srgb, var(--ink) 35%, transparent)' }}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) closePalette()
          }}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={pick(T.dialog, locale)}
            tabIndex={-1}
            className={
              'mx-auto mb-10 mt-[12vh] w-full max-w-[36rem] border border-line-strong bg-raised shadow-[var(--shadow-overlay)] outline-none ' +
              (reduced ? '' : 'live-cpv-pop')
            }
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
              <div className="flex items-center gap-3">
                <span className="stamp">F-08</span>
                <button
                  type="button"
                  onClick={closePalette}
                  aria-label={pick(T.dialogClose, locale)}
                  className="cursor-pointer border border-line px-2 py-0.5 font-mono text-[11px] text-muted transition-colors hover:border-ink hover:text-ink"
                >
                  x
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <span aria-hidden="true" className="font-mono text-[11px] text-accent">
                &gt;
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActive(0)
                }}
                onKeyDown={onSearchKeyDown}
                placeholder={pick(T.placeholder, locale)}
                aria-label={pick(T.placeholder, locale)}
                role="combobox"
                aria-expanded="true"
                aria-controls="live-cpv-listbox"
                aria-activedescendant={
                  activeIndex >= 0 && visible[activeIndex]
                    ? 'live-cpv-row-' + visible[activeIndex].id
                    : undefined
                }
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-transparent font-mono text-[13px] text-ink outline-none placeholder:text-muted"
              />
              <span className="shrink-0 font-mono text-[10px] text-muted">Esc</span>
            </div>

            <ul
              id="live-cpv-listbox"
              role="listbox"
              aria-label={pick(T.listLabel, locale)}
              className="max-h-[50vh] overflow-y-auto py-1"
            >
              {visible.length === 0 ? (
                <li role="presentation" className="px-4 py-6 text-caption text-muted">
                  {pick(T.empty, locale)}
                </li>
              ) : null}
              {visible.map((command, index) => (
                <li
                  key={command.id}
                  id={'live-cpv-row-' + command.id}
                  role="option"
                  aria-selected={index === activeIndex}
                  data-active={index === activeIndex}
                  onPointerMove={() => setActive(index)}
                  onPointerDown={(event) => {
                    event.preventDefault()
                    runCommand(command.id)
                  }}
                  className={
                    'mx-1 flex cursor-pointer items-center justify-between gap-4 border-l-2 px-3 py-2 font-mono text-[12px] ' +
                    (index === activeIndex
                      ? 'border-accent bg-accent-soft text-ink'
                      : 'border-transparent text-ink-2')
                  }
                >
                  <span>{labelOf(command)}</span>
                  <span className="shrink-0 text-[10px] text-muted">{command.hint}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-2.5 font-mono text-[10px] text-muted">
              <span>{pick(T.footer, locale)}</span>
              <span>
                {pick(T.resultsLabel, locale)} {visible.length} / {matches.length}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
