import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export const useSupabase = () => {
  const config = useRuntimeConfig()

  if (import.meta.client && supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = config.public.supabaseUrl as string
  const supabaseAnonKey = config.public.supabaseAnonKey as string

  if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.dev) {
      console.warn('⚠️ Supabase credentials not configured.')
      console.warn('Set NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.')
    }
    supabaseClient = createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )
  } else {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: {
          getItem: (key: string) => {
            if (import.meta.server) return null
            return localStorage.getItem(key)
          },
          setItem: (key: string, value: string) => {
            if (import.meta.server) return
            localStorage.setItem(key, value)
          },
          removeItem: (key: string) => {
            if (import.meta.server) return
            localStorage.removeItem(key)
          }
        }
      }
    })
  }

  return supabaseClient
}

export type { SupabaseClient }
