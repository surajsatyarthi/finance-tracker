'use client'

import { useState } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import { ArrowUpTrayIcon, DocumentTextIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import GlassCard from '@/components/GlassCard'
import { parseStatementCSV, ParsedTransaction } from '@/lib/statementParser'
import { financeManager } from '@/lib/supabaseDataManager'

export default function ImportPage() {
    useRequireAuth()
    const [file, setFile] = useState<File | null>(null)
    const [parsedData, setParsedData] = useState<ParsedTransaction[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [step, setStep] = useState<'upload' | 'review' | 'complete'>('upload')

    const [existingTxns, setExistingTxns] = useState<any[]>([])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)
            processFile(selectedFile)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const selectedFile = e.dataTransfer.files[0]
            setFile(selectedFile)
            processFile(selectedFile)
        }
    }

    const processFile = async (file: File) => {
        setIsProcessing(true)
        try {
            // 1. Fetch existing transactions if not already
            let currentTxns = existingTxns
            if (currentTxns.length === 0) {
                const fetched = await financeManager.getTransactions()
                setExistingTxns(fetched)
                currentTxns = fetched
            }

            // 2. Parse CSV
            const parsed = await parseStatementCSV(file)

            // 3. Reconcile
            const reconciled = await import('@/lib/statementParser').then(mod => mod.reconcileTransactions(parsed, currentTxns))

            setParsedData(reconciled)
            setStep('review')
        } catch (error) {
            console.error('Parse error:', error)
            alert('Failed to parse or reconcile.')
        } finally {
            setIsProcessing(false)
        }
    }

    const reset = () => {
        setFile(null)
        setParsedData([])
        setStep('upload')
    }

    const importTransaction = async (tx: ParsedTransaction) => {
        // TODO: Call financeManager.createTransaction
        alert(`Importing ${tx.description}`)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                    Reconcile Statements
                </h1>
                <p className="text-gray-600 mb-8">
                    Upload your bank or credit card statement to verify your manually entered transactions.
                </p>

                {step === 'upload' && (
                    <GlassCard>
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-500 transition-colors cursor-pointer bg-white/50"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                id="fileInput"
                                className="hidden"
                                accept=".csv"
                                onChange={handleFileUpload}
                            />
                            <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
                                <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                    <ArrowUpTrayIcon className="h-8 w-8 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Upload Statement (CSV)</h3>
                                <p className="text-sm text-gray-500 mt-2">Drag and drop or click to browse</p>
                                <p className="text-xs text-gray-400 mt-4">Supported formats: HDFC, SBI, ICICI (Standard CSV)</p>
                            </label>
                        </div>
                    </GlassCard>
                )}

                {step === 'review' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">Review Transactions</h2>
                            <div className="flex gap-2">
                                <span className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full">New: {parsedData.filter(t => t.status === 'new').length}</span>
                                <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Matched: {parsedData.filter(t => t.status === 'matched').length}</span>
                                <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-900 ml-4">Cancel</button>
                            </div>
                        </div>

                        <GlassCard>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {parsedData.map((tx, idx) => (
                                            <tr key={idx} className={tx.status === 'matched' ? 'bg-blue-50/50' : 'hover:bg-gray-50'}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.description}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {tx.status === 'matched' ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            Matched
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            New
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {tx.status === 'new' ? (
                                                        <button
                                                            onClick={() => importTransaction(tx)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Import
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400">Verified</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </div>
                )}
            </div>
        </div>
    )
}
