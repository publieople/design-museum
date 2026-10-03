import { useEffect, useRef, useState } from 'react'
import { STAGES, stageHint, stageLabel } from '../data/taxonomy'
import { useT, useLocale } from '../i18n'
import { usePrefs, type ThemeMode } from '../lib/prefs'
import type { StagePref } from '../lib/prefs'

const THEMES: { id: ThemeMode; key: 'settings.theme.light' | 'settings.theme.dark' | 'settings.theme.system' }[] = [
  { id: 'light', key: 'settings.theme.light' },
  { id: 'dark', key: 'settings.theme.dark' },
  { id: 'system', key: 'settings.theme.system' },
]

function Chip({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      title={title}
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors ${
        active
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-line text-muted hover:border-ink/40 hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export function SettingsMenu({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const t = useT()
  const locale = useLocale()
  const { theme, locale: currentLocale, stage, slow, loop, setPref, setPrefAnimated, resetPrefs } =
    usePrefs()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const close = () => {
      setOpen(false)
      onOpenChange?.(false)
    }
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) close()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
    // onOpenChange 由 Layout 传的 setState 提供，本身是稳定引用
  }, [open, onOpenChange])

  const stageOptions: { id: StagePref; label: string; hint?: string }[] = [
    { id: 'auto', label: t('settings.stage.auto') },
    ...STAGES.map((item) => ({
      id: item.id as StagePref,
      label: stageLabel(item.id, locale),
      hint: stageHint(item.id, locale),
    })),
  ]

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() =>
          setOpen((prev) => {
            onOpenChange?.(!prev)
            return !prev
          })
        }
        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line px-2 py-1 text-sm text-muted transition-colors hover:text-ink sm:px-2.5"
      >
        <span aria-hidden="true" className="font-mono text-xs">
          ⌘
        </span>
        {/* 窄屏只留图标：粘性头部多占一行就得一直吃掉正文高度。
            文字用 sr-only 留在无障碍树里，按钮的可读名称不受影响。 */}
        <span className="sr-only sm:not-sr-only">{t('settings.open')}</span>
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-xl border border-line bg-raised p-4 shadow-xl">
          <div className="flex flex-col gap-4">
            <fieldset className="flex flex-col gap-2 border-0 p-0">
              <legend className="label-mono mb-1">{t('settings.theme')}</legend>
              <div className="flex flex-wrap gap-1.5">
                {THEMES.map((item) => (
                  <Chip
                    key={item.id}
                    active={theme === item.id}
                    onClick={() => setPrefAnimated('theme', item.id)}
                  >
                    {t(item.key)}
                  </Chip>
                ))}
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-2 border-0 p-0">
              <legend className="label-mono mb-1">{t('settings.locale')}</legend>
              <div className="flex flex-wrap gap-1.5">
                <Chip
                  active={currentLocale === 'zh'}
                  onClick={() => setPrefAnimated('locale', 'zh')}
                >
                  {t('settings.locale.zh')}
                </Chip>
                <Chip
                  active={currentLocale === 'en'}
                  onClick={() => setPrefAnimated('locale', 'en')}
                >
                  {t('settings.locale.en')}
                </Chip>
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-2 border-0 p-0">
              <legend className="label-mono mb-1">{t('settings.stage')}</legend>
              <div className="flex flex-wrap gap-1.5">
                {stageOptions.map((item) => (
                  <Chip
                    key={item.id}
                    active={stage === item.id}
                    title={item.hint}
                    onClick={() => setPref('stage', item.id)}
                  >
                    {item.label}
                  </Chip>
                ))}
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-2 border-0 p-0">
              <legend className="label-mono mb-1">{t('settings.motion')}</legend>
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  {t('settings.loop')}
                  <span className="block text-xs text-muted">{t('settings.loop.hint')}</span>
                </span>
                <input
                  type="checkbox"
                  checked={loop}
                  onChange={(event) => setPref('loop', event.target.checked)}
                  className="size-4 cursor-pointer"
                  style={{ accentColor: 'var(--accent)' }}
                />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  {t('settings.slow')}
                  <span className="block text-xs text-muted">{t('settings.slow.hint')}</span>
                </span>
                <input
                  type="checkbox"
                  checked={slow}
                  onChange={(event) => setPref('slow', event.target.checked)}
                  className="size-4 cursor-pointer"
                  style={{ accentColor: 'var(--accent)' }}
                />
              </label>
            </fieldset>

            <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
              <button
                type="button"
                onClick={resetPrefs}
                className="cursor-pointer font-mono text-[11px] text-muted underline decoration-dotted hover:text-accent"
              >
                {t('settings.reset')}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer font-mono text-[11px] text-muted hover:text-ink"
              >
                {t('settings.close')}
              </button>
            </div>

            <p className="text-xs leading-relaxed text-muted">{t('settings.hint')}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
