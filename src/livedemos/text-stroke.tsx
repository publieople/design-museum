import { useState, type CSSProperties } from 'react'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * Full-page "text stroke" specimen.
 *
 * -webkit-text-stroke paints outward from the glyph outline, so half the
 * stroke width eats into the letter. Whether that reads as crisp or muddy
 * depends on the size, the weight and the surface behind it — all three of
 * which only exist at page scale, not inside a fixed demo box.
 */

const T = {
  eyebrow: { zh: '现场 · T-07 · 描边文字', en: 'LIVE · T-07 · TEXT STROKE' },
  title: { zh: '只留一圈轮廓', en: 'Keep only the outline' },
  lede: {
    zh: '这一页最大的那行字是空心的：填充透明，只剩沿字形描出来的一圈朱红。描边从轮廓中线往两侧画，笔画会被吃掉一半，所以它只在大字号上站得住。',
    en: 'The biggest line on this page is hollow: transparent fill and a single red outline traced around the glyph. The stroke paints from the outline centre outwards and eats half the weight, which is why it only holds up at large sizes.',
  },
  why: {
    zh: '盒子演不了这件事：描边能不能用，取决于字号、字重和背后的底色三件事一起成立，而这三件事只有在整页真实的排版环境里才配得上一起调。',
    en: 'A box cannot show this: whether a stroke works depends on size, weight and the surface behind it holding true together, and those three only line up in a real full-page setting.',
  },
  hint: { zh: '拖宽度和字号，看笔画什么时候糊掉', en: 'Drag the width and size and watch the strokes clog' },
  controlsTitle: { zh: '一个字号下的三种选择', en: 'Three choices at one size' },
  widthLabel: { zh: '描边宽度', en: 'Stroke width' },
  sizeLabel: { zh: '字号', en: 'Size' },
  fillLabel: { zh: '实心填充', en: 'Solid fill' },
  fillOn: { zh: '描边 + 填充', en: 'Stroke + fill' },
  fillOff: { zh: '空心', en: 'Hollow' },
  specimen: { zh: '描边文字', en: 'STROKE' },
  cssReadout: { zh: '当前声明', en: 'Current declaration' },
  surfaceTitle: { zh: '浅底要挑颜色，深底不用', en: 'Light surfaces need care, dark ones do not' },
  surfaceNote: {
    zh: '空心字没有填充帮你兜底，描边色就是它全部的对比度。浅底上要选深色描边并且保证对比度；深底上换浅色描边反而更稳。中间那个是反例：用线色描边，字几乎不见了。',
    en: 'A hollow glyph has no fill to carry it, so the stroke colour is all the contrast there is. On a light surface pick a dark stroke and verify it; on a dark surface a light stroke is the safer choice. The middle panel is the counterexample: stroking with the line colour makes the text almost disappear.',
  },
  surfaceGood: { zh: '浅底 · 深色描边', en: 'Light · dark stroke' },
  surfaceBad: { zh: '反例 · 线色描边', en: 'Counterexample · line stroke' },
  surfaceDark: { zh: '深底 · 浅色描边', en: 'Dark · light stroke' },
  weightTitle: { zh: '细字重先死', en: 'Thin weights die first' },
  weightNote: {
    zh: '同样的描边，字越细，笔画被吃掉的比例越大。字重 300 加上 2px 描边，横画基本就剩一条边了；这就是为什么描边只配大字号、并且通常配中等以上的字重。',
    en: 'The same stroke costs thin type more: at weight 300 with a 2px stroke the horizontal strokes are basically one edge. That is why outlined type is reserved for large sizes and usually paired with a medium weight or heavier.',
  },
  weightLight: { zh: '字重 300', en: 'weight 300' },
  weightSemi: { zh: '字重 600', en: 'weight 600' },
  sectionLabel: { zh: '第 {n} 节', en: 'Section {n}' },
  sections: [
    {
      title: { zh: '描边画在中线上', en: 'The stroke sits on the centre line' },
      figure: ['1px stroke = 0.5px in,', '         0.5px out'],
      body: {
        zh: 'text-stroke 沿字形轮廓画一条以中线为界的带子：一半压在字里面，一半伸到字外面。所以 2px 的描边会让笔画看起来细 1px，而细笔画的字干脆被描边吃掉。想同时保留填充，就写 paint-order: stroke fill，让描边先画、填充后画。',
        en: 'text-stroke draws a band centred on the glyph outline: half inside the letter, half outside. A 2px stroke therefore thins the visible weight by 1px, and hairline strokes disappear entirely. To keep the fill as well, write paint-order: stroke fill so the stroke is painted first and the fill covers it.',
      },
    },
    {
      title: { zh: '宽度用 px，不要用 em', en: 'Keep the width in px, not em' },
      figure: ['-webkit-text-stroke: 2px', 'not 0.04em'],
      body: {
        zh: 'em 会跟着字号一起放大：字号 96px 时 0.04em 正好是 3.84px，笔画直接被吃掉一大截。用固定的 px 宽度，字号变大时描边占比反而变小，大标题才越看越清楚。',
        en: 'An em width scales with the size: at 96px, 0.04em is 3.84px and eats a big chunk of the letter. A fixed px width shrinks in proportion as the size grows, which is exactly what a big heading needs.',
      },
    },
    {
      title: { zh: '空心不等于没有对比', en: 'Hollow is not an excuse for no contrast' },
      figure: ['light bg + line stroke: gone', 'body text: 4.5:1', 'large text: 3:1'],
      body: {
        zh: '空心字唯一的视觉信息就是那一圈线。浅底上用浅色描边等于没有字：大字号至少 3:1，正文级别 4.5:1。同一段文字在深底上反而更稳，因为浅色描边天然拉得开。',
        en: 'The outline is the only visual information a hollow glyph carries. A light stroke on a light surface is effectively no text: at least 3:1 for large type and 4.5:1 at body level. The same line reads far better on a dark surface, where a light stroke pulls away naturally.',
      },
    },
    {
      title: { zh: '别用 SVG 假字', en: 'Do not fake the letters with SVG' },
      figure: ['real text: selectable', 'svg paths: not text'],
      body: {
        zh: '为了描边把标题改成一串 SVG path，读屏软件读不出来、文字不能选中、翻译和复制一起坏掉。描边是纯 CSS 能力，真实文字完全能做到；万一浏览器不支持，就退回实色，而不是换标记。',
        en: 'Turning a heading into SVG paths just to get an outline breaks screen readers, text selection, translation and copy-paste. The stroke is pure CSS and real text handles it; if a browser does not support it, fall back to a solid colour instead of changing the markup.',
      },
    },
  ],
  paramsTitle: { zh: '推荐取值', en: 'Recommended values' },
  params: [
    { label: { zh: '描边宽度', en: 'Stroke width' }, value: { zh: '1–3px（只给大字号）', en: '1–3px (large type only)' } },
    { label: { zh: '建议字号', en: 'Suggested size' }, value: '≥ 32px' },
    { label: { zh: '绘制顺序', en: 'Paint order' }, value: 'paint-order: stroke fill' },
    { label: { zh: '空心写法', en: 'Hollow recipe' }, value: 'color: transparent + -webkit-text-stroke' },
    { label: { zh: '对比度', en: 'Contrast' }, value: { zh: '大字 ≥ 3:1，正文级 ≥ 4.5:1', en: '≥ 3:1 large, ≥ 4.5:1 body' } },
  ],
  codeTitle: { zh: '这一页实际在用的', en: 'What this page actually uses' },
  codeNote: {
    zh: '先给一个实色兜底，再用 @supports 检测描边能力。不支持描边的浏览器会拿到实心字，而不是一页看不见的空白。',
    en: 'A solid colour ships first and @supports checks for the stroke. Browsers without it render solid type instead of a page of invisible headings.',
  },
  reducedNote: {
    zh: '描边文字是静态的，没有需要降级的地方。如果给它加了描边进场的动画，系统开启减少动态效果时直接显示最终态。',
    en: 'Outlined type is static and needs no fallback. If you animate the stroke in, show the final state under reduced motion.',
  },
  back: { zh: '回到词条：描边文字', en: 'Back to the entry: Text Stroke' },
} as const

