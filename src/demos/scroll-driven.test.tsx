import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ScrollDrivenDemo from './scroll-driven'

const html = renderToString(
  <ScrollDrivenDemo values={{}} stage="light" replayKey={0} locale="zh" />,
)

describe('滚动驱动动画的进度条', () => {
  /**
   * 这条钉的是一个真 bug：进度条原来放在滚动框外面，而
   * animation-timeline: scroll() 取的是被动画元素自己的最近滚动祖先——
   * 那就是 overflow-hidden 的舞台根节点，没有可滚动溢出，时间线不可用，
   * 配上 fill-mode: both 停在起始帧，整条 0 像素宽，怎么滚都看不见。
   */
  it('进度条落在滚动容器内部', () => {
    const scroller = html.indexOf('data-scroller')
    const bar = html.indexOf('data-progress-bar')
    expect(scroller, '缺少滚动容器标记').toBeGreaterThan(-1)
    expect(bar, '缺少进度条标记').toBeGreaterThan(-1)
    expect(bar, '进度条必须在滚动容器之后（也就是它的内部）').toBeGreaterThan(scroller)
  })

  it('滚动容器顶部挂住进度条', () => {
    expect(html).toContain('sticky top-0')
  })

  it('进度用 transform: scaleX，不用 width', () => {
    expect(html).toContain('scaleX(')
  })
})
