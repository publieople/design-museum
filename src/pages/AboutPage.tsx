import { useLocale } from '../i18n'
import { pick } from '../i18n/pick'
import { Link } from '../lib/router'
import { SITE_BASE } from '../lib/routes'
import type { Bi } from '../data/types'

/**
 * 给 AI 用的入口。地址用 SITE_BASE 而不是 BASE_URL：
 * 这两份目录发布在固定前缀下，本地开发和线上必须指向同一个地址。
 */
const CATALOG_SNIPPET: Bi = {
  zh: `${SITE_BASE}/llms.txt      # 入口：两份目录 + 全部词条地址
${SITE_BASE}/catalog.json   # 索引：别名、关键词、标签、控件默认值、现成需求句
${SITE_BASE}/catalog.md     # 逐条全文：什么时候用、别搞混、踩坑、推荐取值
skills/design-museum/SKILL.md   # 配套 skill：装到 ~/.dsh/skills/design-museum/`,
  en: `${SITE_BASE}/llms.txt      # entry point: both catalogues + every entry URL
${SITE_BASE}/catalog.json   # index: aliases, keywords, tags, control defaults, ready briefs
${SITE_BASE}/catalog.md     # full text: when to use, confusions, pitfalls, values
skills/design-museum/SKILL.md   # the skill that teaches an agent to use them`,
}

const TEMPLATE: Bi = {
  zh: `请用 <技术栈> 实现下面这个效果，按术语的标准做法来，不要用相近但不同的做法替代：

- 效果名称：毛玻璃（Frosted Glass / backdrop blur）
- 参数：模糊半径 12px，饱和度 180%
- 技术要求：backdrop-filter: blur(12px) saturate(180%)，面板背景 rgba(255,255,255,0.08)，
  1px 半透明白描边，面板必须叠在有内容的背景上
- 不要：用纯色半透明代替（那是「半透明」，不是毛玻璃）`,
  en: `Build this effect with <stack>. Use the standard technique for the term — do not substitute a similar-looking one:

- Effect: frosted glass (backdrop blur)
- Values: blur radius 12px, saturation 180%
- Requirement: backdrop-filter: blur(12px) saturate(180%), panel background rgba(255,255,255,0.08),
  1px translucent white border, and the panel must sit over visible content
- Do not: fake it with a flat translucent fill — that is "translucent", not frosted glass`,
}

interface Section {
  title: Bi
  body: Bi[]
  link?: { to: string; label: Bi }
}

const SECTIONS: Section[] = [
  {
    title: { zh: '三步', en: 'Three steps' },
    body: [
      {
        zh: '找到它。知道名字就直接搜；不知道就按口语说法搜（「磨砂」「果冻」「卡片飘起来」），或者走感觉导航。',
        en: 'Find it. Search the name if you know it; if you do not, search a plain-language phrase ("frosted", "jelly", "card floats up"), or use Find by feel.',
      },
      {
        zh: '调到你要的样子。每个词条都有可交互演示和参数滑块。时长、缓动、模糊半径这些数值不是玄学，滑一遍就知道差异在哪；顺带也能换背景，因为毛玻璃、发光这类效果离开背景就不成立。',
        en: 'Tune it. Every entry has a live demo and sliders. Duration, easing and blur radius are not mysticism — drag once and the difference is obvious. You can also switch the backdrop, because glass and glow effects do not exist without one.',
      },
      {
        zh: '复制过去。词条页给你两版：中文需求句（带当前参数）和英文关键词（AI 最容易认的术语）。一次要加好几个效果，就去速查表勾选后整段导出。',
        en: 'Copy it. Each entry gives you two versions: a brief in Chinese with your current values, and English keywords using the terms models recognise best. Adding several effects at once? Tick them on the cheat sheet and export one block.',
      },
    ],
  },
  {
    title: { zh: '为什么术语比形容词管用', en: 'Why terms beat adjectives' },
    body: [
      {
        zh: '「高级一点的卡片」是形容词，「悬停抬升 + 12px 柔和投影 + 200ms ease-out」是名词和数值。前者要 AI 猜，后者 AI 能直接对上它训练过的实现。所以每条词条都同时给出中文名、英文术语、CSS 属性名和推荐取值——你负责挑，AI 负责落。',
        en: '"A classier card" is an adjective. "Hover lift + 12px soft shadow + 200ms ease-out" is a noun plus numbers. The first forces a guess; the second maps straight onto implementations the model has seen. That is why every entry carries a Chinese name, an English term, the CSS properties and suggested values — you choose, the model builds.',
      },
    ],
  },
  {
    title: { zh: '两个常见误区', en: 'Two common mistakes' },
    body: [
      {
        zh: '把「别搞混」当废话。这一栏专门写两个容易混的效果差在哪——它通常也是 AI 最容易做错的地方。',
        en: 'Skipping "Not to be confused with". That section exists because it is usually exactly where the model gets it wrong.',
      },
      {
        zh: '只要关键词不要参数。同一个效果在 150ms 和 600ms 下是两种气质，参数才是你那次审美判断的落点。',
        en: 'Taking the keywords but dropping the values. The same effect at 150ms and 600ms reads as two different products — the numbers are where your judgement actually lands.',
      },
    ],
  },
]

