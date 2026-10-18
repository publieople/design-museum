import { type CSSProperties } from 'react'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { usePrefersReducedMotion } from '../lib/motion'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * 整页版「粘性堆叠卡片」。
 *
 * 舞台里那个滚轮盒子被拆掉了：这一页的滚动容器就是页面本身，五张档案卡
 * 各自 sticky 在一个递增的 top 上，后一张压住前一张、前一张留一条边。
 * 效果依赖整页滚动距离，这是页面要讲清的第一件事。
 */

const T = {
  eyebrow: { zh: '现场演示 · 布局', en: 'Live demo · Layout' },
  title: { zh: '滚动到哪，哪一层就留下', en: 'Wherever you stop, a layer remains' },
  lede: {
    zh: '五张档案卡，每张吸附在比上一张低一点的刻度上。往下滚，新的一张从底部升上来，把旧的一张压住，只留一条边。',
    en: 'Five archive cards, each sticking a little lower than the one before. Scroll down and the next rises from the bottom, covers the previous one and leaves a single edge showing.',
  },
  lede2: {
    zh: '它不需要 JS 滚动监听：position: sticky 与 z-index 就把这件事做完了。整页就是滚动容器——这不是可选项，是效果成立的前提。',
    en: 'No JS scroll listener: position: sticky and z-index do the whole job. The page itself is the scroll container, which is not a stylistic choice but the condition for the effect to work at all.',
  },
  statusSticky: { zh: '纯 CSS · 无滚动监听 · 五层', en: 'Pure CSS · no scroll listener · five layers' },
  hint: { zh: '向下滚动，卡片会依次叠起', en: 'Scroll down and the cards stack in turn' },
  reduced: { zh: '减少动态：入场浮起已关闭，堆叠与内容保持静态可读', en: 'Reduced motion: the entrance rise is off; the stack and all content stay static and readable' },
  schematic: { zh: '刻度示意', en: 'The ladder' },
  schematicNote: {
    zh: '每一层比上一层多 16px 的 top，越往下 margin 越窄，堆叠时露出上一条。',
    en: 'Each layer sits 16px lower than the one above; the lower cards indent further so the previous edge shows through.',
  },
  stackLabel: { zh: '堆叠层', en: 'The stack' },
  stackNote: { zh: '滚动 · 五张卡依次吸附 · 系统滚动条', en: 'Scroll · five cards stick in turn · system scrollbar' },
  stackEnd: { zh: '堆叠结束 · 五层到齐', en: 'End of stack · five layers reached' },
  whyTitle: { zh: '为什么必须整页滚动', en: 'Why the whole page has to scroll' },
  whyBody: {
    zh: '堆叠有两个参数：滚动距离和露头高度。整页滚动时每张卡分到大约一屏，层与层之间有一次呼吸；把同样五张卡塞进 300px 的盒子，每张只剩几十像素，卡刚贴上就被下一张顶走，看着像抖了一下。这不是参数没调好，是盒子本身给不了距离。',
    en: 'Two parameters drive the stack: scroll distance and peek height. On the page each card gets roughly one screen and the layers get room to breathe. Squeeze the same five cards into a 300px box and each one gets a few dozen pixels: a card barely sticks before the next shoves it away, and the result reads as a jitter. That is not a badly tuned setting; the box simply cannot supply the distance.',
  },
  compare: [
    {
      key: 'page',
      label: { zh: '整页滚动', en: 'Page scroll' },
      value: { zh: '约 100svh / 张', en: 'about 100svh per card' },
      note: { zh: '每张卡有自己的滚动区间，层与层之间留得住停顿。', en: 'Each card owns a scroll interval, so the layers can pause.' },
      bar: 'w-full bg-accent',
    },
    {
      key: 'box',
      label: { zh: '300px 盒子', en: '300px box' },
      value: { zh: '约 6% / 张', en: 'about 6% per card' },
      note: { zh: '卡片刚贴上就被顶走，看起来像抖了一下。', en: 'A card barely sticks before it is pushed away; it reads as a jitter.' },
      bar: 'w-[6%] bg-ink-2',
    },
  ],
  whenTitle: { zh: '什么时候值得用', en: 'When it earns the scroll' },
  whenList: [
    { zh: '教程、步骤、结账：一卡一件事，读完一张再翻下一张。', en: 'Tutorials, steps and checkout: one idea per card, each read before the next.' },
    { zh: '需要把上一阶段留在视口里当上下文：流程阶段、前后对比、对照数据。', en: 'The previous step should stay in view as context: stages, before and after, side-by-side figures.' },
    { zh: '长页面需要停顿：让滚动有节奏，而不是一条平铺的列表。', en: 'A long page needs pauses: rhythm instead of one flat list.' },
  ],
  gimmickTitle: { zh: '什么时候只是耍花招', en: 'When it is only a trick' },
  gimmickList: [
    { zh: '读者在扫读或比较：堆叠逼着人按顺序看，比较变成记忆。', en: 'Readers are scanning or comparing: a stack forces a sequence and turns comparison into memory.' },
    { zh: '表单、后台、密集操作：多一层遮挡就多一次误判。', en: 'Forms, admin panels, dense operations: every extra layer is another chance to misread.' },
    { zh: '页面本来就很短：没有滚动距离，只剩几张卡硬挤。', en: 'The page is already short: no distance, just cards crushed together.' },
    { zh: '关键信息只在最后一张：多数人还没滚到堆叠结束就离开了。', en: 'The key point lives only on the last card: most readers leave before the stack ends.' },
  ],
  specTitle: { zh: '参数与降级', en: 'Parameters and fallback' },
  specRows: [
    {
      label: { zh: '吸附', en: 'Position' },
      value: { zh: 'position: sticky', en: 'position: sticky' },
    },
    {
      label: { zh: '露头（第 n 张）', en: 'Peek (card n)' },
      value: { zh: 'top: 3.5rem + n x 16px', en: 'top: 3.5rem + n x 16px' },
    },
    {
      label: { zh: '卡片高度', en: 'Card height' },
      value: { zh: 'clamp(19rem, 58svh, 30rem)', en: 'clamp(19rem, 58svh, 30rem)' },
    },
    {
      label: { zh: '层序', en: 'Stacking' },
      value: { zh: 'z-index: n + 1', en: 'z-index: n + 1' },
    },
    {
      label: { zh: '入场', en: 'Entrance' },
      value: { zh: 'view() 0 -> 80%', en: 'view() 0 -> 80%' },
    },
    {
      label: { zh: '缩放', en: 'Scale' },
      value: { zh: '不做：CSS 没有「被盖住」信号', en: 'none: CSS has no covered signal' },
    },
    {
      label: { zh: '不支持 sticky', en: 'Without sticky' },
      value: { zh: '退化为普通纵向列表', en: 'Degrades to a plain vertical list' },
    },
  ],
  fallbackBody: {
    zh: 'position: sticky 已经不需要前缀。真遇到不支持的浏览器，这五张卡就是一段普通的纵向列表，标题、正文和参数一条不少——这一页没有把信息藏在动画里。开启减少动态时，入场浮起被关闭；堆叠本身由滚动位置驱动，不是时间动画，保留。',
    en: 'position: sticky ships without prefixes now. In a browser that lacks it, the five cards become an ordinary vertical list and every title, paragraph and spec row survives: no information on this page exists only inside the animation. With reduced motion on, the entrance rise is disabled; the stack itself follows scroll position rather than time, so it stays.',
  },
  codeTitle: { zh: '这一页实际在用的', en: 'What this page actually uses' },
  codeNote: {
    zh: '错位只靠 top 和 z-index。没有 JS 滚动监听，也没有每帧读布局。',
    en: 'The ladder comes only from top and z-index: no JS scroll listener, no per-frame layout reads.',
  },
  back: { zh: '回到词条：粘性堆叠卡片', en: 'Back to the entry: Sticky Stacking Cards' },
} as const

