import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * Full-page "fluid type" specimen: this page's own type scale is the demo.
 *
 * A box cannot show vw. The unit reads the viewport, so the only honest place
 * to put a fluid headline is a page you can actually resize. The middle
 * segment of every clamp() here mixes rem with vw (or cqw inside a container),
 * so the size moves continuously instead of stepping at a breakpoint.
 */

const T = {
  eyebrow: { zh: '现场 · T-01 · 流体排版', en: 'LIVE · T-01 · FLUID TYPE' },
  title: { zh: '字号该是一条坡，不是几级台阶', en: 'Type should be a slope, not a staircase' },
  lede: {
    zh: '这一页没有演示框。每一级标题都用 clamp() 写好了下限与上限，中间那一段跟着视口连续长：把窗口从 375px 拉到 1600px，所有标题一起变，中间没有一次跳档。',
    en: 'There is no demo box on this page. Every heading is written with a clamp() that has a floor and a ceiling, and the middle segment grows continuously with the viewport. Drag the window from 375px to 1600px: every heading moves together, and nothing steps.',
  },
  why: {
    zh: '盒子演不了这件事：vw 量的是视口，cqw 量的是容器。只有长在整页上的标题，才真的挂在「你的窗口」这个变量上。',
    en: 'A box cannot demonstrate this: vw measures the viewport and cqw measures the container. Only headings that live on the full page hang off the variable that is your window.',
  },
  hint: { zh: '缩放浏览器窗口，看标题连续变化', en: 'Resize the window and watch the headings move' },
  scaleTitle: { zh: '这一页自己的四个字阶', en: 'The four steps this page runs on' },
  scaleNote: {
    zh: '它们全是 clamp()。上面一行是声明，下面是同一句话按这个字阶排出来的样子。',
    en: 'All four are clamp(). Each row shows the declaration and the same sentence set at that step.',
  },
  scaleSample: { zh: '流体字号 Aa', en: 'Fluid type Aa' },
  probeTitle: { zh: '同一句话，两种单位', en: 'One line, two units' },
  probeNote: {
    zh: '拖宽度：上面一行用 cqw，下面一行用 vw。窄容器里 vw 算出的是整屏的比例，字号会明显偏大——这就是把流体标题塞进卡片时最常见的错。',
    en: 'Drag the width: the first line uses cqw, the second uses vw. In a narrow container vw still measures the whole screen, so the size comes out too large — the most common mistake when a fluid headline is dropped into a card.',
  },
  widthLabel: { zh: '容器宽度', en: 'Container width' },
  boxLabel: { zh: '容器', en: 'Box' },
  cqwLabel: { zh: 'cqw 版', en: 'cqw' },
  vwLabel: { zh: 'vw 版', en: 'vw' },
  viewportLabel: { zh: '视口', en: 'Viewport' },
  pending: { zh: '测量中', en: 'measuring' },
  sectionLabel: { zh: '第 {n} 节', en: 'Section {n}' },
  sections: [
    {
      title: { zh: 'clamp() 是三个数，不是两个', en: 'clamp() takes three numbers, not two' },
      figure: ['clamp(', '  min,', '  preferred,', '  max', ')'],
      body: {
        zh: '三个参数的顺序固定：最小值、首选值、最大值。最小值保证窄屏上仍然可读，首选值是那条随宽度变化的斜线，最大值拦住超宽屏。浏览器取「首选值，但不小于最小值、不大于最大值」——所以它天然是一段平坡，而不是断点。',
        en: 'The order is fixed: minimum, preferred, maximum. The minimum keeps the size readable on a narrow screen, the preferred value is the sloped line that follows the width, and the maximum stops an ultrawide display. The browser uses the preferred value but never goes below the minimum or above the maximum, so the result is a flat slope rather than a breakpoint.',
      },
    },
    {
      title: { zh: '首选值里必须掺 rem', en: 'The middle value must include rem' },
      figure: ['1rem + 2vw', 'not 2vw alone'],
      body: {
        zh: '纯 vw 不跟浏览器的默认字号走：用户在设置里把文字调大，vw 那一段纹丝不动，而无障碍要求文字能放大到 200%。写法是 clamp(1rem, 1rem + 2vw, 2.5rem)：min 和中间项都带 rem，用户调大根字号时整条坡一起抬起来。',
        en: 'Pure vw ignores the browser default font size: when a user raises the base text size, the vw part does not move, while accessibility asks text to scale to 200%. Write clamp(1rem, 1rem + 2vw, 2.5rem): both the minimum and the middle term carry rem, so raising the root size lifts the whole slope.',
      },
    },
    {
      title: { zh: 'vw 量视口，cqw 量容器', en: 'vw measures the viewport, cqw measures the container' },
      figure: ['container-type:', '  inline-size;', '→ 7cqw'],
      body: {
        zh: '卡片里的标题用 vw 会算错：vw 不知道卡片有多宽。给父级加 container-type: inline-size，再用 cqw，字号就跟着卡片走。这一页最上面那个方框演示的就是这件事——同一个宽度，两种单位算出两个值。',
        en: 'A headline inside a card computes wrong with vw: vw does not know how wide the card is. Set container-type: inline-size on the parent and use cqw, and the size follows the card. The probe box above shows exactly that: one width, two units, two results.',
      },
    },
    {
      title: { zh: '什么时候别用', en: 'When not to use it' },
      figure: ['body text: no', 'min > max: silent', 'line-height: together'],
      body: {
        zh: '正文不要流体：正文该稳定在 16–19px，跟屏幕一起缩放只会让长段落难读。还要记住两件事：min 写得比 max 大时 clamp() 不报错，直接取 min，页面看起来毫无变化；只流 font-size 不管 line-height，大标题会挤在一起或被拉开，行高要用无单位倍数跟着一起变。',
        en: 'Do not make body text fluid: body copy should stay at 16–19px, and scaling it with the screen only makes long paragraphs harder to read. Two more traps: when the minimum is larger than the maximum, clamp() does not warn, it just returns the minimum and the page looks unchanged; and scaling font-size without line-height leaves big headings crammed or spread out, so keep a unitless line-height that scales with it.',
      },
    },
  ],
  paramsTitle: { zh: '推荐取值', en: 'Recommended values' },
  params: [
    { label: { zh: '字号公式', en: 'Size formula' }, value: 'clamp(1rem, 0.75rem + 1.2vw, 2.5rem)' },
    { label: { zh: '正文字号下限', en: 'Minimum body size' }, value: { zh: '16px（不要低于 14px）', en: '16px (never below 14px)' } },
    { label: { zh: '字阶比例', en: 'Scale ratio' }, value: '1.125–1.333' },
    { label: { zh: '行高', en: 'Line height' }, value: { zh: '标题 1.1–1.2，正文 1.5–1.6（无单位）', en: '1.1–1.2 headings, 1.5–1.6 body (unitless)' } },
    { label: { zh: '容器单位', en: 'Container units' }, value: { zh: 'cqw 需要父级 container-type: inline-size', en: 'cqw needs container-type: inline-size on the parent' } },
  ],
  codeTitle: { zh: '这一页实际在用的', en: 'What this page actually uses' },
  codeNote: {
    zh: '下面这段就是上面那个方框的完整写法：容器先声明 container-type，然后两行同尺寸的 clamp 只差单位。支持容器查询的浏览器里，cqw 那行会跟着方框宽度走，vw 那行不会。',
    en: 'This is the exact code behind the probe: the container declares container-type first, then two clamp() lines differ only in unit. In browsers with container queries the cqw line follows the box width and the vw line does not.',
  },
  reducedNote: {
    zh: '流体排版是静态排版，和 prefers-reduced-motion 没有关系。但如果你把字号绑到滚动上做「越滚越大」，那么系统开启减少动态效果时，字号必须停在基准值。',
    en: 'Fluid type is static typography and has nothing to do with prefers-reduced-motion. If you bind the size to scroll so it grows as you read, then under reduced motion the size has to rest at its base value.',
  },
  back: { zh: '回到词条：流体排版', en: 'Back to the entry: Fluid Type' },
} as const