const CSS_SNIPPET = [
  '.outline-title {',
  '  /* solid first, so the fallback is never invisible */',
  '  color: var(--ink);',
  '}',
  '',
  '@supports (-webkit-text-stroke: 1px currentColor) {',
  '  .outline-title {',
  '    color: transparent;',
  '    -webkit-text-stroke: 2px var(--accent);',
  '    paint-order: stroke fill;',
  '  }',
  '',
  '  /* stroke plus fill: the stroke is painted underneath */',
  '  .outline-title--filled {',
  '    color: var(--ink);',
  '    -webkit-text-stroke: 2px var(--ink);',
  '  }',
  '}',
  '',
  '@media (forced-colors: active) {',
  '  .outline-title {',
  '    color: CanvasText;',
  '    -webkit-text-stroke: 0;',
  '  }',
  '}',
].join('\n')

function strokeOf(width: number, color: string, fill: boolean): CSSProperties {
  return {
    color: fill ? 'var(--ink)' : 'transparent',
    WebkitTextStroke: width + 'px ' + color,
    paintOrder: 'stroke fill',
  }
}

export default function TextStrokeLive() {
  const locale = useLocale()
  const [width, setWidth] = useState(2)
  const [size, setSize] = useState(56)
  const [fill, setFill] = useState(false)

  return (
    <div className="relative bg-canvas pb-28">
      <section aria-label={pick(T.title, locale)} className="flex min-h-[92svh] items-center px-5 py-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-[88rem] gap-10">
          <div className="flex flex-col gap-5">
            <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
            <h2
              className="max-w-[14ch] break-words font-display text-display font-semibold leading-[1.02]"
              style={{
                color: 'transparent',
                WebkitTextStroke: '2px var(--accent)',
                paintOrder: 'stroke fill',
              }}
            >
              {pick(T.title, locale)}
            </h2>
            <p className="max-w-[56ch] text-body text-ink-2">{pick(T.lede, locale)}</p>
            <p className="max-w-[62ch] border-l-2 border-accent pl-3 text-caption text-muted">
              {pick(T.why, locale)}
            </p>
            <p className="mt-1 flex items-center gap-2 font-mono text-[11px] text-muted">
              <span aria-hidden="true" className="inline-block h-2 w-2 bg-accent" />
              {pick(T.hint, locale)}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="live-ts-controls" className="px-5 py-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-6 border-t border-line pt-6">
          <h3 id="live-ts-controls" className="font-display text-h2 text-ink">
            {pick(T.controlsTitle, locale)}
          </h3>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:gap-10">
            <div className="well flex min-h-[18rem] flex-col justify-center gap-4 overflow-hidden p-4 sm:p-8">
              <p
                className="max-w-full break-words font-display font-semibold leading-[1.05]"
                style={{ ...strokeOf(width, 'var(--accent)', fill), fontSize: size + 'px' }}
              >
                {pick(T.specimen, locale)}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                font-size: {size}px
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="label-mono flex items-center justify-between gap-3">
                  <span>{pick(T.widthLabel, locale)}</span>
                  <span className="tabular-nums text-ink">{width}px</span>
                </span>
                <input
                  type="range"
                  min={0.5}
                  max={4}
                  step={0.5}
                  value={width}
                  onChange={(event) => setWidth(Number(event.target.value))}
                  className="h-1 w-full cursor-pointer appearance-none rounded-none bg-line accent-accent"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="label-mono flex items-center justify-between gap-3">
                  <span>{pick(T.sizeLabel, locale)}</span>
                  <span className="tabular-nums text-ink">{size}px</span>
                </span>
                <input
                  type="range"
                  min={24}
                  max={96}
                  step={4}
                  value={size}
                  onChange={(event) => setSize(Number(event.target.value))}
                  className="h-1 w-full cursor-pointer appearance-none rounded-none bg-line accent-accent"
                />
              </label>

              <button
                type="button"
                aria-pressed={fill}
                onClick={() => setFill((value) => !value)}
                className="self-start border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2 transition-colors hover:border-ink hover:text-ink"
              >
                {pick(T.fillLabel, locale)}: {fill ? pick(T.fillOn, locale) : pick(T.fillOff, locale)}
              </button>

              <div className="border-t border-line pt-4">
                <p className="label-mono">{pick(T.cssReadout, locale)}</p>
                <pre className="mt-2 overflow-x-auto font-mono text-[11px] leading-relaxed text-ink-2">
                  {'color: ' + (fill ? 'var(--ink)' : 'transparent') + ';\n' +
                    '-webkit-text-stroke: ' + width + 'px var(--accent);\n' +
                    'paint-order: stroke fill;'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="live-ts-surface" className="px-5 py-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-6 border-t border-line pt-6">
          <h3 id="live-ts-surface" className="font-display text-h2 text-ink">
            {pick(T.surfaceTitle, locale)}
          </h3>
          <p className="max-w-[62ch] text-body text-ink-2">{pick(T.surfaceNote, locale)}</p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-4 border border-line bg-surface px-5 py-6">
              <p className="break-words font-display text-h2 font-semibold leading-[1.1]" style={strokeOf(2, 'var(--accent)', false)}>
                {pick(T.specimen, locale)}
              </p>
              <p className="label-mono mt-auto">{pick(T.surfaceGood, locale)}</p>
            </div>
            <div className="flex flex-col gap-4 border border-line bg-surface px-5 py-6">
              <p className="break-words font-display text-h2 font-semibold leading-[1.1]" style={strokeOf(2, 'var(--line)', false)}>
                {pick(T.specimen, locale)}
              </p>
              <p className="label-mono mt-auto">{pick(T.surfaceBad, locale)}</p>
            </div>
            <div className="flex flex-col gap-4 bg-ink px-5 py-6">
              <p className="break-words font-display text-h2 font-semibold leading-[1.1]" style={strokeOf(2, 'var(--canvas)', false)}>
                {pick(T.specimen, locale)}
              </p>
              <p className="label-mono mt-auto text-line">{pick(T.surfaceDark, locale)}</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="live-ts-weight" className="px-5 py-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-6 border-t border-line pt-6">
          <h3 id="live-ts-weight" className="font-display text-h2 text-ink">
            {pick(T.weightTitle, locale)}
          </h3>
          <p className="max-w-[62ch] text-body text-ink-2">{pick(T.weightNote, locale)}</p>
          <div className="flex flex-col divide-y divide-line border-y border-line">
            <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <p className="break-words font-display text-h1 font-light leading-[1.1]" style={strokeOf(2, 'var(--accent)', false)}>
                {pick(T.specimen, locale)}
              </p>
              <p className="label-mono shrink-0">{pick(T.weightLight, locale)}</p>
            </div>
            <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <p className="break-words font-display text-h1 font-semibold leading-[1.1]" style={strokeOf(2, 'var(--accent)', false)}>
                {pick(T.specimen, locale)}
              </p>
              <p className="label-mono shrink-0">{pick(T.weightSemi, locale)}</p>
            </div>
          </div>
        </div>
      </section>

      {T.sections.map((section, index) => (
        <section
          key={section.title.en}
          aria-labelledby={'live-ts-section-' + index}
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
              <h3 id={'live-ts-section-' + index} className="font-display text-h2 text-ink">
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
            <span className="stamp">T-07</span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
              {CSS_SNIPPET}
            </pre>
            <div className="flex flex-col gap-3">
              <p className="text-caption text-ink-2">{pick(T.codeNote, locale)}</p>
              <p className="text-caption text-muted">{pick(T.reducedNote, locale)}</p>
              <Link
                to={entryPath('text-stroke')}
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