const CARDS = [
  {
    no: '01',
    code: 'L-02 / A',
    kind: { zh: '第一张', en: 'Card one' },
    title: { zh: '一张卡，一件事', en: 'One card, one idea' },
    note: {
      zh: '堆叠卡片从教程、步骤和结账流程里长出来，因为这三类内容天生有顺序：读完一条，才轮到下一条。',
      en: 'Stacking cards grew out of tutorials, step flows and checkout, because those three kinds of content have a native order: one item is finished before the next one matters.',
    },
    note2: {
      zh: '如果内容可以任意跳读，这个效果就是在给读者加一道门槛。',
      en: 'If the content can be read in any order, the effect adds a gate that does not need to exist.',
    },
    spec: { zh: '露头', en: 'Peek' },
    value: { zh: '16px', en: '16px' },
  },
  {
    no: '02',
    code: 'L-02 / B',
    kind: { zh: '第二张', en: 'Card two' },
    title: { zh: '上一张不谢幕', en: 'The previous card stays on stage' },
    note: {
      zh: '后一张升到更高的 z-index，把前一张压住，却只压掉一部分：上一层的标题和编号还露在顶部，读者知道自己在第几层。',
      en: 'The next card rises with a higher z-index and covers part of the one below: the previous title and number still peek at the top, so the reader knows which layer they are on.',
    },
    note2: {
      zh: '被完全盖住的堆叠只剩动画，没有上下文。保持 12–24px 的露头才看得见层级。',
      en: 'A stack that covers cards completely is animation without context; keep a 12–24px peek so the ladder stays visible.',
    },
    spec: { zh: '层序', en: 'Stacking' },
    value: { zh: 'z-index 1 -> 5', en: 'z-index 1 -> 5' },
  },
  {
    no: '03',
    code: 'L-02 / C',
    kind: { zh: '第三张', en: 'Card three' },
    title: { zh: '高度是入场券', en: 'Height is the ticket' },
    note: {
      zh: '每张卡都需要自己的滚动距离。五张卡大致要五个视口高，页面才排得下这套节奏；内容不够长时，堆叠会挤在一屏里，边滚边闪。',
      en: 'Every card needs scroll distance of its own. Five cards want roughly five screens of page for the rhythm to have room; when the content is too short, the stack crowds into one screen and flickers as you scroll.',
    },
    note2: {
      zh: '这一页敢用五张，是因为每一层都有真实要讲的东西——不是把同一句话抄五遍。',
      en: 'This page can afford five layers because each one says something real, not the same sentence five times.',
    },
    spec: { zh: '卡片高度', en: 'Card height' },
    value: { zh: 'clamp(19rem, 58svh, 30rem)', en: 'clamp(19rem, 58svh, 30rem)' },
  },
  {
    no: '04',
    code: 'L-02 / D',
    kind: { zh: '第四张', en: 'Card four' },
    title: { zh: 'z-index 决定谁在上面', en: 'z-index decides who is on top' },
    note: {
      zh: '卡片自己带递增的层序，不依赖 DOM 顺序碰巧正确。后一张盖前一张，前一张留在下面，这就是「堆」。',
      en: 'Each card carries its own increasing layer order instead of relying on DOM order to be accidentally right. Later covers earlier, earlier stays underneath: that is the stack.',
    },
    note2: {
      zh: '把 z-index 写成同一个值，卡片会在同一位置互相闪烁。',
      en: 'Give every card the same z-index and they flicker against each other at the same offset.',
    },
    spec: { zh: '入场', en: 'Entrance' },
    value: { zh: 'view(), entry 0% -> 80%', en: 'view(), entry 0% -> 80%' },
  },
  {
    no: '05',
    code: 'L-02 / E',
    kind: { zh: '第五张', en: 'Card five' },
    title: { zh: '没有缩放，是故意的', en: 'No scale, on purpose' },
    note: {
      zh: '很多堆叠效果会让被盖住的卡缩小、变暗。问题在于 CSS 不知道一张卡「被盖住了」——没有这个信号，纯 CSS 就做不出跟滚动位置联动的缩小。',
      en: 'Many stack effects shrink and dim the covered card. The problem is that CSS does not know a card is covered: without that signal, pure CSS cannot shrink a card in step with scroll position.',
    },
    note2: {
      zh: '要么接受一个不缩放的堆叠，要么叠一层 observer 去测量覆盖比例。这一页选了前者：动画少了，逻辑也少了。',
      en: 'Either accept a stack that does not shrink, or add an observer to measure coverage. This page chooses the former: less animation, less logic.',
    },
    spec: { zh: '降级', en: 'Fallback' },
    value: { zh: '普通列表', en: 'plain list' },
  },
] as const