export function AboutPage() {
  const locale = useLocale()

  return (
    <article className="flex max-w-2xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-title font-display font-semibold enter enter-1">
          {locale === 'en' ? 'How to use this glossary' : '怎么用这份词典'}
        </h1>
        <p className="text-muted">
          {locale === 'en'
            ? 'This site is not here to teach you to code. It exists to close one gap: turning "I want that thing... you know, that effect" into a brief your AI gets right the first time.'
            : '这个站不为教你写代码，为的是解决一件事：把「我想要那个……嗯……就是那个效果」变成一句 AI 一次就能做对的需求。'}
        </p>
      </header>

      {SECTIONS.map((section) => (
        <section key={section.title.zh} className="flex flex-col gap-3 border-t border-line pt-5">
          <h2 className="label-mono">{pick(section.title, locale)}</h2>
          <div className="flex flex-col gap-3 text-sm text-muted">
            {section.body.map((paragraph) => (
              <p key={paragraph.zh}>{pick(paragraph, locale)}</p>
            ))}
          </div>
        </section>
      ))}

      <section className="flex flex-col gap-3 border-t border-line pt-5">
        <h2 className="label-mono">{locale === 'en' ? 'Prompt template' : '提示词模板'}</h2>
        <pre className="overflow-x-auto rounded-lg border border-line bg-raised p-4 font-mono text-xs leading-relaxed">
          {pick(TEMPLATE, locale)}
        </pre>
      </section>

      <section className="flex flex-col gap-3 border-t border-line pt-5">
        <h2 className="label-mono">{locale === 'en' ? 'Let the AI look it up' : '让 AI 自己查'}</h2>
        <p className="text-sm text-muted">
          {locale === 'en'
            ? 'This site also publishes its catalogue for machines, so an agent can search it itself instead of you pasting paragraphs into a chat. The index (aliases, keywords, tags, control defaults and ready-to-use briefs) lives in catalog.json; the full text of every entry (when to use, confusions, pitfalls, values) lives in catalog.md.'
            : '这个站还给机器发布了一份目录：AI 可以自己查，不用你把内容一段段复制进对话框。索引（别名、关键词、标签、控件默认值、现成需求句）在 catalog.json，逐条全文（什么时候用、别搞混、踩坑、推荐取值）在 catalog.md。'}
        </p>
        <pre className="overflow-x-auto rounded-lg border border-line bg-raised p-4 font-mono text-xs leading-relaxed">
          {pick(CATALOG_SNIPPET, locale)}
        </pre>
        <p className="text-sm text-muted">
          {locale === 'en'
            ? 'The catalogue is generated from the same data as these pages, so it cannot drift: every entry, alias, confusion and value you see here is in there too.'
            : '目录与页面同源，不会各说各话：这里的每条词条、别名、易混项与推荐取值，目录里都有。'}
        </p>
      </section>

      <section className="flex flex-col gap-3 border-t border-line pt-5">
        <h2 className="label-mono">{locale === 'en' ? 'Keep going' : '继续走'}</h2>
        <p className="text-sm text-muted">
          {locale === 'en' ? 'Head into ' : '直接'}
          <Link to="/browse" className="mx-1 text-accent no-underline">
            {locale === 'en' ? 'the collection' : '进词条库'}
          </Link>
          {locale === 'en' ? 'or go back ' : '，或者回到'}
          <Link to="/" className="mx-1 text-accent no-underline">
            {locale === 'en' ? 'home' : '首页'}
          </Link>
          {locale === 'en'
            ? 'and search for the effect you are missing right now.'
            : '搜一个你现在正缺的效果。'}
        </p>
      </section>

      <section className="flex flex-col gap-3 border-t border-line pt-5">
        <h2 className="label-mono">{locale === 'en' ? 'License and credits' : '许可与致谢'}</h2>
        <ul className="flex flex-col gap-2 text-sm text-muted">
          <li>
            {locale === 'en'
              ? 'Code is MIT, the written content is CC BY 4.0. '
              : '代码按 MIT 授权，文字内容按 CC BY 4.0 授权。'}
            <a
              href="https://github.com/publieople/design-museum/blob/main/LICENSE"
              className="text-accent no-underline"
            >
              LICENSE
            </a>
            {' / '}
            <a
              href="https://github.com/publieople/design-museum/blob/main/LICENSE-CONTENT"
              className="text-accent no-underline"
            >
              LICENSE-CONTENT
            </a>
          </li>
          <li>
            {locale === 'en'
              ? 'Fonts are bundled locally, no external CDN: JetBrains Mono and Space Grotesk, both under the SIL Open Font License 1.1. '
              : '字体本地打包、不请求外部 CDN：JetBrains Mono 与 Space Grotesk，均为 SIL Open Font License 1.1。'}
            <a
              href={`${import.meta.env.BASE_URL}licenses/OFL-1.1-JetBrainsMono.txt`}
              className="text-accent no-underline"
            >
              JetBrains Mono
            </a>
            {' / '}
            <a
              href={`${import.meta.env.BASE_URL}licenses/OFL-1.1-SpaceGrotesk.txt`}
              className="text-accent no-underline"
            >
              Space Grotesk
            </a>
          </li>
          <li>
            {locale === 'en'
              ? 'Entries are our own summaries that link out to MDN, web.dev and the W3C specs — those pages stay with their owners.'
              : '词条正文是原创归纳，只链接到 MDN、web.dev 与 W3C 规范，那些页面的版权归各自所有者。'}
          </li>
          <li>
            {locale === 'en' ? 'Full list of third-party components: ' : '第三方组件与素材清单：'}
            <a
              href="https://github.com/publieople/design-museum/blob/main/THIRD_PARTY_NOTICES.md"
              className="text-accent no-underline"
            >
              THIRD_PARTY_NOTICES.md
            </a>
          </li>
        </ul>
      </section>
    </article>
  )
}
