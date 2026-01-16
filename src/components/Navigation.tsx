'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Accounts', href: '/accounts' },
  { name: 'Income', href: '/income' },
  { name: 'Expenses', href: '/expenses' },
  { name: 'Credit Cards', href: '/credit-cards' },
  { name: 'Loans', href: '/loans' },
  { name: 'EMIs', href: '/emis' },
  { name: 'BNPL', href: '/bnpl' },
  { name: 'Investments', href: '/investments' },
  { name: 'Fixed Deposits', href: '/fixed-deposits' },
  { name: 'Goals', href: '/goals' },
  { name: 'Transactions', href: '/transactions' },
  { name: 'Categories', href: '/categories' },
  { name: 'Budgets', href: '/budgets' },
  { name: 'Projections', href: '/projections' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Statement Analysis', href: '/statement-analysis' },
  { name: 'Future Payables', href: '/future-payables' },
]

export default function Navigation({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                Finance Tracker
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-4">{userEmail}</span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}
