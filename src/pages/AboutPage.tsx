import type { ReactNode } from 'react'
import { useLocale, useT } from '../i18n'
import { pick } from '../i18n/pick'
import { Link } from '../lib/router'
import { SITE_BASE } from '../lib/routes'
import type { Bi } from '../data/types'
import { PageHeader } from '../components/PageHeader'
import { Rule } from '../components/Meta'
import { StepList } from '../components/StepList'

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

const CODEX_LINK = 'https://github.com/publieople/design-museum/blob/main'

function SectionHeading({ index, children }: { index: string; children: ReactNode }) {
  return (
    <h2 className="flex items-baseline gap-3 font-display text-h2 text-ink">
      <span aria-hidden="true" className="font-mono text-[11px] tracking-[0.08em] text-accent">
        {index}
      </span>
      {children}
    </h2>
  )
}

function Body({ children }: { children: ReactNode }) {
  return <p className="max-w-[62ch] text-body text-ink-2">{children}</p>
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="text-accent no-underline hover:underline">
      {children}
    </a>
  )
}

export function AboutPage() {
  const t = useT()
  const locale = useLocale()
  const base = import.meta.env.BASE_URL

  return (
    <article className="mx-auto flex w-full max-w-[68ch] flex-col gap-10">
      <PageHeader title={t('about.title')} lede={t('about.lede')} />

      <section className="flex flex-col gap-4">
        <SectionHeading index="01">{t('about.stepsTitle')}</SectionHeading>
        <StepList
          items={[{ body: t('about.step1') }, { body: t('about.step2') }, { body: t('about.step3') }]}
        />
      </section>

      <Rule />

      <section className="flex flex-col gap-4">
        <SectionHeading index="02">{t('about.whyTitle')}</SectionHeading>
        <Body>{t('about.whyBody')}</Body>
      </section>

      <Rule variant="dotted" />

      <section className="flex flex-col gap-4">
        <SectionHeading index="03">{t('about.mistakesTitle')}</SectionHeading>
        <ul className="flex flex-col gap-3">
          {[t('about.mistake1'), t('about.mistake2')].map((mistake, index) => (
            <li key={index} className="flex gap-3">
              <span
                aria-hidden="true"
                className="pt-1 font-mono text-[11px] tracking-[0.08em] text-accent"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="max-w-[62ch] text-body text-ink-2">{mistake}</p>
            </li>
          ))}
        </ul>
      </section>

      <Rule />

      <section className="flex flex-col gap-4">
        <SectionHeading index="04">{t('about.templateTitle')}</SectionHeading>
        <pre className="well overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-ink-2">
          {pick(TEMPLATE, locale)}
        </pre>
      </section>

      <Rule variant="dotted" />

      <section className="flex flex-col gap-4">
        <SectionHeading index="05">{t('about.catalogTitle')}</SectionHeading>
        <Body>{t('about.catalogBody')}</Body>
        <pre className="well overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-ink-2">
          {pick(CATALOG_SNIPPET, locale)}
        </pre>
        <Body>{t('about.catalogNote')}</Body>
      </section>

      <Rule />

      <section className="flex flex-col gap-4">
        <SectionHeading index="06">{t('about.nextTitle')}</SectionHeading>
        <Body>
          {t('about.nextBefore')}
          <Link to="/browse" className="mx-1 text-accent no-underline hover:underline">
            {t('about.nextBrowse')}
          </Link>
          {t('about.nextMiddle')}
          <Link to="/" className="mx-1 text-accent no-underline hover:underline">
            {t('about.nextHome')}
          </Link>
          {t('about.nextAfter')}
        </Body>
      </section>

      <Rule variant="strong" />

      <section className="flex flex-col gap-4">
        <SectionHeading index="07">{t('about.licenseTitle')}</SectionHeading>
        <ul className="flex max-w-[62ch] flex-col gap-3 text-body text-ink-2">
          <li>
            {t('about.licenseCode')}
            <ExternalLink href={CODEX_LINK + '/LICENSE'}>LICENSE</ExternalLink>
            {' / '}
            <ExternalLink href={CODEX_LINK + '/LICENSE-CONTENT'}>LICENSE-CONTENT</ExternalLink>
          </li>
          <li>
            {t('about.licenseFonts')}
            <ExternalLink href={base + 'licenses/OFL-1.1-JetBrainsMono.txt'}>JetBrains Mono</ExternalLink>
            {' / '}
            <ExternalLink href={base + 'licenses/OFL-1.1-SpaceGrotesk.txt'}>Space Grotesk</ExternalLink>
          </li>
          <li>{t('about.licenseEntries')}</li>
          <li>
            {t('about.licenseThirdParty')}
            <ExternalLink href={CODEX_LINK + '/THIRD_PARTY_NOTICES.md'}>
              THIRD_PARTY_NOTICES.md
            </ExternalLink>
          </li>
        </ul>
      </section>
    </article>
  )
}
