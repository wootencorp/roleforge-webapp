'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/use-auth'
import { LoadingSpinner } from '@/shared/components/common/loading-spinner'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo,
  fallback 
}: AuthGuardProps) {
  const { user, loading, initialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!initialized || loading) return

    if (requireAuth && !user) {
      // User needs to be authenticated but isn't
      const redirect = redirectTo || '/auth/login'
      const currentPath = window.location.pathname
      const returnUrl = currentPath !== '/' ? `?returnUrl=${encodeURIComponent(currentPath)}` : ''
      router.push(`${redirect}${returnUrl}` as any)
    } else if (!requireAuth && user) {
      // User is authenticated but shouldn't be (e.g., on login page)
      const redirect = redirectTo || '/dashboard'
      router.push(redirect as any)
    }
  }, [user, loading, initialized, requireAuth, redirectTo, router])

  // Show loading state while initializing
  if (!initialized || loading) {
    return fallback || <AuthLoadingFallback />
  }

  // Show nothing while redirecting
  if (requireAuth && !user) {
    return null
  }

  if (!requireAuth && user) {
    return null
  }

  return <>{children}</>
}

function AuthLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

// Higher-order component for protecting pages
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthGuardProps, 'children'> = {}
) {
  const WrappedComponent = (props: P) => (
    <AuthGuard {...options}>
      <Component {...props} />
    </AuthGuard>
  )
  
  WrappedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

