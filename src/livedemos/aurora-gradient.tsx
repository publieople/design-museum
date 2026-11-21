import { usePrefersReducedMotion } from '../lib/motion'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * Whole-page aurora gradient.
 *
 * The page is the canvas: four blurred radial blobs drift behind everything on a
 * fixed dark layer. Text never sits on a demo frame; it sits on a paper scrim so
 * contrast does not depend on whichever blob happens to be underneath.
 */

const T = {
  eyebrow: { zh: '现场 · 极光渐变', en: 'LIVE · AURORA GRADIENT' },
  title: { zh: '光在纸后面慢慢走', en: 'Light drifts behind the paper' },
  lede: {
    zh: '这一页没有演示框。整块视口就是画布：四团彩色光斑在深色底上以不同速度漂移，文字只是压在上面的纸。极光渐变只有铺满视口、看不到边界时，才像极光，而不是一张卡片的背景图。',
    en: 'There is no demo box here. The viewport is the canvas: four coloured blobs drift at different speeds on a dark base, and the text is paper laid on top. An aurora gradient only reads as an aurora when it fills the viewport with no visible edge, not when it is a card background.',
  },
  hint: { zh: '向下滚动；光斑不跟滚动走，它自己走', en: 'Scroll down; the blobs drift on their own, not with the scroll' },
  statusLive: {
    zh: '四团光正在漂移：一轮 26–38s，各自错开。系统开启「减少动态效果」后会停住。',
    en: 'Four blobs are drifting now: 26–38s per loop, each offset. Turning on reduced motion stops them.',
  },
  statusReduced: {
    zh: '系统偏好减少动态效果，位移已停；静态渐变、层数与对比度都还在。',
    en: 'The system prefers reduced motion, so the drift is stopped; the still gradient, its layers and the contrast all remain.',
  },
  specLabel: { zh: '本页参数', en: 'ON THIS PAGE' },
  specRows: [
    { label: { zh: '光斑', en: 'Blobs' }, value: '4' },
    { label: { zh: '模糊', en: 'Blur' }, value: '72px' },
    { label: { zh: '一轮', en: 'Loop' }, value: '26–38s' },
    { label: { zh: '混合', en: 'Blend' }, value: 'screen' },
  ],
  sections: [
    {
      title: { zh: '一个盒子装不下它', en: 'A box cannot hold it' },
      figure: ['viewport = canvas', 'no frame', 'no outer edge'],
      body: {
        zh: '把四团光收进一张卡片，光斑的中心就落在边框里面：中间一个亮核，边缘迅速衰减，四周出现被裁断的暗边——它立刻变成「卡片背景」。铺满视口之后，中心可以落在屏幕外，光从边上漫进来，没有边界可看，也没有「外面」。这种从边缘进入的光，加上余光里缓慢的位移，才是极光的观感；它靠的是视口尺寸，不是画框。',
        en: 'Put four blobs inside a card and their centres land inside the border: a bright core, a fast falloff, and a cut-off dark rim on every side. It immediately becomes a card background. Fill the viewport instead and the centres can sit off-screen, so light spills in from the edges with no boundary to see and no outside. Light entering from the edges, plus slow motion in peripheral vision, is what makes an aurora; it depends on the viewport, not on a frame.',
      },
    },
    {
      title: { zh: '三到五团，靠 screen 相加', en: 'Three to five blobs, added with screen' },
      figure: ['3–5 blobs', 'mix-blend-mode: screen', 'negative delays'],
      body: {
        zh: '三到五团就够。每团是一个从颜色到同色透明的 radial-gradient，叠 mix-blend-mode: screen 做加色：深色底上越叠越亮，叠到七八团就糊成一片白雾，谁也认不出。给每团不同的时长和负延迟（26–38s），它们就永远不同步，看不出循环的接缝。换色相最省事的办法是给整层 filter: hue-rotate()，但它作用在整块合成面上，每帧都要重算滤镜；当一次性换肤可以，别让它一直转。',
        en: 'Three to five blobs are enough. Each is a radial-gradient from a colour to the same colour at zero alpha, stacked with mix-blend-mode: screen so the light adds: on a dark base it gets brighter, and by seven or eight blobs it is one white fog where nothing reads. Give each a different duration and a negative delay (26–38s) and they never sync, so no loop seam shows. The cheapest way to recolour is filter: hue-rotate() on the whole layer, but that filter covers the full composite and is recomputed every frame; fine as a one-off theme change, not as a permanent spin.',
      },
    },
    {
      title: { zh: '贵的是模糊，不是位移', en: 'The blur is expensive, not the movement' },
      figure: ['transform only', 'never background-position', 'will-change: 4 layers'],
      body: {
        zh: '80px 模糊的大图层每次重绘都要采一大片像素，所以每团光要放独立图层，只动 transform: translate3d 和 scale，让合成器搬已经画好的位图。不要每帧改 background-position：那会重新计算渐变，等于每帧重画。will-change: transform 加在这四层上是合理的，加到整页上只会多占显存。窄屏像素少，但 GPU 的填充率也低，375px 宽先跑一遍再上线。',
        en: 'A large layer with an 80px blur samples a wide area every time it repaints, so keep each blob on its own layer and animate only transform: translate3d and scale, letting the compositor move an already painted bitmap. Do not animate background-position per frame: that recomputes the gradient, which means repainting every frame. will-change: transform on these four layers is reasonable; on the whole page it only costs memory. A narrow screen has fewer pixels but also less GPU fill rate, so test at 375px before shipping.',
      },
    },
    {
      title: { zh: '什么时候别用', en: 'When not to use it' },
      figure: ['dense text: no', 'light theme: lower sat', 'print: no'],
      body: {
        zh: '正文密集的文档页不要用：每段都要加纸面，最后满页都是补丁。浅色主题上要把饱和度压下来，否则显脏；打印和 PDF 里它只会是一团灰。低端机、省电模式、以及开启减少动态偏好时，都应该退回静态渐变——氛围还在，只是不动。词条里「深色底效果好」不是审美偏好：screen 混合只在暗底上成立。',
        en: 'Do not use it on text-heavy document pages: every paragraph needs a paper panel and the page ends up patched. On a light theme lower the saturation or it looks muddy; in print and PDF it is just a grey wash. Low-end devices, battery saver, and reduced motion should all fall back to the still gradient: the atmosphere stays, the movement does not. The note that it works best on dark bases is not a taste preference: screen blending only works on a dark base.',
      },
    },
  ],
  themeTitle: { zh: '两种主题，同一块纸', en: 'Two themes, one sheet of paper' },
  themeBody: {
    zh: '右边这块强制使用深色主题的 token：画布、纸面、文字、细线全部换成深色值，背景的光则原样保留。对比度来自不透明的纸面，不来自光；所以深色主题下不需要另一套极光，只需要另一套纸。',
    en: 'The panel on the right forces the dark theme tokens: canvas, surface, text and hairlines all take their dark values while the background light stays exactly the same. Contrast comes from the opaque paper, not from the light, so the dark theme needs no second aurora, only a second sheet.',
  },
  themeLabel: { zh: '深色主题样本', en: 'DARK THEME SPECIMEN' },
  themeSampleTitle: { zh: '正文仍然落在纸上', en: 'Body text still lands on paper' },
  themeSampleBody: {
    zh: '光只在纸与纸之间的缝里露出来。',
    en: 'The glow only shows in the gaps between sheets.',
  },
  paramsTitle: { zh: '推荐取值', en: 'Recommended values' },
  params: [
    { label: { zh: '光斑数量', en: 'Blobs' }, value: { zh: '3–5 团', en: '3–5' } },
    { label: { zh: '模糊半径', en: 'Blur radius' }, value: '60–100px' },
    { label: { zh: '一轮时长', en: 'Loop' }, value: { zh: '20–40s，每团错开', en: '20–40s, offset per blob' } },
    { label: { zh: '混合模式', en: 'Blend' }, value: 'mix-blend-mode: screen' },
    { label: { zh: '正文对比度', en: 'Body contrast' }, value: { zh: '≥ 4.5:1，用不透明纸面兜底', en: '≥ 4.5:1, backed by an opaque sheet' } },
    { label: { zh: '色相旋转', en: 'Hue rotation' }, value: { zh: '避免每帧转整层', en: 'Never per frame on the full layer' } },
  ],
  codeTitle: { zh: '这一页背后的 CSS', en: 'The CSS behind this page' },
  codeNote: {
    zh: '光斑放在固定层里，文字层只负责可读性。减少动态时只关掉 animation，不删图层——静态渐变仍然是构图的一部分。',
    en: 'The blobs live on a fixed layer; the text layer only owns readability. Reduced motion removes the animation, not the layers: the still gradient is still the composition.',
  },
  back: { zh: '回到词条：极光渐变', en: 'Back to the entry: Aurora Gradient' },
} as const

