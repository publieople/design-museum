import { useCallback } from 'react'
import { usePrefs, type Locale } from '../lib/prefs'
import { STRINGS, type StringKey } from './strings'

export type Vars = Record<string, string | number>
export type Translate = (key: StringKey, vars?: Vars) => string

function fill(template: string, vars?: Vars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}

export function translate(locale: Locale, key: StringKey, vars?: Vars): string {
  const entry = STRINGS[key]
  // 界面文案表里每条都同时有 zh 与 en，不需要回退
  const template = locale === 'en' ? entry.en : entry.zh
  return fill(template, vars)
}

/** 组件里统一用它取文案 */
export function useT(): Translate {
  const { locale } = usePrefs()
  return useCallback((key: StringKey, vars?: Vars) => translate(locale, key, vars), [locale])
}

export function useLocale(): Locale {
  return usePrefs().locale
}

export type { StringKey }
