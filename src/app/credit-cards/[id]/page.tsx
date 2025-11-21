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
import {
    getCreditCards,
    getCreditCardTransactions,
    getCreditCardStatements,
    getCreditCardPayments,
    getCreditCardBalance,
    getCreditCardUtilization,
    getCreditCardAvailableCredit,
    type CreditCard,
    type ExpenseTransaction,
    type CreditCardStatement,
    type CreditCardPayment
} from '@/lib/dataManager'

export default function CreditCardDetailPage() {
    const params = useParams()
    const router = useRouter()
    const cardId = params.id as string

    const [card, setCard] = useState<CreditCard | null>(null)
    const [transactions, setTransactions] = useState<ExpenseTransaction[]>([])
    const [statements, setStatements] = useState<CreditCardStatement[]>([])
    const [payments, setPayments] = useState<CreditCardPayment[]>([])
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'statements' | 'payments'>('overview')

    useEffect(() => {
        if (typeof window === 'undefined') return

        const cards = getCreditCards()
        const foundCard = cards.find(c => c.id === cardId)

        if (!foundCard) {
            router.push('/credit-cards')
            return
        }

        setCard(foundCard)
        setTransactions(getCreditCardTransactions(cardId))
        setStatements(getCreditCardStatements(cardId))
        setPayments(getCreditCardPayments(cardId))
    }, [cardId, router])

    const stats = useMemo(() => {
        if (!card) return null

        return {
            balance: getCreditCardBalance(cardId),
            utilization: getCreditCardUtilization(cardId),
            availableCredit: getCreditCardAvailableCredit(cardId),
            totalTransactions: transactions.length,
            totalPayments: payments.reduce((sum, p) => sum + p.amount, 0),
            pendingStatements: statements.filter(s => s.status === 'pending').length
        }
    }, [card, cardId, transactions, payments, statements])

    if (!card || !stats) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`
    const maskCardNumber = (lastFour: string) => `**** **** **** ${lastFour || 'XXXX'}`

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/credit-cards')}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to Credit Cards
                    </button>

                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center mb-2">
                                    <CreditCardIcon className="h-8 w-8 mr-3" />
                                    <h1 className="text-3xl font-bold">{card.name}</h1>
                                </div>
                                <p className="text-indigo-100 text-lg">{maskCardNumber(card.lastFourDigits)}</p>
                                <div className="mt-4 flex items-center space-x-6 text-sm">
                                    <div>
                                        <span className="text-indigo-200">Expires</span>
                                        <span className="ml-2 font-semibold">{card.expiryMonth}/{card.expiryYear}</span>
                                    </div>
                                    <div>
                                        <span className="text-indigo-200">Due Date</span>
                                        <span className="ml-2 font-semibold">{card.dueDate}{getDaySuffix(card.dueDate)} of month</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-indigo-200 text-sm mb-1">Available Credit</p>
                                <p className="text-4xl font-bold">{formatCurrency(stats.availableCredit)}</p>
                                <p className="text-indigo-200 text-sm mt-2">
                                    of {formatCurrency(card.creditLimit)} limit
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
                                <p className={`text-2xl font-bold mt-1 ${stats.utilization > 70 ? 'text-red-600' :
                                    stats.utilization > 30 ? 'text-yellow-600' :
                                        'text-green-600'
                                    }`}>
                                    {Math.round(stats.utilization)}%
                                </p>
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
                                            <p className="text-base font-medium text-gray-900">{formatCurrency(card.annualFee)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Renewal Month</p>
                                            <p className="text-base font-medium text-gray-900">{card.renewalMonth || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Statement Date</p>
                                            <p className="text-base font-medium text-gray-900">{card.statementDate || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Status</p>
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${card.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {card.isActive ? 'Active' : 'Inactive'}
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
                                                        <p className="text-sm text-gray-500">{txn.date} • {txn.category}</p>
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
                                                        <td className="px-4 py-3 text-sm text-gray-900">{txn.date}</td>
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
