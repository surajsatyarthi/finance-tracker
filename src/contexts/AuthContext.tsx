'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

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
    // Check localStorage for login state (single-user mode)
    const isLoggedIn = localStorage.getItem('finance-tracker-logged-in')
    const userEmail = localStorage.getItem('finance-tracker-user-email')
    const sessionExpiry = localStorage.getItem('finance-tracker-session-expiry')
    const rememberMe = localStorage.getItem('finance-tracker-remember')
    
    if (isLoggedIn === 'true' && userEmail) {
      // Check if session is still valid
      let sessionValid = true
      
      if (rememberMe === 'true' && sessionExpiry) {
        // Long-term session with remember me
        const expiryDate = new Date(sessionExpiry)
        if (new Date() > expiryDate) {
          sessionValid = false
        }
      } else {
        // Short-term session without remember me (24 hours)
        const loginTime = localStorage.getItem('finance-tracker-login-time')
        if (loginTime) {
          const loginDate = new Date(loginTime)
          const now = new Date()
          const hoursSinceLogin = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60)
          if (hoursSinceLogin > 24) {
            sessionValid = false
          }
        }
      }
      
      if (sessionValid) {
        // Create a mock user object for single-user mode
        const mockUser = {
          id: 'single-user',
          email: userEmail,
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          user_metadata: {
            name: userEmail.split('@')[0]
          }
        } as User
        
        setUser(mockUser)
        setSession({ user: mockUser } as Session)
      } else {
        // Session expired, clear storage
        localStorage.removeItem('finance-tracker-logged-in')
        localStorage.removeItem('finance-tracker-user-email')
        localStorage.removeItem('finance-tracker-login-time')
        setUser(null)
        setSession(null)
      }
    } else {
      setUser(null)
      setSession(null)
    }
    
    setLoading(false)
  }, [])



  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setLoading(true)
      
      // Simple validation for single-user mode
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return { error: 'Please enter a valid email address' }
      }
      
      if (!password) {
        return { error: 'Please enter a password' }
      }
      
      // Store login state
      localStorage.setItem('finance-tracker-logged-in', 'true')
      localStorage.setItem('finance-tracker-user-email', email)
      localStorage.setItem('finance-tracker-login-time', new Date().toISOString())
      
      // Store remember me preference with timestamp
      if (rememberMe) {
        const expiryTime = new Date()
        expiryTime.setDate(expiryTime.getDate() + 30) // 30 days persistence
        localStorage.setItem('finance-tracker-remember', 'true')
        localStorage.setItem('finance-tracker-email', email)
        localStorage.setItem('finance-tracker-session-expiry', expiryTime.toISOString())
      } else {
        localStorage.removeItem('finance-tracker-remember')
        localStorage.removeItem('finance-tracker-email')
        localStorage.removeItem('finance-tracker-session-expiry')
      }
      
      // Create mock user and update state
      const mockUser = {
        id: 'single-user',
        email: email,
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        user_metadata: {
          name: email.split('@')[0]
        }
      } as User
      
      setUser(mockUser)
      setSession({ user: mockUser } as Session)

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
      
      // Clear all login data
      localStorage.removeItem('finance-tracker-logged-in')
      localStorage.removeItem('finance-tracker-user-email')
      localStorage.removeItem('finance-tracker-remember')
      localStorage.removeItem('finance-tracker-email')
      localStorage.removeItem('finance-tracker-session-expiry')
      localStorage.removeItem('finance-tracker-login-time')
      
      // Clear user state
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

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setShouldRedirect(true)
        router.push('/login')
      } else {
        setShouldRedirect(false)
      }
    }
  }, [user, loading, router])

  // Show loading screen while checking authentication or redirecting
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
