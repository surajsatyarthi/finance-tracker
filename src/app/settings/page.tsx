'use client'

import DataBackup from '@/components/DataBackup'
import DataImport from '@/components/DataImport'

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings & Data Management</h1>
                    <p className="text-gray-600">Import, export, and backup your financial data</p>
                </div>

                <div className="space-y-6">
                    {/* Data Import */}
                    <DataImport />

                    {/* Data Backup */}
                    <DataBackup />
                </div>
            </div>
        </div>
    )
}
