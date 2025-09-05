'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/shared/components/ui/button'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import { captureException } from '@/config/sentry.config'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  feature?: string
  showGoBack?: boolean
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    captureException(error, {
      feature: this.props.feature,
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8">
          <div className="text-center max-w-md">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Something went wrong
            </h3>
            
            <p className="text-sm text-red-700 mb-6">
              {this.props.feature 
                ? `An error occurred in the ${this.props.feature} feature. Please try again or go back to the previous page.`
                : 'An unexpected error occurred. Please try again or go back to the previous page.'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="sm"
                onClick={this.handleRetry}
                className="bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              
              {this.props.showGoBack !== false && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={this.handleGoBack}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  feature?: string
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary feature={feature}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

