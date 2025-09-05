import { createClient } from '@supabase/supabase-js'
import { env } from '@/config/env'

// Client-side Supabase client with PKCE flow
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)

// Server-side Supabase client (for API routes)
export const createServerClient = () => {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// Database types (generated from Supabase)
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          subscription_tier: 'free' | 'pro' | 'premium'
          avatar_url: string | null
          created_at: string
          last_login: string | null
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          subscription_tier?: 'free' | 'pro' | 'premium'
          avatar_url?: string | null
          created_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          subscription_tier?: 'free' | 'pro' | 'premium'
          avatar_url?: string | null
          created_at?: string
          last_login?: string | null
        }
      }
      characters: {
        Row: {
          id: string
          user_id: string
          name: string
          race: string
          class: string
          level: number
          background: string
          alignment: string
          ability_scores: Record<string, number>
          hit_points: number
          armor_class: number
          speed: number
          skills: string[]
          equipment: string[]
          personality_traits: string[]
          ideals: string
          bonds: string
          flaws: string
          backstory: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          race: string
          class: string
          level?: number
          background: string
          alignment: string
          ability_scores: Record<string, number>
          hit_points: number
          armor_class: number
          speed?: number
          skills?: string[]
          equipment?: string[]
          personality_traits?: string[]
          ideals: string
          bonds: string
          flaws: string
          backstory: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          race?: string
          class?: string
          level?: number
          background?: string
          alignment?: string
          ability_scores?: Record<string, number>
          hit_points?: number
          armor_class?: number
          speed?: number
          skills?: string[]
          equipment?: string[]
          personality_traits?: string[]
          ideals?: string
          bonds?: string
          flaws?: string
          backstory?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

