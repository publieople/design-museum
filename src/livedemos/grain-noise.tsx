import { usePrefersReducedMotion } from '../lib/motion'
import { noiseUrl } from '../lib/noise'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * Whole-page grain noise.
 *
 * A fixed warm gradient carries a fixed noise layer made from an SVG feTurbulence
 * data URI. The layer sits under the content: grain is a surface material, and
 * text keeps its own opaque paper so contrast never depends on the noise.
 */

const T = {
  eyebrow: { zh: '现场 · 颗粒噪点', en: 'LIVE · GRAIN NOISE' },
  title: { zh: '整块画面共用一层砂', en: 'One layer of sand over the whole frame' },
  lede: {
    zh: '这一页没有演示框。视口是一整块渐变，上面压着一层 160px 的 SVG feTurbulence 噪点；滚动时噪点不动，纸面在它上面走。颗粒只有在整页尺度上才像「材质」，缩进一张卡片里就只是一块纹理贴图。',
    en: 'There is no demo box here. The viewport is one large gradient with a 160px SVG feTurbulence noise layer over it; the grain does not move while the paper sheets scroll across it. Grain reads as a material only at page scale; shrunk into a card it is just a texture swatch.',
  },
  hint: { zh: '向下滚动，注意噪点不跟内容一起走', en: 'Scroll down and notice the grain does not travel with the content' },
  statusLive: {
    zh: '抖动正在跑：steps(6, end)、0.8s 一轮，只改 transform。开启「减少动态效果」后停掉抖动，颗粒层保留。',
    en: 'The jitter is running: steps(6, end) over 0.8s, transform only. Reduced motion stops the jitter and keeps the grain layer.',
  },
  statusReduced: {
    zh: '系统偏好减少动态效果，抖动已停；颗粒层、频率和强度都还在，材质本身不需要降级。',
    en: 'The system prefers reduced motion, so the jitter is stopped; the grain layer, its frequency and strength remain. The material itself needs no fallback.',
  },
  specRows: [
    { label: { zh: '频率', en: 'Frequency' }, value: '0.70' },
    { label: { zh: '八度', en: 'Octaves' }, value: '3' },
    { label: { zh: '瓦片', en: 'Tile' }, value: '160px' },
    { label: { zh: '强度', en: 'Opacity' }, value: '9%' },
  ],
  sections: [
    {
      title: { zh: '它是一种材质，不是一个物件', en: 'A material, not an object' },
      figure: ['fixed layer', '160px tile', 'under the content'],
      body: {
        zh: '颗粒描述的是「表面」，不是画面上某个东西。所以它必须铺得比视口更大：160px 的小瓦片重复几十次，眼睛找不到瓦片的边界，才会把它读成整块材质。缩进一张卡片，瓦片边缘和重复单元立刻显形，噪点看起来像脏点或贴图接缝。放在固定层里还有一个好处：滚动时它不跟着内容重绘，合成器只搬一次。',
        en: 'Grain describes a surface, not an object in the frame. It therefore has to cover more than the viewport: a 160px tile repeating dozens of times has no visible boundary, so the eye reads it as one material. Shrink it into a card and the tile edge and repeat unit appear at once, and the noise looks like dirt or a texture seam. A fixed layer has a second benefit: it does not repaint as content scrolls, the compositor moves it once.',
      },
    },
    {
      title: { zh: '频率决定它是砂还是云', en: 'Frequency decides sand or cloud' },
      figure: ['baseFrequency 0.5–0.9', 'numOctaves 2–4', 'opacity 3%–10%'],
      body: {
        zh: 'baseFrequency 约等于颗粒直径的倒数：0.5–0.9 之间是细砂，低于 0.3 就变成大块云雾。numOctaves 给噪声叠细节，2–4 够用，再多只是更慢。不透明度 3%–10% 通常刚好；超过 15% 画面发脏，文字对比度也一起掉。混合模式优先 overlay 或 soft-light，深色底上这两个几乎看不见，要换 normal 或提高强度。还有一步容易漏：feTurbulence 连 alpha 都是随机的，必须接一个 feColorMatrix saturate 0 转成中性灰，否则叠上去会发彩。',
        en: 'baseFrequency is roughly the inverse of the grain diameter: 0.5 to 0.9 gives fine sand, below 0.3 it becomes large clouds. numOctaves adds detail; two to four is enough and more only costs time. An opacity of 3% to 10% usually lands right; above 15% the image turns dirty and text contrast drops with it. Prefer overlay or soft-light, except on a dark base where both are nearly invisible, so switch to normal or raise the strength. One step is easy to miss: feTurbulence randomises alpha too, so add feColorMatrix saturate 0 to make it neutral grey, or the layer picks up colour.',
      },
    },
    {
      title: { zh: '它真正的工作是压色带', en: 'Its real job is hiding banding' },
      figure: ['8-bit gradient', 'bands become steps', 'grain dithers them'],
      body: {
        zh: '大面积渐变在 8 位色深下只有有限的台阶，颜色相近的地方会出现一圈圈色带。噪点给每个像素一个很小的随机偏移，把台阶打散成肉眼不敏感的颗粒，这就是手动抖动。它不改变平均亮度，所以画面不会变暗，只是多了一层质感——这是它和「蒙一块半透明黑」最本质的区别。下面这条对比带就是同一块渐变：左半边压了噪点，右半边没有。',
        en: 'A large gradient has a limited number of steps at 8-bit depth, and nearby colours show as rings of banding. Noise gives every pixel a tiny random offset that breaks those steps into grain the eye ignores: manual dithering. It does not change average brightness, so the image does not darken, it only gains texture. That is the real difference from laying a translucent black over it. The strip below is one gradient: the left half carries grain, the right half does not.',
      },
    },
    {
      title: { zh: '什么时候别用', en: 'When not to use it' },
      figure: ['dense text: no', 'video: bitrate', 'dark: normal'],
      body: {
        zh: '正文密集的页面不要整页压噪点：字缘会被颗粒啃掉，越小越明显。视频上也别用高强度的噪点，编码器会把它当成细节去保，码率跟着涨。打印时颗粒会变成网点，和印刷网屏打架。深色主题里 overlay 几乎不可见，要换 soft-light 或 normal；如果只是为了「有点质感」而把强度拉到 15% 以上，通常已经过头了。',
        en: 'Do not cover a text-heavy page with grain: it eats the edges of glyphs, worse the smaller they are. Avoid strong grain over video too, because the encoder preserves it as detail and the bitrate climbs. In print the grain turns into dots that fight the halftone screen. In dark themes overlay is nearly invisible, so switch to soft-light or normal; and if the strength is past 15% just to feel some texture, it has usually gone too far.',
      },
    },
  ],
  compareLabel: { zh: '同一块渐变', en: 'ONE GRADIENT' },
  compareYes: { zh: '左：有噪点', en: 'LEFT: WITH GRAIN' },
  compareNo: { zh: '右：无噪点', en: 'RIGHT: NO GRAIN' },
  compareNote: {
    zh: '放大看左半边：色带被随机颗粒打散，平均亮度没变。右半边是原始渐变。',
    en: 'Look closely at the left half: random grain breaks the bands while average brightness stays the same. The right half is the untouched gradient.',
  },
  themeTitle: { zh: '深色主题下，颗粒要换混合模式', en: 'On dark, grain needs another blend mode' },
  themeBody: {
    zh: '同一层噪点，在浅色主题的纸面上用 overlay 很自然；切到深色主题，纸面接近黑色，overlay 几乎不起作用。右边这块固定使用深色 token，噪点改用 soft-light 并提高强度，才能看见。这不是换了一套噪点，只是同一层在另一种底色上需要不同的混合方式。',
    en: 'The same noise layer reads naturally with overlay on light paper; in dark theme the paper is near-black and overlay does almost nothing. The panel on the right forces the dark tokens and switches the grain to soft-light at a higher strength so it shows. It is not a different noise, only the same layer needing a different blend on another base.',
  },
  themeLabel: { zh: '深色主题样本', en: 'DARK THEME SPECIMEN' },
  themeSampleTitle: { zh: 'soft-light，不是 overlay', en: 'soft-light, not overlay' },
  themeSampleBody: { zh: '底色越暗，颗粒越要靠混合模式而不是强度。', en: 'The darker the base, the more grain depends on blend mode rather than strength.' },
  paramsTitle: { zh: '推荐取值', en: 'Recommended values' },
  params: [
    { label: { zh: 'baseFrequency', en: 'baseFrequency' }, value: { zh: '0.5–0.9（低于 0.3 成云雾）', en: '0.5–0.9 (below 0.3 becomes cloud)' } },
    { label: { zh: 'numOctaves', en: 'numOctaves' }, value: '2–4' },
    { label: { zh: '颗粒直径', en: 'Grain diameter' }, value: '1–2px' },
    { label: { zh: '不透明度', en: 'Opacity' }, value: '3%–10%' },
    { label: { zh: '混合模式', en: 'Blend mode' }, value: 'overlay / soft-light / normal' },
    { label: { zh: '瓦片尺寸', en: 'Tile size' }, value: '120–200px' },
  ],
  codeTitle: { zh: '这一页背后的 SVG 与 CSS', en: 'The SVG and CSS behind this page' },
  codeNote: {
    zh: '噪点不是图片文件，是一段内联 SVG 滤镜生成的 data URI；浏览器按 160px 瓦片平铺，所以传输体积只有这段字符串。减少动态只停抖动，噪点层本身照常渲染。',
    en: 'The noise is not an image file; it is a data URI generated by an inline SVG filter, tiled at 160px by the browser, so the only transfer is that string. Reduced motion stops the jitter; the grain layer itself still renders.',
  },
  back: { zh: '回到词条：颗粒噪点', en: 'Back to the entry: Grain Noise' },
} as const

