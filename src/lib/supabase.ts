import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

const localMode = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_LOCAL_MODE === 'true'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: SupabaseClient<Database>

if (localMode || !supabaseUrl || !supabaseKey) {
  const mock: Partial<SupabaseClient<Database>> = {
    auth: {
      async getSession() {
        return { data: { session: null } } as { data: { session: null } }
      },
      onAuthStateChange(_event: string, _cb: (event: string, session: unknown) => void) {
        return { data: { subscription: { unsubscribe() { } } } } as { data: { subscription: { unsubscribe: () => void } } }
      },
      async signInWithPassword(_args: { email: string; password: string }) {
        return { data: { session: null, user: null }, error: null } as { data: { session: null; user: null }; error: null }
      },
      async signOut() {
        return { error: null } as { error: null }
      },
      async resetPasswordForEmail(_email: string, _opts?: { redirectTo?: string }) {
        return { error: null } as { error: null }
      },
      async getUser() {
        return { data: { user: null }, error: null } as { data: { user: null }; error: null }
      },
    } as unknown as SupabaseClient<Database>['auth'],
    from(_table: string) {
      return {
        select: async () => ({ data: [], error: null }),
        eq: () => ({ select: async () => ({ data: [], error: null }) }),
        gte: () => ({ select: async () => ({ data: [], error: null }) }),
        lte: () => ({ select: async () => ({ data: [], error: null }) }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    },
  }
  supabase = mock as SupabaseClient<Database>
} else {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}

export { supabase }

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
