'use client'

import { useState, useEffect } from 'react'
import {
    CloudArrowUpIcon,
    CheckCircleIcon,
    XCircleIcon,
    PlusCircleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'
import { FinanceDataManager } from '@/lib/supabaseDataManager'
import { Transaction } from '@/types/finance'
import { parseStatementCSV, ParsedTransaction } from '@/lib/statementParser'
import { useNotification } from '@/contexts/NotificationContext'
import { useRequireAuth } from '@/contexts/AuthContext'
import GlassCard from '@/components/GlassCard'
import { formatDate } from '@/lib/dateUtils'

export default function ReconcilePage() {
    const { user } = useRequireAuth()
    const { showNotification } = useNotification()
    const financeManager = FinanceDataManager.getInstance()

    const [file, setFile] = useState<File | null>(null)
    const [parsedTxns, setParsedTxns] = useState<ParsedTransaction[]>([])
    const [dbTxns, setDbTxns] = useState<Transaction[]>([])
    const [step, setStep] = useState<'upload' | 'review'>('upload')
    const [loading, setLoading] = useState(false)

    // Fetch recent DB transactions for matching
    useEffect(() => {
        if (user) {
            financeManager.getTransactions(500).then(res => {
                // Need custom mapping or extended type? 
                // EnhancedTransaction is close enough for matching
                setDbTxns(res as unknown as Transaction[])
            })
        }
    }, [user])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const processFile = async () => {
        if (!file) return
        setLoading(true)
        try {
            const results = await parseStatementCSV(file)

            // Auto-Match Logic
            const matched = results.map(pTx => {
                // MATCHING LOGIC: Same Amount, Same Type, Date within 2 days?
                const found = dbTxns.find(dTx => {
                    const amtMatch = Math.abs(dTx.amount - pTx.amount) < 1 // Tolerance
                    const typeMatch = dTx.type === pTx.type
                    // Date Check: simplistic for now, exact match or string compare
                    // Ideally use date-fns differenceInDays
                    return amtMatch && typeMatch
                })

                if (found) {
                    return { ...pTx, status: 'matched', matchedTransactionId: found.id, matchConfidence: 1.0 } as ParsedTransaction
                }
                return pTx
            })

            setParsedTxns(matched)
            setStep('review')
        } catch (error) {
            showNotification('Failed to parse CSV', 'error')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTransaction = async (idx: number) => {
        const txn = parsedTxns[idx]
        try {
            await financeManager.createTransaction({
                amount: txn.amount,
                type: txn.type,
                description: txn.description,
                date: txn.date,
                payment_method: 'unknown', // Default or prompt
                category: 'Uncategorized'
            })

            // Update local state
            const newTxns = [...parsedTxns]
            newTxns[idx].status = 'matched' // Effectively reconciled
            setParsedTxns(newTxns)
            showNotification('Transaction created', 'success')
        } catch (error) {
            showNotification('Failed to create transaction', 'error')
        }
    }

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Statement Reconciliation</h1>

                {step === 'upload' && (
                    <GlassCard className="p-12 text-center">
                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Upload Bank Statement</h3>
                        <p className="mt-1 text-sm text-gray-500">CSV files supported (HDFC, ICICI, Generic)</p>
                        <div className="mt-6">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        </div>
                        {file && (
                            <button
                                onClick={processFile}
                                disabled={loading}
                                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                            >
                                {loading ? 'Processing...' : 'Analyze Statement'}
                            </button>
                        )}
                    </GlassCard>
                )}

                {step === 'review' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">Review Transactions ({parsedTxns.length})</h2>
                            <button onClick={() => setStep('upload')} className="text-sm text-indigo-600 hover:text-indigo-500">Upload New File</button>
                        </div>

                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {parsedTxns.map((txn, idx) => (
                                    <li key={idx} className="bg-white hover:bg-gray-50 p-4">
                                        <div className="flex items-center justify-between">

                                            {/* Status Icon */}
                                            <div className="flex-shrink-0 mr-4">
                                                {txn.status === 'matched' ? (
                                                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                                                ) : (
                                                    <XCircleIcon className="h-6 w-6 text-yellow-500" />
                                                )}
                                            </div>

                                            {/* Transaction Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-indigo-600 truncate">{txn.description}</p>
                                                    <div className="ml-2 flex-shrink-0 flex">
                                                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${txn.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {txn.type}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex justify-between">
                                                    <div className="sm:flex">
                                                        <p className="flex items-center text-sm text-gray-500">
                                                            {formatDate(txn.date)}
                                                        </p>
                                                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                            {formatCurrency(txn.amount)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="ml-6 flex-shrink-0 flex space-x-2">
                                                {txn.status === 'unmatched' && (
                                                    <button
                                                        onClick={() => handleCreateTransaction(idx)}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                                    >
                                                        <PlusCircleIcon className="h-4 w-4 mr-1" />
                                                        Add
                                                    </button>
                                                )}
                                                {txn.status === 'matched' && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Matched
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