const CSS_TEXT = [
  '/* the page is the scroll container; each card sticks at its own top */',
  '.live-stk-card {',
  '  position: sticky;',
  '  top: calc(3.5rem + var(--stk-i, 0) * 1rem);',
  '  z-index: calc(var(--stk-i, 0) + 1);',
  '}',
  '',
  '/* entrance only where scroll-driven animations exist */',
  '@supports (animation-timeline: view()) {',
  '  .live-stk-card {',
  '    animation: live-stk-in linear both;',
  '    animation-timeline: view();',
  '    animation-range: entry 0% entry 80%;',
  '  }',
  '}',
  '',
  '@keyframes live-stk-in {',
  '  from { opacity: 0.55; transform: translateY(1.5rem); }',
  '  to { opacity: 1; transform: translateY(0); }',
  '}',
  '',
  '@media (prefers-reduced-motion: reduce) {',
  '  .live-stk-card {',
  '    animation: none;',
  '    transform: none;',
  '  }',
  '}',
].join('\n')

const SNIPPET = [
  '.card {',
  '  position: sticky;',
  '  top: calc(3.5rem + var(--i) * 1rem);',
  '  z-index: var(--i);',
  '}',
  '',
  '/* give each card --i: 0, 1, 2, 3, 4 */',
  '/* no overflow: hidden on any ancestor */',
].join('\n')

