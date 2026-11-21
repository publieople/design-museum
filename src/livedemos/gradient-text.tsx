import { useMemo, useState, type CSSProperties } from 'react'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * Full-page "gradient text" specimen.
 *
 * The gradient is painted on the element box and then clipped to the glyphs,
 * so the width of that box decides which slice every character lands on.
 * A fixed demo box always stretches the same way; only full-page headlines
 * wrap, re-proportion and sit on both surfaces, which is what this page shows.
 */

const T = {
  eyebrow: { zh: '现场 · T-03 · 渐变文字', en: 'LIVE · T-03 · GRADIENT TEXT' },
  title: { zh: '把一条渐变裁进字形里', en: 'Clip one gradient into the letters' },
  lede: {
    zh: '这一页的大标题自己就是渐变文字：背景铺一条渐变，再用 background-clip: text 把它裁进字形，文字颜色设为透明。你能读到的每个字，都是那条渐变的一个切片。',
    en: 'The headlines on this page are the specimen: a gradient is painted behind the text, background-clip: text cuts it to the glyphs, and the text colour is transparent. Every letter you read is one slice of that gradient.',
  },
  why: {
    zh: '盒子演不了这件事：渐变铺在元素的盒子上，盒子多宽、在哪里换行，决定每个字落在渐变的哪一段。只有整页的标题才有真实的宽度和换行。',
    en: 'A box cannot show this: the gradient is painted on the element box, and the box width and line breaks decide which slice each character lands on. Only full-page headlines have a real width and real wrapping.',
  },
  hint: { zh: '拖动角度，看每个字的颜色怎么换', en: 'Drag the angle and watch every letter change colour' },
  angleSample: { zh: '渐变文字 Aa', en: 'Gradient text Aa' },
  angleTitle: { zh: '角度决定每个字落在哪一段', en: 'The angle decides which slice each letter lands on' },
  angleHint: { zh: '同一条渐变，只改角度', en: 'The same gradient, only the angle changes' },
  angleLabel: { zh: '渐变角度', en: 'Gradient angle' },
  wrapTitle: { zh: '换行以后，渐变不会每行重来', en: 'When the text wraps, the gradient does not restart per line' },
  wrapNote: {
    zh: '整段渐变只铺一次，横跨整个文字盒子：第一行从左往右走，到了第二行接着往下走。想要每一行都完整走一遍，只能给每一行单独包一个元素。',
    en: 'The gradient is painted once across the whole text box: it travels left to right on the first line, then continues on the second. To restart the gradient on every line you have to wrap each line in its own element.',
  },
  wrapSample: {
    zh: '渐变铺在整个盒子上，不是每一行重新开始一遍。',
    en: 'The gradient runs across the whole box, not once per line. ',
  },
  contrastTitle: { zh: '两端都要和底色有对比', en: 'Both ends need contrast against the background' },
  contrastNote: {
    zh: '渐变两端各自和底色的对比度必须达标：正文级别 4.5:1，大字号 3:1。下面这些数字是刚才从当前主题的 token 上量出来的，不是写死的。',
    en: 'Each end of the gradient has to clear its contrast against the background: 4.5:1 for body-size text, 3:1 for large text. The numbers below were measured from the current theme tokens just now, not hard-coded.',
  },
  measuredNote: { zh: '当前主题 · 实测对比度', en: 'Current theme · measured contrast' },
  pending: { zh: '测量中', en: 'measuring' },
  pairAccentCanvas: { zh: '朱红 / 纸面', en: 'accent / canvas' },
  pairInkCanvas: { zh: '墨 / 纸面', en: 'ink-2 / canvas' },
  pairAccentInk: { zh: '朱红 / 反色面板', en: 'accent / inverted panel' },
  pairLineInk: { zh: '浅线 / 反色面板', en: 'line / inverted panel' },
  passLabel: { zh: '达标', en: 'pass' },
  failLabel: { zh: '偏低', en: 'low' },
  fallbackTitle: { zh: '降级：先让它有颜色', en: 'Fallback: give it a colour first' },
  fallbackNote: {
    zh: 'color: transparent 只有在裁剪生效时才是安全的。裁剪不生效、或者系统进入高对比度模式时，透明文字会直接消失。所以真要上线，先写一条实色回退，再用 @supports 打开渐变。',
    en: 'color: transparent is only safe while the clip works. Without the clip, or under high-contrast mode, transparent text simply disappears. So ship a solid colour first, then turn the gradient on behind @supports.',
  },
  simulateLabel: { zh: '模拟回退', en: 'Simulate the fallback' },
  simulateOn: { zh: '回退态（实色）', en: 'Fallback (solid)' },
  simulateOff: { zh: '渐变态', en: 'Gradient' },
  simulateNote: {
    zh: '这是同一个盒子切到实色，用来对照；真正的 forced-colors 由系统强制覆盖，页面写什么都会被换成系统色。',
    en: 'This is the same box switched to a solid colour for comparison. Real forced-colors is enforced by the system: whatever the page declares gets replaced with system colours.',
  },
  sectionLabel: { zh: '第 {n} 节', en: 'Section {n}' },
  sections: [
    {
      title: { zh: '渐变不是画在字上的', en: 'The gradient is not painted on the letters' },
      figure: ['background-image: ...', 'background-clip: text', 'color: transparent'],
      body: {
        zh: '三步：先给元素铺一条背景渐变，再把背景裁剪到字形，最后把文字颜色设为透明，让背后的渐变透出来。所以颜色是一整条连续的渐变，不是给每个字单独上色——每个字只是这条渐变的取样窗口。',
        en: 'Three steps: paint a gradient on the element, clip that background to the glyphs, then make the text colour transparent so the gradient shows through. The colour is one continuous gradient rather than per-character paint — each glyph is just a sampling window onto it.',
      },
    },
    {
      title: { zh: '角度是 90° 起算的', en: 'The angle starts at 90°' },
      figure: ['90deg  →  left to right', '135deg →  corner to corner', '2–3 stops, no more'],
      body: {
        zh: '90deg 从左到右，135deg 从左上到右下；角度一转，每个字落在渐变里的颜色全变。色标控制在两到三个就够，再多会在字里出现排不干净的色带。还要记得两个前缀都要写：background-clip 与 -webkit-background-clip。',
        en: '90deg runs left to right, 135deg from top-left to bottom-right; turn the angle and every letter samples a different colour. Two or three stops are enough — more than that leaves banding you cannot clean up inside a glyph. And write both prefixes: background-clip and -webkit-background-clip.',
      },
    },
    {
      title: { zh: '暗底放大对比问题', en: 'A dark background magnifies the contrast problem' },
      figure: ['light end on light bg: gone', 'forced-colors: gone', 'body text: 4.5:1'],
      body: {
        zh: '深色页面上的霓虹或金属标题之所以好看，是因为浅色那一端和深底拉开了距离。反过来，浅色那一端压在浅底上会直接糊掉。所以两端都要单独验对比度，而不是只看「整体看起来还行」。整段正文上渐变会明显掉可读性，一般只给一到两行标题用。',
        en: 'A neon or metallic headline works on a dark page because its light end pulls away from the dark background. Reverse that and the light end washes out on a light page. Check each end separately instead of trusting how the whole thing looks, and keep the gradient to one or two headline lines: a full paragraph loses too much readability.',
      },
    },
    {
      title: { zh: '裁剪失效时文字会消失', en: 'When the clip fails, the text disappears' },
      figure: ['@supports (background-clip: text)', '@media (forced-colors: active)', '→ solid colour'],
      body: {
        zh: '这是它比普通文字危险的地方：普通文字最坏也就是颜色难看，渐变文字在裁剪失效时是空白的。用 @supports 判断裁剪能力、用 forced-colors 媒体查询接住高对比度模式，两条都退回实色，文字才一直存在。',
        en: 'This is where it is riskier than ordinary text: ordinary text at worst looks wrong, while gradient text goes blank when the clip fails. Gate the gradient behind @supports and catch high-contrast mode with a forced-colors media query; both fall back to a solid colour so the text never disappears.',
      },
    },
  ],
  paramsTitle: { zh: '推荐取值', en: 'Recommended values' },
  params: [
    { label: { zh: '渐变角度', en: 'Gradient angle' }, value: '90–135deg' },
    { label: { zh: '色标数量', en: 'Colour stops' }, value: { zh: '2–3 个', en: '2–3' } },
    { label: { zh: '对比度', en: 'Contrast' }, value: { zh: '正文 ≥ 4.5:1，大字号 ≥ 3:1', en: '≥ 4.5:1 body, ≥ 3:1 large' } },
    { label: { zh: '前缀', en: 'Prefixes' }, value: 'background-clip + -webkit-background-clip' },
    { label: { zh: '降级', en: 'Fallback' }, value: { zh: '实色打底，@supports 内开渐变', en: 'solid colour first, gradient inside @supports' } },
  ],
  codeTitle: { zh: '这一页实际在用的', en: 'What this page actually uses' },
  codeNote: {
    zh: '先实色、再渐变，forced-colors 里退回墨色。上面那个「模拟回退」按钮就是把这段的最后一行手动执行了一遍。',
    en: 'Solid colour first, gradient second, and ink under forced-colors. The simulate button above runs the last line of this snippet by hand.',
  },
  reducedNote: {
    zh: '渐变本身是静态的。如果再加背景位移或色相旋转，系统开启减少动态效果时要把动画停住，只留静态渐变。',
    en: 'The gradient itself is static. If you add a moving background position or a hue rotation, reduced motion has to stop the animation and leave the static gradient.',
  },
  back: { zh: '回到词条：渐变文字', en: 'Back to the entry: Gradient Text' },
} as const

