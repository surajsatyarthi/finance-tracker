'use client'

import DataBackup from '@/components/DataBackup'
import DataImport from '@/components/DataImport'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
    const { signOut } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await signOut()
            router.push('/login')
        } catch (error) {
            console.error('Error logging out:', error)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings & Data Management</h1>
                <p className="text-gray-600">Import, export, and backup your financial data</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-blue-900">Cloud Data Management</h3>
                    <p className="text-blue-700 text-sm mt-1">Manage database records and hydrate initial data.</p>
                </div>
                <button
                    onClick={() => router.push('/infra')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                >
                    Manage Infra & Data
                </button>
            </div>

            <div className="space-y-6">
                {/* Data Import */}
                <DataImport />

                {/* Data Backup */}
                <DataBackup />

                {/* Sign Out Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h2>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    )
}
