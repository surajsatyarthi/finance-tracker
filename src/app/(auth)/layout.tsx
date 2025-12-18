'use client'

import React from 'react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-neutral-50 relative">
            <Header />
            <main className="pt-20 pb-24 lg:pt-0 lg:pb-0 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
            <BottomNav />
        </div>
    )
}
