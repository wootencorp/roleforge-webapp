import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'
import { captureException } from '@/config/sentry.config'
import type { User } from '@/shared/types'
import type { AuthState, AuthActions, SignUpData, AuthError } from '../types'

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return
    
    set({ loading: true })
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const userData = await fetchUserProfile(session.user.id)
        set({ user: userData, loading: false, initialized: true })
      } else {
        set({ user: null, loading: false, initialized: true })
      }
    } catch (error) {
      captureException(error as Error, { context: 'auth_initialization' })
      set({ user: null, loading: false, initialized: true })
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw new AuthError(error.message, error.message)
      
      if (data.user) {
        const userData = await fetchUserProfile(data.user.id)
        await updateLastLogin(data.user.id)
        set({ user: userData, loading: false })
      }
    } catch (error) {
      set({ loading: false })
      captureException(error as Error, { context: 'auth_signin', email })
      throw error
    }
  },

  signUp: async ({ email, password, firstName, lastName }: SignUpData) => {
    set({ loading: true })
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })
      
      if (error) throw new AuthError(error.message, error.message)
      
      if (data.user) {
        const userData = await createUserProfile({
          id: data.user.id,
          email,
          firstName,
          lastName,
        })
        set({ user: userData, loading: false })
      }
    } catch (error) {
      set({ loading: false })
      captureException(error as Error, { context: 'auth_signup', email })
      throw error
    }
  },

  signOut: async () => {
    set({ loading: true })
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      set({ user: null, loading: false })
    } catch (error) {
      set({ loading: false })
      captureException(error as Error, { context: 'auth_signout' })
      throw error
    }
  },

  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) throw new AuthError(error.message, error.message)
    } catch (error) {
      captureException(error as Error, { context: 'auth_reset_password', email })
      throw error
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    const currentUser = get().user
    if (!currentUser) throw new Error('No user logged in')
    
    set({ loading: true })
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          avatar_url: updates.avatarUrl,
        })
        .eq('id', currentUser.id)
      
      if (error) throw error
      
      const updatedUser = { ...currentUser, ...updates }
      set({ user: updatedUser, loading: false })
    } catch (error) {
      set({ loading: false })
      captureException(error as Error, { context: 'auth_update_profile', userId: currentUser.id })
      throw error
    }
  },

  setUser: (user: User | null) => set({ user }),
  setLoading: (loading: boolean) => set({ loading }),
}))

// Helper functions
async function fetchUserProfile(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  
  return {
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    subscriptionTier: data.subscription_tier,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    lastLogin: data.last_login,
  }
}

async function createUserProfile(userData: {
  id: string
  email: string
  firstName: string
  lastName: string
}): Promise<User> {
  const profileData = {
    id: userData.id,
    email: userData.email,
    first_name: userData.firstName,
    last_name: userData.lastName,
    subscription_tier: 'free' as const,
    created_at: new Date().toISOString(),
  }
  
  const { error } = await supabase
    .from('user_profiles')
    .insert(profileData)
  
  if (error) throw error
  
  return {
    id: userData.id,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    subscriptionTier: 'free',
    createdAt: profileData.created_at,
  }
}

async function updateLastLogin(userId: string): Promise<void> {
  await supabase
    .from('user_profiles')
    .update({ last_login: new Date().toISOString() })
    .eq('id', userId)
}

class AuthError extends Error {
  constructor(public code: string, message: string, public field?: string) {
    super(message)
    this.name = 'AuthError'
  }
}

