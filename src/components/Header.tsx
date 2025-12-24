'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bars3Icon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from './Sidebar'

export default function Header() {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Failsafe: Hide if on a public page
  const isPublicPage = pathname === '/' || pathname === '/login' || pathname?.startsWith('/login?') || pathname?.startsWith('/login/')
  if (isPublicPage) return null

  return (
    <>
      <header className="bg-white border-b border-neutral-200 shadow-sm h-16">
        <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">

          {/* Left: Hamburger + Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <Link href="/dashboard" className="text-xl font-bold text-gray-900 hidden sm:block">
              Finance Tracker
            </Link>
          </div>


          {/* Right: Actions (removed - moved to FAB) */}
          <div className="flex items-center gap-3">
          </div>
        </div>
      </header>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  )
}
