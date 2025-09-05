import { useEffect } from 'react'
import { useAuthStore } from '../stores/auth-store'
import { supabase } from '@/shared/lib/supabase'
import { captureException } from '@/config/sentry.config'

export function useAuth() {
  const store = useAuthStore()

  useEffect(() => {
    // Initialize auth state
    store.initialize()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (event === 'SIGNED_IN' && session?.user) {
            const { data, error } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (error) throw error
            
            const userData = {
              id: data.id,
              email: data.email,
              firstName: data.first_name,
              lastName: data.last_name,
              subscriptionTier: data.subscription_tier,
              avatarUrl: data.avatar_url,
              createdAt: data.created_at,
              lastLogin: data.last_login,
            }
            
            store.setUser(userData)
          } else if (event === 'SIGNED_OUT') {
            store.setUser(null)
          }
        } catch (error) {
          captureException(error as Error, { 
            context: 'auth_state_change', 
            event,
            userId: session?.user?.id 
          })
          store.setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [store])

  return {
    user: store.user,
    loading: store.loading,
    initialized: store.initialized,
    isAuthenticated: !!store.user,
    signIn: store.signIn,
    signUp: store.signUp,
    signOut: store.signOut,
    resetPassword: store.resetPassword,
    updateProfile: store.updateProfile,
  }
}

