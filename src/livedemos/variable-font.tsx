import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { usePrefersReducedMotion } from '../lib/motion'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * Full-page variable font specimen.
 *
 * The site ships two variable families as real files: Space Grotesk
 * (wght 300-700) and JetBrains Mono (wght 100-800, plus ital). The page
 * invites you to drag the axis, quantise it back into fake static stops,
 * and watch a single weight morph frame by frame.
 */

type Family = 'display' | 'mono'

const RANGE: Record<Family, { min: number; max: number; label: string }> = {
  display: { min: 300, max: 700, label: 'Space Grotesk' },
  mono: { min: 100, max: 800, label: 'JetBrains Mono' },
}

const T = {
  eyebrow: { zh: '现场 · T-05 · 可变字体', en: 'LIVE · T-05 · VARIABLE FONT' },
  title: { zh: '一个文件，', en: 'Every weight,' },
  titleBold: { zh: '全粗细', en: 'one file' },
  lede: {
    zh: '这一页的标题本身就是可变字体：前半句停在 300，后半句是 700，中间没有第二个字体文件。整页底下的所有字号、字重都由同一个文件里那条连续的字重轴插值出来。',
    en: 'The heading on this page is a variable font: the first half rests at 300, the second at 700, with no second font file involved. Everything else on this page is interpolated from that same continuous weight axis.',
  },
  why: {
    zh: '一条轴只在真实排版里才看得出连续：你需要在同一屏里同时看到细标题、粗标题、等宽标签和滑块推着它们走，才能判断这个轴到底够不够用。',
    en: 'An axis only proves itself in real typesetting: you need thin headings, bold headings, mono labels and a slider pushing them all at once on one screen to judge whether the range is actually enough.',
  },
  hint: { zh: '拖字重轴，再打开档位量化看差别', en: 'Drag the axis, then quantise it to see the difference' },
  labTitle: { zh: '轴是连续的', en: 'The axis is continuous' },
  labNote: {
    zh: '滑块给的是任意整数，浏览器在轴范围内真正插值。把档位数调到 2 以上，就等于假装只加载了几个静态字重：取值被就近取整，中间的粗细直接不存在。',
    en: 'The slider gives any integer and the browser interpolates inside the axis range. Raise the step count above 2 and you are pretending only a few static weights exist: the value snaps to the nearest stop and everything between simply disappears.',
  },
  wghtLabel: { zh: '字重轴 wght', en: 'Weight axis (wght)' },
  stepsLabel: { zh: '档位数', en: 'Number of stops' },
  stepsNote: {
    zh: '1 档 = 连续插值；2 档 = 只有轴的两端；更多档 = 有限档位。',
    en: '1 stop means continuous interpolation, 2 stops keeps only the ends of the axis, more stops gives you a finite ladder.',
  },
  familyLabel: { zh: '字体', en: 'Typeface' },
  continuous: { zh: '连续', en: 'continuous' },
  requested: { zh: '要求', en: 'requested' },
  rendered: { zh: '实际渲染', en: 'rendered' },
  rulerTitle: { zh: '300–700 对照尺', en: 'Weight ruler 300-700' },
  nearest: { zh: '离当前值最近', en: 'closest to the current value' },
  compareTitle: { zh: '静态字重 vs 可变字体', en: 'Static weights vs a variable font' },
  compareNote: {
    zh: '同一句、同一个目标字重，左边把取值舍入到 400 或 700（就像只加载了两个静态文件），右边真插值。把滑条拖到 550，左边直接跳到 700，右边停在中间 —— 差别不在「能不能变」，在「能不能停在中间」。',
    en: 'Same sentence, same target weight. The left side snaps to 400 or 700 as if only two static files were loaded; the right side truly interpolates. Drag the axis to 550 and the difference stops being subtle: the left jumps to 700 while the right rests in between.',
  },
  staticSide: { zh: '只加载 400 / 700', en: 'Only 400 / 700 loaded' },
  variableSide: { zh: '可变字体', en: 'Variable font' },
  pulseTitle: { zh: '让字重自己呼吸', en: 'Let the weight breathe' },
  pulseNote: {
    zh: '每帧改一次轴值就是每帧重排一次文字。单行这么做还撑得住，几十个节点一起循环就会掉帧 —— 所以这类效果用有限的过渡（400–900ms），不要无限循环。',
    en: 'Writing an axis value every frame re-lays out the text every frame. One line survives it; dozens of nodes looping will drop frames, which is why these effects use a finite transition (400-900ms) rather than an endless loop.',
  },
  pulseOn: { zh: '开始脉动', en: 'Start pulsing' },
  pulseOff: { zh: '停下', en: 'Stop' },
  reducedOn: {
    zh: '系统开启了减少动态效果，这里只显示一个静止的字重，不做脉动。',
    en: 'Reduced motion is on, so this shows one static weight instead of pulsing.',
  },
  reducedOff: {
    zh: '脉动在可见范围内运行时才逐帧写轴值，切走标签页会停下来。',
    en: 'The pulse writes the axis value per frame only while it is on screen, and stops when the tab is hidden.',
  },
  sectionLabel: { zh: '第 {n} 节', en: 'Section {n}' },
  sections: [
    {
      title: { zh: '轴有名字、有范围', en: 'Axes have names and ranges' },
      figure: ['wght 300-700 (display)', 'wght 100-800 (mono)', 'ital 0-1 (mono)'],
      body: {
        zh: '可变字体把若干条轴写进一个文件：wght 管粗细，wdth 管宽窄，opsz 管光学尺寸，slnt 管倾斜。每条轴都有最小值、最大值和默认值，本站 Space Grotesk 是 300–700，JetBrains Mono 是 100–800。给超出范围的值不会报错，只会被夹到端点。',
        en: 'A variable font packs several axes into one file: wght for weight, wdth for width, opsz for optical size, slnt for slant. Each axis has a minimum, a maximum and a default; on this site Space Grotesk runs 300-700 and JetBrains Mono 100-800. Out-of-range values do not error, they are clamped to the endpoint.',
      },
    },
    {
      title: { zh: 'font-weight 优先，底层开关补位', en: 'Prefer font-weight, use the raw switch for the rest' },
      figure: ['font-weight: 550', 'font-variation-settings:', '  "wght" 550, "wdth" 92'],
      body: {
        zh: 'wght 有专门属性，就用 font-weight：它会正常继承、参与 fallback、也能被 CSS 过渡驱动。font-variation-settings 是给没有专门属性的轴用的，写 wght 时会盖过 font-weight，而且轴名必须带引号，少一个引号整条声明就失效。',
        en: 'Because wght has a dedicated property, use font-weight: it inherits normally, participates in fallbacks and can be driven by a CSS transition. font-variation-settings exists for axes without a dedicated property; writing wght there overrides font-weight, and axis names must be quoted or the whole declaration is dropped.',
      },
    },
    {
      title: { zh: '改轴是重排版，不是合成', en: 'Changing an axis re-lays out, it does not composite' },
      figure: ['layout: yes', 'compositor: no', 'transition: 400-900ms'],
      body: {
        zh: '字重变化会改变字形宽度，浏览器必须重新排版这段文字，而不是像 transform 那样交给合成层。所以它适合短促的强调（悬停变粗、进场从细到粗），不适合长列表每帧抖动；真要动，就用几百毫秒的过渡，并且尊重 prefers-reduced-motion。',
        en: 'A weight change alters glyph widths, so the browser has to re-lay out that text instead of handing it to the compositor like transform. That suits short emphasis (thicken on hover, settle in on entry), not a long list jittering every frame; if you do animate it, keep the transition to a few hundred milliseconds and respect prefers-reduced-motion.',
      },
    },
    {
      title: { zh: '回退要提前想好', en: 'Plan the fallback first' },
      figure: ['font-display: swap', 'font-weight: 300 700', 'fallback close in weight'],
      body: {
        zh: '字体没下载完之前先落到系统字体，轴不生效，字重还会跳一下。@font-face 里把 font-weight 写成区间（300 700），浏览器才知道这一个文件覆盖整条轴；再用 font-display: swap 让文字尽早可读，并选一个粗细接近的 fallback。',
        en: 'Before the font downloads, the system font renders: the axis does nothing and the weight jumps. Declare font-weight as the range (300 700) in @font-face so the browser knows one file covers the whole axis, use font-display: swap so text is readable early, and pick a fallback whose weight is close.',
      },
    },
  ],
  paramsTitle: { zh: '推荐取值', en: 'Recommended values' },
  params: [
    { label: { zh: '字重范围', en: 'Weight range' }, value: { zh: '以字体实际轴为准（本站 300–700 / 100–800）', en: 'Whatever the font exposes (300-700 / 100-800 here)' } },
    { label: { zh: '常见轴', en: 'Common axes' }, value: 'wght / wdth / opsz / slnt / ital' },
    { label: { zh: '插值时长', en: 'Interpolation' }, value: '400–900ms' },
    { label: { zh: '缓动', en: 'Easing' }, value: 'ease-in-out' },
    {
      label: { zh: '回退', en: 'Fallback' },
      value: { zh: 'font-display: swap + 静态字重兜底', en: 'font-display: swap + a static weight fallback' },
    },
  ],
  codeTitle: { zh: '这一页实际在用的', en: 'What this page actually uses' },
  codeNote: {
    zh: '上面那段 @font-face 只声明一次宽度区间，整条轴就都能用；滑块里写的是 font-variation-settings，因为要演示「引号 + 任意整数」这件事，实际项目里 wght 建议直接写 font-weight。',
    en: 'The @font-face block declares the range once and the whole axis becomes available. The slider writes font-variation-settings because the point is to show the quoting and the arbitrary integer; in real projects set wght through font-weight.',
  },
  back: { zh: '回到词条：可变字体', en: 'Back to the entry: Variable Font' },
} as const

