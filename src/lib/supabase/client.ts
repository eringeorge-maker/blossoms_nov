import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://placeholder.supabase.co'
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'placeholder-anon-key'

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
)

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.info(
    'ℹ️ Supabase environment variables not detected. Running in mock/offline mode. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local to connect to live Supabase.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export type { Session, User } from '@supabase/supabase-js'
