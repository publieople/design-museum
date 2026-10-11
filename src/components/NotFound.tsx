import { translate } from '../i18n'
import { Link } from '../lib/router'
import { usePrefs } from '../lib/prefs'

export function NotFound() {
  const { locale } = usePrefs()
  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="font-display text-2xl font-semibold">{translate(locale, 'notFound.title')}</h1>
      <p className="text-sm text-muted">
        {translate(locale, 'notFound.desc')}
        <Link to="/" className="mx-1 text-accent no-underline">
          {translate(locale, 'notFound.home')}
        </Link>
      </p>
    </div>
  )
}
