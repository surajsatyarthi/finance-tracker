'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, BuildingLibraryIcon, ChartBarIcon, CreditCardIcon, PlusIcon } from '@heroicons/react/24/outline'

const items = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Accounts', href: '/accounts', icon: BuildingLibraryIcon },
  { name: 'Budget', href: '/budget', icon: ChartBarIcon },
  { name: 'Cards', href: '/cards', icon: CreditCardIcon },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 glass-nav backdrop-blur-md md:hidden">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.name} href={item.href} className={`flex flex-col items-center text-xs ${active ? 'text-neutral-900' : 'text-neutral-600'}`}>
              <item.icon className={`h-6 w-6 ${active ? 'text-indigo-600' : 'text-neutral-500'}`} />
              <span className="mt-1">{item.name}</span>
            </Link>
          )
        })}
        <Link href="/transactions/add" className="btn-primary inline-flex items-center px-3 py-2 rounded-lg text-sm">
          <PlusIcon className="h-4 w-4 mr-1" />
          Add
        </Link>
      </div>
    </nav>
  )
}

