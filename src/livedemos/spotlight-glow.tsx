import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../lib/motion'
import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { Link } from '../lib/router'
import { entryPath } from '../lib/routes'

/**
 * Whole-page spotlight glow.
 *
 * A fixed radial glow follows the pointer across the viewport; a second, smaller
 * glow is clipped inside a dark card so the difference between ambient light and
 * a hover highlight is visible side by side. Pointer moves never call setState:
 * they write transform through requestAnimationFrame.
 */

const PAGE_GLOW = 'radial-gradient(circle at center, color-mix(in srgb, var(--accent) 34%, transparent) 0%, color-mix(in srgb, var(--accent) 11%, transparent) 36%, transparent 68%)'
const CARD_GLOW = 'radial-gradient(circle at center, color-mix(in srgb, var(--accent) 40%, transparent) 0%, color-mix(in srgb, var(--accent) 13%, transparent) 40%, transparent 70%)'
const QUIET_GLOW = 'radial-gradient(circle at center, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 70%)'

const T = {
  eyebrow: { zh: '现场 · 光晕聚光', en: 'LIVE · SPOTLIGHT GLOW' },
  title: { zh: '整页是一束环境光', en: 'The page is one pool of ambient light' },
  lede: {
    zh: '没有演示框：一块固定的柔光跟着指针在视口里移动，纸面从它上面滚过去。旁边那张深色卡片里是另一种用法——同样的光被 overflow: hidden 裁在元素内，只能照亮卡片自己。整页版让人觉得光在房间里，卡片版只是悬停高亮。',
    en: 'No demo box: a fixed soft light follows the pointer across the viewport while paper sheets scroll over it. The dark card nearby shows the other use, the same light clipped inside an element by overflow: hidden, lighting only the card. The page version feels like light in the room; the card version is just a hover highlight.',
  },
  hint: { zh: '移动指针，看光斑和纸面的关系', en: 'Move the pointer and watch the light against the paper' },
  statusLive: {
    zh: '光斑正在跟随：pointermove 只写 transform，坐标经 requestAnimationFrame 合帧，不触发 React 重渲染。',
    en: 'The glow is following: pointermove writes transform only, coordinates are coalesced in requestAnimationFrame, and React never re-renders.',
  },
  statusCoarse: {
    zh: '没有检测到精细指针（触屏或窄屏）：光斑停在页面中上部做静态环境光。这不是跟随失败，是主动不假装有光标。',
    en: 'No fine pointer was detected (touch or narrow screen), so the glow rests in the upper middle as static ambient light. This is not a failed follow; it deliberately does not pretend a cursor exists.',
  },
  statusReduced: {
    zh: '系统偏好减少动态效果：光斑不跟随指针，固定在页面中上部；卡片样本的光也停在中心。位置是静态的，内容照常可读。',
    en: 'The system prefers reduced motion, so the glow does not follow the pointer and rests in the upper middle; the card sample light also stays centred. Position is static and content stays readable.',
  },
  specRows: [
    { label: { zh: '直径', en: 'Diameter' }, value: '46rem' },
    { label: { zh: '峰值', en: 'Peak alpha' }, value: '0.34' },
    { label: { zh: '过渡', en: 'Transition' }, value: '120ms' },
    { label: { zh: '混合', en: 'Blend' }, value: 'screen' },
  ],
  sections: [
    {
      title: { zh: '环境光，还是悬停高亮', en: 'Ambient light, or a hover highlight' },
      figure: ['page: fixed light', 'card: clipped light', 'same gradient'],
      body: {
        zh: '同样一段 radial-gradient，铺在视口上就是环境光：它从纸面边缘露出来，随指针在整页移动，人会觉得房间里有光源。裁进一张卡片，它就退化成悬停高亮——只在元素内部出现，移出就消失。判断该用哪种，看你想让光属于「空间」还是属于「控件」。整页版还有一个副作用：光会从文字面板的四周漏出来，所以面板必须是不透明或接近不透明的纸，不能靠光斑本身保证对比度。',
        en: 'The same radial-gradient spread over the viewport becomes ambient light: it shows around the edges of paper sheets and moves across the page with the pointer, so the room feels lit. Clipped into a card it degrades into a hover highlight that exists only inside the element and disappears on leave. Decide by whether the light belongs to the space or to the control. The page version has one side effect: light leaks around the text panels, so those panels must be opaque or near-opaque paper; contrast cannot depend on the glow itself.',
      },
    },
    {
      title: { zh: '每帧只写 transform', en: 'Write transform, once per frame' },
      figure: ['no setState', 'rAF coalescing', 'cached rect'],
      body: {
        zh: 'pointermove 一秒能来上百次，用 setState 存坐标等于每帧重渲染整棵子树，页面很快就会掉帧。做法是直接把位置写进元素：坐标先存进局部变量，requestAnimationFrame 到期时改一次 style.transform。卡片版还要读 getBoundingClientRect，但这个读取也不该每次移动都做——在 pointerenter、滚动和 resize 时缓存，移动时只用缓存值。过渡给 80–160ms ease-out，让光有一点惯性；再长就会明显拖在后面。',
        en: 'pointermove can fire a hundred times a second, so storing the position in state re-renders the whole subtree every frame and drops frames quickly. Write the position straight to the element instead: keep coordinates in local variables and change style.transform once when requestAnimationFrame fires. The card version also needs getBoundingClientRect, but not on every move: cache it on pointerenter, scroll and resize, and read the cache while moving. A transition of 80 to 160ms ease-out gives the light a little inertia; longer and it visibly trails behind.',
      },
    },
    {
      title: { zh: '尺寸、强度、衰减', en: 'Size, strength, falloff' },
      figure: ['320–560px', '0.10–0.25', 'screen / soft-light'],
      body: {
        zh: '光斑直径 320–560px 最像手电；太小像光标，太大整页发白。峰值不透明度 0.10–0.25，超过 0.3 就会盖住纸面纹理。衰减用 radial-gradient 的多段色标做，中心到 40% 左右还亮，60%–70% 归零，边缘才不会有硬圈。混合模式优先 screen（暗底）或 soft-light（亮底）；移出时用 150–250ms 淡出，不要瞬间消失。卡片很宽时，光斑要给固定 px 直径而不是百分比，否则会被拉成椭圆。',
        en: 'A diameter of 320 to 560px reads most like a torch; smaller looks like a cursor and larger washes the page out. Peak opacity sits at 0.10 to 0.25, and past 0.3 it covers the paper texture. Build the falloff from several radial-gradient stops that stay bright to about 40% and reach zero at 60% to 70%, so the edge has no hard ring. Prefer screen on dark and soft-light on light, and fade out over 150 to 250ms instead of vanishing. On a wide card, give the glow a fixed px diameter, not a percentage, or it stretches into an ellipse.',
      },
    },
    {
      title: { zh: '触屏与减少动态', en: 'Touch screens and reduced motion' },
      figure: ['no hover on touch', 'static centre', 'no transition'],
      body: {
        zh: '触屏没有悬停，跟着手指跑的光会挡住内容，也容易被当成加载状态。用 media (pointer: coarse) 判断，直接给一个居中的静态光斑，并明确告诉用户这是设计而不是故障。prefers-reduced-motion 下同理：去掉过渡和跟随，让光停在固定位置；不要写「已按系统设置减少动态」这种谎报，条件式说明当前状态就够了。两种降级都不需要删掉光斑，静态光本身仍然是有效的视觉层次。',
        en: 'Touch screens have no hover, and a light chasing a finger covers content and can read as a loading state. Use media (pointer: coarse) to place a static centred glow and say plainly that it is a design choice, not a failure. The same applies under prefers-reduced-motion: remove the transition and the follow, and leave the light at a fixed position. Do not claim the system setting was applied when it was not; a conditional sentence about the current state is enough. Neither fallback needs to delete the glow, because static light still does useful visual work.',
      },
    },
  ],
  cardEyebrow: { zh: '可交互样本', en: 'INTERACTIVE SPECIMEN' },
  cardTitle: { zh: '被裁在卡片里的光', en: 'Light clipped inside a card' },
  cardBody: {
    zh: '把指针移进这块深色面板。光斑直径固定 380px，被 overflow: hidden 裁掉，纸面外不会漏光。',
    en: 'Move the pointer into this dark panel. The glow has a fixed 380px diameter and is clipped by overflow: hidden, so no light leaks outside the card.',
  },
  cardMeta: { zh: '380px · overflow: hidden · rect 缓存', en: '380px · overflow: hidden · cached rect' },
  themeTitle: { zh: '光斑需要暗底', en: 'A spotlight needs a dark base' },
  themeBody: {
    zh: 'screen 混合在浅色纸面上几乎等于什么都不做——下面左边那块就是证据，同样的光只剩一圈很淡的红。右边换成深色 token，光斑立刻成立。这也解释了为什么聚光几乎总出现在深色界面：不是风格偏好，是混合模式在亮底上没有可加的光。',
    en: 'Screen blend on light paper is close to doing nothing: the left panel below is the evidence, where the same light leaves only a faint red ring. Switch to the dark tokens on the right and the glow works at once. That is also why spotlights almost always live on dark interfaces: not a style preference, but the blend mode having no light to add on a bright base.',
  },
  themeLightLabel: { zh: '浅色纸面', en: 'LIGHT PAPER' },
  themeLightNote: { zh: 'screen：几乎不可见', en: 'screen: nearly invisible' },
  themeDarkLabel: { zh: '深色面板', en: 'DARK PANEL' },
  themeDarkNote: { zh: 'screen：光斑成立', en: 'screen: the glow works' },
  paramsTitle: { zh: '推荐取值', en: 'Recommended values' },
  params: [
    { label: { zh: '光斑直径', en: 'Diameter' }, value: '320–560px' },
    { label: { zh: '峰值不透明度', en: 'Peak opacity' }, value: '0.10–0.25' },
    { label: { zh: '位置过渡', en: 'Position transition' }, value: '80–160ms ease-out' },
    { label: { zh: '移出淡出', en: 'Leave fade' }, value: '150–250ms' },
    { label: { zh: '混合模式', en: 'Blend mode' }, value: 'screen / soft-light' },
    { label: { zh: '触屏', en: 'Touch' }, value: { zh: '静态居中光斑', en: 'static centred glow' } },
  ],
  codeTitle: { zh: '这一页的指针循环', en: 'The pointer loop on this page' },
  codeNote: {
    zh: '位置不经过 React：pointermove 只更新局部变量，rAF 里改一次 transform。reduced 或 coarse 时不挂监听，光斑保持静态，代码路径和文案一致。',
    en: 'Position never passes through React: pointermove updates local variables and rAF changes transform once. Under reduced motion or a coarse pointer no listener is attached, the glow stays static, and the code path matches the copy.',
  },
  back: { zh: '回到词条：光晕聚光', en: 'Back to the entry: Spotlight Glow' },
} as const

