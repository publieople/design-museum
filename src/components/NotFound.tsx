import { useState } from 'react'
import { useT } from '../i18n'
import { Link } from '../lib/router'
import { buttonClass } from './Button'
import { SearchBox } from './SearchBox'

/**
 * 404：先给一个能继续走的动作（搜索），两个出口（首页 / 词条库）。
 * 大号编号只是版面锚点，语义交给 h1，读屏不会念两遍。
 */
export function NotFound() {
  const t = useT()
  const [query, setQuery] = useState('')

  return (
    <article className="mx-auto flex w-full max-w-xl flex-col gap-6 py-8">
      <p aria-hidden="true" className="font-display text-display leading-none text-muted">
        404
      </p>

      <header className="flex flex-col gap-2 border-b-2 border-ink pb-5">
        <h1 className="font-display text-h2 text-ink">{t('notFound.title')}</h1>
        <p className="max-w-[52ch] text-body text-ink-2">{t('notFound.desc')}</p>
      </header>

      <div className="flex flex-col gap-2">
        <p className="label-mono">{t('notFound.search')}</p>
        <SearchBox value={query} onChange={setQuery} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link to="/" className={buttonClass({ variant: 'primary', size: 'sm' })}>
          {t('notFound.home')}
        </Link>
        <Link to="/browse" className={buttonClass({ variant: 'secondary', size: 'sm' })}>
          {t('nav.browse')}
        </Link>
      </div>
    </article>
  )
}
