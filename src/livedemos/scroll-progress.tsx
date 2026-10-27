import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * 整页版「滚动进度条」：这一页自己就是那篇文章。
 *
 * 进度条读的是整页滚动位置，不是某个盒子的 scrollTop——盒子里的进度条只能
 * 告诉你「这个盒子读了多少」，跟阅读位置无关。原生支持 animation-timeline
 * 时用 CSS 时间线；不支持时退回 rAF 合帧的 JS，两条路都不在 scroll 事件里
 * 直接写 width。减少动态时进度条照常工作：它是信息，不是装饰动画。
 */

const T = {
  eyebrow: { zh: '现场 · 滚动进度', en: 'LIVE · SCROLL PROGRESS' },
  title: { zh: '读到哪里，条走到哪里', en: 'Read to the end, watch the bar' },
  lede: {
    zh: '这一页没有演示框。整篇文章就是演示：顶部这条 3px 的朱红条，长度等于你读到的位置。往下滚，它跟着长；滚到底，它刚好满。',
    en: 'There is no demo box on this page. The article itself is the demo: the 3px red bar at the top grows with how far you have read. Scroll down and it follows; at the bottom it is exactly full.',
  },
  hint: { zh: '向下滚动，看顶部的条', en: 'Scroll down and watch the bar' },
  progress: { zh: '已读', en: 'Read' },
  native: { zh: 'CSS animation-timeline: scroll(root)', en: 'CSS animation-timeline: scroll(root)' },
  fallback: { zh: 'JS 兜底：rAF 合帧后写 transform', en: 'JS fallback: rAF-batched transform' },
  reducedNote: {
    zh: '开启减少动态时，进度条照常工作：它是指示器，不是装饰。',
    en: 'With reduced motion on, the bar still works: it is an indicator, not decoration.',
  },
  cardLabel: { zh: '一根条的三部分', en: 'Three parts of one bar' },
  cardNote: {
    zh: '轨道给长度参照，填充给已读量，读数给百分比。缺了轨道，条会像一根装饰线。',
    en: 'The track gives the scale, the fill gives the read amount, the number gives the percentage. Without a track the bar reads as decoration.',
  },
  sections: [
    {
      title: { zh: '它在回答「还剩多少」', en: 'It answers “how much is left”' },
      figure: ['reading position', '≠ box scrollTop'],
      body: {
        zh: '滚动进度条不是滚动条。滚动条由系统画在窗口边缘，只表示可滚动范围；进度条是页面自己画的一条线，表示这篇文章读了多少。它服务的是长文、文档、教程这类「读」的页面，不是所有页面都值得加。',
        en: 'A progress bar is not a scrollbar. The scrollbar is drawn by the system at the window edge and only shows the scrollable range; the progress bar is a line the page draws itself to show how much of the article has been read. It serves long-form reading — documents, tutorials — not every page.',
      },
    },
    {
      title: { zh: '原生版：滚动条就是时间线', en: 'Native: the scrollbar is the timeline' },
      figure: ['animation-timeline:', '  scroll(root block);'],
      body: {
        zh: 'CSS 版本不监听 scroll，也不读 scrollY：animation-timeline: scroll(root block) 把整页滚动条当成时间线，transform: scaleX() 从 0 走到 1。滚动位置变，动画进度跟着变，主线程上没有每帧回调。',
        en: 'The CSS version does not listen to scroll and does not read scrollY: animation-timeline: scroll(root block) treats the page scrollbar as the timeline, and transform: scaleX() runs from 0 to 1. Scroll position changes, animation progress follows — with no per-frame callback on the main thread.',
      },
    },
    {
      title: { zh: 'JS 版也要合帧', en: 'The JS version must batch too' },
      figure: ['scroll → rAF', '→ transform', '(never width)'],
      body: {
        zh: '不支持时间线时的兜底：scroll 事件里只记一个标记，下一帧 requestAnimationFrame 里读一次位置，写 transform。不要在 scroll 回调里读 layout 再写 width——那会让每个滚动事件都触发一次布局，页面越长越明显。',
        en: 'The fallback when timelines are unsupported: the scroll event only sets a flag, and the next requestAnimationFrame reads the position once and writes transform. Do not read layout and write width inside the scroll callback — that triggers layout on every scroll event, and it gets worse as the page grows.',
      },
    },
    {
      title: { zh: '别做过头', en: 'Do not overdo it' },
      figure: ['short page: no', 'long read: yes', 'animation: no'],
      body: {
        zh: '一屏能读完的页面加进度条只会多一条装饰线；它也不该盖住系统滚动条，不该有惯性、回弹或渐变，更不该在到达顶部时反向缩回。它的全部工作是：安静地告诉读者还剩多少。',
        en: 'A page that fits in one screen only gains a decorative line; the bar should not cover the system scrollbar, should not have inertia, bounce or gradients, and should not shrink backwards at the top. Its whole job: quietly tell the reader how much is left.',
      },
    },
  ],
  chapter: { zh: '第 {n} 节', en: 'Section {n}' },
  paramsTitle: { zh: '推荐取值', en: 'Recommended values' },
  params: [
    { label: { zh: '高度', en: 'Height' }, value: '2–4px' },
    { label: { zh: '轨道', en: 'Track' }, value: 'var(--line)' },
    { label: { zh: '填充', en: 'Fill' }, value: 'var(--accent)' },
    { label: { zh: '位置', en: 'Placement' }, value: { zh: '固定在视口顶部，或粘性头下方', en: 'Fixed at the viewport top, or under a sticky header' } },
    { label: { zh: '方向', en: 'Direction' }, value: { zh: '从左往右，跟随阅读方向', en: 'Left to right, following the reading direction' } },
  ],
  codeTitle: { zh: '这一页实际在用的', en: 'What this page actually uses' },
  codeNote: {
    zh: '两条路：支持 animation-timeline 的浏览器走 CSS，其余浏览器走同一个 rAF 兜底。上面的条现在就是其中之一在驱动。',
    en: 'Two paths: browsers with animation-timeline use CSS, the rest share one rAF fallback. The bar above is being driven by one of them right now.',
  },
  back: { zh: '回到词条：滚动进度条', en: 'Back to the entry: Scroll Progress Bar' },
} as const

