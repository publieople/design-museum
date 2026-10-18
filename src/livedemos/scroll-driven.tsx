import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { usePrefersReducedMotion } from '../lib/motion'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * 整页版「滚动驱动动画」：页面本身就是时间线。
 *
 * 与展台 demo 的区别：这里没有滚动容器，进度取的是整页滚动；主视觉是一段
 * 190vh 的 sticky 场景，卡片随整页进度转正；后面的章节用 view() 时间线在
 * 进入视口时浮起。不支持 animation-timeline 的浏览器里内容保持静态可读，
 * 不做假的减速动画。
 */

const T = {
  eyebrow: { zh: '现场 · 滚动驱动', en: 'LIVE · SCROLL-DRIVEN' },
  title: { zh: '滚到哪，动画走到哪', en: 'Scroll is the timeline' },
  lede: {
    zh: '这一页没有演示框。顶部进度条、这张卡片的转正、后面每一章的入场，全由这条页面自己的滚动位置驱动——用的是 CSS 的 animation-timeline: scroll() 与 view()。',
    en: 'There is no demo box on this page. The top bar, the card straightening up and every chapter below are driven by this page’s own scroll position — with CSS animation-timeline: scroll() and view().',
  },
  hint: { zh: '向下滚动开始', en: 'Scroll to begin' },
  progress: { zh: '滚动进度', en: 'Scroll progress' },
  native: { zh: '原生 animation-timeline', en: 'Native animation-timeline' },
  fallback: {
    zh: '静态兜底：此浏览器不支持 animation-timeline',
    en: 'Static fallback: this browser does not support animation-timeline',
  },
  reduced: {
    zh: '已按系统设置减少动态，内容保持静态可读',
    en: 'Reduced motion is on: the page stays static and readable',
  },
  cardLabel: { zh: '标本卡片', en: 'Specimen card' },
  cardNote: {
    zh: '一开始斜着，滚到第一个 190vh 结束时转正。',
    en: 'It starts tilted and straightens up by the end of the first 190vh.',
  },
  chapter: { zh: '第 {n} 章', en: 'Chapter {n}' },
  chapters: [
    {
      title: { zh: '进度就是滚动位置', en: 'Progress is scroll position' },
      figure: ['animation-timeline:', '  scroll(root block);'],
      body: {
        zh: '进度条不读 JS 的 scrollY，它把整页滚动条当成时间线：animation-timeline: scroll(root block)。滚动位置变，动画进度跟着变，没有 requestAnimationFrame 里的补间。',
        en: 'The bar does not read scrollY in JS. It treats the page scrollbar as the timeline: animation-timeline: scroll(root block). Scroll position changes, animation progress follows — no tween inside requestAnimationFrame.',
      },
    },
    {
      title: { zh: '进入视口才发生的入场', en: 'Entrances that happen on entry' },
      figure: ['animation-timeline: view();', 'animation-range:', '  entry 0% cover 34%;'],
      body: {
        zh: '下面这些章节用 view() 时间线：元素自己的可见范围决定动画区间，滚进来就浮起。跟 IntersectionObserver 的区别是它连续跟随，而不是触发一次 class。',
        en: 'These chapters use the view() timeline: the element’s own visibility range defines the animation range, so it rises as it scrolls in. Unlike IntersectionObserver it follows continuously instead of firing a class once.',
      },
    },
    {
      title: { zh: '整页滚动才有纵深感', en: 'Depth needs the whole page' },
      figure: ['page  4890px', 'box    300px'],
      body: {
        zh: '同样的卡片放进 300px 的盒子，转正这一段只剩几十像素，看起来像抖动。滚动距离是这类效果的参数之一，盒子给不了。',
        en: 'Put the same card in a 300px box and the straightening happens over a few dozen pixels — it reads as a jitter. Scroll distance is one of the parameters of this effect, and a box cannot provide it.',
      },
    },
    {
      title: { zh: '降级也要能读', en: 'The fallback must still read' },
      figure: ['@media', '  (prefers-reduced-motion: reduce)', '  { … }'],
      body: {
        zh: '不支持 animation-timeline 或开启了减少动态时，这一页不播放假动画：所有章节静态展开，信息一条不少。动画是增强，不是内容。',
        en: 'Without animation-timeline, or with reduced motion on, this page does not fake the animation: every chapter stays open and all the information is still there. Motion is an enhancement, not the content.',
      },
    },
  ],
  codeTitle: { zh: '这一页实际在用的', en: 'What this page actually uses' },
  codeNote: {
    zh: '进度条与卡片用 scroll(root)，章节用 view()。两条时间线都不写 JS。',
    en: 'The bar and the card use scroll(root); the chapters use view(). Neither timeline needs JS.',
  },
  back: { zh: '回到词条：滚动驱动动画', en: 'Back to the entry: Scroll-Driven Animation' },
} as const

