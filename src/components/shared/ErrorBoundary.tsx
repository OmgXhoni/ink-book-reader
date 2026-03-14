import React from 'react'

interface State {
  hasError: boolean
  error: string
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center h-full p-8 text-center">
            <div>
              <div className="text-red-400 text-4xl mb-4">⚠</div>
              <h2 className="text-white font-semibold mb-2">Something went wrong</h2>
              <p className="text-white/50 text-sm">{this.state.error}</p>
              <button
                className="mt-4 px-4 py-2 bg-ink-600 text-white rounded-lg text-sm"
                onClick={() => this.setState({ hasError: false, error: '' })}
              >
                Try again
              </button>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}