const INLINE_SNIPPET = (angle: number) =>
  [
    'background-image:',
    '  linear-gradient(' + angle + 'deg,',
    '    var(--accent), var(--ink-2));',
    'background-clip: text;',
    '-webkit-background-clip: text;',
    'color: transparent;',
    '-webkit-text-fill-color: transparent;',
  ].join('\n')

const CSS_SNIPPET = [
  '/* ship the solid colour first */',
  '.gradient-title {',
  '  color: var(--accent);',
  '}',
  '',
  '@supports (background-clip: text) or (-webkit-background-clip: text) {',
  '  .gradient-title {',
  '    background-image: linear-gradient(120deg, var(--accent), var(--ink-2));',
  '    background-clip: text;',
  '    -webkit-background-clip: text;',
  '    color: transparent;',
  '    -webkit-text-fill-color: transparent;',
  '  }',
  '}',
  '',
  '@media (forced-colors: active) {',
  '  .gradient-title {',
  '    background-image: none;',
  '    color: CanvasText;',
  '    -webkit-text-fill-color: currentColor;',
  '  }',
  '}',
].join('\n')

type Rgb = [number, number, number]

function parseColor(value: string): Rgb | null {
  const match = value.match(/rgba?\(([^)]+)\)/)
  if (!match) return null
  const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()))
  if (parts.length < 3) return null
  const [r, g, b] = parts
  if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) return null
  return [r, g, b]
}