const CSS_TEXT = [
  '@keyframes live-sda-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }',
  '@keyframes live-sda-turn {',
  '  from { transform: perspective(900px) rotateY(-32deg) rotateX(7deg) scale(.92); }',
  '  to { transform: perspective(900px) rotateY(0deg) rotateX(0deg) scale(1); }',
  '}',
  '@keyframes live-sda-rise {',
  '  from { opacity: 0; transform: translate3d(0, 48px, 0); }',
  '  to { opacity: 1; transform: none; }',
  '}',
  '@supports (animation-timeline: scroll()) {',
  '  .live-sda-bar { animation: live-sda-progress linear both; animation-timeline: scroll(root block); }',
  '  .live-sda-card {',
  '    animation: live-sda-turn linear both;',
  '    animation-timeline: scroll(root block);',
  '    animation-range: 0 150vh;',
  '  }',
  '}',
  '@supports (animation-timeline: view()) {',
  '  .live-sda-plate {',
  '    animation: live-sda-rise linear both;',
  '    animation-timeline: view();',
  '    animation-range: entry 0% cover 34%;',
  '  }',
  '}',
  '@media (prefers-reduced-motion: reduce) {',
  '  .live-sda-bar, .live-sda-card, .live-sda-plate { animation: none !important; }',
  '}',
].join('\n')

const SNIPPET = [
  '/* progress bar */',
  'animation: live-sda-progress linear both;',
  'animation-timeline: scroll(root block);',
  '',
  '/* chapter entrance */',
  'animation: live-sda-rise linear both;',
  'animation-timeline: view();',
  'animation-range: entry 0% cover 34%;',
].join('\n')