const CSS_TEXT = `
.live-aurora-canvas {
  background:
    radial-gradient(120% 120% at 50% 0%, #0c1322 0%, #070a13 52%, #04060c 100%);
}

.live-aurora-blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(72px) saturate(150%);
  mix-blend-mode: screen;
  animation-name: live-aurora-drift;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  will-change: transform;
}

@keyframes live-aurora-drift {
  from { transform: translate3d(-6%, -3%, 0) scale(1); }
  to   { transform: translate3d(10%, 7%, 0) scale(1.16); }
}

@media (prefers-reduced-motion: reduce) {
  .live-aurora-blob { animation: none; }
}

/* Local copy of the dark theme tokens, for the specimen on this page. */
.live-dark {
  --canvas: #0e0e10;
  --surface: #151518;
  --raised: #1a1a1e;
  --ink: #f1efe9;
  --ink-2: #cbc9c1;
  --muted: #908d84;
  --line: #2d2c31;
  --line-strong: #49474f;
  --accent: #ff614a;
  color-scheme: dark;
}
`

const CSS_SNIPPET = [
  '.aurora {',
  '  position: fixed;',
  '  inset: 0;',
  '  overflow: hidden;',
  '  background: radial-gradient(120% 120% at 50% 0%, #0c1322, #04060c);',
  '}',
  '',
  '.aurora__blob {',
  '  position: absolute;',
  '  width: 70vmax;',
  '  aspect-ratio: 1;',
  '  border-radius: 50%;',
  '  background: radial-gradient(circle,',
  '    rgba(52, 211, 153, 0.55),',
  '    rgba(52, 211, 153, 0) 68%);',
  '  filter: blur(80px) saturate(150%);',
  '  mix-blend-mode: screen;',
  '  animation: aurora-drift 30s ease-in-out infinite alternate;',
  '  will-change: transform;',
  '}',
  '',
  '@keyframes aurora-drift {',
  '  from { transform: translate3d(-6%, -3%, 0) scale(1); }',
  '  to   { transform: translate3d(10%, 7%, 0) scale(1.16); }',
  '}',
  '',
  '.aurora__copy {',
  '  position: relative;',
  '  background: color-mix(in srgb, #f2f0e9 95%, transparent);',
  '}',
  '',
  '@media (prefers-reduced-motion: reduce) {',
  '  .aurora__blob { animation: none; }',
  '}',
].join('\n')