function channel(value: number): number {
  const c = value / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function luminance([r, g, b]: Rgb): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const la = luminance(a)
  const lb = luminance(b)
  const light = Math.max(la, lb)
  const dark = Math.min(la, lb)
  return (light + 0.05) / (dark + 0.05)
}

type Ratios = Record<'accentCanvas' | 'inkCanvas' | 'accentInk' | 'lineInk', number>

export default function GradientTextLive() {
  const locale = useLocale()
  const [angle, setAngle] = useState(120)
  const [fallback, setFallback] = useState(false)
  const [ratios] = useState<Ratios | null>(() => {
    if (typeof document === 'undefined') return null
    const read = (token: string): Rgb | null => {
      const probe = document.createElement('span')
      probe.style.color = 'var(' + token + ')'
      probe.style.position = 'absolute'
      probe.style.opacity = '0'
      probe.style.pointerEvents = 'none'
      document.body.appendChild(probe)
      const value = getComputedStyle(probe).color
      probe.remove()
      return parseColor(value)
    }
    const accent = read('--accent')
    const ink2 = read('--ink-2')
    const canvas = read('--canvas')
    const ink = read('--ink')
    const line = read('--line')
    if (!accent || !ink2 || !canvas || !ink || !line) return null
    return {
      accentCanvas: Math.round(contrastRatio(accent, canvas) * 100) / 100,
      inkCanvas: Math.round(contrastRatio(ink2, canvas) * 100) / 100,
      accentInk: Math.round(contrastRatio(accent, ink) * 100) / 100,
      lineInk: Math.round(contrastRatio(line, ink) * 100) / 100,
    }
  })

  const gradient = useMemo<CSSProperties>(() => {
    if (fallback) return { color: 'var(--accent)' }
    return {
      backgroundImage: 'linear-gradient(' + angle + 'deg, var(--accent), var(--ink-2))',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      color: 'transparent',
      WebkitTextFillColor: 'transparent',
    }
  }, [angle, fallback])

  const ratioRows = [
    { key: 'accentCanvas' as const, label: T.pairAccentCanvas },
    { key: 'inkCanvas' as const, label: T.pairInkCanvas },
    { key: 'accentInk' as const, label: T.pairAccentInk },
    { key: 'lineInk' as const, label: T.pairLineInk },
  ]

  const ratioText = (value: number | undefined) =>
    value === undefined ? pick(T.pending, locale) : value.toFixed(2) + ':1'

  return (
    <div className="relative bg-canvas pb-28">
      <section aria-label={pick(T.title, locale)} className="flex min-h-[92svh] items-center px-5 py-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-[88rem] gap-10 lg:gap-14">
          <div className="flex flex-col gap-5">
            <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
            <h2
              className="max-w-[15ch] break-words font-display text-display font-semibold leading-[1.02]"
              style={gradient}
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

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-line pt-3">
              <h3 className="font-display text-h3 text-ink">{pick(T.angleTitle, locale)}</h3>
              <span className="label-mono">{pick(T.angleHint, locale)}</span>
            </div>
            <p
              className="max-w-[24ch] break-words font-display text-h1 font-semibold leading-[1.05]"
              style={gradient}
            >
              {pick(T.angleSample, locale)}
            </p>
            <label className="mt-1 flex flex-col gap-2">
              <span className="label-mono flex items-center justify-between gap-3">
                <span>{pick(T.angleLabel, locale)}</span>
                <span className="tabular-nums text-ink">{angle}deg</span>
              </span>
              <input
                type="range"
                min={0}
                max={360}
                step={5}
                value={angle}
                onChange={(event) => setAngle(Number(event.target.value))}
                className="h-1 w-full cursor-pointer appearance-none rounded-none bg-line accent-accent"
              />
            </label>
          </div>
        </div>
      </section>

      <section aria-labelledby="live-gt-wrap" className="px-5 py-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-6 border-t border-line pt-6">
          <div className="flex flex-col gap-3">
            <h3 id="live-gt-wrap" className="font-display text-h2 text-ink">
              {pick(T.wrapTitle, locale)}
            </h3>
            <p className="max-w-[62ch] text-body text-ink-2">{pick(T.wrapNote, locale)}</p>
          </div>
          <p
            className="max-w-[46ch] break-words font-display text-h2 font-semibold leading-[1.15]"
            style={gradient}
          >
            {pick(T.wrapSample, locale).repeat(2)}
          </p>
        </div>
      </section>

      <section aria-labelledby="live-gt-contrast" className="px-5 py-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-[88rem] gap-6 border-t border-line pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-12">
          <div className="flex flex-col gap-4">
            <h3 id="live-gt-contrast" className="font-display text-h2 text-ink">
              {pick(T.contrastTitle, locale)}
            </h3>
            <p className="max-w-[58ch] text-body text-ink-2">{pick(T.contrastNote, locale)}</p>
            <p className="label-mono pt-2">{pick(T.measuredNote, locale)}</p>
            <dl className="flex flex-col">
              {ratioRows.map((row) => {
                const value = ratios?.[row.key]
                const pass = value !== undefined && value >= 4.5
                return (
                  <div
                    key={row.key}
                    className="grid grid-cols-[minmax(0,1fr)_5rem_4rem] items-baseline gap-3 border-b border-line py-2.5"
                  >
                    <dt className="text-caption text-ink-2">{pick(row.label, locale)}</dt>
                    <dd className="text-right font-mono text-[11px] tabular-nums text-ink">
                      {ratioText(value)}
                    </dd>
                    <dd
                      className={
                        'text-right font-mono text-[10px] uppercase tracking-[0.12em] ' +
                        (value === undefined ? 'text-muted' : pass ? 'text-accent' : 'text-muted')
                      }
                    >
                      {value === undefined ? '—' : pass ? pick(T.passLabel, locale) : pick(T.failLabel, locale)}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-4 bg-ink px-5 py-6 text-canvas">
              <p
                className="break-words font-display text-h2 font-semibold leading-[1.1]"
                style={{
                  backgroundImage: 'linear-gradient(' + angle + 'deg, var(--accent), var(--line))',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {pick(T.contrastTitle, locale)}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-line">
                bg-ink · gradient accent → line
              </p>
            </div>
            <div className="flex flex-col gap-4 border border-line bg-raised px-5 py-6">
              <p
                className="break-words font-display text-h3 font-semibold leading-[1.2]"
                style={gradient}
              >
                {pick(T.angleTitle, locale)}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                bg-raised · gradient accent → ink-2
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="live-gt-fallback" className="px-5 py-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-6 border-t border-line pt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 id="live-gt-fallback" className="font-display text-h2 text-ink">
              {pick(T.fallbackTitle, locale)}
            </h3>
            <button
              type="button"
              aria-pressed={fallback}
              onClick={() => setFallback((value) => !value)}
              className="border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2 transition-colors hover:border-ink hover:text-ink"
            >
              {pick(T.simulateLabel, locale)}: {fallback ? pick(T.simulateOn, locale) : pick(T.simulateOff, locale)}
            </button>
          </div>
          <p className="max-w-[62ch] text-body text-ink-2">{pick(T.fallbackNote, locale)}</p>
          <p
            className="max-w-[30ch] break-words font-display text-h1 font-semibold leading-[1.08]"
            style={gradient}
          >
            {pick(T.wrapSample, locale)}
          </p>
          <p className="max-w-[62ch] text-caption text-muted">{pick(T.simulateNote, locale)}</p>
        </div>
      </section>

      {T.sections.map((section, index) => (
        <section
          key={section.title.en}
          aria-labelledby={'live-gt-section-' + index}
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
              <h3 id={'live-gt-section-' + index} className="font-display text-h2 text-ink">
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
            <span className="stamp">T-03</span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <pre className="well self-start overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
              {INLINE_SNIPPET(angle)}
            </pre>
            <div className="flex flex-col gap-3">
              <p className="text-caption text-ink-2">{pick(T.codeNote, locale)}</p>
              <p className="text-caption text-muted">{pick(T.reducedNote, locale)}</p>
              <Link
                to={entryPath('gradient-text')}
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
