
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  WalletIcon,
  BanknotesIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  FlagIcon,
  CreditCardIcon,
  PresentationChartLineIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

import { useState } from 'react'
import FeedbackModal from './FeedbackModal'

const items = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Accounts', href: '/accounts', icon: WalletIcon },
  { name: 'Income', href: '/income', icon: BanknotesIcon },
  { name: 'Expenses', href: '/expenses/add', icon: ArrowTrendingDownIcon },
  { name: 'Budget', href: '/budget', icon: ChartBarIcon },
  { name: 'Goals', href: '/goals', icon: FlagIcon },
  { name: 'Loans', href: '/loans', icon: ArrowTrendingDownIcon },
  { name: 'Savings', href: '/savings-fds', icon: FlagIcon },
  { name: 'Cards', href: '/credit-cards', icon: CreditCardIcon },
  { name: 'Payables', href: '/liabilities', icon: ArrowTrendingDownIcon },
  { name: 'Analytics', href: '/analytics', icon: PresentationChartLineIcon },
]

export default function BottomNav() {
  const pathname = usePathname()

  const [feedbackOpen, setFeedbackOpen] = useState(false)

  if (pathname === '/login') return null

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-40 glass-nav backdrop-blur-md md:hidden border-t border-gray-200">
        <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 no-scrollbar pb-safe">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center min-w-[4.5rem] py-1 transition-colors rounded-lg ${active ? 'text-indigo-600' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
              >
                <item.icon className={`h-6 w-6 mb-1 ${active ? 'stroke-2' : ''}`} />
                <span className={`text-[10px] font-medium leading-tight ${active ? 'text-indigo-600' : 'text-neutral-500'}`}>
                  {item.name}
                </span>
              </Link>
            )
          })}

          {/* Feedback Button */}
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            className="flex flex-col items-center justify-center min-w-[4.5rem] py-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
          >
            <ChatBubbleLeftRightIcon className="h-6 w-6 mb-1 text-orange-500" />
            <span className="text-[10px] font-medium leading-tight text-neutral-500">Feedback</span>
          </button>

          {/* Add Transaction Button as the last item in the slider */}
          <Link
            href="/transactions/add"
            className="flex flex-col items-center justify-center min-w-[4.5rem] py-1 text-indigo-600"
          >
            <div className="bg-indigo-600 text-white p-2 rounded-full shadow-md mb-1">
              <PlusIcon className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-medium leading-tight text-indigo-600">Add</span>
          </Link>
        </div>
      </nav>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  )
}
