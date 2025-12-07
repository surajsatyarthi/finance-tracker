'use client'

import { useState, useEffect } from 'react'
import { financeManager } from '@/lib/supabaseDataManager'
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function DataMigrationBanner() {
    const [show, setShow] = useState(false)
    const [migrating, setMigrating] = useState(false)
    const [result, setResult] = useState<{ success: boolean, message?: string } | null>(null)

    useEffect(() => {
        // Check if local data exists
        if (typeof window !== 'undefined') {
            const hasLocal = localStorage.getItem('transactions') || localStorage.getItem('bank_accounts')
            if (hasLocal) {
                // Optimally, check if cloud is empty or just always show for now?
                // Let's show if we haven't dismissed it
                const dismissed = localStorage.getItem('migration_banner_dismissed')
                if (!dismissed) setShow(true)
            }
        }
    }, [])

    const handleMigrate = async () => {
        setMigrating(true)
        const res = await financeManager.migrateFromLocalStorage()
        setMigrating(false)
        if (res.success) {
            setResult({ success: true, message: 'Migration complete! Please refresh.' })
            localStorage.setItem('migration_banner_dismissed', 'true')
            setTimeout(() => window.location.reload(), 2000)
        } else {
            setResult({ success: false, message: 'Migration failed: ' + res.error })
        }
    }

    const handleDismiss = () => {
        setShow(false)
        localStorage.setItem('migration_banner_dismissed', 'true')
    }

    if (!show) return null

    return (
        <div className="bg-indigo-600 rounded-lg shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                    <span className="flex p-2 rounded-lg bg-indigo-800">
                        <CloudArrowUpIcon className="h-6 w-6 text-white" />
                    </span>
                    <div className="ml-3 font-medium text-white max-w-xl">
                        <span className="md:hidden">Migrate local data to cloud?</span>
                        <span className="hidden md:inline">We found data in your local storage. Would you like to migrate it to the cloud (Supabase)?</span>
                    </div>
                </div>
                <div className="flex-shrink-0 order-3 w-full sm:order-2 sm:mt-0 sm:w-auto">
                    {!result ? (
                        <button
                            onClick={handleMigrate}
                            disabled={migrating}
                            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 disabled:opacity-50 w-full"
                        >
                            {migrating ? 'Migrating...' : 'Migrate Now'}
                        </button>
                    ) : (
                        <span className={`text-sm font-bold ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                            {result.message}
                        </span>
                    )}
                </div>
                <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                    <button type="button" onClick={handleDismiss} className="-mr-1 flex p-2 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2">
                        <span className="sr-only">Dismiss</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    )
}
