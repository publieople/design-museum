import { defaultOf, defaultValues } from './controls'
import { absoluteUrl } from './routes'
import type { Control, ControlValues, Entry, StageId } from '../data/types'

const STAGE_IDS: StageId[] = ['light', 'dark', 'accent', 'photo']
const TUNED_KEY = 'design-museum:tuned'

/**
 * 词条页的状态放进 URL：?blur=24&saturate=200&stage=photo
 * 只写与默认值不同的参数，链接才不至于长到没法贴。
 */
export function parseEntryState(entry: Entry, query: URLSearchParams): {
  values: ControlValues
  stage: StageId | null
} {
  const values = defaultValues(entry)

  for (const control of entry.controls) {
    const raw = query.get(control.id)
    if (raw === null) continue
    values[control.id] = coerce(control, raw, defaultOf(control))
  }

  const stageRaw = query.get('stage')
  const stage = STAGE_IDS.find((id) => id === stageRaw) ?? null
  return { values, stage }
}

function coerce(control: Control, raw: string, fallback: number | string | boolean) {
  if (control.kind === 'range') {
    const num = Number(raw)
    if (!Number.isFinite(num)) return fallback
    return Math.min(control.max, Math.max(control.min, num))
  }
  if (control.kind === 'toggle') return raw === '1' || raw === 'true'
  return control.options.some((option) => option.value === raw) ? raw : fallback
}

export function buildEntryQuery(
  entry: Pick<Entry, 'controls'>,
  values: ControlValues,
  stage: StageId | null,
): string {
  const params = new URLSearchParams()
  for (const control of entry.controls) {
    const value = values[control.id]
    if (value === undefined) continue
    if (value === defaultOf(control)) continue
    params.set(control.id, control.kind === 'toggle' ? (value ? '1' : '0') : String(value))
  }
  if (stage) params.set('stage', stage)
  return params.toString()
}

/** 分享链接：干净的真实路径（带参数），不再是 #/... 的 hash 地址 */
/** 只用到 slug 与控件定义，所以收窄参数：详情页传 ResolvedEntry 也成立 */
export function entryLink(
  entry: Pick<Entry, 'slug' | 'controls'>,
  values: ControlValues,
  stage: StageId | null,
): string {
  const query = buildEntryQuery(entry, values, stage)
  return absoluteUrl(`/entry/${entry.slug}${query ? `?${query}` : ''}`)
}

interface TunedStore {
  [slug: string]: ControlValues
}

function readStore(): TunedStore {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(TUNED_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as TunedStore) : {}
  } catch {
    return {}
  }
}

/** 用户在词条页调过的参数，速查表导出时要用它，而不是永远用默认值 */
export function readTunedValues(slug: string): ControlValues | null {
  const stored = readStore()[slug]
  return stored && typeof stored === 'object' ? stored : null
}

export function writeTunedValues(slug: string, values: ControlValues) {
  if (typeof window === 'undefined') return
  try {
    const store = readStore()
    store[slug] = values
    window.localStorage.setItem(TUNED_KEY, JSON.stringify(store))
  } catch {
    // 写不进去就算了
  }
}

export function clearTunedValues() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(TUNED_KEY)
  } catch {
    // 同上
  }
}

/** 速查表用：调过的值 + 默认值补齐，防止老数据缺字段 */
export function valuesForSheet(entry: Entry): ControlValues {
  const tuned = readTunedValues(entry.slug)
  const values = defaultValues(entry)
  if (!tuned) return values
  for (const control of entry.controls) {
    const value = tuned[control.id]
    if (value === undefined) continue
    values[control.id] = coerce(control, String(value), defaultOf(control))
  }
  return values
}
