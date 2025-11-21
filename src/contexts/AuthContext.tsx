'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const localMode = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_LOCAL_MODE === 'true'
    if (localMode) {
      setLoading(false)
      return
    }
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        setSession(data.session ?? null)
        setUser(data.session?.user ?? null)
      } finally {
        setLoading(false)
      }
    }

    init()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])



  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setLoading(true)
      const localMode = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_LOCAL_MODE === 'true'
      if (localMode) {
        setSession(null)
        setUser(null)
        return { error: null }
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        return { error: error.message }
      }
      setSession(data.session ?? null)
      setUser(data.user ?? data.session?.user ?? null)

      // Best-effort data migration from localStorage (if any remnants)
      try {
        const { FinanceDataManager } = await import('../lib/supabaseDataManager')
        const mgr = FinanceDataManager.getInstance()
        const init = await mgr.initialize()
        if (init.success) {
          await mgr.migrateFromLocalStorage()
        }
      } catch (e) {
        console.warn('Migration skipped or failed:', e)
      }

      return { error: null }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during sign in'
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const localMode = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_LOCAL_MODE === 'true'
      if (localMode) {
        setUser(null)
        setSession(null)
        return { error: null }
      }
      const { error } = await supabase.auth.signOut()
      if (error) {
        return { error: error.message }
      }
      setUser(null)
      setSession(null)
      return { error: null }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during sign out'
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const localMode = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_LOCAL_MODE === 'true'
      if (localMode) {
        return { error: null }
      }
      const { supabase } = await import('../lib/supabase')
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      return { error: errorMessage }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper hook for protected routes
export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const localMode = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_LOCAL_MODE === 'true'

  useEffect(() => {
    if (localMode) {
      setShouldRedirect(false)
      return
    }
    if (!loading) {
      if (!user) {
        setShouldRedirect(true)
        router.push('/login')
      } else {
        setShouldRedirect(false)
      }
    }
  }, [user, loading, router, localMode])

  if (localMode) {
    return { user: null, loading: false, LoadingComponent: null }
  }

  if (loading || shouldRedirect) {
    return { 
      user: null, 
      loading: true,
      LoadingComponent: (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-success-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-semibold text-2xl">₹</span>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-success-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your finance tracker...</p>
          </div>
        </div>
      )
    }
  }

  return { user, loading: false, LoadingComponent: null }
}
