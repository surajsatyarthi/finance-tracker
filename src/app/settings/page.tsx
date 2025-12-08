'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { FinanceDataManager } from '@/lib/supabaseDataManager'
import {
    UserCircleIcon,
    ArrowDownTrayIcon,
    TrashIcon,
    PlusIcon,
    TagIcon
} from '@heroicons/react/24/outline'

interface Category {
    id: string
    name: string
    type: string
}

export default function SettingsPage() {
    const { user, signOut } = useAuth()
    const router = useRouter()
    const financeManager = FinanceDataManager.getInstance()

    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)

    // New Category Form
    const [newCategoryName, setNewCategoryName] = useState('')
    const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense')

    const loadSettings = async () => {
        setLoading(true)
        try {
            await financeManager.initialize()
            const cats = await financeManager.getCategories()
            setCategories(cats)
        } catch (error) {
            console.error('Error loading settings:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        console.log('SettingsPage Mounted. User:', user)
        loadSettings()
    }, [user])


    const handleLogout = async () => {
        try {
            await signOut()
            router.push('/login')
        } catch (error) {
            console.error('Error logging out:', error)
        }
    }

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCategoryName.trim()) return

        try {
            await financeManager.addCategory(newCategoryName, newCategoryType)
            setNewCategoryName('')
            loadSettings() // Reload list
        } catch (error) {
            console.error('Error adding category:', error)
            alert('Failed to add category')
        }
    }

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return

        try {
            await financeManager.deleteCategory(id)
            loadSettings()
        } catch (error) {
            console.error('Error deleting category:', error)
            alert('Failed to delete category')
        }
    }

    const handleExportData = async () => {
        setExporting(true)
        try {
            const data = await financeManager.exportUserData()
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error exporting data:', error)
            alert('Failed to export data')
        } finally {
            setExporting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your profile, data, and preferences</p>
                </div>

                {/* Profile Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserCircleIcon className="h-10 w-10 text-gray-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">Profile Logged In</h2>
                            <p className="text-gray-500">{user?.email}</p>
                            <p className="text-xs text-gray-400 font-mono mt-1">ID: {user?.id}</p>
                        </div>
                        <div className="ml-auto">
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Category Management */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <TagIcon className="h-5 w-5 text-gray-400" />
                            <h2 className="text-lg font-medium text-gray-900">Manage Categories</h2>
                        </div>
                    </div>

                    {/* Add Category Form */}
                    <form onSubmit={handleAddCategory} className="flex gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="New Category Name..."
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <select
                            value={newCategoryType}
                            onChange={(e) => setNewCategoryType(e.target.value as 'income' | 'expense')}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                        <button
                            type="submit"
                            disabled={!newCategoryName.trim()}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add
                        </button>
                    </form>

                    {/* Category List */}
                    {loading ? (
                        <div className="text-center py-4 text-gray-500">Loading categories...</div>
                    ) : (
                        <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
                            {categories.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No custom categories found.</p>
                            ) : (
                                categories.map((cat) => (
                                    <div key={cat.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className={`h-2 w-2 rounded-full ${cat.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCategory(cat.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Delete Category"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Data Management */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <ArrowDownTrayIcon className="h-5 w-5 text-gray-400" />
                        <h2 className="text-lg font-medium text-gray-900">Data & Privacy</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        Download a backup of all your financial data including transactions, accounts, and settings.
                    </p>

                    <button
                        onClick={handleExportData}
                        disabled={exporting}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {exporting ? 'Exporting...' : 'Export All Data (JSON)'}
                    </button>
                </div>

                <div className="text-center text-xs text-gray-400 pt-8">
                    Financial Tracker v1.0 • Secure & Private
                </div>
            </div>
        </div>
    )
}