const CSS_TEXT = [
  '@keyframes live-spg-fill {',
  '  from { transform: scaleX(0); }',
  '  to   { transform: scaleX(1); }',
  '}',
  '@supports (animation-timeline: scroll()) {',
  '  .live-spg-bar {',
  '    transform-origin: left;',
  '    animation: live-spg-fill linear both;',
  '    animation-timeline: scroll(root block);',
  '  }',
  '}',
  '@media (prefers-reduced-motion: reduce) {',
  '  /* the indicator does not rely on a transition: the timeline still applies */',
  '  .live-spg-bar { transition: none; }',
  '}',
].join('\n')

const CSS_SNIPPET = [
  '.reading-progress {',
  '  position: fixed;',
  '  inset: 0 0 auto;',
  '  height: 3px;',
  '  background: var(--line);',
  '}',
  '',
  '.reading-progress > span {',
  '  display: block;',
  '  height: 100%;',
  '  transform-origin: left;',
  '  background: var(--accent);',
  '  animation: fill linear both;',
  '  animation-timeline: scroll(root block);',
  '}',
  '',
  '@keyframes fill {',
  '  from { transform: scaleX(0); }',
  '  to   { transform: scaleX(1); }',
  '}',
].join('\n')

const JS_SNIPPET = [
  'let queued = false',
  'addEventListener("scroll", () => {',
  '  if (queued) return',
  '  queued = true',
  '  requestAnimationFrame(() => {',
  '    queued = false',
  '    const max = document.documentElement.scrollHeight',
  '      - innerHeight',
  '    const p = max > 0 ? scrollY / max : 0',
  '    bar.style.transform = `scaleX(${p})`',
  '  })',
  '}, { passive: true })',
].join('\n')

