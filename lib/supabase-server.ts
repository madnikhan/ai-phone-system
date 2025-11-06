import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client
// Use this in API routes and server components
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key not configured')
    return null
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

