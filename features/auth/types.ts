import type { User } from '@/shared/types'

export interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
}

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthError {
  code: string
  message: string
  field?: string
}

export interface AuthSession {
  user: User
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export type AuthProvider = 'google' | 'github' | 'discord'

