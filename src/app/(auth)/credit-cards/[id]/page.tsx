'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    CreditCardIcon,
    ArrowLeftIcon,
    BanknotesIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    DocumentTextIcon,
    ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline'
import { FinanceDataManager } from '@/lib/supabaseDataManager'
import {
    type CreditCard,
    type Transaction as ExpenseTransaction,
    // type CreditCardStatement,
    // type CreditCardPayment
} from '@/types/finance'
import { formatDate } from '@/lib/dateUtils'

interface CreditCardStatement {
    id: string
    statementDate: string
    dueDate: string
    totalDue: number
    minimumDue: number
    newCharges: number
    status: string
}

interface CreditCardPayment {
    id: string
    paymentDate: string
    amount: number
    paymentMethod: string
    notes?: string
}

export default function CreditCardDetailPage() {
    const params = useParams()
    const router = useRouter()
    const cardId = params.id as string

    const [card, setCard] = useState<CreditCard | null>(null)
    const [transactions, setTransactions] = useState<ExpenseTransaction[]>([])
    const [statements, setStatements] = useState<CreditCardStatement[]>([])
    const [payments, setPayments] = useState<CreditCardPayment[]>([])
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'statements' | 'payments'>('overview')
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editForm, setEditForm] = useState({
        name: '',
        credit_limit: 0,
        last_four_digits: '',
        statement_date: null as number | null,
        due_date: null as number | null,
        annual_fee: 0
    })

    const financeManager = FinanceDataManager.getInstance()

    // Load initial edit form data when card loads
    useEffect(() => {
        if (card) {
            setEditForm({
                name: card.name,
                credit_limit: card.credit_limit,
                last_four_digits: card.last_four_digits || '',
                statement_date: card.statement_date || null,
                due_date: card.due_date || null,
                annual_fee: card.annual_fee || 0
            })
        }
    }, [card])

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!card) return

        try {
            setIsSaving(true)
            const updates = {
                name: editForm.name,
                credit_limit: editForm.credit_limit > 0 ? editForm.credit_limit : null,
                last_four_digits: editForm.last_four_digits,
                statement_date: editForm.statement_date,
                due_date: editForm.due_date,
                annual_fee: editForm.annual_fee
            }
            // @ts-ignore - DB type mismatch for credit_limit nullability vs local type
            await financeManager.updateCreditCard(card.id, updates)

            // Refresh local state by partially updating card
            setCard(prev => prev ? ({
                ...prev,
                ...updates,
                // Ensure optional fields are handled correctly types-wise if needed
            } as CreditCard) : null)

            setIsEditModalOpen(false)
        } catch (error) {
            console.error('Failed to update card:', error)
            alert('Failed to save changes. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeactivate = async () => {
        if (!card) return
        if (confirm(`Are you sure you want to deactivate ${card.name}? It will be hidden from lists.`)) {
            try {
                await financeManager.updateCreditCard(card.id, { is_active: false })
                router.push('/credit-cards')
            } catch (error) {
                console.error('Failed to deactivate card:', error)
                alert('Failed to deactivate card. Please try again.')
            }
        }
    }

    useEffect(() => {
        const loadData = async () => {
            await financeManager.initialize()
            // ... (rest of useEffect logic remains same, implicit via replace context if I match correctly. 
            // WAIT, simply replacing the function and the end of file is safer in two chunks. 
            // I will do handleDeactivate first.)
        }
    }, [cardId, router])
    // Actually, I can't put useEffect here if I'm replacing handleDeactivate. 
    // I will replace handleDeactivate ONLY first.

    // ... wait, I need to fix the JSX too.
    // I'll do handleDeactivate first.

    useEffect(() => {
        const loadData = async () => {
            await financeManager.initialize()
            const cards = await financeManager.getCreditCards()
            const foundCard = (cards as unknown as CreditCard[]).find(c => c.id === cardId)

            if (!foundCard) {
                router.push('/credit-cards')
                return
            }

            setCard(foundCard)
            // Fetch transactions
            const txs = await financeManager.getCreditCardTransactions(cardId)
            setTransactions(txs as unknown as ExpenseTransaction[])

            // Statements and Payments - Stubbed for now as DB schema support is partial
            setStatements([])
            setPayments([])
        }
        loadData()
    }, [cardId, router])

    const stats = useMemo(() => {
        if (!card) return null

        // Calculate stats locally from loaded data
        const balance = card.current_balance
        const util = card.credit_limit > 0 ? (balance / card.credit_limit) * 100 : 0
        const available = Math.max(0, card.credit_limit - balance)

        return {
            balance,
            utilization: util,
            availableCredit: available,
            totalTransactions: transactions.length,
            totalPayments: payments.reduce((sum, p) => sum + p.amount, 0),
            pendingStatements: statements.filter(s => s.status === 'pending').length
        }
    }, [card, transactions, payments, statements])

    if (!card || !stats) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    const formatCurrency = (amount: number | null | undefined) => `₹${(amount ?? 0).toLocaleString()}`
    const maskCardNumber = (lastFour: string) => `**** **** **** ${lastFour || 'XXXX'}`

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={() => router.push('/credit-cards')}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Credit Cards
                        </button>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 rounded-md hover:bg-indigo-50 transition-colors"
                            >
                                Edit Card
                            </button>
                            <button
                                onClick={handleDeactivate}
                                className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                            >
                                Deactivate
                            </button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center mb-2">
                                    <CreditCardIcon className="h-8 w-8 mr-3" />
                                    <h1 className="text-3xl font-bold">{card.name}</h1>
                                </div>
                                <p className="text-indigo-100 text-lg">{maskCardNumber(card.last_four_digits || '')}</p>
                                <div className="mt-4 flex items-center space-x-6 text-sm">
                                    <div>
                                        <span className="text-indigo-200">Due Date</span>
                                        <span className="ml-2 font-semibold">{card.due_date || 'N/A'}{card.due_date ? getDaySuffix(card.due_date) : ''} of month</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-indigo-200 text-sm mb-1">Available Credit</p>
                                <p className="text-4xl font-bold">{formatCurrency(stats.availableCredit)}</p>
                                <p className="text-indigo-200 text-sm mt-2">
                                    of {formatCurrency(card.credit_limit)} limit
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Current Balance</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.balance)}</p>
                            </div>
                            <BanknotesIcon className="h-10 w-10 text-orange-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Utilization</p>
                                <div className="flex items-end items-baseline space-x-2">
                                    <p className={`text-2xl font-bold mt-1 ${stats.utilization > 70 ? 'text-red-600' :
                                        stats.utilization > 30 ? 'text-yellow-600' :
                                            'text-green-600'
                                        }`}>
                                        {Math.round(stats.utilization)}%
                                    </p>
                                    <p className="text-sm text-gray-400 font-medium lowercase">used</p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                    <div
                                        className={`h-1.5 rounded-full transition-all duration-500 ${stats.utilization > 90 ? 'bg-red-600' :
                                            stats.utilization > 70 ? 'bg-orange-500' :
                                                stats.utilization > 30 ? 'bg-yellow-500' :
                                                    'bg-green-500'
                                            }`}
                                        style={{ width: `${Math.min(stats.utilization, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            <ChartBarIcon className="h-10 w-10 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Transactions</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalTransactions}</p>
                            </div>
                            <DocumentTextIcon className="h-10 w-10 text-purple-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Statements</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingStatements}</p>
                            </div>
                            <ClipboardDocumentCheckIcon className="h-10 w-10 text-green-500" />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            {[
                                { id: 'overview', label: 'Overview' },
                                { id: 'transactions', label: `Transactions (${transactions.length})` },
                                { id: 'statements', label: `Statements (${statements.length})` },
                                { id: 'payments', label: `Payments (${payments.length})` }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as 'overview' | 'transactions' | 'statements' | 'payments')}
                                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Annual Fee</p>
                                            <p className="text-base font-medium text-gray-900">{formatCurrency(card.annual_fee || 0)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Statement Date</p>
                                            <p className="text-base font-medium text-gray-900">{card.statement_date || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Status</p>
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${card.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {card.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                                    {transactions.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">No transactions yet</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {transactions.slice(0, 5).map(txn => (
                                                <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{txn.description}</p>
                                                        <p className="text-sm text-gray-500">{formatDate(txn.date)} • {txn.category}</p>
                                                    </div>
                                                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(txn.amount)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Transactions Tab */}
                        {activeTab === 'transactions' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Transactions</h3>
                                {transactions.length === 0 ? (
                                    <p className="text-gray-500 text-center py-12">No transactions found</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {transactions.map(txn => (
                                                    <tr key={txn.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-gray-900">{formatDate(txn.date)}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{txn.description}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">{txn.category}</td>
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(txn.amount)}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${txn.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                                txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {txn.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Statements Tab */}
                        {activeTab === 'statements' && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Statements</h3>
                                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                                        Add Statement
                                    </button>
                                </div>
                                {statements.length === 0 ? (
                                    <p className="text-gray-500 text-center py-12">No statements found</p>
                                ) : (
                                    <div className="space-y-4">
                                        {statements.map(stmt => (
                                            <div key={stmt.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">Statement Date: {stmt.statementDate}</p>
                                                        <p className="text-sm text-gray-500">Due: {stmt.dueDate}</p>
                                                    </div>
                                                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${stmt.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                        stmt.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {stmt.status}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-600">Total Due</p>
                                                        <p className="font-semibold text-gray-900">{formatCurrency(stmt.totalDue)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Minimum Due</p>
                                                        <p className="font-semibold text-gray-900">{formatCurrency(stmt.minimumDue)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">New Charges</p>
                                                        <p className="font-semibold text-gray-900">{formatCurrency(stmt.newCharges)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payments Tab */}
                        {activeTab === 'payments' && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                                        Record Payment
                                    </button>
                                </div>
                                {payments.length === 0 ? (
                                    <p className="text-gray-500 text-center py-12">No payments recorded</p>
                                ) : (
                                    <div className="space-y-3">
                                        {payments.map(payment => (
                                            <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {payment.paymentDate} • {payment.paymentMethod.replace('_', ' ')}
                                                    </p>
                                                    {payment.notes && (
                                                        <p className="text-sm text-gray-600 mt-1">{payment.notes}</p>
                                                    )}
                                                </div>
                                                <CalendarDaysIcon className="h-6 w-6 text-gray-400" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Modal */}
                {
                    isEditModalOpen && card && (
                        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsEditModalOpen(false)}></div>
                                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                    <form onSubmit={handleEditSubmit}>
                                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                                                Edit Credit Card
                                            </h3>
                                            <div className="grid gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Card Name</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={editForm.name}
                                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Credit Limit</label>
                                                        <div className="mt-1 relative rounded-md shadow-sm">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <span className="text-gray-500 sm:text-sm">₹</span>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={editForm.credit_limit || ''}
                                                                onChange={e => setEditForm({ ...editForm, credit_limit: e.target.value ? Number(e.target.value) : 0 })}
                                                                placeholder="Leave empty for Debit Card"
                                                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Last 4 Digits</label>
                                                    <input
                                                        type="text"
                                                        maxLength={4}
                                                        pattern="\d{4}"
                                                        value={editForm.last_four_digits}
                                                        onChange={e => setEditForm({ ...editForm, last_four_digits: e.target.value })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Statement Day</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="31"
                                                            value={editForm.statement_date || ''}
                                                            onChange={e => setEditForm({ ...editForm, statement_date: Number(e.target.value) || null })}
                                                            placeholder="Day (1-31)"
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Due Day</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="31"
                                                            value={editForm.due_date || ''}
                                                            onChange={e => setEditForm({ ...editForm, due_date: Number(e.target.value) || null })}
                                                            placeholder="Day (1-31)"
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Annual Fee</label>
                                                        <div className="mt-1 relative rounded-md shadow-sm">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <span className="text-gray-500 sm:text-sm">₹</span>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={editForm.annual_fee}
                                                                onChange={e => setEditForm({ ...editForm, annual_fee: Number(e.target.value) })}
                                                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                            >
                                                {isSaving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditModalOpen(false)}
                                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    )
}



function getDaySuffix(day: number): string {
    if (day >= 11 && day <= 13) return 'th'
    switch (day % 10) {
        case 1: return 'st'
        case 2: return 'nd'
        case 3: return 'rd'
        default: return 'th'
    }
}
