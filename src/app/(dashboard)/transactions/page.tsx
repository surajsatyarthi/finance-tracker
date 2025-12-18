'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
    PlusIcon,
    ArrowDownIcon,
    ArrowUpIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import { financeManager } from '@/lib/supabaseDataManager'
import { useRequireAuth } from '../../contexts/AuthContext'
import GlassCard from '@/components/GlassCard'

type TransactionItem = {
    id: string
    date: string
    amount: number
    description: string
    category: string
    type: 'income' | 'expense'
    paymentMethod?: string
    bankAccount?: string
}

export default function TransactionsPage() {
    const { user, LoadingComponent } = useRequireAuth()
    const [transactions, setTransactions] = useState<TransactionItem[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
    const [search, setSearch] = useState('')
    const [deleteModal, setDeleteModal] = useState<{ show: boolean; transaction: TransactionItem | null }>({ show: false, transaction: null })
    const [editModal, setEditModal] = useState<{ show: boolean; transaction: TransactionItem | null }>({ show: false, transaction: null })
    const [editForm, setEditForm] = useState({ amount: 0, description: '', category: '', date: '' })

    const loadTransactions = useCallback(async () => {
        if (!user) return
        setLoading(true)
        try {
            const [incomes, expenses] = await Promise.all([
                financeManager.getIncomeTransactions(),
                financeManager.getExpenseTransactions()
            ])

            const incomeItems = incomes.map(t => ({
                id: t.id,
                date: t.date,
                amount: t.amount,
                description: t.description || '',
                category: t.subcategory || 'General',
                type: 'income' as const,
                bankAccount: t.account_id || undefined
            }))

            const expenseItems = expenses.map(t => ({
                id: t.id,
                date: t.date,
                amount: t.amount,
                description: t.description || '',
                category: t.subcategory || 'General',
                type: 'expense' as const,
                paymentMethod: t.payment_method,
                bankAccount: t.account_id || undefined
            }))

            const all = [...incomeItems, ...expenseItems].sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )

            setTransactions(all)
        } catch (error) {
            console.error('Failed to load transactions:', error)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        loadTransactions()
    }, [loadTransactions])

    const filteredTransactions = transactions.filter(t => {
        const matchesFilter = filter === 'all' || t.type === filter
        const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
            t.category.toLowerCase().includes(search.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const handleDelete = async () => {
        if (!deleteModal.transaction) return

        const { success } = await financeManager.deleteTransaction(deleteModal.transaction.id)

        if (success) {
            await loadTransactions()
            setDeleteModal({ show: false, transaction: null })
        }
    }

    const handleEdit = async () => {
        if (!editModal.transaction) return

        const { success } = await financeManager.updateTransaction(editModal.transaction.id, {
            amount: editForm.amount,
            description: editForm.description,
            subcategory: editForm.category, // Map category to subcategory as per schema
            date: editForm.date
        })

        if (success) {
            await loadTransactions()
            setEditModal({ show: false, transaction: null })
        }
    }

    const openEditModal = (transaction: TransactionItem) => {
        setEditForm({
            amount: transaction.amount,
            description: transaction.description,
            category: transaction.category,
            date: transaction.date
        })
        setEditModal({ show: true, transaction })
    }

    if (LoadingComponent) return LoadingComponent

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-neutral-900">Transactions</h1>
                        <p className="text-neutral-600">View and manage your financial history</p>
                    </div>
                    <Link
                        href="/transactions/add"
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Transaction
                    </Link>
                </div>

                {/* Filters */}
                <GlassCard className="mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 p-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'all'
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('income')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'income'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                    }`}
                            >
                                Income
                            </button>
                            <button
                                onClick={() => setFilter('expense')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'expense'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                    }`}
                            >
                                Expense
                            </button>
                        </div>
                    </div>
                </GlassCard>

                {/* List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="mt-2 text-gray-500">Loading transactions...</p>
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                            <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {search || filter !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'Get started by adding your first transaction'}
                            </p>
                        </div>
                    ) : (
                        filteredTransactions.map((transaction) => (
                            <GlassCard key={transaction.id} className="hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                                            }`}>
                                            {transaction.type === 'income' ? (
                                                <ArrowUpIcon className="h-6 w-6 text-green-600" />
                                            ) : (
                                                <ArrowDownIcon className="h-6 w-6 text-red-600" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(transaction.date).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })} • {transaction.category}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                                            </p>
                                            {transaction.paymentMethod && (
                                                <p className="text-xs text-gray-500 capitalize">
                                                    {transaction.paymentMethod.replace('_', ' ')}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(transaction)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit transaction"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ show: true, transaction })}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete transaction"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        ))
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Delete Transaction</h3>
                            <button
                                onClick={() => setDeleteModal({ show: false, transaction: null })}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this transaction? This action cannot be undone.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-sm font-medium text-gray-900">{deleteModal.transaction?.description}</p>
                            <p className="text-sm text-gray-500">
                                ₹{deleteModal.transaction?.amount.toLocaleString()} • {deleteModal.transaction?.category}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ show: false, transaction: null })}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Edit Transaction</h3>
                            <button
                                onClick={() => setEditModal({ show: false, transaction: null })}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    value={editForm.amount}
                                    onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <input
                                    type="text"
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={editForm.date}
                                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setEditModal({ show: false, transaction: null })}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEdit}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
