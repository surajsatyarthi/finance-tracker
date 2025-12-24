import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

const localMode = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_LOCAL_MODE === 'true'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: SupabaseClient<Database>

// Simple mock builder for chaining
const createMockBuilder = (data: any = [], error: any = null) => {
  const builder: any = {
    // Promise interface
    then: (onfulfilled?: ((value: any) => any) | null, onrejected?: ((reason: any) => any) | null) => {
      return Promise.resolve({ data, error }).then(onfulfilled, onrejected)
    },
    catch: (onrejected?: ((reason: any) => any) | null) => {
      return Promise.resolve({ data, error }).catch(onrejected)
    },
    // Filter methods - return self for chaining
    select: () => builder,
    eq: () => builder,
    gte: () => builder,
    lte: () => builder,
    order: () => builder,
    limit: () => builder,
    single: () => {
        // Mock single return (return first item or null)
        const singleData = Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data;
        // Return a promise that resolves to single result
        return Promise.resolve({ data: singleData, error })
    },
    insert: () => {
       // Return builder but next await will resolve to inserted data
       return builder
    }
  }
  return builder
}

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
      return createMockBuilder([], null)
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rpc: (_name: string, _params: any) => {
      // Mock RPC must return a thenable that is also chainable if needed, but usually RPC just returns data
      return Promise.resolve({ data: null, error: null }) as any
    }
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
