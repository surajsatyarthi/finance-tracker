'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useState } from 'react'

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    name: 'Accounts',
    href: '/accounts',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )
  },
  {
    name: 'Credit Cards',
    href: '/credit-cards',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )
  },
  {
    name: 'Loans',
    href: '/loans',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )
  },
  {
    name: 'Budgets',
    href: '/budgets',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
]

export default function AppLayout({ userEmail, children }: { userEmail: string; children: ReactNode }) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg flex flex-col flex-shrink-0 transition-all duration-300 relative`}>
        {/* Logo */}
        <div className="px-6 py-4 border-b border-gray-200">
          {isCollapsed ? (
            <Link href="/dashboard" className="text-xl font-bold text-gray-900 block text-center">
              FT
            </Link>
          ) : (
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              Finance Tracker
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-3 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href || pathname?.startsWith(item.href + '/')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isCollapsed ? item.name : ''}
            >
              {item.icon}
              {!isCollapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-gray-200">
          {!isCollapsed && (
            <div className="mb-3">
              <p className="text-xs text-gray-500">Signed in as</p>
              <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
            </div>
          )}
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors`}
              title="Sign out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!isCollapsed && <span className="ml-2">Sign Out</span>}
            </button>
          </form>
        </div>

        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border border-gray-300 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors z-10"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`w-3 h-3 text-gray-600 transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
