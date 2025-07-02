import { createClient } from '@supabase/supabase-js'

// For now, we'll use placeholder values
// You'll need to replace these with your actual Supabase project values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-ref.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names
export const TABLES = {
  PROFILES: 'profiles',
  SESSIONS: 'sessions', 
  ATTEMPTS: 'attempts'
}

// Helper functions for common operations
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
} 