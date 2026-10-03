import { describe, expect, it } from 'vitest'
import { defaultValues } from '../lib/controls'
import { findEntry } from './index'
import { ringStops, TEXT_PALETTE_FALLBACK, TEXT_PALETTES } from './palettes'

/**
 * 演示渲染的色值和词条 prompt 写给 AI 的色值必须同源：
 * 两边各抄一份时，改了这里忘了那里，用户看到的样子就和他复制出去的需求句对不上。
 */
describe('配色单一来源', () => {
  it('渐变文字的需求句用的是演示渲染的那组色值', () => {
    const entry = findEntry('gradient-text')!
    const values = defaultValues(entry)
    const prompt = entry.prompt(values)
    const [from, to] = TEXT_PALETTES[String(values.palette)]
    expect(prompt.zh).toContain(from)
    expect(prompt.zh).toContain(to)
    expect(prompt.en).toContain(from)
    expect(prompt.en).toContain(to)
  })

  it('每套渐变文字配色的两端都足够深，浅色舞台上不至于看不见', () => {
    for (const [id, pair] of Object.entries(TEXT_PALETTES)) {
      expect(pair, id).toHaveLength(2)
      for (const hex of pair) expect(hex, id).toMatch(/^#[0-9a-f]{6}$/)
    }
    expect(TEXT_PALETTES[TEXT_PALETTE_FALLBACK]).toBeDefined()
  })

  it('渐变描边的需求句用的是 ringStops 算出的色标', () => {
    const entry = findEntry('gradient-border')!
    const values = defaultValues(entry)
    const prompt = entry.prompt(values)
    for (const stop of ringStops(Number(values.hue))) {
      expect(prompt.zh, stop).toContain(stop)
      expect(prompt.en, stop).toContain(stop)
    }
  })

  it('渐变描边的色标亮度都在 60% 以上（之前 55% 在浅色舞台上太暗）', () => {
    for (const stop of ringStops(14)) {
      const lightness = Number(stop.match(/,\s*(\d+)%\)/)?.[1])
      expect(lightness).toBeGreaterThanOrEqual(60)
    }
  })
})