const CSS_TEXT = `
.live-grain-jitter {
  position: absolute;
  inset: -8%;
  pointer-events: none;
  animation: live-grain-jitter 0.8s steps(6, end) infinite;
}

@keyframes live-grain-jitter {
  0%   { transform: translate3d(-1.2%, -0.8%, 0); }
  20%  { transform: translate3d(0.9%, -1.4%, 0); }
  40%  { transform: translate3d(1.4%, 0.7%, 0); }
  60%  { transform: translate3d(-0.6%, 1.3%, 0); }
  80%  { transform: translate3d(-1.4%, 0.4%, 0); }
  100% { transform: translate3d(-1.2%, -0.8%, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .live-grain-jitter { animation: none; }
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
  '.grain::after {',
  '  content: "";',
  '  position: fixed;',
  '  inset: -8%;',
  '  pointer-events: none;',
  '  background-image: url("data:image/svg+xml,...");',
  '  background-repeat: repeat;',
  '  background-size: 160px 160px;',
  '  opacity: 0.08;',
  '  mix-blend-mode: overlay;',
  '  animation: grain-jitter 0.8s steps(6, end) infinite;',
  '}',
  '',
  '@keyframes grain-jitter {',
  '  0%   { transform: translate3d(-1%, -.6%, 0); }',
  '  50%  { transform: translate3d(1%, .8%, 0); }',
  '  100% { transform: translate3d(-1%, -.6%, 0); }',
  '}',
  '',
  '@media (prefers-reduced-motion: reduce) {',
  '  .grain::after { animation: none; }',
  '}',
].join('\n')

const SVG_SNIPPET = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">',
  '  <filter id="grain">',
  '    <feTurbulence type="fractalNoise"',
  '      baseFrequency="0.70"',
  '      numOctaves="3"',
  '      stitchTiles="stitch"/>',
  '    <feColorMatrix type="saturate" values="0"/>',
  '  </filter>',
  '  <rect width="100%" height="100%" filter="url(#grain)"/>',
  '</svg>',
].join('\n')

export default function GrainNoiseLive() {
  const locale = useLocale()
  const reduced = usePrefersReducedMotion()
  const noise = noiseUrl(0.7)

  return (
    <div className="relative isolate bg-canvas pb-28">
      <style>{CSS_TEXT}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #1a1714 0%, #4a4238 36%, #9c8a6e 70%, #e8d9bd 100%)',
        }}
      >
        <div
          className="live-grain-jitter"
          style={{
            backgroundImage: noise,
            backgroundRepeat: 'repeat',
            backgroundSize: '160px 160px',
            opacity: 0.09,
            mixBlendMode: 'overlay',
          }}
        />
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
          aria-labelledby={'live-grain-section-' + index}
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
                {pick(T.specRows[0].label, locale)}
              </p>
            </div>
            <div className="max-w-[64ch] bg-canvas/95 px-5 py-5 sm:px-6">
              <h2
                id={'live-grain-section-' + index}
                className="font-display text-h2 text-ink"
              >
                {pick(section.title, locale)}
              </h2>
              <p className="mt-3 text-body text-ink-2">{pick(section.body, locale)}</p>
              {index === 2 ? (
                <figure className="mt-5">
                  <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                    <span>{pick(T.compareLabel, locale)}</span>
                    <span>160px tile</span>
                  </div>
                  <div
                    className="relative mt-2 h-28 overflow-hidden border border-line-strong"
                    style={{
                      background:
                        'linear-gradient(90deg, #2c3440 0%, #6f7d90 50%, #cfd8e3 100%)',
                    }}
                  >
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{ clipPath: 'inset(0 50% 0 0)' }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: noise,
                          backgroundRepeat: 'repeat',
                          backgroundSize: '160px 160px',
                          opacity: 0.28,
                          mixBlendMode: 'overlay',
                        }}
                      />
                    </div>
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-1/2 w-px bg-canvas/80"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex justify-between gap-2 bg-canvas/80 px-3 py-1.5 font-mono text-[10px] text-ink">
                      <span>{pick(T.compareYes, locale)}</span>
                      <span>{pick(T.compareNo, locale)}</span>
                    </div>
                  </div>
                  <figcaption className="mt-2 text-caption text-muted">
                    {pick(T.compareNote, locale)}
                  </figcaption>
                </figure>
              ) : null}
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
                  'linear-gradient(135deg, #101014 0%, #26262d 48%, #4a4a54 100%)',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: noise,
                  backgroundRepeat: 'repeat',
                  backgroundSize: '160px 160px',
                  opacity: 0.35,
                  mixBlendMode: 'soft-light',
                }}
              />
            </div>
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
                  className="grid grid-cols-[8rem_minmax(0,1fr)] gap-4 border-b border-line py-2.5"
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
            <span className="label-mono">feTurbulence</span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
              {SVG_SNIPPET}
            </pre>
            <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
              {CSS_SNIPPET}
            </pre>
          </div>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
            <p className="max-w-[64ch] bg-canvas/95 px-5 py-4 text-caption text-ink-2">
              {pick(T.codeNote, locale)}
            </p>
            <Link
              to={entryPath('grain-noise')}
              className="text-link self-start bg-canvas/95 px-5 py-4 font-mono text-[11px] text-accent no-underline"
            >
              {pick(T.back, locale)} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
