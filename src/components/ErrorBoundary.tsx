import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  label?: string
}

interface State {
  error: Error | null
}

/** 一个 demo 崩掉不应该带走整页——尤其是 #/debug/all 要把 30 个 demo 同时挂起来 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded border border-accent/40 bg-raised p-4 text-sm">
          <p className="font-mono text-xs text-accent">
            {this.props.label ?? 'demo'} 渲染失败
          </p>
          <p className="mt-2 break-all text-muted">{this.state.error.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}
