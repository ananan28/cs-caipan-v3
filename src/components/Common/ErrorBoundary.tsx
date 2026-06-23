import { Component, ReactNode } from 'react'
import { Button } from './Button'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 text-center">
          <AlertTriangle size={48} className="text-orange mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">出错了</h3>
          <p className="text-muted mt-2">{this.state.error?.message || '未知错误'}</p>
          <Button variant="primary" className="mt-4" onClick={() => window.location.reload()}>
            刷新页面
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
