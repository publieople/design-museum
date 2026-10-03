import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ToastDemo from './toast'

const html = renderToString(<ToastDemo values={{}} stage="light" replayKey={0} locale="zh" />)

describe('轻提示的主按钮', () => {
  // 上一轮从磁吸按钮上撤掉的那支蓝紫渐变，这里漏了一处
  it('不再用蓝紫渐变，改用站点墨色', () => {
    expect(html).not.toContain('#2f6bff')
    expect(html).not.toContain('#7b2ff7')
    expect(html).toContain('var(--stage-ink)')
  })

  it('深色舞台上按钮文字跟着翻过来', () => {
    const dark = renderToString(
      <ToastDemo values={{}} stage="dark" replayKey={0} locale="zh" />,
    )
    expect(dark).toContain('#101014')
  })
})
