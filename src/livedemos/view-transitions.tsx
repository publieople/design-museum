import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { usePrefersReducedMotion } from '../lib/motion'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * 整页版「视图过渡」：这一页自己就是那份两页的档案。
 *
 * 点 01 / 02 时，document.startViewTransition 先给旧 DOM 拍一张快照，
 * 再执行回调改 state，最后拍新快照，然后让两张快照之间做动画。
 * React 的更新是异步批处理的，所以回调里必须 flushSync，否则新快照
 * 拍到的还是旧界面。不支持 API 或减少动态时直接切换，不排假动画。
 */

type ViewId = 'a' | 'b'

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> }
}

const T = {
  eyebrow: { zh: '现场 · 视图过渡', en: 'LIVE · VIEW TRANSITIONS' },
  title: { zh: '两屏之间，浏览器补一帧', en: 'The browser draws the frame between two screens' },
  lede: {
    zh: '这一页没有演示框。下面这份档案就是演示：点「翻到 02」，同一份 DOM 换一个状态，标题、编号与卡片从旧位置滑到新位置，其余部分原地不动。',
    en: 'There is no demo box on this page. The file below is the demo: press "Open 02" and the same DOM swaps state; the title, the number and the card travel from their old places to new ones while everything else stays put.',
  },
  hint: { zh: '翻一次，盯住标题和编号', en: 'Switch once, keep your eyes on the title and number' },
  sheetLabel: { zh: '档案 · 同文档', en: 'File · same document' },
  statusTitle: { zh: '这一刻的支持情况', en: 'Support right now' },
  labelApi: { zh: 'startViewTransition', en: 'startViewTransition' },
  labelMotion: { zh: '减少动态', en: 'Reduced motion' },
  labelView: { zh: '当前视图', en: 'Current view' },
  labelNames: { zh: '共享元素', en: 'Shared elements' },
  apiYes: { zh: '可用', en: 'available' },
  apiNo: { zh: '不可用', en: 'missing' },
  motionOn: { zh: '开启', en: 'reduce' },
  motionOff: { zh: '未开启', en: 'no-preference' },
  namesValue: { zh: '3 个名字', en: '3 names' },
  statusNative: {
    zh: 'API 可用：切换由 startViewTransition 接管，320ms。',
    en: 'API available: startViewTransition owns the switch, 320ms.',
  },
  statusReduced: {
    zh: '已减少动态：切换是瞬间的，功能不变。',
    en: 'Reduced motion is on: the switch is instant, the feature is unchanged.',
  },
  statusFallback: {
    zh: '这个浏览器没有 View Transitions API：切换是瞬间的，不留空白。',
    en: 'This browser has no View Transitions API: the switch is instant and never leaves a blank screen.',
  },
  statusBusy: { zh: '过渡进行中，指针被伪元素挡着。', en: 'Transition running; a pseudo element is covering the page.' },
  currentA: { zh: '01 · 索引', en: '01 · Index' },
  currentB: { zh: '02 · 详情', en: '02 · Detail' },
  openB: { zh: '翻到 02 · 详情', en: 'Open 02 · Detail' },
  openA: { zh: '回到 01 · 索引', en: 'Back to 01 · Index' },
  viewA: {
    sheet: 'SHEET 01 / INDEX',
    code: '01',
    kicker: { zh: '索引', en: 'Index' },
    title: { zh: '三份档案，按编号排', en: 'Three records, ordered by number' },
    intro: {
      zh: '这是旧屏：一张列表。翻页之后，这份列表会整块变成右侧那张卡片的新位置。',
      en: 'This is the old screen: a list. After the switch, this block becomes the card in its new place.',
    },
    rows: [
      { code: 'R-01', name: { zh: '粘性头部', en: 'Sticky Header' }, kind: 'layout' },
      { code: 'R-02', name: { zh: '滚动揭示', en: 'Scroll Reveal' }, kind: 'motion' },
      { code: 'R-03', name: { zh: '视图过渡', en: 'View Transitions' }, kind: 'navigation' },
    ],
  },
  viewB: {
    sheet: 'SHEET 02 / DETAIL',
    code: '02',
    kicker: { zh: '详情', en: 'Detail' },
    title: { zh: '视图过渡', en: 'View Transitions' },
    oneLiner: {
      zh: '页面切换时，浏览器把新旧两屏接起来，补出中间那一下过渡。',
      en: 'When the view changes, the browser stitches the old and new screens together and fills the gap.',
    },
    meta: [
      { key: { zh: '编号', en: 'Code' }, value: 'M-07' },
      { key: { zh: '分类', en: 'Category' }, value: { zh: '动效 · 导航', en: 'Motion · Navigation' } },
      { key: { zh: '时长', en: 'Duration' }, value: '320ms' },
      { key: { zh: '降级', en: 'Fallback' }, value: { zh: '不支持时瞬间切换', en: 'Instant switch when unsupported' } },
    ],
    note: {
      zh: '这是新屏：标题变大，编号移到右上方，卡片从右栏铺到整行。浏览器把旧位置和新位置连起来，所以你看到的是「同一件东西移动」，不是「一屏消失、一屏出现」。',
      en: 'This is the new screen: the title grows, the number moves to the upper right, the card spreads from the right column to the full row. The browser connects old positions to new ones, so you see one thing moving rather than one screen leaving and another arriving.',
    },
  },
  chapters: { zh: '第 {n} 节', en: 'Section {n}' },
  sections: [
    {
      title: { zh: '它拍的是两屏，不是元素', en: 'It snapshots screens, not elements' },
      figure: { zh: ['::view-transition-old(root)', '::view-transition-new(root)', '中间那一下由浏览器补'], en: ['::view-transition-old(root)', '::view-transition-new(root)', 'the gap is drawn by the browser'] },
      body: {
        zh: 'CSS transition 只能让同一个元素自己变；视图过渡在新旧 DOM 各拍一张快照，再让两张快照之间做动画。所以旧界面里的某个元素可以「落到」新界面里的对应元素上——这就是共享元素。改 DOM 的那一步，必须发生在两张快照之间。',
        en: 'A CSS transition can only animate one element on its own; a view transition snapshots the old and the new DOM, then animates between the two snapshots. That is why an element in the old view can land on its counterpart in the new one: a shared element. The DOM change has to happen between the snapshots.',
      },
    },
    {
      title: { zh: '改 DOM 那一步要放进回调，React 还要 flushSync', en: 'Commit inside the callback, flushSync inside React' },
      figure: { zh: ['startViewTransition(() => {', '  flushSync(() => setView(next))', '})'], en: ['startViewTransition(() => {', '  flushSync(() => setView(next))', '})'] },
      body: {
        zh: 'startViewTransition 拿到回调后先拍旧快照，再执行回调，最后拍新快照。React 的 setState 默认异步批处理，回调里只写 setState 的话，拍新快照时 DOM 还没更新，浏览器会拍到「旧屏 → 旧屏」。flushSync 强制同步提交；它是一次性的逃生口，别在普通渲染路径里用。',
        en: 'startViewTransition takes the callback, snapshots the old screen, runs the callback, then snapshots the new screen. React batches setState asynchronously, so if the callback only calls setState the DOM has not updated by the time the new snapshot is taken, and the browser captures old to old. flushSync forces a synchronous commit; it is a one-off escape hatch, not something for normal rendering.',
      },
    },
    {
      title: { zh: '三个硬约束', en: 'Three hard constraints' },
      figure: { zh: ['name 同时刻唯一', '伪元素挡指针', '连续点击要挡住'], en: ['name unique at a time', 'pseudo element blocks pointers', 'guard against double clicks'] },
      body: {
        zh: '同一时刻 view-transition-name 只能出现一次，列表里每行都写死名字会直接报错，只给参与这次过渡的元素加；过渡期间整页上面盖着一层伪元素，点击会被吞掉几百毫秒；连点两次会让两次过渡抢同一批快照，用一个 busy 标记把第二次挡在外面。',
        en: 'A view-transition-name may appear only once at a time; naming every row throws, so name only the element taking part in this transition. During the transition a pseudo element covers the page and swallows clicks for a few hundred milliseconds. Two quick clicks make two transitions fight over snapshots, so a busy flag keeps the second one out.',
      },
    },
    {
      title: { zh: '降级与边界', en: 'Fallbacks and edges' },
      figure: { zh: ['没有 API', '减少动态', '跨文档'], en: ['no API', 'reduced motion', 'cross-document'] },
      body: {
        zh: '三种情况要提前想好，下面三块各自对应。共同原则只有一句：过渡是附加的，拿掉它之后功能必须完全一样。',
        en: 'Three situations need deciding up front, one panel each below. The shared rule is one line: the transition is additive, and removing it must leave the feature fully intact.',
      },
    },
    {
      title: { zh: '为什么它是「现场页」', en: 'Why it is a live page' },
      figure: { zh: ['快照 = 整个文档', '展台只截到盒子内部', '共享元素要跨版式'], en: ['snapshot = whole document', 'a stage crops to its box', 'shared elements cross layouts'] },
      body: {
        zh: '它拍的是整个文档与视口。放在展台盒子里也照样运行，但你只能看到盒子内部换了一屏，两屏怎么接起来、共享元素怎么跨版式移动，全被盒子裁掉了。这一页把整份档案当画布，过渡本身才看得见。',
        en: 'It snapshots the whole document and viewport. The API still runs inside a stage box, but then you only see one box change its contents; how the two screens connect and how shared elements travel across layouts gets cropped away. This page uses the whole file as the canvas, which is where the transition itself becomes visible.',
      },
    },
  ],
  guards: [
    {
      code: 'G-01',
      title: { zh: '没有 API', en: 'No API' },
      body: {
        zh: '直接 setState：不跑动画、不留空白、不排一场假过渡。功能拿到手就行。',
        en: 'Call setState directly: no animation, no blank screen, no fake transition. The feature is what matters.',
      },
    },
    {
      code: 'G-02',
      title: { zh: '减少动态', en: 'Reduced motion' },
      body: {
        zh: 'prefers-reduced-motion 下不调用 startViewTransition；页面瞬间切换，内容与操作完全不变。',
        en: 'Under prefers-reduced-motion do not call startViewTransition; the view switches instantly and nothing about the content or controls changes.',
      },
    },
    {
      code: 'G-03',
      title: { zh: '跨文档', en: 'Cross-document' },
      body: {
        zh: '多页应用要同源，并写 @view-transition { navigation: auto }；浏览器仍可能按普通导航处理。它管两个文档之间，不是同一 DOM 的两次状态。',
        en: 'A multi-page site needs same-origin pages and @view-transition { navigation: auto }, and the browser may still treat it as a normal navigation. That mode moves between two documents, not between two states of one DOM.',
      },
    },
  ],
  compareTitle: { zh: '相邻概念的边界', en: 'Borders with neighbouring ideas' },
  compareRows: [
    {
      name: { zh: 'CSS 过渡', en: 'CSS transition' },
      does: { zh: '一个元素自己变，旧屏不参与', en: 'One element changes alone; the old screen is not involved' },
    },
    {
      name: { zh: '入场动画', en: 'Entrance animation' },
      does: { zh: '新屏自己播，旧屏已经消失', en: 'The new screen plays alone after the old one is gone' },
    },
    {
      name: { zh: '跨文档过渡', en: 'Cross-document transition' },
      does: { zh: '两个文档之间，要同源并声明', en: 'Between two documents, same-origin and declared' },
    },
    {
      name: { zh: '同文档过渡（本页）', en: 'Same-document (this page)' },
      does: { zh: '同一 DOM 的两次状态，回调里提交', en: 'Two states of one DOM, committed inside the callback' },
    },
  ],
  paramsTitle: { zh: '推荐取值', en: 'Recommended values' },
  params: [
    { label: { zh: '时长', en: 'Duration' }, value: '200–400ms' },
    { label: { zh: '缓动', en: 'Easing' }, value: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    { label: { zh: '命名', en: 'Naming' }, value: { zh: '同一时刻唯一', en: 'unique at any moment' } },
    { label: { zh: '降级', en: 'Fallback' }, value: { zh: '瞬间切换，不留空白', en: 'instant switch, no blank screen' } },
    { label: { zh: '跨文档', en: 'Cross-document' }, value: '@view-transition { navigation: auto }' },
  ],
  codeTitle: { zh: '这一页实际在用的', en: 'What this page actually uses' },
  codeNote: {
    zh: '三件事：先判断支持与减少动态；在回调里 flushSync 提交；名字写在元素自己的 style 上。CSS 只负责给这几个名字定时长与缓动。',
    en: 'Three things: check support and reduced motion first; commit with flushSync inside the callback; put names on the elements own style. CSS only gives those names a duration and easing.',
  },
  back: { zh: '回到词条：视图过渡', en: 'Back to the entry: View Transitions' },
} as const

const SHARED_NUMBER = 'dm-vt-number'
const SHARED_TITLE = 'dm-vt-title'
const SHARED_CARD = 'dm-vt-card'

const CSS_TEXT = [
  '::view-transition-group(' + SHARED_NUMBER + '),',
  '::view-transition-old(' + SHARED_NUMBER + '),',
  '::view-transition-new(' + SHARED_NUMBER + '),',
  '::view-transition-group(' + SHARED_TITLE + '),',
  '::view-transition-old(' + SHARED_TITLE + '),',
  '::view-transition-new(' + SHARED_TITLE + '),',
  '::view-transition-group(' + SHARED_CARD + '),',
  '::view-transition-old(' + SHARED_CARD + '),',
  '::view-transition-new(' + SHARED_CARD + '),',
  '::view-transition-group(root),',
  '::view-transition-old(root),',
  '::view-transition-new(root) {',
  '  animation-duration: 320ms;',
  '  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);',
  '}',
  '',
  '@media (prefers-reduced-motion: reduce) {',
  '  ::view-transition-group(*),',
  '  ::view-transition-old(*),',
  '  ::view-transition-new(*) {',
  '    animation-duration: 0.01ms;',
  '  }',
  '}',
].join('\n')

const SNIPPET = [
  'type ViewTransitionDocument = Document & {',
  '  startViewTransition?: (cb: () => void) => {',
  '    finished: Promise<void>',
  '  }',
  '}',
  '',
  'const doc = document as ViewTransitionDocument',
  'const start = doc.startViewTransition',
  '',
  'if (!start || reduced) {',
  '  setView(next)',
  '} else {',
  '  start.call(doc, () => {',
  '    // React batches updates: without flushSync the',
  '    // new snapshot still shows the old DOM',
  '    flushSync(() => setView(next))',
  '  })',
  '}',
  '',
  '/* the names live on the elements themselves */',
  '<h2 style={{ viewTransitionName: "dm-vt-title" }} />',
  '',
  '::view-transition-group(dm-vt-title) {',
  '  animation-duration: 320ms;',
  '}',
].join('\n')

export default function ViewTransitionsLive() {
  const locale = useLocale()
  const reduced = usePrefersReducedMotion()
  const [view, setView] = useState<ViewId>('a')
  const [supported] = useState(
    () =>
      typeof document !== 'undefined' &&
      typeof (document as ViewTransitionDocument).startViewTransition === 'function',
  )
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)

  const go = (next: ViewId) => {
    if (next === view || busyRef.current) return
    const doc = document as ViewTransitionDocument
    const start = doc.startViewTransition
    if (!start || reduced) {
      setView(next)
      return
    }
    busyRef.current = true
    setBusy(true)
    const transition = start.call(doc, () => {
      // 同步提交，否则新快照拍到的还是旧 DOM
      flushSync(() => setView(next))
    })
    transition.finished.finally(() => {
      busyRef.current = false
      setBusy(false)
    })
  }

  const statusText = reduced
    ? pick(T.statusReduced, locale)
    : !supported
      ? pick(T.statusFallback, locale)
      : busy
        ? pick(T.statusBusy, locale)
        : pick(T.statusNative, locale)

  return (
    <div className="relative bg-canvas pb-28">
      <style>{CSS_TEXT}</style>

      <section aria-label={pick(T.title, locale)} className="flex min-h-[92svh] items-center px-5 py-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-[88rem] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-center">
          <div className="flex flex-col gap-5">
            <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
            <h2 className="max-w-[16ch] font-display text-display font-semibold leading-[1.05] text-ink">
              {pick(T.title, locale)}
            </h2>
            <p className="max-w-[56ch] text-body text-ink-2">{pick(T.lede, locale)}</p>
            <p className="mt-2 flex items-center gap-2 font-mono text-[11px] text-muted">
              <span aria-hidden="true" className="inline-block h-2 w-2 bg-accent" />
              {pick(T.hint, locale)} ↓
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm border border-line-strong bg-raised p-6">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                <span>{pick(T.statusTitle, locale)}</span>
                <span className="stamp">M-07</span>
              </div>
              <dl className="mt-5 flex flex-col">
                <div className="flex items-baseline justify-between border-b border-line py-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {pick(T.labelApi, locale)}
                  </dt>
                  <dd className={'font-mono text-[12px] ' + (supported ? 'text-accent' : 'text-ink')}>
                    {supported ? pick(T.apiYes, locale) : pick(T.apiNo, locale)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-b border-line py-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {pick(T.labelMotion, locale)}
                  </dt>
                  <dd className="font-mono text-[12px] text-ink">
                    {reduced ? pick(T.motionOn, locale) : pick(T.motionOff, locale)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-b border-line py-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {pick(T.labelView, locale)}
                  </dt>
                  <dd className="font-mono text-[12px] text-ink">
                    {view === 'a' ? pick(T.currentA, locale) : pick(T.currentB, locale)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between py-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {pick(T.labelNames, locale)}
                  </dt>
                  <dd className="font-mono text-[12px] text-ink">{pick(T.namesValue, locale)}</dd>
                </div>
              </dl>
              <p className="mt-4 border-t border-line pt-3 text-caption text-muted">{statusText}</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label={pick(T.sheetLabel, locale)} className="px-5 pb-16 pt-4 sm:px-8">
        <div className="mx-auto w-full max-w-[88rem]">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-3">
            <p className="label-mono text-accent">{pick(T.sheetLabel, locale)}</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => go('a')}
                aria-pressed={view === 'a'}
                aria-disabled={busy}
                className={
                  'border px-3 py-1.5 font-mono text-[11px] transition-colors ' +
                  (view === 'a'
                    ? 'border-ink bg-ink text-canvas'
                    : 'border-line-strong bg-transparent text-ink-2 hover:border-ink hover:text-ink')
                }
              >
                {pick(T.currentA, locale)}
              </button>
              <button
                type="button"
                onClick={() => go('b')}
                aria-pressed={view === 'b'}
                aria-disabled={busy}
                className={
                  'border px-3 py-1.5 font-mono text-[11px] transition-colors ' +
                  (view === 'b'
                    ? 'border-ink bg-ink text-canvas'
                    : 'border-line-strong bg-transparent text-ink-2 hover:border-ink hover:text-ink')
                }
              >
                {pick(T.currentB, locale)}
              </button>
            </div>
          </div>

          <p className="mt-3 font-mono text-[11px] text-muted" aria-live="polite">
            {statusText}
          </p>

          {view === 'a' ? (
            <div className="mt-8 grid min-h-[54svh] gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-12">
              <div className="flex flex-col gap-4 border-l-2 border-accent pl-5">
                <span
                  aria-hidden="true"
                  style={{ viewTransitionName: SHARED_NUMBER }}
                  className="font-display text-display leading-none text-line-strong"
                >
                  {T.viewA.code}
                </span>
                <p className="label-mono">{T.viewA.sheet}</p>
                <h2
                  style={{ viewTransitionName: SHARED_TITLE }}
                  className="max-w-[18ch] font-display text-h1 font-semibold leading-[1.04] text-ink"
                >
                  {pick(T.viewA.title, locale)}
                </h2>
                <p className="max-w-[40ch] text-caption text-ink-2">{pick(T.viewA.intro, locale)}</p>
              </div>
              <div
                style={{ viewTransitionName: SHARED_CARD }}
                className="flex flex-col self-start border border-line bg-surface"
              >
                {T.viewA.rows.map((row, index) => (
                  <div
                    key={row.code}
                    className={
                      'grid grid-cols-[4rem_minmax(0,1fr)_auto] items-baseline gap-4 px-5 py-4 ' +
                      (index > 0 ? 'border-t border-line' : '')
                    }
                  >
                    <span className="font-mono text-[11px] text-muted">{row.code}</span>
                    <span className="font-display text-h3 text-ink">{pick(row.name, locale)}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-accent">
                      {row.kind}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 flex min-h-[54svh] flex-col gap-8">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex flex-col gap-4">
                  <p className="label-mono">{T.viewB.sheet}</p>
                  <h2
                    style={{ viewTransitionName: SHARED_TITLE }}
                    className="max-w-[20ch] font-display text-display font-semibold leading-[1.02] text-ink"
                  >
                    {pick(T.viewB.title, locale)}
                  </h2>
                </div>
                <span
                  aria-hidden="true"
                  style={{ viewTransitionName: SHARED_NUMBER }}
                  className="border border-line-strong px-3 py-1 font-display text-h1 leading-none text-accent"
                >
                  {T.viewB.code}
                </span>
              </div>
              <div
                style={{ viewTransitionName: SHARED_CARD }}
                className="grid gap-8 border border-line bg-surface p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]"
              >
                <div className="flex flex-col gap-4">
                  <p className="font-display text-h3 text-ink">{pick(T.viewB.oneLiner, locale)}</p>
                  <p className="text-caption text-ink-2">{pick(T.viewB.note, locale)}</p>
                </div>
                <dl className="flex flex-col self-start">
                  {T.viewB.meta.map((row) => (
                    <div
                      key={row.key.zh}
                      className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 border-b border-line py-2"
                    >
                      <dt className="label-mono">{pick(row.key, locale)}</dt>
                      <dd className="text-caption text-ink">
                        {typeof row.value === 'string' ? row.value : pick(row.value, locale)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}
        </div>
      </section>

      {T.sections.map((section, index) => (
        <section
          key={section.title.zh}
          id={'live-vt-section-' + index}
          aria-labelledby={'live-vt-section-' + index + '-title'}
          className="flex min-h-[62vh] items-center px-5 py-16 sm:px-8"
        >
          <div className="mx-auto grid w-full max-w-[88rem] gap-6 border-t border-line pt-6 md:grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,15rem)] md:gap-10">
            <div className="flex items-baseline gap-3 md:flex-col md:gap-2">
              <span aria-hidden="true" className="font-display text-h1 leading-none text-line-strong">
                {'0' + (index + 1)}
              </span>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                {pick(T.chapters, locale).replace('{n}', '0' + (index + 1))}
              </p>
            </div>
            <div className="flex max-w-[58ch] flex-col gap-3">
              <h2 id={'live-vt-section-' + index + '-title'} className="font-display text-h2 text-ink">
                {pick(section.title, locale)}
              </h2>
              <p className="text-body text-ink-2">{pick(section.body, locale)}</p>
            </div>
            <pre className="self-start overflow-x-auto border-l-2 border-accent pl-3 font-mono text-[10px] leading-relaxed text-muted">{(locale === 'en' ? section.figure.en : section.figure.zh).join('\n')}</pre>
            {index === 3 ? (
              <div className="grid gap-3 sm:grid-cols-3 md:col-span-2 md:col-start-2">
                {T.guards.map((guard) => (
                  <div key={guard.code} className="flex flex-col gap-2 border border-line bg-surface p-4">
                    <div className="flex items-center justify-between">
                      <span className="label-mono">{pick(guard.title, locale)}</span>
                      <span className="stamp">{guard.code}</span>
                    </div>
                    <p className="text-caption text-ink-2">{pick(guard.body, locale)}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ))}

      <section aria-label={pick(T.compareTitle, locale)} className="px-5 py-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-[88rem] gap-6 border-t border-line pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-h2 text-ink">{pick(T.compareTitle, locale)}</h2>
            <div className="flex flex-col">
              {T.compareRows.map((row) => (
                <div
                  key={row.name.zh}
                  className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-4 border-b border-line py-3"
                >
                  <span className="font-mono text-[11px] text-ink">{pick(row.name, locale)}</span>
                  <span className="text-caption text-ink-2">{pick(row.does, locale)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-h3 text-ink">{pick(T.paramsTitle, locale)}</h2>
            <dl className="flex flex-col">
              {T.params.map((row) => (
                <div
                  key={row.label.zh}
                  className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-line py-2.5"
                >
                  <dt className="label-mono">{pick(row.label, locale)}</dt>
                  <dd className="text-caption text-ink">
                    {typeof row.value === 'string' ? row.value : pick(row.value, locale)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section aria-label={pick(T.codeTitle, locale)} className="px-5 py-20 pb-28 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-5">
          <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
            <h2 className="font-display text-h3 text-ink">{pick(T.codeTitle, locale)}</h2>
            <span className="label-mono">
              {reduced ? 'reduced-motion' : supported ? 'view-transition' : 'no-api'}
            </span>
          </div>
          <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
            {SNIPPET}
          </pre>
          <div className="flex flex-col gap-3">
            <p className="max-w-[70ch] text-caption text-ink-2">{pick(T.codeNote, locale)}</p>
            <Link
              to={entryPath('view-transitions')}
              className="text-link self-start font-mono text-[11px] text-accent no-underline"
            >
              {pick(T.back, locale)} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
