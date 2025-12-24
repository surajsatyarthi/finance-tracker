import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

const localMode = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_LOCAL_MODE === 'true'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: SupabaseClient<Database>

// Simple mock builder for chaining
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMockBuilder = (initialData: any = [], error: any = null) => {
  let currentData = initialData;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder: any = {
    // Promise interface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    then: (onfulfilled?: ((value: any) => any) | null, onrejected?: ((reason: any) => any) | null) => {
      return Promise.resolve({ data: currentData, error }).then(onfulfilled, onrejected)
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch: (onrejected?: ((reason: any) => any) | null) => {
      return Promise.resolve({ data: currentData, error }).catch(onrejected)
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
        const singleData = Array.isArray(currentData) ? (currentData.length > 0 ? currentData[0] : null) : currentData;
        // Return a promise that resolves to single result
        return Promise.resolve({ data: singleData, error })
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    insert: (values: any) => {
       // Mock insert by setting currentData to values (wrapped in array if needed)
       const toInsert = Array.isArray(values) ? values : [values];
       // Simulate that the DB now contains this (or returns this)
       // We add 'id' if missing for testing purposes
       const inserted = toInsert.map((item: any) => ({
           id: 'mock-id-' + Math.random().toString(36).substr(2, 9),
           ...item
       }));
       currentData = inserted;
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
