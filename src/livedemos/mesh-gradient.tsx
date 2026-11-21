import { usePrefersReducedMotion } from '../lib/motion'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * Whole-page mesh gradient.
 *
 * Five radial layers sit on a fixed dark field; a slow transform on the field and
 * one accent layer keeps the colour slowly moving without touching background
 * positions. Text blocks are opaque paper, so contrast does not depend on where
 * the blobs currently are.
 */

const T = {
  eyebrow: { zh: '现场 · 渐变网格', en: 'LIVE · MESH GRADIENT' },
  title: { zh: '五个中心，没有一条轴', en: 'Five centres, no axis' },
  lede: {
    zh: '这一页没有演示框。整块视口是一张由五层 radial-gradient 叠出来的色场，色斑在缓慢地缩放和转动。渐变网格的重点不是「有渐变」，而是颜色在二维上互相混合，找不到一条从头走到尾的渐变轴。',
    en: 'There is no demo box here. The viewport is a colour field stacked from five radial-gradients, and the field slowly scales and turns. The point of a mesh gradient is not that it has a gradient, but that colour mixes in two dimensions with no single axis running from one end to the other.',
  },
  hint: { zh: '向下滚动，看色场和纸面的关系', en: 'Scroll down and watch the field against the paper' },
  statusLive: {
    zh: '色场正在缓慢漂移：24s 缩放、19s 独立色斑。系统开启「减少动态效果」后会停在当前构图。',
    en: 'The field is drifting slowly: a 24s scale and a 19s independent blob. Reduced motion holds the current composition.',
  },
  statusReduced: {
    zh: '系统偏好减少动态效果，漂移已停；五层色场与混合关系原样保留。',
    en: 'The system prefers reduced motion, so the drift is stopped; the five layers and their mixing remain.',
  },
  specRows: [
    { label: { zh: '色斑层', en: 'Layers' }, value: '5 + 1' },
    { label: { zh: '色标', en: 'Stops' }, value: '58%' },
    { label: { zh: '整层模糊', en: 'Blur' }, value: '0px' },
    { label: { zh: '底线', en: 'Base' }, value: '#101018' },
  ],
  sections: [
    {
      title: { zh: '叠出来的色场', en: 'A field built by stacking' },
      figure: ['5 × radial-gradient', 'no mesh-gradient property', 'base #101018'],
      body: {
        zh: 'CSS 里没有 mesh-gradient 这个属性。做法是把五层 radial-gradient 叠在同一张背景上：每层一个圆心、一个颜色，最底下垫一块深中性色。五层各自负责一个区域，交界处由透明度自然过渡，于是颜色在二维上互相渗透，而不是沿一条线走。层数不是越多越好：四到六层足够铺满一屏，超过七八层重绘会明显变慢。',
        en: 'CSS has no mesh-gradient property. The technique is to stack five radial-gradients on one background: each has a centre and a colour, over a dark neutral base. Each layer owns one region and the transparent edges blend, so colour bleeds in two dimensions instead of running along a line. More layers is not better: four to six fill a screen, and past seven or eight repainting slows noticeably.',
      },
    },
    {
      title: { zh: '色标早退，边缘才软', en: 'Stop early, blend soft' },
      figure: ['stop at 50–70%', 'rgba(r,g,b,0)', 'scale(1.2)–scale(1.5)'],
      body: {
        zh: '色标不要停到 100%：那样每层会留下一个硬边，叠起来能看到一圈圈轮廓。让颜色在 50%–70% 处就开始淡出，相邻两层才有重叠区。透明端要写同一颜色的 rgba(...,0)，不要写 transparent——部分浏览器会拿它和黑色混合，边缘发灰。整层加模糊时把元素放大到 1.2 以上，否则模糊会从元素边界透出透明的边。',
        en: 'Do not place the colour stop at 100%: each layer then keeps a hard edge and the stack shows rings of outline. Let the colour fade from 50% to 70% so neighbours overlap. Write the transparent end as rgba(r,g,b,0) of the same colour, not transparent: some browsers mix that with black and leave a grey rim. When blurring the layer, scale it past 1.2, or the blur bleeds a transparent edge at the element boundary.',
      },
    },
    {
      title: { zh: '动画只动整层', en: 'Animate the layer, not the stops' },
      figure: ['transform: scale/rotate', 'never background-position', '18–26s ease-in-out'],
      body: {
        zh: '让色场动起来最便宜的方式，是给整层加一个很慢的 transform：缩放 1.22–1.34、转动几度，18–26s 一个来回。合成器搬的是已经画好的位图，渐变不用重算。如果改成每帧改 background-position 或每个色斑的坐标，浏览器就要重新计算五层渐变，成本立刻上一个量级。色相旋转也一样：filter: hue-rotate() 作用在整层合成面上，适合做一次换肤，不适合常驻动画。',
        en: 'The cheapest way to move the field is one very slow transform on the whole layer: scale from 1.22 to 1.34 and rotate a few degrees over 18–26s. The compositor moves a painted bitmap, so the gradients are not recomputed. Animating background-position or each blob position per frame forces the browser to recompute five gradients, which costs an order of magnitude more. Hue rotation is the same: filter: hue-rotate() covers the whole composite, fine for a one-off theme change, not for a permanent animation.',
      },
    },
    {
      title: { zh: '对面是一张图或一段视频', en: 'The alternative is an image or a video' },
      figure: ['CSS: ~0 KB', 'image: 80–300 KB', 'video: 2–8 MB'],
      body: {
        zh: '同样一块背景，换成图片通常是 80–300KB 的 WebP/AVIF，分辨率固定，换配色要重新出图；换成视频是 2–8MB，还要解码、耗电，很多浏览器默认不自动播放。CSS 版本几乎不占传输体积，任何视口都清晰，改一个色值就能整套换色。代价是绘制：大屏上五层渐变加模糊仍然要 GPU 填充率。要真实纹理、插画或品牌主视觉时，图片和视频仍然更合适；要一块可缩放、可换色的色场时，才是网格渐变。',
        en: 'For the same background, an image is typically 80–300KB of WebP or AVIF, at a fixed resolution, and a recolour means a new export. A video is 2–8MB, needs decoding, drains battery, and many browsers refuse to autoplay it. The CSS version costs almost no transfer, stays sharp at any viewport, and a single colour change recolours the whole thing. The price is paint: five gradient layers plus blur still need GPU fill rate on a large screen. For real texture, illustration or key brand art, images and video remain the right tool; for a colour field that scales and recolours, a mesh gradient is.',
      },
    },
  ],
  compareTitle: { zh: '三种背景的成本', en: 'Three ways to fill the same screen' },
  compare: [
    {
      title: { zh: '五层 CSS', en: 'Five CSS layers' },
      rows: [
        { label: { zh: '传输', en: 'Transfer' }, value: { zh: '约 0 KB，只有代码', en: 'about 0 KB, code only' } },
        { label: { zh: '分辨率', en: 'Resolution' }, value: { zh: '任意视口都清晰', en: 'sharp at any viewport' } },
        { label: { zh: '换色', en: 'Recolour' }, value: { zh: '改一个变量或 hue-rotate', en: 'one variable or hue-rotate' } },
        { label: { zh: '代价', en: 'Cost' }, value: { zh: '大屏绘制、宽色域色带', en: 'paint on large screens, banding' } },
      ],
    },
    {
      title: { zh: '一张图片', en: 'One image' },
      rows: [
        { label: { zh: '传输', en: 'Transfer' }, value: { zh: '80–300 KB（WebP/AVIF）', en: '80–300 KB (WebP/AVIF)' } },
        { label: { zh: '分辨率', en: 'Resolution' }, value: { zh: '固定，需按 2x 导出', en: 'fixed, export at 2x' } },
        { label: { zh: '换色', en: 'Recolour' }, value: { zh: '重新出图', en: 'export again' } },
        { label: { zh: '代价', en: 'Cost' }, value: { zh: '带宽、缓存、适配', en: 'bandwidth, cache, sizing' } },
      ],
    },
    {
      title: { zh: '一段视频', en: 'One video' },
      rows: [
        { label: { zh: '传输', en: 'Transfer' }, value: { zh: '2–8 MB', en: '2–8 MB' } },
        { label: { zh: '分辨率', en: 'Resolution' }, value: { zh: '固定，按档位切', en: 'fixed, per rendition' } },
        { label: { zh: '换色', en: 'Recolour' }, value: { zh: '重新渲染', en: 'render again' } },
        { label: { zh: '代价', en: 'Cost' }, value: { zh: '解码、耗电、自动播放限制', en: 'decode, battery, autoplay limits' } },
      ],
    },
  ],
  themeTitle: { zh: '深色主题下，纸反而更明显', en: 'In dark theme the paper stands out more' },
  themeBody: {
    zh: '色场本身是深色，所以浅色主题里文字块像一叠亮纸浮在上面；切到深色主题后纸面变黑，边界只剩一根细线，色场从缝里透出来。右边这块固定使用深色 token，可以对照下面的背景看两种关系。',
    en: 'The field is dark, so in the light theme the text blocks read as bright sheets floating on it. Switch to dark theme and the sheets turn near-black, only a hairline marks the edge, and the field shows through the gaps. The panel on the right forces the dark tokens so you can compare the two relationships against the same background.',
  },
  themeLabel: { zh: '深色主题样本', en: 'DARK THEME SPECIMEN' },
  themeSampleTitle: { zh: '同一片色场，另一张纸', en: 'Same field, another sheet' },
  themeSampleBody: { zh: '边界靠 1px 细线，不靠投影。', en: 'The edge is a 1px line, never a shadow.' },
  paramsTitle: { zh: '推荐取值', en: 'Recommended values' },
  params: [
    { label: { zh: '色斑层数', en: 'Blob layers' }, value: { zh: '4–6 层', en: '4–6 layers' } },
    { label: { zh: '色标停靠', en: 'Color stops' }, value: { zh: '50%–70% 处提前淡出', en: 'fade out at 50%–70%' } },
    { label: { zh: '整层模糊', en: 'Layer blur' }, value: '0–40px' },
    { label: { zh: '放大倍数', en: 'Scale up' }, value: '1.2–1.5' },
    { label: { zh: '底色', en: 'Base colour' }, value: { zh: '#101018 一类深中性色', en: 'a dark neutral such as #101018' } },
    { label: { zh: '宽色域色带', en: 'Wide-gamut banding' }, value: { zh: '叠 3%–8% 颗粒噪点', en: 'add 3%–8% grain' } },
  ],
  codeTitle: { zh: '这一页背后的 CSS', en: 'The CSS behind this page' },
  codeNote: {
    zh: '五层径向渐变加一块底色，透明端全部写成同色 rgba(...,0)。动画只加在整层上，减少动态时停在当前构图，色场不会消失。',
    en: 'Five radial gradients over one base colour, with every transparent end written as rgba(r,g,b,0). The animation lives on the layer only; reduced motion holds the composition and the field stays.',
  },
  back: { zh: '回到词条：渐变网格', en: 'Back to the entry: Mesh Gradient' },
} as const

