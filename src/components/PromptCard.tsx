import type { Entry, ControlValues } from '../data/types'
import { buildPrompt, formatValues } from '../lib/prompt'
import { CopyButton } from './CopyButton'

interface PromptCardProps {
  entry: Entry
  values: ControlValues
}

/**
 * 这个项目的核心出口：观众在这里把「我看到的」翻译成「AI 听得懂的」。
 * 中文版负责语义，英文关键词版负责让模型精确定位到标准实现。
 */
export function PromptCard({ entry, values }: PromptCardProps) {
  const prompt = buildPrompt(entry, values)
  const params = formatValues(entry, values)

  return (
    <section aria-label="给 AI 的需求" className="rounded-lg border border-line bg-raised">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="label-mono">复制给 AI</h2>
        <span className="font-mono text-[11px] text-muted">
          {entry.controls.length > 0 ? '随参数实时更新' : '固定文案'}
        </span>
      </header>

      <div className="flex flex-col gap-4 p-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] text-muted">需求句（中文）</span>
            <CopyButton text={prompt.zh} label="复制需求句" toastMessage="需求句已复制" />
          </div>
          <p className="rounded border border-line bg-surface p-3 text-sm leading-relaxed">
            {prompt.zh}
          </p>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] text-muted">关键词（英文术语）</span>
            <CopyButton text={prompt.en} label="复制关键词" toastMessage="关键词已复制" />
          </div>
          <p className="rounded border border-line bg-surface p-3 font-mono text-xs leading-relaxed break-words">
            {prompt.en}
          </p>
        </div>

        {params.length > 0 ? (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 text-xs">
            {params.map((item) => {
              const [label, ...rest] = item.split(' ')
              return (
                <div key={item} className="flex justify-between gap-2">
                  <dt className="text-muted">{label}</dt>
                  <dd className="font-mono">{rest.join(' ')}</dd>
                </div>
              )
            })}
          </dl>
        ) : null}
      </div>
    </section>
  )
}
