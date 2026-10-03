import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { noiseUrl } from '../lib/noise'
import GrainNoiseDemo from './grain-noise'

describe('颗粒噪点', () => {
  it('噪声转成中性灰，否则叠上去会发彩', () => {
    const svg = decodeURIComponent(noiseUrl(0.67))
    expect(svg).toContain('feTurbulence')
    expect(svg).toContain('fractalNoise')
    expect(svg).toContain('stitchTiles="stitch"')
    expect(svg).toContain('type="saturate" values="0"')
  })

  it('左右分屏对比：同尺寸、只有左半边被裁出噪点', () => {
    const html = renderToString(
      <GrainNoiseDemo values={{}} stage="photo" replayKey={0} locale="zh" />,
    )
    expect(html).toContain('有噪点')
    expect(html).toContain('无噪点')
    expect(html).toContain('clip-path:inset(0 50% 0 0)')
    // 只有一块面板，不再是"一大块 + 一小条"两个尺寸不同的区域
    expect(html.match(/h-44/g)).toHaveLength(1)
  })

  it('英文模式下没有中文', () => {
    const html = renderToString(
      <GrainNoiseDemo values={{}} stage="photo" replayKey={0} locale="en" />,
    )
    expect(html).not.toMatch(/[\u4e00-\u9fff]/)
  })
})