const CSS_TEXT = `
.live-mesh-field {
  position: absolute;
  inset: -20%;
  animation: live-mesh-drift 24s ease-in-out infinite alternate;
  will-change: transform;
}

.live-mesh-accent {
  position: absolute;
  inset: -20%;
  opacity: 0.5;
  mix-blend-mode: screen;
  animation: live-mesh-accent 19s ease-in-out infinite alternate;
  will-change: transform;
}

@keyframes live-mesh-drift {
  from { transform: scale(1.22) rotate(-2deg); }
  to   { transform: scale(1.34) rotate(4deg); }
}

@keyframes live-mesh-accent {
  from { transform: translate3d(-3%, 2%, 0) scale(1); }
  to   { transform: translate3d(4%, -3%, 0) scale(1.12); }
}

@media (prefers-reduced-motion: reduce) {
  .live-mesh-field,
  .live-mesh-accent { animation: none; }
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
  '.mesh {',
  '  background:',
  '    radial-gradient(circle at 18% 20%, rgba(255, 122, 89, 0.92), rgba(255, 122, 89, 0) 58%),',
  '    radial-gradient(circle at 82% 16%, rgba(255, 209, 102, 0.92), rgba(255, 209, 102, 0) 58%),',
  '    radial-gradient(circle at 88% 82%, rgba(6, 214, 160, 0.92), rgba(6, 214, 160, 0) 58%),',
  '    radial-gradient(circle at 22% 86%, rgba(17, 138, 178, 0.92), rgba(17, 138, 178, 0) 58%),',
  '    radial-gradient(circle at 54% 52%, rgba(123, 47, 247, 0.92), rgba(123, 47, 247, 0) 70%),',
  '    #101018;',
  '  transform: scale(1.24);',
  '  animation: mesh-drift 24s ease-in-out infinite alternate;',
  '  will-change: transform;',
  '}',
  '',
  '@keyframes mesh-drift {',
  '  from { transform: scale(1.22) rotate(-2deg); }',
  '  to   { transform: scale(1.34) rotate(4deg); }',
  '}',
  '',
  '@media (prefers-reduced-motion: reduce) {',
  '  .mesh { animation: none; }',
  '}',
].join('\n')

const BLOBS = [
  { at: '18% 20%', rgb: '255, 122, 89' },
  { at: '82% 16%', rgb: '255, 209, 102' },
  { at: '88% 82%', rgb: '6, 214, 160' },
  { at: '22% 86%', rgb: '17, 138, 178' },
  { at: '54% 52%', rgb: '123, 47, 247' },
] as const

const ACCENT_BLOBS = [
  { at: '12% 62%', rgb: '236, 72, 153' },
  { at: '78% 38%', rgb: '56, 189, 248' },
] as const

function meshBackground(blobs: ReadonlyArray<{ at: string; rgb: string }>, stop: number) {
  const layers = blobs.map(
    (blob) =>
      'radial-gradient(circle at ' +
      blob.at +
      ', rgba(' +
      blob.rgb +
      ', 0.92) 0%, rgba(' +
      blob.rgb +
      ', 0) ' +
      stop +
      '%)',
  )
  return layers.join(', ')
}

export default function MeshGradientLive() {
  const locale = useLocale()
  const reduced = usePrefersReducedMotion()

  return (
    <div className="relative isolate bg-canvas pb-28">
      <style>{CSS_TEXT}</style>

      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#101018]">
        <div
          className="live-mesh-field"
          style={{ background: meshBackground(BLOBS, 58) }}
        />
        <div
          className="live-mesh-accent"
          style={{ background: meshBackground(ACCENT_BLOBS, 46) }}
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
          aria-labelledby={'live-mesh-section-' + index}
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
                id={'live-mesh-section-' + index}
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

      <section aria-label={pick(T.compareTitle, locale)} className="px-5 py-16 sm:px-8">
        <div className="mx-auto w-full max-w-[88rem] border-t border-line pt-6">
          <h2 className="max-w-[64ch] bg-canvas/95 px-5 py-3 font-display text-h2 text-ink">
            {pick(T.compareTitle, locale)}
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {T.compare.map((card) => (
              <div key={card.title.en} className="well bg-surface p-4">
                <p className="font-display text-h3 text-ink">{pick(card.title, locale)}</p>
                <dl className="mt-3 flex flex-col">
                  {card.rows.map((row) => (
                    <div key={row.label.en} className="border-b border-line py-2 last:border-b-0">
                      <dt className="label-mono">{pick(row.label, locale)}</dt>
                      <dd className="mt-1 text-caption text-ink-2">
                        {typeof row.value === 'string' ? row.value : pick(row.value, locale)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              style={{ background: meshBackground(BLOBS.slice(0, 3), 58) }}
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
            <span className="label-mono">5 + 1</span>
          </div>
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
            <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
              {CSS_SNIPPET}
            </pre>
            <div className="flex flex-col gap-3 bg-canvas/95 px-5 py-4">
              <p className="text-caption text-ink-2">{pick(T.codeNote, locale)}</p>
              <Link
                to={entryPath('mesh-gradient')}
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