const CSS_TEXT = `
.live-spot {
  position: absolute;
  left: 50%;
  top: 50%;
  pointer-events: none;
  transform: translate3d(0, 0, 0) translate(-50%, -50%);
  transition: transform 120ms ease-out, opacity 180ms ease-out;
  will-change: transform, opacity;
}

.live-spot-page {
  top: 45%;
  width: 46rem;
  height: 46rem;
  mix-blend-mode: screen;
}

.live-spot-card {
  width: 380px;
  height: 380px;
  mix-blend-mode: screen;
}

@media (max-width: 640px) {
  .live-spot-page { width: 30rem; height: 30rem; }
}

@media (prefers-reduced-motion: reduce) {
  .live-spot { transition: none; }
}

/* Local copy of the dark theme tokens, for the specimens on this page. */
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
  '.spotlight {',
  '  position: fixed;',
  '  left: 50%;',
  '  top: 45%;',
  '  width: 46rem;',
  '  height: 46rem;',
  '  pointer-events: none;',
  '  background: radial-gradient(circle,',
  '    color-mix(in srgb, var(--accent) 34%, transparent) 0%,',
  '    color-mix(in srgb, var(--accent) 11%, transparent) 36%,',
  '    transparent 68%);',
  '  transform: translate(-50%, -50%);',
  '  transition: transform 120ms ease-out;',
  '  will-change: transform;',
  '}',
  '',
  '@media (pointer: coarse) {',
  '  .spotlight { transition: none; }',
  '}',
  '',
  '@media (prefers-reduced-motion: reduce) {',
  '  .spotlight { transition: none; }',
  '}',
].join('\n')

const JS_SNIPPET = [
  'const glow = document.querySelector(".spotlight");',
  'let frame = 0;',
  'let x = 0;',
  'let y = 0;',
  '',
  'function paint() {',
  '  frame = 0;',
  '  glow.style.transform =',
  '    "translate3d(" + (x - innerWidth / 2) + "px," +',
  '    (y - innerHeight * 0.45) + "px, 0) translate(-50%, -50%)";',
  '}',
  '',
  'window.addEventListener("pointermove", (event) => {',
  '  x = event.clientX;',
  '  y = event.clientY;',
  '  if (!frame) frame = requestAnimationFrame(paint);',
  '}, { passive: true });',
].join('\n')

function useFinePointer() {
  const [fine, setFine] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(pointer: fine)')
    const sync = () => setFine(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  return fine
}

function SpotCard({ active, background }: { active: boolean; background: string }) {
  const locale = useLocale()
  const cardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return
    const card = cardRef.current
    const glow = glowRef.current
    if (!card || !glow) return

    let rect = card.getBoundingClientRect()
    let frame = 0
    let dx = 0
    let dy = 0

    const refresh = () => {
      rect = card.getBoundingClientRect()
    }

    const paint = () => {
      frame = 0
      glow.style.transform =
        'translate3d(' + dx + 'px, ' + dy + 'px, 0) translate(-50%, -50%)'
    }

    const onMove = (event: PointerEvent) => {
      dx = event.clientX - rect.left - rect.width / 2
      dy = event.clientY - rect.top - rect.height / 2
      if (!frame) frame = requestAnimationFrame(paint)
    }

    const onEnter = () => {
      refresh()
      glow.style.opacity = '1'
    }

    const onLeave = () => {
      dx = 0
      dy = 0
      glow.style.opacity = '0'
      if (!frame) frame = requestAnimationFrame(paint)
    }

    glow.style.opacity = '0'
    card.addEventListener('pointermove', onMove, { passive: true })
    card.addEventListener('pointerenter', onEnter)
    card.addEventListener('pointerleave', onLeave)
    window.addEventListener('scroll', refresh, { passive: true })
    window.addEventListener('resize', refresh)

    return () => {
      card.removeEventListener('pointermove', onMove)
      card.removeEventListener('pointerenter', onEnter)
      card.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', refresh)
      window.removeEventListener('resize', refresh)
      if (frame) cancelAnimationFrame(frame)
      glow.style.opacity = '1'
      glow.style.transform = ''
    }
  }, [active])

  return (
    <div
      ref={cardRef}
      className="live-dark relative mt-5 min-h-[16rem] overflow-hidden border border-line-strong bg-canvas"
    >
      <div aria-hidden="true" ref={glowRef} className="live-spot live-spot-card" style={{ background }} />
      <div className="relative p-6">
        <p className="label-mono text-accent">{pick(T.cardEyebrow, locale)}</p>
        <p className="mt-3 font-display text-h3 text-ink">{pick(T.cardTitle, locale)}</p>
        <p className="mt-2 max-w-[36ch] text-caption text-ink-2">{pick(T.cardBody, locale)}</p>
        <p className="mt-8 font-mono text-[10px] text-muted">{pick(T.cardMeta, locale)}</p>
      </div>
    </div>
  )
}

export default function SpotlightGlowLive() {
  const locale = useLocale()
  const reduced = usePrefersReducedMotion()
  const fine = useFinePointer()
  const live = fine && !reduced
  const pageGlowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!live) return
    const glow = pageGlowRef.current
    if (!glow) return

    let frame = 0
    let dx = 0
    let dy = 0

    const paint = () => {
      frame = 0
      glow.style.transform =
        'translate3d(' + dx + 'px, ' + dy + 'px, 0) translate(-50%, -50%)'
    }

    const onMove = (event: PointerEvent) => {
      dx = event.clientX - window.innerWidth / 2
      dy = event.clientY - window.innerHeight * 0.45
      if (!frame) frame = requestAnimationFrame(paint)
    }

    window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onMove)
      if (frame) cancelAnimationFrame(frame)
      glow.style.transform = ''
    }
  }, [live])

  return (
    <div className="relative isolate bg-canvas pb-28">
      <style>{CSS_TEXT}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 10%, #191b22 0%, #0b0c10 62%, #060709 100%)',
        }}
      >
        <div ref={pageGlowRef} className="live-spot live-spot-page" style={{ background: PAGE_GLOW }} />
      </div>

      <section
        aria-label={pick(T.title, locale)}
        className="flex min-h-[92svh] items-center px-5 py-16 sm:px-8"
      >
        <div className="mx-auto w-full max-w-[88rem]">
          <div className="max-w-[56rem] border-l-2 border-accent bg-canvas/95 p-6 sm:p-10">
            <p className="label-mono text-accent">{pick(T.eyebrow, locale)}</p>
            <h2 className="mt-4 max-w-[18ch] font-display text-display font-semibold leading-[1.04] text-ink">
              {pick(T.title, locale)}
            </h2>
            <p className="mt-5 max-w-[58ch] text-body text-ink-2">{pick(T.lede, locale)}</p>
            <p className="mt-5 flex items-center gap-2 font-mono text-[11px] text-muted">
              <span aria-hidden="true" className="inline-block h-2 w-2 bg-accent" />
              {pick(T.hint, locale)}
            </p>
            <p className="mt-4 max-w-[60ch] border-t border-line pt-3 text-caption text-muted">
              {reduced
                ? pick(T.statusReduced, locale)
                : fine
                  ? pick(T.statusLive, locale)
                  : pick(T.statusCoarse, locale)}
            </p>
          </div>

          <dl className="mt-4 grid max-w-[56rem] grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
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
          aria-labelledby={'live-spot-section-' + index}
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
                spotlight
              </p>
            </div>
            <div className="max-w-[64ch] bg-canvas/95 px-5 py-5 sm:px-6">
              <h2
                id={'live-spot-section-' + index}
                className="font-display text-h2 text-ink"
              >
                {pick(section.title, locale)}
              </h2>
              <p className="mt-3 text-body text-ink-2">{pick(section.body, locale)}</p>
              {index === 0 ? <SpotCard active={live} background={CARD_GLOW} /> : null}
            </div>
            <pre className="well self-start overflow-x-auto p-3 font-mono text-[10px] leading-relaxed text-muted">
              {section.figure.join('\n')}
            </pre>
          </div>
        </section>
      ))}

      <section aria-label={pick(T.themeTitle, locale)} className="px-5 py-16 sm:px-8">
        <div className="mx-auto w-full max-w-[88rem] border-t border-line pt-6">
          <div className="max-w-[64ch] bg-canvas/95 px-5 py-5">
            <h2 className="font-display text-h2 text-ink">{pick(T.themeTitle, locale)}</h2>
            <p className="mt-3 text-body text-ink-2">{pick(T.themeBody, locale)}</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="relative min-h-[14rem] overflow-hidden border border-line-strong bg-surface p-5">
              <div
                aria-hidden="true"
                className="live-spot"
                style={{ width: '18rem', height: '18rem', background: QUIET_GLOW, mixBlendMode: 'screen' }}
              />
              <div className="relative">
                <p className="label-mono text-muted">{pick(T.themeLightLabel, locale)}</p>
                <p className="mt-3 font-display text-h3 text-ink">screen</p>
                <p className="mt-2 text-caption text-ink-2">{pick(T.themeLightNote, locale)}</p>
              </div>
            </div>
            <div className="live-dark relative min-h-[14rem] overflow-hidden border border-line-strong bg-canvas p-5">
              <div
                aria-hidden="true"
                className="live-spot"
                style={{ width: '18rem', height: '18rem', background: PAGE_GLOW, mixBlendMode: 'screen' }}
              />
              <div className="relative">
                <p className="label-mono text-accent">{pick(T.themeDarkLabel, locale)}</p>
                <p className="mt-3 font-display text-h3 text-ink">screen</p>
                <p className="mt-2 text-caption text-ink-2">{pick(T.themeDarkNote, locale)}</p>
              </div>
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
                  className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-4 border-b border-line py-2.5"
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
            <span className="label-mono">pointermove</span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <pre className="well overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink-2">
              {JS_SNIPPET}
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
              to={entryPath('spotlight-glow')}
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
