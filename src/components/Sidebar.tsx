'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Accounts', href: '/accounts', icon: '🏦' },
  { name: 'Income', href: '/income', icon: '💵' },
  { name: 'Expenses', href: '/expenses', icon: '💸' },
  { name: 'Credit Cards', href: '/credit-cards', icon: '💳' },
  { name: 'Loans', href: '/loans', icon: '💰' },
  { name: 'EMIs', href: '/emis', icon: '📅' },
  { name: 'BNPL', href: '/bnpl', icon: '🛒' },
  { name: 'Investments', href: '/investments', icon: '📈' },
  { name: 'Fixed Deposits', href: '/fixed-deposits', icon: '🏛️' },
  { name: 'Goals', href: '/goals', icon: '🎯' },
  { name: 'Transactions', href: '/transactions', icon: '📝' },
  { name: 'Categories', href: '/categories', icon: '🏷️' },
  { name: 'Budgets', href: '/budgets', icon: '💹' },
  { name: 'Projections', href: '/projections', icon: '🔮' },
  { name: 'Analytics', href: '/analytics', icon: '🔍' },
  { name: 'Statement Analysis', href: '/statement-analysis', icon: '📑' },
  { name: 'Future Payables', href: '/future-payables', icon: '📆' },
]

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo */}
        <div className="px-6 py-4 border-b border-gray-200">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            Finance Tracker
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href || pathname?.startsWith(item.href + '/')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
            </div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="ml-2 text-sm text-gray-500 hover:text-gray-700"
                title="Sign out"
              >
                ↪
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main content area - to be filled by page content */}
    </div>
  )
}
