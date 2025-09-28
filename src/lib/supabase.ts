import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
})

// Helper function for handling Supabase errors
export const handleSupabaseError = (error: unknown, context?: string) => {
  console.error(`Supabase error${context ? ` in ${context}` : ''}:`, error)
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
  const errorCode = (error as { code?: string })?.code || 'UNKNOWN_ERROR'
  return {
    error: errorMessage,
    code: errorCode
  }
}

// Auth helper functions
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return { user, error: null }
  } catch (error) {
    return { user: null, error: handleSupabaseError(error, 'getCurrentUser') }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: handleSupabaseError(error, 'signOut') }
  }
}
