/**
 * 配色单一来源。
 *
 * 演示组件渲染的色值，和词条 prompt 里写给 AI 的色值，必须是同一组——
 * 两边各抄一份的话，改了一处另一处就会悄悄对不上（用户看到的样子
 * 和他复制出去的需求句不一致，这种 bug 没人看得出来）。
 */

/**
 * 渐变文字的配色。
 *
 * id 会进 URL（分享链接）和 localStorage（design-museum:tuned），
 * 所以只换色值、不改 id：改 id 会让老链接与老存储静默回退到默认配色。
 * 色值刻意收在站点色系里（朱红 / 墨 / 陶土 / 松绿），并且两端都足够深，
 * 在浅色舞台上仍有 3:1 以上的对比度。
 */
export const TEXT_PALETTES: Record<string, [string, string]> = {
  sunset: ['#c9382a', '#b8721c'],
  ocean: ['#1b1b20', '#c9382a'],
  acid: ['#315a4c', '#a8562f'],
}

/** 存储里出现陌生 id 时退回的那一套 */
export const TEXT_PALETTE_FALLBACK = 'sunset'

/**
 * 渐变描边的三个色标：起始色相决定第一个，后两个固定 +90deg / +180deg。
 * 亮度提到 64–70%：之前 55–62% 在浅色舞台上被卡片底色吃掉，看起来就是"太暗"。
 */
export function ringStops(hue: number): [string, string, string] {
  const start = ((hue % 360) + 360) % 360
  return [
    `hsl(${start}, 82%, 70%)`,
    `hsl(${(start + 90) % 360}, 84%, 64%)`,
    `hsl(${(start + 180) % 360}, 80%, 68%)`,
  ]
}
