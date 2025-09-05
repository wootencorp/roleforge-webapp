import * as Sentry from '@sentry/nextjs'
import { env } from './env'

export function initSentry() {
  if (!env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn('Sentry DSN not provided, skipping Sentry initialization')
    return
  }

  Sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    environment: env.NODE_ENV,
    
    // Performance monitoring
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Error filtering
    beforeSend(event, hint) {
      // Filter out development errors
      if (env.NODE_ENV === 'development') {
        console.error('Sentry captured error:', hint.originalException || hint.syntheticException)
      }
      
      // Filter out known non-critical errors
      const error = hint.originalException
      if (error instanceof Error) {
        // Skip network errors that are user-related
        if (error.message.includes('NetworkError') || 
            error.message.includes('Failed to fetch')) {
          return null
        }
      }
      
      return event
    },
    
    // Additional context
    initialScope: {
      tags: {
        component: 'roleforge-app',
      },
    },
  })
}

// Helper function to capture exceptions with context
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value)
      })
    }
    Sentry.captureException(error)
  })
}

// Helper function to capture messages
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level)
}