export default function ScrollProgressLive() {
  const locale = useLocale()
  const [native] = useState(
    () =>
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('animation-timeline: scroll()'),
  )
  const barRef = useRef<HTMLSpanElement | null>(null)
  const readoutRef = useRef<HTMLSpanElement | null>(null)

  // 读数两种情况都更新；只有不支持原生时间线时才由 JS 写进度
  useEffect(() => {
    const bar = barRef.current
    const readout = readoutRef.current
    if (!bar || !readout) return
    let frame = 0
    const update = () => {
      frame = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      readout.textContent = Math.round(progress * 100) + '%'
      if (!native) bar.style.transform = 'scaleX(' + progress.toFixed(4) + ')'
    }
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [native])

  return (
    <div className="relative bg-canvas pb-28">
      <style>{CSS_TEXT}</style>

      <div className="fixed inset-x-0 top-0 z-40 h-[3px] bg-line" aria-hidden="true">
        <span
          ref={barRef}
          className="live-spg-bar block h-full origin-left bg-accent"
          style={native ? undefined : { transform: 'scaleX(0)' }}
        />
      </div>

      <div className="pointer-events-none fixed right-4 top-4 z-40 max-w-[26ch] text-right font-mono text-[10px] leading-relaxed text-muted">
        <p className="text-ink">
          {pick(T.progress, locale)} <span ref={readoutRef} className="text-accent">0%</span>
        </p>
        <p className="mt-1">
          {native ? pick(T.native, locale) : pick(T.fallback, locale)}
        </p>
      </div>

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
            <p className="mt-2 flex items-center gap-2 font-mono text-[11px] text-muted">
              <span aria-hidden="true" className="inline-block h-2 w-2 bg-accent" />
              {pick(T.hint, locale)} ↓
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm border border-line-strong bg-raised p-6">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                <span>{pick(T.cardLabel, locale)}</span>
                <span className="stamp">M-09</span>
              </div>
              <div aria-hidden="true" className="mt-6 flex flex-col gap-4">
                <div>
                  <p className="font-mono text-[10px] text-muted">track</p>
                  <span className="mt-1 block h-[3px] w-full bg-line" />
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted">fill</p>
                  <span className="mt-1 block h-[3px] w-full bg-line">
                    <span className="block h-full w-2/3 bg-accent" />
                  </span>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted">readout</p>
                  <p className="mt-1 font-mono text-[11px] text-ink">67%</p>
                </div>
              </div>
              <p className="mt-6 border-t border-line pt-3 text-caption text-muted">
                {pick(T.cardNote, locale)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {T.sections.map((section, index) => (
        <section
          key={section.title.zh}
          aria-labelledby={'live-spg-section-' + index}
          className="flex min-h-[62vh] items-center px-5 py-16 sm:px-8"
        >
          <div className="mx-auto grid w-full max-w-[88rem] gap-6 border-t border-line pt-6 md:grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,15rem)] md:gap-10">
            <div className="flex items-baseline gap-3 md:flex-col md:gap-2">
              <span aria-hidden="true" className="font-display text-h1 leading-none text-line-strong">
                {'0' + (index + 1)}
              </span>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                {pick(T.chapter, locale).replace('{n}', '0' + (index + 1))}
              </p>
            </div>
            <div className="flex max-w-[58ch] flex-col gap-3">
              <h2 id={'live-spg-section-' + index} className="font-display text-h2 text-ink">
                {pick(section.title, locale)}
              </h2>
              <p className="text-body text-ink-2">{pick(section.body, locale)}</p>
            </div>
            <pre className="self-start overflow-x-auto border-l-2 border-accent pl-3 font-mono text-[10px] leading-relaxed text-muted">{section.figure.join('\n')}</pre>
          </div>
        </section>
      ))}

      <section aria-label={pick(T.paramsTitle, locale)} className="px-5 py-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-[88rem] gap-6 border-t border-line pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-h2 text-ink">{pick(T.paramsTitle, locale)}</h2>
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
          <pre className="well self-start overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
            {CSS_SNIPPET}
          </pre>
        </div>
      </section>

      <section aria-label={pick(T.codeTitle, locale)} className="px-5 py-20 pb-28 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-5">
          <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
            <h2 className="font-display text-h3 text-ink">{pick(T.codeTitle, locale)}</h2>
            <span className="label-mono">{native ? '1' : '0'} + 1</span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
              {JS_SNIPPET}
            </pre>
            <div className="flex flex-col gap-3">
              <p className="text-caption text-ink-2">{pick(T.codeNote, locale)}</p>
              <p className="text-caption text-muted">{pick(T.reducedNote, locale)}</p>
              <Link
                to={entryPath('scroll-progress')}
                className="text-link self-start font-mono text-[11px] text-accent no-underline"
              >
                {pick(T.back, locale)} →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