const BLOBS = [
  {
    left: '-12%',
    top: '2%',
    size: '72vmax',
    color: '52, 211, 153',
    duration: '31s',
    delay: '-3s',
  },
  {
    left: '42%',
    top: '-18%',
    size: '64vmax',
    color: '99, 102, 241',
    duration: '37s',
    delay: '-9s',
  },
  {
    left: '6%',
    top: '52%',
    size: '70vmax',
    color: '168, 85, 247',
    duration: '34s',
    delay: '-15s',
  },
  {
    left: '58%',
    top: '44%',
    size: '56vmax',
    color: '34, 211, 238',
    duration: '26s',
    delay: '-6s',
  },
] as const

export default function AuroraGradientLive() {
  const locale = useLocale()
  const reduced = usePrefersReducedMotion()

  return (
    <div className="relative isolate bg-canvas pb-28">
      <style>{CSS_TEXT}</style>

      <div
        aria-hidden="true"
        className="live-aurora-canvas pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        {BLOBS.map((blob) => (
          <span
            key={blob.color}
            className="live-aurora-blob"
            style={{
              left: blob.left,
              top: blob.top,
              width: blob.size,
              height: blob.size,
              background:
                'radial-gradient(circle, rgba(' +
                blob.color +
                ', 0.55) 0%, rgba(' +
                blob.color +
                ', 0) 68%)',
              animationDuration: blob.duration,
              animationDelay: blob.delay,
            }}
          />
        ))}
      </div>

      <section
        aria-label={pick(T.title, locale)}
        className="flex min-h-[92svh] items-center px-5 py-16 sm:px-8"
      >
        <div className="mx-auto w-full max-w-[88rem]">
          <div className="max-w-[62rem] border-l-2 border-accent bg-canvas/95 p-6 sm:p-10">
            <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
            <h2 className="mt-4 max-w-[17ch] font-display text-display font-semibold leading-[1.04] text-ink">
              {pick(T.title, locale)}
            </h2>
            <p className="mt-5 max-w-[58ch] text-body text-ink-2">{pick(T.lede, locale)}</p>
            <p className="mt-5 flex items-center gap-2 font-mono text-[11px] text-muted">
              <span aria-hidden="true" className="inline-block h-2 w-2 bg-accent" />
              {pick(T.hint, locale)} ↓
            </p>
            <p className="mt-4 max-w-[60ch] border-t border-line pt-3 text-caption text-muted">
              {reduced ? pick(T.statusReduced, locale) : pick(T.statusLive, locale)}
            </p>
          </div>

          <dl className="mt-4 grid max-w-[62rem] grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
            {T.specRows.map((row) => (
              <div key={row.label.en} className="bg-canvas/95 px-4 py-3">
                <dt className="label-mono">{pick(row.label, locale)}</dt>
                <dd className="mt-1 font-mono text-[12px] text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {T.sections.map((section, index) => (
        <section
          key={section.title.en}
          aria-labelledby={'live-aurora-section-' + index}
          className="px-5 py-14 sm:px-8"
        >
          <div className="mx-auto grid w-full max-w-[88rem] gap-6 md:grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,16rem)] md:gap-10">
            <div className="bg-canvas/95 px-4 py-4 md:self-start">
              <span
                aria-hidden="true"
                className="font-display text-h1 leading-none text-line-strong"
              >
                {'0' + (index + 1)}
              </span>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                {pick(T.specLabel, locale)}
              </p>
            </div>
            <div className="max-w-[64ch] bg-canvas/95 px-5 py-5 sm:px-6">
              <h2
                id={'live-aurora-section-' + index}
                className="font-display text-h2 text-ink"
              >
                {pick(section.title, locale)}
              </h2>
              <p className="mt-3 text-body text-ink-2">{pick(section.body, locale)}</p>
            </div>
            <pre className="well self-start overflow-x-auto p-3 font-mono text-[10px] leading-relaxed text-muted">
              {section.figure.join('\n')}
            </pre>
          </div>
        </section>
      ))}

      <section aria-label={pick(T.themeTitle, locale)} className="px-5 py-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-[88rem] gap-6 border-t border-line pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          <div className="max-w-[64ch] bg-canvas/95 px-5 py-5">
            <h2 className="font-display text-h2 text-ink">{pick(T.themeTitle, locale)}</h2>
            <p className="mt-3 text-body text-ink-2">{pick(T.themeBody, locale)}</p>
          </div>
          <div className="live-dark relative overflow-hidden border border-line bg-canvas p-5">
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(70% 90% at 18% 0%, rgba(52, 211, 153, 0.42), transparent 62%), radial-gradient(70% 90% at 92% 100%, rgba(168, 85, 247, 0.4), transparent 64%), radial-gradient(60% 80% at 80% 10%, rgba(34, 211, 238, 0.26), transparent 66%)',
              }}
            />
            <div className="relative">
              <p className="label-mono text-accent">{pick(T.themeLabel, locale)}</p>
              <p className="mt-3 font-display text-h3 text-ink">
                {pick(T.themeSampleTitle, locale)}
              </p>
              <p className="mt-2 max-w-[30ch] text-caption text-ink-2">
                {pick(T.themeSampleBody, locale)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label={pick(T.paramsTitle, locale)} className="px-5 py-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-[88rem] gap-6 border-t border-line pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
          <div className="max-w-[64ch] bg-canvas/95 px-5 py-5">
            <h2 className="font-display text-h2 text-ink">{pick(T.paramsTitle, locale)}</h2>
            <dl className="mt-4 flex flex-col">
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

      <section aria-label={pick(T.codeTitle, locale)} className="px-5 py-16 pb-28 sm:px-8">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-5">
          <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-3">
            <h2 className="font-display text-h3 text-ink">{pick(T.codeTitle, locale)}</h2>
            <span className="label-mono">fixed + screen</span>
          </div>
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
            <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
              {CSS_SNIPPET}
            </pre>
            <div className="flex flex-col gap-3 bg-canvas/95 px-5 py-4">
              <p className="text-caption text-ink-2">{pick(T.codeNote, locale)}</p>
              <Link
                to={entryPath('aurora-gradient')}
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
