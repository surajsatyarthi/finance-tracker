'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  HomeIcon,
  BuildingLibraryIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  FlagIcon,
  CreditCardIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { usePrivacy } from '@/contexts/PrivacyContext'

export default function Header() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Accounts', href: '/accounts', icon: BuildingLibraryIcon },
    { name: 'Income', href: '/income', icon: ArrowTrendingUpIcon },
    { name: 'Expenses', href: '/expenses/add', icon: ArrowTrendingDownIcon },
    { name: 'Budget', href: '/budget', icon: ChartBarIcon },
    { name: 'Goals', href: '/goals', icon: FlagIcon },
    { name: 'Loans', href: '/loans', icon: ArrowTrendingDownIcon },
    { name: 'Savings & FDs', href: '/savings-fds', icon: FlagIcon },
    { name: 'Credit Cards', href: '/cards', icon: CreditCardIcon },
    { name: 'CC Liability', href: '/credit-card-liability', icon: ArrowTrendingDownIcon },
  ]

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close menus when navigation occurs
  useEffect(() => {
    setIsUserMenuOpen(false)
    setIsMobileMenuOpen(false)
  }, [pathname])

  const { locked, lock, unlock, setPassword } = usePrivacy()
  const [showLockPanel, setShowLockPanel] = useState(false)
  const [pwd, setPwd] = useState('')

  // Don't show header on login/signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Main Navigation - Left Side */}
          <nav className="hidden md:flex items-center space-x-1 flex-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                              (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-neutral-100 text-neutral-900'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <div className="icon-golden-card mr-2">
                    <item.icon className="h-4 w-4 icon-white" />
                  </div>
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Action Bar - Right Side */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Add Transaction Button */}
            <Link
              href="/transactions/add"
              className="hidden sm:inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
              style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
            >
              <div className="icon-golden-card mr-2">
                <PlusIcon className="h-4 w-4 icon-white" />
              </div>
              <span className="hidden lg:inline">Add Transaction</span>
              <span className="lg:hidden">Add</span>
            </Link>

            {/* Add Transaction - Mobile Icon Only */}
            <Link
              href="/transactions/add"
              className="sm:hidden p-2 rounded-md text-white hover:bg-green-700 transition-colors"
              style={{ backgroundColor: '#16a34a' }}
              aria-label="Add Transaction"
            >
              <div className="icon-golden-card">
                <PlusIcon className="h-5 w-5 icon-white" />
              </div>
            </Link>

            {/* Activity Log */}
            <Link
              href="/activity"
              aria-label="Activity Log"
              className="p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors relative"
            >
              <div className="icon-golden-card">
                <ClockIcon className="h-5 w-5 icon-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-success-500 rounded-full"></span>
            </Link>

            {/* Privacy Lock */}
            <button
              onClick={() => setShowLockPanel(true)}
              className={`px-2 py-2 rounded-md text-sm font-medium ${locked ? 'text-red-600' : 'text-neutral-700'} hover:bg-neutral-50`}
            >
              {locked ? 'Unlock' : 'Lock'}
            </button>

            {/* User Profile Dropdown */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                {/* User Profile Button */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1 px-2 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="icon-golden-card">
                    <UserIcon className="h-5 w-5 icon-white" />
                  </div>
                  <span className="hidden lg:inline text-sm truncate max-w-24">
                    {user.user_metadata?.name || user.email?.split('@')[0]}
                  </span>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.user_metadata?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>
                    
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false)
                          handleSignOut()
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
        </div>
      </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-success-500 hover:bg-success-600 transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav"
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div id="mobile-nav" className="md:hidden py-4 border-t border-white/20">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                                (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : 'text-premium-600 hover:bg-white/50'
                    }`}
                  >
                    <div className="icon-golden-card mr-3">
                      <item.icon className="h-5 w-5 icon-white" />
                    </div>
                    {item.name}
                  </Link>
                )
              })}
              <Link
                href="/transactions/add"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-green-500"
              >
                <div className="icon-golden-card mr-3">
                  <PlusIcon className="h-5 w-5 icon-white" />
                </div>
                Add Transaction
              </Link>
              
              {/* Mobile User Profile */}
              {user && (
                <div className="mx-4 mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-700">
                    <div className="icon-golden-card mr-3">
                      <UserIcon className="h-5 w-5 icon-white" />
                    </div>
                    <div>
                      <p className="font-medium">{user.user_metadata?.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      handleSignOut()
                    }}
                    className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {showLockPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm glass-card">
              <div className="px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{locked ? 'Unlock' : 'Set/Lock'}</h3>
                <input
                  type="password"
                  className="w-full glass-input px-3 py-2 rounded-md"
                  placeholder="Enter password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                />
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button className="px-3 py-2 rounded-md border" onClick={() => { setShowLockPanel(false); setPwd('') }}>Cancel</button>
                  <button
                    className="btn-primary px-3 py-2 rounded-md"
                    onClick={async () => {
                      if (!locked) {
                        const ok = await setPassword(pwd)
                        if (ok) { lock(); setShowLockPanel(false); setPwd('') }
                        return
                      }
                      const ok = unlock(pwd)
                      if (ok) { setShowLockPanel(false); setPwd('') }
                    }}
                  >
                    {locked ? 'Unlock' : 'Lock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