const CSS_TEXT = [
  '.live-ft-probe {',
  '  container-type: inline-size;',
  '  border: 1px solid var(--line);',
  '  background: var(--surface);',
  '}',
  '.live-ft-cqw { font-size: clamp(1rem, 0.4rem + 7cqw, 4rem); line-height: 1.05; }',
  '.live-ft-vw  { font-size: clamp(1rem, 0.4rem + 7vw, 4rem); line-height: 1.05; }',
].join('\n')

const CSS_SNIPPET = [
  '.card {',
  '  container-type: inline-size;',
  '}',
  '',
  '/* follows the card width */',
  '.card h2 {',
  '  font-size: clamp(1rem, 0.4rem + 7cqw, 4rem);',
  '  line-height: 1.05;',
  '}',
  '',
  '/* follows the viewport, not the card */',
  '.card h3 {',
  '  font-size: clamp(1rem, 0.4rem + 7vw, 4rem);',
  '  line-height: 1.05;',
  '}',
].join('\n')

const SCALE_ROWS = [
  { token: 'text-display', value: 'clamp(2.1rem, 1.2rem + 4vw, 4.25rem)', className: 'text-display' },
  { token: 'text-h1', value: 'clamp(2rem, 1.35rem + 2.2vw, 3rem)', className: 'text-h1' },
  { token: 'text-h2', value: 'clamp(1.45rem, 1.2rem + 1vw, 2rem)', className: 'text-h2' },
] as const

