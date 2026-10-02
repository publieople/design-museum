import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { StageId } from '../data/types'
import { applyTheme, withThemeTransition } from './viewTransition'

export type ThemeMode = 'light' | 'dark' | 'system'
export type Locale = 'zh' | 'en'
/** 预览舞台：auto 表示按词条类型自动挑背景 */
export type StagePref = StageId | 'auto'

export interface Prefs {
  theme: ThemeMode
  locale: Locale
  stage: StagePref
  /** 演示慢放 */
  slow: boolean
  /** 演示循环重播 */
  loop: boolean
}

export const PREF_DEFAULTS: Prefs = {
  theme: 'system',
  locale: 'zh',
  stage: 'auto',
  slow: false,
  // 默认循环：这是一座展品会动的博物馆，缩略图停在那里不动太可惜
  loop: true,
}

/** 改默认值时顺手升版，否则老访客会一直用着上一次存下来的旧默认值 */
export const PREFS_STORAGE_KEY = 'design-museum:prefs:v2'

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system'
}

function isLocale(value: unknown): value is Locale {
  return value === 'zh' || value === 'en'
}

function isStagePref(value: unknown): value is StagePref {
  return (
    value === 'auto' || value === 'light' || value === 'dark' || value === 'accent' || value === 'photo'
  )
}

/** 从 localStorage 读取，逐字段校验——坏数据不能把站点搞崩 */
export function loadPrefs(): Prefs {
  if (typeof window === 'undefined') return PREF_DEFAULTS
  try {
    const raw = window.localStorage.getItem(PREFS_STORAGE_KEY)
    if (!raw) return PREF_DEFAULTS
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return PREF_DEFAULTS
    const record = parsed as Record<string, unknown>
    return {
      theme: isThemeMode(record.theme) ? record.theme : PREF_DEFAULTS.theme,
      locale: isLocale(record.locale) ? record.locale : PREF_DEFAULTS.locale,
      stage: isStagePref(record.stage) ? record.stage : PREF_DEFAULTS.stage,
      slow: typeof record.slow === 'boolean' ? record.slow : PREF_DEFAULTS.slow,
      loop: typeof record.loop === 'boolean' ? record.loop : PREF_DEFAULTS.loop,
    }
  } catch {
    return PREF_DEFAULTS
  }
}

/** 站点主题与语言写到 <html> 上：主题决定 CSS 变量，语言决定断词与朗读 */
export function applyPrefs(prefs: Prefs) {
  if (typeof document === 'undefined') return
  applyTheme(prefs.theme)
  document.documentElement.lang = prefs.locale === 'en' ? 'en' : 'zh-CN'
}

interface PrefsApi extends Prefs {
  setPref: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void
  /** 主题/语言这类会整页换装的切换走这个，带过渡动画 */
  setPrefAnimated: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void
  resetPrefs: () => void
  /** 系统当前是不是深色，theme=system 时用来解出实际主题 */
  systemDark: boolean
}

const PrefsContext = createContext<PrefsApi | null>(null)

export function PrefsProvider({
  children,
  initial,
}: {
  children: ReactNode
  initial?: Prefs
}) {
  const [prefs, setPrefs] = useState<Prefs>(() => initial ?? loadPrefs())
  const [systemDark, setSystemDark] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemDark(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  // 任何偏好变化都同步到 localStorage 与 <html>
  useEffect(() => {
    applyPrefs(prefs)
    try {
      window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      // 隐私模式下写不进去也无妨
    }
  }, [prefs])

  const setPref = useCallback(<K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    setPrefs((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }))
  }, [])

  const setPrefAnimated = useCallback(
    <K extends keyof Prefs>(key: K, value: Prefs[K]) => {
      withThemeTransition(() => {
        applyPrefsFromKey(key, value)
        setPrefs((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }))
      })
    },
    [],
  )

  const resetPrefs = useCallback(() => {
    withThemeTransition(() => {
      applyPrefs(PREF_DEFAULTS)
      setPrefs(PREF_DEFAULTS)
    })
  }, [])

  const api = useMemo<PrefsApi>(
    () => ({ ...prefs, setPref, setPrefAnimated, resetPrefs, systemDark }),
    [prefs, setPref, setPrefAnimated, resetPrefs, systemDark],
  )

  return <PrefsContext.Provider value={api}>{children}</PrefsContext.Provider>
}

/** 在 React 状态更新之前先把 <html> 改掉，避免过渡动画拍到旧主题 */
function applyPrefsFromKey<K extends keyof Prefs>(key: K, value: Prefs[K]) {
  if (typeof document === 'undefined') return
  if (key === 'theme' && isThemeMode(value)) applyTheme(value)
  if (key === 'locale' && isLocale(value)) {
    document.documentElement.lang = value === 'en' ? 'en' : 'zh-CN'
  }
}

export function usePrefs(): PrefsApi {
  const value = useContext(PrefsContext)
  if (!value) throw new Error('usePrefs 必须在 PrefsProvider 内使用')
  return value
}
