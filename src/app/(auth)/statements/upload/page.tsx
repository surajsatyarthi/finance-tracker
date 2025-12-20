'use client'

import { useState } from 'react'
import StatementPreview from '@/components/StatementPreview'
import { StatementData } from '@/scripts/statement-analyzer/types'

export default function UploadStatementPage() {
    const [file, setFile] = useState<File | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [extractedData, setExtractedData] = useState<StatementData | null>(null)
    const [currentBalance, setCurrentBalance] = useState<number>(0)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            setError(null)
            setSuccess(null)
            setExtractedData(null)
        }
    }

    const handleAnalyze = async () => {
        if (!file) return

        setIsAnalyzing(true)
        setError(null)
        setSuccess(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/analyze-statement', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to analyze statement')
            }

            setExtractedData(result.data)

            // Fetch current balance from database
            try {
                const balanceResponse = await fetch(
                    `/api/get-card?lastFour=${result.data.lastFourDigits}&cardName=${encodeURIComponent(result.data.cardName)}`
                )
                const balanceResult = await balanceResponse.json()

                if (balanceResponse.ok) {
                    setCurrentBalance(balanceResult.currentBalance)
                } else {
                    // Card might not exist yet, default to 0
                    setCurrentBalance(0)
                }
            } catch {
                setCurrentBalance(0)
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleConfirmUpdate = async () => {
        if (!extractedData) return

        setIsUpdating(true)
        setError(null)

        try {
            const response = await fetch('/api/update-balance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statementData: extractedData })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update balance')
            }

            setSuccess(result.message)
            setExtractedData(null)
            setFile(null)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsUpdating(false
            )
        }
    }

    const handleCancel = () => {
        setExtractedData(null)
        setFile(null)
    }

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Analyze Credit Card Statement</h1>

            {/* Success Message */}
            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">✅ {success}</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">❌ {error}</p>
                </div>
            )}

            {/* Upload Section */}
            {!extractedData && (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
                        <h2 className="text-lg sm:text-xl font-semibold mb-4">Upload Statement PDF</h2>

                        <div className="mb-6">
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Select PDF File
                            </label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2.5 touch-manipulation"
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Supports: ICICI, YES Bank, Indusind, RBL, SBI, Axis, HDFC
                            </p>
                        </div>

                        {file && (
                            <div className="mb-4 p-3 bg-blue-50 rounded">
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Selected:</span> {file.name}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleAnalyze}
                            disabled={!file || isAnalyzing}
                            className="w-full bg-blue-600 text-white py-3 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed touch-manipulation min-h-[48px]"
                        >
                            {isAnalyzing ? 'Analyzing...' : 'Analyze Statement'}
                        </button>
                    </div>
                </div>
            )}

            {/* Preview Section */}
            {extractedData && (
                <StatementPreview
                    data={extractedData}
                    currentBalance={currentBalance}
                    onConfirm={handleConfirmUpdate}
                    onCancel={handleCancel}
                    isUpdating={isUpdating}
                />
            )}
        </div>
    )
}
