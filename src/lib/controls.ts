import type { Control, ControlValues, Entry } from '../data/types'

export function defaultOf(control: Control): number | string | boolean {
  return control.def
}

export function defaultValues(entry: Entry): ControlValues {
  const values: ControlValues = {}
  for (const control of entry.controls) values[control.id] = defaultOf(control)
  return values
}

export function numberValue(values: ControlValues, id: string, fallback: number): number {
  const raw = values[id]
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : fallback
}

export function stringValue(values: ControlValues, id: string, fallback: string): string {
  const raw = values[id]
  return typeof raw === 'string' ? raw : fallback
}

export function boolValue(values: ControlValues, id: string, fallback: boolean): boolean {
  const raw = values[id]
  return typeof raw === 'boolean' ? raw : fallback
}
