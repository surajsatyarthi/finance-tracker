'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from './Header'
import BottomNav from './BottomNav'
import PWARegister from './PWARegister'

export default function MainShell({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const pathname = usePathname()

    // 1. Define truly public pages that must never show the shell
    // Using startsWith to handle any query params or sub-paths
    const isPublicPage = pathname === '/' || pathname?.startsWith('/login')

    // 2. Determine visibility: 
    // - Hide if on a public page
    // - Hide if definitely logged out (user is null)
    const showShell = !isPublicPage && !!user

    if (!showShell) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <main>
                    {children}
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50 relative">
            <Header />
            {/* 
              Global layout padding is strictly contained here.
              This prevents padding from affecting the login page.
            */}
            <main className="pt-20 pb-24 lg:pt-0 lg:pb-0 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
            <BottomNav />
        </div>
    )
}
