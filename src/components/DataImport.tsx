'use client'

import { useState } from 'react'
import { ArrowUpTrayIcon, CheckCircleIcon, XCircleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { parseCSV, validateImportData, type ImportResult, type ImportRow } from '@/lib/importParser'
import { financeManager } from '@/lib/supabaseDataManager'

export default function DataImport() {
    const [importing, setImporting] = useState(false)
    const [result, setResult] = useState<ImportResult | null>(null)
    const [preview, setPreview] = useState<ImportRow[]>([])
    const [showPreview, setShowPreview] = useState(false)

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setImporting(true)
        setResult(null)
        setPreview([])

        try {
            const importResult = await parseCSV(file)

            // Validate the data
            const validation = validateImportData(importResult.data)

            if (!validation.valid) {
                setResult({
                    ...importResult,
                    success: false,
                    errors: [...importResult.errors, ...validation.errors]
                })
                setImporting(false)
                return
            }

            // Show preview
            setPreview(importResult.data)
            setShowPreview(true)
            setImporting(false)
        } catch (error) {
            setResult({
                success: false,
                imported: 0,
                failed: 0,
                errors: [error instanceof Error ? error.message : 'Failed to parse file'],
                data: []
            })
            setImporting(false)
        }
    }

    const confirmImport = async () => {
        setImporting(true)
        let imported = 0
        let failed = 0
        const errors: string[] = []

        // Process sequentially to avoid rate limits or race conditions
        for (let i = 0; i < preview.length; i++) {
            const row = preview[i]
            try {
                await financeManager.createTransaction({
                    amount: row.amount,
                    type: row.type, // 'income' or 'expense'
                    description: row.description,
                    date: row.date,
                    category: row.category,
                    payment_method: row.paymentMethod || 'cash',
                    // Note: We are not interacting with account_id here as we'd need to lookup IDs by name. 
                    // Future enhancement: Fetch accounts and map row.bankAccount to account_id.
                })
                imported++
            } catch (error) {
                failed++
                errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Failed to import'}`)
            }
        }

        setResult({
            success: failed === 0,
            imported,
            failed,
            errors,
            data: preview
        })
        setShowPreview(false)
        setImporting(false)
    }

    const downloadTemplate = () => {
        const template = `date,description,amount,category,type,payment_method,bank_account
2024-01-15,Salary,50000,Salary,income,,HDFC Bank
2024-01-16,Groceries,2500,Food,expense,upi,
2024-01-17,Electricity Bill,1200,Utilities,expense,bank_transfer,HDFC Bank`

        const blob = new Blob([template], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'transaction_import_template.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Import Transactions</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Upload a CSV file to bulk import your transactions
                    </p>
                </div>
                <button
                    onClick={downloadTemplate}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                    Download Template
                </button>
            </div>

            {/* File Upload */}
            <div className="mb-6">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ArrowUpTrayIcon className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">CSV files only</p>
                    </div>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={importing}
                    />
                </label>
            </div>

            {/* Loading State */}
            {importing && (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="ml-3 text-gray-600">Processing file...</p>
                </div>
            )}

            {/* Preview */}
            {showPreview && preview.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-gray-900">
                            Preview ({preview.length} transactions)
                        </h4>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setShowPreview(false)
                                    setPreview([])
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmImport}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                            >
                                Confirm Import
                            </button>
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {preview.slice(0, 10).map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm text-gray-900">{row.date}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{row.description}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">₹{row.amount.toLocaleString()}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{row.category}</td>
                                        <td className="px-4 py-2 text-sm">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${row.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {row.type}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {preview.length > 10 && (
                            <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500 text-center">
                                ... and {preview.length - 10} more transactions
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Result */}
            {result && !showPreview && (
                <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-start">
                        {result.success ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" />
                        ) : (
                            <XCircleIcon className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                            <h4 className={`text-sm font-semibold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                                {result.success ? 'Import Successful!' : 'Import Failed'}
                            </h4>
                            <p className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                                {result.imported > 0 && `${result.imported} transactions imported successfully. `}
                                {result.failed > 0 && `${result.failed} transactions failed.`}
                            </p>
                            {result.errors.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-sm font-medium text-red-900 mb-1">Errors:</p>
                                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                        {result.errors.slice(0, 5).map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                        {result.errors.length > 5 && (
                                            <li>... and {result.errors.length - 5} more errors</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">CSV Format Requirements:</h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Required columns: <code className="bg-blue-100 px-1 rounded">date</code>, <code className="bg-blue-100 px-1 rounded">description</code>, <code className="bg-blue-100 px-1 rounded">amount</code></li>
                    <li>Optional columns: <code className="bg-blue-100 px-1 rounded">category</code>, <code className="bg-blue-100 px-1 rounded">type</code>, <code className="bg-blue-100 px-1 rounded">payment_method</code>, <code className="bg-blue-100 px-1 rounded">bank_account</code></li>
                    <li>Date format: YYYY-MM-DD or DD/MM/YYYY</li>
                    <li>Type: &quot;income&quot; or &quot;expense&quot; (defaults to expense if not specified)</li>
                    <li>Amount: Positive numbers (negative amounts will be converted to expenses)</li>
                </ul>
            </div>
        </div>
    )
}
