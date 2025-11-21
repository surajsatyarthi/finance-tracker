'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const { showNotification } = useNotification()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('finance-tracker-email')
    const rememberPreference = localStorage.getItem('finance-tracker-remember')
    
    if (rememberedEmail && rememberPreference === 'true') {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn(email, password, rememberMe)
      
      if (result.error) {
        showNotification(result.error, 'error')
      } else {
        showNotification('Successfully logged in!', 'success')
        // Small delay to let user see success message
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      }
    } catch (error) {
      showNotification('Login failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden watermark-bg">
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-success-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-xl">₹</span>
            </div>
          </div>
          <h2 className="text-3xl font-semibold text-neutral-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-neutral-600">
            Personal Finance Management System
          </p>
        </div>
        <form 
          className="mt-8 bg-white rounded-lg border border-neutral-200 p-8" 
          onSubmit={handleSubmit}
          name="login"
        >
          
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-neutral-300 bg-white focus:ring-2 focus:ring-success-500 focus:border-success-500 transition-colors text-neutral-900 placeholder-neutral-500"
                placeholder="Enter your email address"
                data-lpignore="false"
                data-form-type="login"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 rounded-md border border-neutral-300 bg-white focus:ring-2 focus:ring-success-500 focus:border-success-500 transition-colors text-neutral-900 placeholder-neutral-500"
                  placeholder="Enter your password"
                  data-lpignore="false"
                  data-form-type="login"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center mt-6">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-success-600 focus:ring-success-500 border-neutral-300 rounded transition-colors"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700 font-medium">
                Remember me for 30 days
              </label>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-md text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px]"
              style={{ backgroundColor: '#16a34a', minHeight: '48px' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}