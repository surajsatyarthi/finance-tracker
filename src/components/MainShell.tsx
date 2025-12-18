'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from './Header'
import BottomNav from './BottomNav'
import PWARegister from './PWARegister'

export default function MainShell({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const pathname = usePathname()

    // Determine if we should show the authenticated shell
    // We hide it on /login and if the user is definitely logged out
    const isPublicPage = pathname === '/login'
    const showShell = !isPublicPage && (loading || !!user)

    if (!showShell) {
        return (
            <div className="min-h-screen bg-slate-50">
                <main>
                    {children}
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <PWARegister />
            <Header />
            {/* The padding is only applied when the shell is active */}
            <main className="pt-20 pb-24 lg:pt-0 lg:pb-0 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
            <BottomNav />
        </div>
    )
}