type Measurement = { box: number; cqw: number; vw: number; viewport: number }

export default function FluidTypeLive() {
  const locale = useLocale()
  const [width, setWidth] = useState(100)
  const [measured, setMeasured] = useState<Measurement | null>(null)
  const boxRef = useRef<HTMLDivElement | null>(null)
  const cqwRef = useRef<HTMLParagraphElement | null>(null)
  const vwRef = useRef<HTMLParagraphElement | null>(null)

  useEffect(() => {
    const box = boxRef.current
    const cqw = cqwRef.current
    const vw = vwRef.current
    if (!box || !cqw || !vw) return
    let frame = 0
    const update = () => {
      frame = 0
      const boxWidth = box.getBoundingClientRect().width
      const cqwSize = Number.parseFloat(getComputedStyle(cqw).fontSize)
      const vwSize = Number.parseFloat(getComputedStyle(vw).fontSize)
      if (!Number.isFinite(boxWidth) || !Number.isFinite(cqwSize) || !Number.isFinite(vwSize)) return
      setMeasured({
        box: Math.round(boxWidth),
        cqw: Math.round(cqwSize * 10) / 10,
        vw: Math.round(vwSize * 10) / 10,
        viewport: window.innerWidth,
      })
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    observer?.observe(box)
    window.addEventListener('resize', schedule)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('resize', schedule)
    }
  }, [width])

  const readout = (value: number | undefined) =>
    value === undefined ? pick(T.pending, locale) : value + 'px'

  return (
    <div className="relative bg-canvas pb-28">
      <style>{CSS_TEXT}</style>

      <section aria-label={pick(T.title, locale)} className="flex min-h-[92svh] items-center px-5 py-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-[88rem] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-end">
          <div className="flex flex-col gap-5">
            <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
            <h2 className="max-w-[16ch] font-display text-display font-semibold leading-[1.02] text-ink">
              {pick(T.title, locale)}
            </h2>
            <p className="max-w-[54ch] text-body text-ink-2">{pick(T.lede, locale)}</p>
            <p className="mt-1 flex items-start gap-2 border-l-2 border-accent pl-3 text-caption text-muted">
              {pick(T.why, locale)}
            </p>
            <p className="mt-2 flex items-center gap-2 font-mono text-[11px] text-muted">
              <span aria-hidden="true" className="inline-block h-2 w-2 bg-accent" />
              {pick(T.hint, locale)}
              <span aria-hidden="true">(375px → 1600px)</span>
            </p>
          </div>

          <div className="flex flex-col gap-3 border-l border-line pl-4 font-mono text-[10px] leading-relaxed text-muted sm:border-l-0 sm:border-t sm:pl-0 sm:pt-4">
            {SCALE_ROWS.map((row) => (
              <div key={row.token} className="flex items-baseline justify-between gap-3">
                <span className="text-ink-2">{row.token}</span>
                <span className="text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-6 border-t border-line pt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-display text-h2 text-ink">{pick(T.scaleTitle, locale)}</h3>
            <p className="max-w-[48ch] text-caption text-muted">{pick(T.scaleNote, locale)}</p>
          </div>
          <div className="flex flex-col">
            {SCALE_ROWS.map((row) => (
              <div
                key={row.token}
                className="flex flex-col gap-2 border-b border-line py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <p className={'min-w-0 break-words font-display font-semibold text-ink ' + row.className}>
                  {pick(T.scaleSample, locale)}
                </p>
                <p className="shrink-0 font-mono text-[10px] text-muted">{row.token}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="live-ft-probe" className="px-5 py-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-6 border-t border-line pt-6">
          <div className="flex flex-col gap-3">
            <h3 id="live-ft-probe" className="font-display text-h2 text-ink">
              {pick(T.probeTitle, locale)}
            </h3>
            <p className="max-w-[64ch] text-body text-ink-2">{pick(T.probeNote, locale)}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)] lg:gap-10">
            <div className="well flex flex-col gap-5 p-4 sm:p-6">
              <label className="flex flex-col gap-2">
                <span className="label-mono flex items-center justify-between gap-3">
                  <span>{pick(T.widthLabel, locale)}</span>
                  <span className="text-ink">{width}%</span>
                </span>
                <input
                  type="range"
                  min={40}
                  max={100}
                  step={1}
                  value={width}
                  onChange={(event) => setWidth(Number(event.target.value))}
                  className="h-1 w-full cursor-pointer appearance-none rounded-none bg-line accent-accent"
                />
              </label>

              <div className="overflow-x-auto">
                <div
                  ref={boxRef}
                  className="live-ft-probe flex flex-col gap-3 px-3 py-4"
                  style={{ width: width + '%' }}
                >
                  <p ref={cqwRef} className="live-ft-cqw min-w-0 break-words font-display font-semibold text-ink">
                    {pick(T.scaleSample, locale)}
                  </p>
                  <p ref={vwRef} className="live-ft-vw min-w-0 break-words font-display font-semibold text-line-strong">
                    {pick(T.scaleSample, locale)}
                  </p>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-4 font-mono text-[11px] sm:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <dt className="label-mono">{pick(T.boxLabel, locale)}</dt>
                  <dd className="tabular-nums text-ink">{readout(measured?.box)}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="label-mono">{pick(T.cqwLabel, locale)}</dt>
                  <dd className="tabular-nums text-accent">{readout(measured?.cqw)}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="label-mono">{pick(T.vwLabel, locale)}</dt>
                  <dd className="tabular-nums text-ink">{readout(measured?.vw)}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="label-mono">{pick(T.viewportLabel, locale)}</dt>
                  <dd className="tabular-nums text-muted">{readout(measured?.viewport)}</dd>
                </div>
              </dl>
            </div>

            <pre className="self-start overflow-x-auto border-l-2 border-accent pl-3 font-mono text-[10px] leading-relaxed text-muted">
              {'clamp(1rem,\n  0.4rem + 7cqw,\n  4rem)\n\nclamp(1rem,\n  0.4rem + 7vw,\n  4rem)'}
            </pre>
          </div>
        </div>
      </section>

      {T.sections.map((section, index) => (
        <section
          key={section.title.en}
          aria-labelledby={'live-ft-section-' + index}
          className="flex min-h-[62vh] items-center px-5 py-16 sm:px-8"
        >
          <div className="mx-auto grid w-full max-w-[88rem] gap-6 border-t border-line pt-6 md:grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,15rem)] md:gap-10">
            <div className="flex items-baseline gap-3 md:flex-col md:gap-2">
              <span aria-hidden="true" className="font-display text-h1 leading-none text-line-strong">
                {'0' + (index + 1)}
              </span>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                {pick(T.sectionLabel, locale).replace('{n}', '0' + (index + 1))}
              </p>
            </div>
            <div className="flex max-w-[58ch] flex-col gap-3">
              <h3 id={'live-ft-section-' + index} className="font-display text-h2 text-ink">
                {pick(section.title, locale)}
              </h3>
              <p className="text-body text-ink-2">{pick(section.body, locale)}</p>
            </div>
            <pre className="self-start overflow-x-auto border-l-2 border-accent pl-3 font-mono text-[10px] leading-relaxed text-muted">
              {section.figure.join('\n')}
            </pre>
          </div>
        </section>
      ))}

      <section aria-label={pick(T.paramsTitle, locale)} className="px-5 py-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-[88rem] gap-6 border-t border-line pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-h2 text-ink">{pick(T.paramsTitle, locale)}</h3>
            <dl className="flex flex-col">
              {T.params.map((row) => (
                <div
                  key={row.label.en}
                  className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 border-b border-line py-2.5"
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
          <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-3">
            <h3 className="font-display text-h3 text-ink">{pick(T.codeTitle, locale)}</h3>
            <span className="label-mono">clamp()</span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
              {CSS_TEXT}
            </pre>
            <div className="flex flex-col gap-3">
              <p className="text-caption text-ink-2">{pick(T.codeNote, locale)}</p>
              <p className="text-caption text-muted">{pick(T.reducedNote, locale)}</p>
              <Link
                to={entryPath('fluid-type')}
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
