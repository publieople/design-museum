import { useMemo, useState } from 'react'
import { ENTRIES, featuredEntries } from '../data'
import { CATEGORIES, categoryOf } from '../data/taxonomy'
import type { Entry } from '../data/types'
import { defaultValues } from '../lib/controls'
import { Link } from '../lib/router'
import { searchEntries } from '../lib/search'
import { DemoStage } from '../components/DemoStage'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { SearchBox } from '../components/SearchBox'
import { preferredStageFor } from '../components/stageStyles'
import { demoFor } from '../demos/registry'

function Specimen({ entry }: { entry: Entry }) {
  const Demo = demoFor(entry.slug)
  const values = useMemo(() => defaultValues(entry), [entry])
  const stage = preferredStageFor(entry)

  return (
    <li className="flex flex-col gap-3">
      {Demo ? (
        <Link to={`/entry/${entry.slug}`} className="no-underline" tabIndex={-1} aria-hidden="true">
          <ErrorBoundary label={entry.slug}>
            <DemoStage compact stage={stage} onStageChange={() => {}} onReplay={() => {}}>
              <Demo values={values} stage={stage} replayKey={0} />
            </DemoStage>
          </ErrorBoundary>
        </Link>
      ) : null}
      <div>
        <span className="font-mono text-[11px] tracking-wider text-accent">{entry.code}</span>
        <h3 className="font-display text-base font-semibold leading-tight">
          <Link to={`/entry/${entry.slug}`} className="no-underline">
            {entry.nameZh}
          </Link>
        </h3>
        <p className="font-mono text-[11px] text-muted">{entry.nameEn}</p>
      </div>
    </li>
  )
}

export function HomePage() {
  const [query, setQuery] = useState('')
  const hits = useMemo(() => searchEntries(ENTRIES, query).slice(0, 12), [query])
  const specimens = featuredEntries().slice(0, 3)

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-6 pt-4">
        <div className="max-w-2xl">
          <p className="label-mono">
            前端设计博物馆 · FRONTEND DESIGN MUSEUM · {ENTRIES.length} 件标本
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl">
            先给效果起个名字，
            <br />
            再让 AI 实现它。
          </h1>
          <p className="mt-4 text-muted">
            用 AI 做网页时最卡的一步，往往不是不会做，而是不知道那个效果叫什么。
            这里把常见效果都做成活的标本：看到、摸到、把参数调到满意，然后复制成一句 AI 听得懂的需求。
          </p>
        </div>

        <SearchBox value={query} onChange={setQuery} />

        {query ? (
          <div>
            <p className="label-mono mb-3">
              {hits.length > 0 ? `命中 ${hits.length} 条` : '没有找到——试试口语说法，比如「毛玻璃」「果冻」'}
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {hits.map(({ entry }) => (
                <li key={entry.slug} className="rounded-lg border border-line bg-raised p-3">
                  <Link to={`/entry/${entry.slug}`} className="no-underline">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-display font-semibold">{entry.nameZh}</span>
                      <span className="font-mono text-[11px] text-accent">{entry.code}</span>
                    </div>
                    <p className="font-mono text-[11px] text-muted">{entry.nameEn}</p>
                    <p className="mt-1 text-sm text-muted">{entry.oneLiner}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {!query && specimens.length > 0 ? (
        <section>
          <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-line pb-2">
            <h2 className="label-mono">正在展出</h2>
            <Link to="/browse" className="font-mono text-xs text-muted no-underline hover:text-accent">
              看全部 {ENTRIES.length} 件 →
            </Link>
          </div>
          <ul className="grid gap-6 sm:grid-cols-3">
            {specimens.map((entry) => (
              <Specimen key={entry.slug} entry={entry} />
            ))}
          </ul>
        </section>
      ) : null}

      {!query ? (
        <section>
          <div className="mb-4 border-b border-line pb-2">
            <h2 className="label-mono">五个展厅</h2>
          </div>
          <ul className="flex flex-col divide-y divide-line border-y border-line">
            {CATEGORIES.map((category) => {
              const count = ENTRIES.filter((entry) => entry.category === category.id).length
              return (
                <li key={category.id}>
                  <Link
                    to={`/browse?cat=${category.id}`}
                    className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4 no-underline transition-colors hover:text-accent"
                  >
                    <span className="w-6 font-mono text-xs text-accent">{category.letter}</span>
                    <span className="font-display text-lg font-semibold">{category.nameZh}</span>
                    <span className="font-mono text-[11px] text-muted">{category.nameEn}</span>
                    <span className="ml-auto font-mono text-xs text-muted">{count} 件</span>
                    <span className="w-full text-sm text-muted sm:w-auto sm:flex-1">
                      {category.blurb}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {!query ? (
        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/feel"
            className="rounded-lg border border-line bg-raised p-5 no-underline transition-colors hover:border-accent/50"
          >
            <h2 className="font-display text-lg font-semibold">描述不出来？按感觉找</h2>
            <p className="mt-1 text-sm text-muted">
              回答三个问题（用在哪、什么感觉、想达到什么效果），从候选里挑一个。
            </p>
          </Link>
          <Link
            to="/cheatsheet"
            className="rounded-lg border border-line bg-raised p-5 no-underline transition-colors hover:border-accent/50"
          >
            <h2 className="font-display text-lg font-semibold">速查表 · 整段复制给 AI</h2>
            <p className="mt-1 text-sm text-muted">
              勾选这次要用的几个效果，导出一段带中英术语和参数的需求清单。
            </p>
          </Link>
        </section>
      ) : null}

      {!query && specimens.length > 0 ? (
        <p className="text-xs text-muted">
          展品分类参考：
          {CATEGORIES.map((c) => `${c.nameZh}（${categoryOf(c.id).nameEn}）`).join('、')}。
        </p>
      ) : null}
    </div>
  )
}