const CSS_SNIPPET = [
  '@font-face {',
  '  font-family: "Space Grotesk Variable";',
  '  src: url("/fonts/space-grotesk-variable.woff2") format("woff2-variations");',
  '  /* the whole axis, not one weight */',
  '  font-weight: 300 700;',
  '  font-display: swap;',
  '}',
  '',
  '.headline {',
  '  font-family: "Space Grotesk Variable", system-ui, sans-serif;',
  '  font-weight: 450;',
  '  transition: font-weight 600ms ease-in-out;',
  '}',
  '.headline:hover { font-weight: 700; }',
  '',
  '/* axes without a dedicated property; names must be quoted */',
  '.optical { font-variation-settings: "opsz" 32, "wght" 550; }',
].join('\n')

const STATIC_STOPS: Record<Family, number[]> = {
  display: [400, 700],
  mono: [400, 700],
}

function nearestStatic(value: number, stops: number[]): number {
  return stops.reduce((best, stop) => (Math.abs(stop - value) < Math.abs(best - value) ? stop : best), stops[0])
}

function quantize(value: number, steps: number, min: number, max: number): number {
  if (steps <= 1) return value
  const unit = (max - min) / (steps - 1)
  return Math.round((value - min) / unit) * unit + min
}

export default function VariableFontLive() {
  const locale = useLocale()
  const reduced = usePrefersReducedMotion()
  const [family, setFamily] = useState<Family>('display')
  const [wght, setWght] = useState(450)
  const [steps, setSteps] = useState(1)
  const [pulse, setPulse] = useState(false)

  const bandRef = useRef<HTMLParagraphElement | null>(null)

  const range = RANGE[family]
  const requested = Math.min(range.max, Math.max(range.min, wght))
  const effective = quantize(requested, steps, range.min, range.max)
  const snapped = nearestStatic(requested, STATIC_STOPS[family])
  const fontFamily = family === 'display' ? 'var(--font-display)' : 'var(--font-mono)'

  const ruler = useMemo(() => {
    const marks = [300, 350, 400, 450, 500, 550, 600, 650, 700]
    return marks.map((mark) => ({ mark, distance: Math.abs(mark - effective) }))
  }, [effective])

  useEffect(() => {
    if (reduced || !pulse) return
    const node = bandRef.current
    if (!node) return
    if (typeof window === 'undefined') return
    let frame = 0
    const start = (window.performance || Date).now()
    const tick = (now: number) => {
      const k = 0.5 + 0.5 * Math.sin((now - start) / 700)
      const value = Math.round(range.min + (range.max - range.min) * k)
      node.style.fontVariationSettings = '"wght" ' + value
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame)
      node.style.fontVariationSettings = '"wght" ' + effective
    }
  }, [pulse, reduced, range.min, range.max, effective])

  const familyName = RANGE[family].label

  return (
    <div className="relative bg-canvas pb-28">
      <section aria-label={pick(T.title, locale)} className="flex min-h-[92svh] items-center px-5 py-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-[88rem] gap-6">
          <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
          <h2
            className="max-w-[18ch] break-words font-display text-display leading-[1.03]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}
          >
            {pick(T.title, locale)}
            <span style={{ fontWeight: 700 }}>{pick(T.titleBold, locale)}</span>
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
      </section>

      <section aria-labelledby="live-vf-lab" className="px-5 py-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-6 border-t border-line pt-6">
          <h3 id="live-vf-lab" className="font-display text-h2 text-ink">
            {pick(T.labTitle, locale)}
          </h3>
          <p className="max-w-[62ch] text-body text-ink-2">{pick(T.labNote, locale)}</p>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,19rem)] lg:gap-10">
            <div className="well flex min-h-[20rem] flex-col justify-between gap-6 overflow-hidden p-5 sm:p-8">
              <p
                className="max-w-full break-words leading-[1.08]"
                style={{
                  fontFamily,
                  fontVariationSettings: '"wght" ' + effective,
                  fontSize: 'clamp(2rem, 6vw, 4.5rem)',
                }}
              >
                {familyName}
              </p>
              <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                <span>
                  {pick(T.requested, locale)}: <span className="text-ink tabular-nums">{requested}</span>
                </span>
                <span>
                  {pick(T.rendered, locale)}: <span className="text-ink tabular-nums">{effective}</span>
                </span>
                <span>{familyName}</span>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="label-mono flex items-center justify-between gap-3">
                  <span>{pick(T.wghtLabel, locale)}</span>
                  <span className="tabular-nums text-ink">{requested}</span>
                </span>
                <input
                  type="range"
                  min={range.min}
                  max={range.max}
                  step={1}
                  value={requested}
                  onChange={(event) => setWght(Number(event.target.value))}
                  className="h-1 w-full cursor-pointer appearance-none rounded-none bg-line accent-accent"
                />
                <span className="font-mono text-[10px] text-muted tabular-nums">
                  {range.min} – {range.max}
                </span>
              </label>

              <label className="flex flex-col gap-2">
                <span className="label-mono flex items-center justify-between gap-3">
                  <span>{pick(T.stepsLabel, locale)}</span>
                  <span className="tabular-nums text-ink">
                    {steps === 1 ? pick(T.continuous, locale) : steps}
                  </span>
                </span>
                <input
                  type="range"
                  min={1}
                  max={9}
                  step={1}
                  value={steps}
                  onChange={(event) => setSteps(Number(event.target.value))}
                  className="h-1 w-full cursor-pointer appearance-none rounded-none bg-line accent-accent"
                />
              </label>
              <p className="text-caption text-muted">{pick(T.stepsNote, locale)}</p>

              <div className="flex flex-col gap-2">
                <span className="label-mono">{pick(T.familyLabel, locale)}</span>
                <div className="flex">
                  <button
                    type="button"
                    aria-pressed={family === 'display'}
                    onClick={() => setFamily('display')}
                    className={
                      'flex-1 border px-3 py-1.5 font-mono text-[11px] transition-colors ' +
                      (family === 'display'
                        ? 'border-ink bg-ink text-canvas'
                        : 'border-line-strong text-ink-2 hover:border-ink hover:text-ink')
                    }
                  >
                    Space Grotesk
                  </button>
                  <button
                    type="button"
                    aria-pressed={family === 'mono'}
                    onClick={() => setFamily('mono')}
                    className={
                      '-ml-px flex-1 border px-3 py-1.5 font-mono text-[11px] transition-colors ' +
                      (family === 'mono'
                        ? 'border-ink bg-ink text-canvas'
                        : 'border-line-strong text-ink-2 hover:border-ink hover:text-ink')
                    }
                  >
                    JetBrains Mono
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="live-vf-ruler" className="px-5 py-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-5 border-t border-line pt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 id="live-vf-ruler" className="font-display text-h2 text-ink">
              {pick(T.rulerTitle, locale)}
            </h3>
            <p className="label-mono text-accent">{pick(T.nearest, locale)}</p>
          </div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-5 md:grid-cols-9">
            {ruler.map((item) => {
              const active = item.distance < 25
              return (
                <div key={item.mark} className="flex flex-col gap-1">
                  <span
                    className="break-words leading-none"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: item.mark, fontSize: '1.75rem' }}
                  >
                    Aa
                  </span>
                  <span
                    className={
                      'font-mono text-[10px] tabular-nums ' + (active ? 'text-accent' : 'text-muted')
                    }
                  >
                    {item.mark}
                  </span>
                  <span
                    aria-hidden="true"
                    className={'block h-[2px] w-full ' + (active ? 'bg-accent' : 'bg-line')}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="live-vf-compare" className="px-5 py-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-6 border-t border-line pt-6">
          <h3 id="live-vf-compare" className="font-display text-h2 text-ink">
            {pick(T.compareTitle, locale)}
          </h3>
          <p className="max-w-[62ch] text-body text-ink-2">{pick(T.compareNote, locale)}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-4 border border-line bg-surface p-5">
              <p
                className="break-words leading-[1.1]"
                style={{
                  fontFamily,
                  fontWeight: snapped,
                  fontSize: 'clamp(1.75rem, 3.4vw, 2.75rem)',
                }}
              >
                {familyName}
              </p>
              <p className="label-mono mt-auto">
                {pick(T.staticSide, locale)} · {snapped}
              </p>
            </div>
            <div className="flex flex-col gap-4 border border-line-strong bg-raised p-5">
              <p
                className="break-words leading-[1.1]"
                style={{ fontFamily, fontVariationSettings: '"wght" ' + requested, fontSize: 'clamp(1.75rem, 3.4vw, 2.75rem)' }}
              >
                {familyName}
              </p>
              <p className="label-mono mt-auto">
                {pick(T.variableSide, locale)} · {requested}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="live-vf-pulse" className="px-5 py-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-6 border-t border-line pt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 id="live-vf-pulse" className="font-display text-h2 text-ink">
              {pick(T.pulseTitle, locale)}
            </h3>
            <button
              type="button"
              aria-pressed={pulse}
              disabled={reduced}
              onClick={() => setPulse((value) => !value)}
              className="border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2 transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:border-line disabled:text-muted"
            >
              {pulse ? pick(T.pulseOff, locale) : pick(T.pulseOn, locale)}
            </button>
          </div>
          <p className="max-w-[62ch] text-body text-ink-2">{pick(T.pulseNote, locale)}</p>
          <div className="well flex min-h-[12rem] items-center overflow-hidden px-5 py-8">
            <p
              ref={bandRef}
              className="max-w-full break-words leading-[1.05]"
              style={{
                fontFamily,
                fontVariationSettings: '"wght" ' + effective,
                fontSize: 'clamp(2rem, 6vw, 4rem)',
                transition: reduced ? undefined : 'none',
              }}
            >
              {pick(T.labTitle, locale)}
            </p>
          </div>
          <p className="text-caption text-muted">{reduced ? pick(T.reducedOn, locale) : pick(T.reducedOff, locale)}</p>
        </div>
      </section>

      {T.sections.map((section, index) => (
        <section
          key={section.title.en}
          aria-labelledby={'live-vf-section-' + index}
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
              <h3 id={'live-vf-section-' + index} className="font-display text-h2 text-ink">
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
            <span className="stamp">T-05</span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
              {CSS_SNIPPET}
            </pre>
            <div className="flex flex-col gap-3">
              <p className="text-caption text-ink-2">{pick(T.codeNote, locale)}</p>
              <Link
                to={entryPath('variable-font')}
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
