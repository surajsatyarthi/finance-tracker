'use client'

import { useState } from 'react'
import { financeManager } from '@/lib/supabaseDataManager'
import {
    ArrowDownTrayIcon,
    ShieldCheckIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline'

export default function BackupManager() {
    const [exporting, setExporting] = useState(false)
    const [lastBackup, setLastBackup] = useState<string | null>(null)

    const handleExport = async () => {
        try {
            setExporting(true)
            const data = await financeManager.exportUserData()

            // Create Blob and trigger download
            const jsonStr = JSON.stringify(data, null, 2)
            const blob = new Blob([jsonStr], { type: 'application/json' })
            const url = URL.createObjectURL(blob)

            const a = document.createElement('a')
            a.href = url
            a.download = `finance_backup_${new Date().toISOString().slice(0, 10)}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            setLastBackup(new Date().toLocaleTimeString())
        } catch (e) {
            console.error('Export failed', e)
            alert('Backup export failed. Please try again.')
        } finally {
            setExporting(false)
        }
    }

    return (
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6 mt-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                    <div className="p-3 bg-indigo-50 rounded-xl mr-4">
                        <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Data & Backup</h3>
                        <p className="text-sm text-gray-600">
                            {lastBackup
                                ? `Last backup saved at ${lastBackup}`
                                : 'Secure your financial data regularly'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {exporting ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Preparing Backup...
                        </span>
                    ) : (
                        <>
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                            Download Full Backup
                        </>
                    )}
                </button>
            </div>
            <div className="mt-4 flex items-center text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                <ExclamationCircleIcon className="h-4 w-4 mr-2" />
                This exports all your Accounts, Transactions, Cards, Loans, and Goals into a secure JSON file. Keep it safe.
            </div>
        </div>
    )
}