export default function ScrollDrivenLive() {
  const locale = useLocale()
  const reduced = usePrefersReducedMotion()
  const [native] = useState(
    () =>
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('animation-timeline: view()'),
  )
  const barRef = useRef<HTMLSpanElement | null>(null)
  const readoutRef = useRef<HTMLSpanElement | null>(null)

  const live = native && !reduced

  // 只有不支持原生时间线时才用 JS 动进度条；读数两种情况都更新
  useEffect(() => {
    const bar = barRef.current
    const readout = readoutRef.current
    if (!bar || !readout) return
    let frame = 0
    const update = () => {
      frame = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      readout.textContent = Math.round(p * 100) + '%'
      if (!live) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')'
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
  }, [live])

  return (
    <div className="relative bg-canvas pb-28">
      <style>{CSS_TEXT}</style>

      {/* 顶部进度条：原生时间线驱动；不支持时由上面的 effect 写 transform */}
      <div className="fixed inset-x-0 top-0 z-40 h-[3px] bg-line">
        <span
          ref={barRef}
          className="live-sda-bar block h-full origin-left bg-accent"
          style={live ? undefined : { transform: 'scaleX(0)' }}
        />
      </div>

      <div className="pointer-events-none fixed right-4 top-4 z-40 max-w-[24ch] text-right font-mono text-[10px] leading-relaxed text-muted">
        <p className="text-ink">
          {pick(T.progress, locale)} <span ref={readoutRef} className="text-accent">0%</span>
        </p>
        <p className="mt-1">
          {reduced ? pick(T.reduced, locale) : live ? pick(T.native, locale) : pick(T.fallback, locale)}
        </p>
      </div>

      {/* 主场景：190vh，其中一屏 sticky，卡片随整页滚动转正 */}
      <section aria-label={pick(T.title, locale)} className="relative h-[190vh]">
        <div className="sticky top-0 flex min-h-svh items-center px-5 py-16 sm:px-8">
          <div className="mx-auto grid w-full max-w-[88rem] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center">
            <div className="flex flex-col gap-5">
              <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
              <h2 className="max-w-[13ch] font-display text-display font-semibold leading-[1.05] text-ink">
                {pick(T.title, locale)}
              </h2>
              <p className="max-w-[54ch] text-body text-ink-2">{pick(T.lede, locale)}</p>
              <p className="mt-2 flex items-center gap-2 font-mono text-[11px] text-muted">
                <span aria-hidden="true" className="inline-block h-2 w-2 bg-accent" />
                {pick(T.hint, locale)} ↓
              </p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div
                className="live-sda-card w-full max-w-sm border border-line-strong bg-raised p-6"
                style={live ? undefined : { transform: 'none' }}
              >
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  <span>{pick(T.cardLabel, locale)}</span>
                  <span className="stamp">M-06</span>
                </div>
                <p className="mt-6 font-display text-h2 text-ink">Scroll-Driven</p>
                <p className="mt-2 text-caption text-ink-2">animation-timeline: scroll(root block)</p>
                <div aria-hidden="true" className="mt-6 flex flex-col gap-2">
                  <span className="block h-[3px] w-full bg-line">
                    <span className="block h-full w-2/3 bg-accent" />
                  </span>
                  <span className="block h-[3px] w-full bg-line">
                    <span className="block h-full w-1/3 bg-ink" />
                  </span>
                </div>
                <p className="mt-5 border-t border-line pt-3 text-caption text-muted">
                  {pick(T.cardNote, locale)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {T.chapters.map((chapter, index) => (
        <section
          key={chapter.title.zh}
          aria-labelledby={'live-sda-chapter-' + index}
          className="flex min-h-[58vh] items-center px-5 py-16 sm:px-8"
        >
          <div className="live-sda-plate mx-auto grid w-full max-w-[88rem] gap-6 border-t border-line pt-6 md:grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,15rem)] md:gap-10">
            <div className="flex items-baseline gap-3 md:flex-col md:gap-2">
              <span aria-hidden="true" className="font-display text-h1 leading-none text-line-strong">
                {'0' + (index + 1)}
              </span>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                {pick(T.chapter, locale).replace('{n}', '0' + (index + 1))}
              </p>
            </div>
            <div className="flex max-w-[58ch] flex-col gap-3">
              <h2 id={'live-sda-chapter-' + index} className="font-display text-h2 text-ink">
                {pick(chapter.title, locale)}
              </h2>
              <p className="text-body text-ink-2">{pick(chapter.body, locale)}</p>
            </div>
            <pre className="self-start overflow-x-auto border-l-2 border-accent pl-3 font-mono text-[10px] leading-relaxed text-muted">{chapter.figure.join('\n')}</pre>
          </div>
        </section>
      ))}

      <section aria-label={pick(T.codeTitle, locale)} className="px-5 py-20 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-5">
          <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
            <h2 className="font-display text-h3 text-ink">{pick(T.codeTitle, locale)}</h2>
            <span className="label-mono">4 + 1</span>
          </div>
          <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
            {SNIPPET}
          </pre>
          <p className="max-w-[60ch] text-caption text-muted">{pick(T.codeNote, locale)}</p>
          <Link
            to={entryPath('scroll-driven')}
            className="text-link self-start font-mono text-[11px] text-accent no-underline"
          >
            {pick(T.back, locale)} →
          </Link>
        </div>
      </section>
    </div>
  )
}