export default function StickyStackLive() {
  const locale = useLocale()
  const reduced = usePrefersReducedMotion()
  const total = String(CARDS.length).padStart(2, '0')

  return (
    <div className="min-h-svh bg-canvas pb-28">
      <style>{CSS_TEXT}</style>

      <section className="flex min-h-svh items-center px-5 pb-10 pt-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-[88rem] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] lg:items-end">
          <div className="max-w-4xl">
            <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
            <h2 className="mt-4 font-display text-display leading-[0.98] text-ink">{pick(T.title, locale)}</h2>
            <p className="mt-6 max-w-[58ch] text-body text-ink-2">{pick(T.lede, locale)}</p>
            <p className="mt-3 max-w-[58ch] text-caption text-muted">{pick(T.lede2, locale)}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] text-muted">
              <span className="inline-flex items-center gap-2 text-ink-2">
                <span aria-hidden="true" className="inline-block h-2 w-2 bg-accent" />
                {pick(T.statusSticky, locale)}
              </span>
              <span aria-hidden="true">·</span>
              <span className={reduced ? 'text-accent' : undefined}>{reduced ? pick(T.reduced, locale) : pick(T.hint, locale)}</span>
            </div>
          </div>

          <div className="w-full max-w-sm border border-line bg-raised p-5">
            <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2.5">
              <span className="label-mono">{pick(T.schematic, locale)}</span>
              <span className="stamp">L-02</span>
            </div>
            <div className="mt-4 flex flex-col gap-1.5">
              {CARDS.map((card, index) => (
                <div
                  key={card.code}
                  className="flex items-center gap-3 border border-line bg-surface px-2.5 py-1.5"
                  style={{ marginLeft: `${index * 8}%`, width: `${100 - index * 8}%` }}
                >
                  <span className="font-mono text-[10px] text-muted">{card.no}</span>
                  <span aria-hidden="true" className="h-px flex-1 bg-line" />
                  <span className="font-mono text-[10px] text-ink-2">{'+' + index * 16 + 'px'}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 font-mono text-[10px] leading-relaxed text-muted">{pick(T.schematicNote, locale)}</p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-4 sm:px-8">
        <div className="mx-auto w-full max-w-5xl border-t border-line pt-4">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="label-mono text-accent">{pick(T.stackLabel, locale)}</h2>
            <p className="font-mono text-[11px] text-muted">{pick(T.stackNote, locale)}</p>
          </div>
          <div className="flex flex-col gap-6">
            {CARDS.map((card, index) => (
              <article
                key={card.code}
                className="live-stk-card flex min-h-[clamp(19rem,58svh,30rem)] flex-col rounded-plate border border-line-strong bg-raised px-5 py-5 sm:px-7 sm:py-6"
                style={{ '--stk-i': index } as CSSProperties}
              >
                <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
                  <span className="label-mono text-accent">{pick(card.kind, locale)}</span>
                  <span className="stamp">{card.code}</span>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-6">
                  <span aria-hidden="true" className="hidden font-display text-h1 leading-none text-line-strong sm:block">
                    {card.no}
                  </span>
                  <div>
                    <h3 className="font-display text-h2 leading-[1.02] text-ink">{pick(card.title, locale)}</h3>
                    <p className="mt-3 max-w-[52ch] text-body text-ink-2">{pick(card.note, locale)}</p>
                    <p className="mt-2 max-w-[52ch] text-caption text-muted">{pick(card.note2, locale)}</p>
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap items-baseline justify-between gap-2 border-t border-line pt-3">
                  <span className="font-mono text-[11px] text-ink-2">
                    {pick(card.spec, locale)} · {pick(card.value, locale)}
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    {card.no} / {total}
                  </span>
                </div>
              </article>
            ))}
            {/* 尾部的空高度：五张卡叠齐后，需要一段滚动距离让「整叠」停留一会儿，
                否则最后一张刚贴上就被容器底部带走。 */}
            <div aria-hidden="true" className="flex h-[60svh] flex-col items-center justify-start gap-3 pt-10">
              <span className="h-px w-16 bg-line-strong" />
              <span className="label-mono text-muted">{pick(T.stackEnd, locale)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[88rem] px-5 py-16 sm:px-8">
        <div className="border-t border-line-strong pt-6">
          <h2 className="font-display text-h2 text-ink">{pick(T.whyTitle, locale)}</h2>
          <p className="mt-4 max-w-[62ch] text-body text-ink-2">{pick(T.whyBody, locale)}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {T.compare.map((row) => (
              <div key={row.key} className="border border-line bg-surface p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="label-mono">{pick(row.label, locale)}</span>
                  <span className="font-mono text-[11px] text-ink-2">{pick(row.value, locale)}</span>
                </div>
                <div aria-hidden="true" className="mt-3 h-2 w-full bg-line">
                  <span className={'block h-full ' + row.bar} />
                </div>
                <p className="mt-3 max-w-[46ch] text-caption text-muted">{pick(row.note, locale)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[88rem] px-5 pb-16 sm:px-8">
        <div className="grid gap-10 border-t border-line-strong pt-6 md:grid-cols-2">
          <div>
            <h2 className="font-display text-h3 text-ink">{pick(T.whenTitle, locale)}</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {T.whenList.map((item, index) => (
                <li key={item.zh} className="flex gap-3 text-body text-ink-2">
                  <span aria-hidden="true" className="mt-1 font-mono text-[11px] text-accent">
                    {'0' + (index + 1)}
                  </span>
                  <span className="max-w-[46ch]">{pick(item, locale)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-h3 text-ink">{pick(T.gimmickTitle, locale)}</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {T.gimmickList.map((item, index) => (
                <li key={item.zh} className="flex gap-3 text-body text-muted">
                  <span aria-hidden="true" className="mt-1 font-mono text-[11px] text-line-strong">
                    {'0' + (index + 1)}
                  </span>
                  <span className="max-w-[46ch]">{pick(item, locale)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[88rem] px-5 pb-16 sm:px-8">
        <div className="border-t border-line-strong pt-6">
          <h2 className="font-display text-h3 text-ink">{pick(T.specTitle, locale)}</h2>
          <dl className="mt-6 grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {T.specRows.map((row) => (
              <div key={row.label.zh} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line pb-2">
                <dt className="text-caption text-muted">{pick(row.label, locale)}</dt>
                <dd className="font-mono text-[11px] text-ink-2">{pick(row.value, locale)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 max-w-[62ch] text-body text-ink-2">{pick(T.fallbackBody, locale)}</p>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-5">
          <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
            <h2 className="font-display text-h3 text-ink">{pick(T.codeTitle, locale)}</h2>
            <span className="label-mono">CSS</span>
          </div>
          <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">{SNIPPET}</pre>
          <p className="max-w-[60ch] text-caption text-muted">{pick(T.codeNote, locale)}</p>
          <Link to={entryPath('sticky-stack')} className="text-link self-start font-mono text-[11px] text-accent no-underline">
            {pick(T.back, locale)} →
          </Link>
        </div>
      </section>
    </div>
  )
}
