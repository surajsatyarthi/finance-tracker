'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import { FinanceDataManager } from '@/lib/supabaseDataManager'
import { FuturePayable } from '@/types/finance'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import LiabilityCard from './components/LiabilityCard'

export default function LiabilitiesPage() {
    const { user } = useRequireAuth()
    const [loading, setLoading] = useState(true)
    const [liabilities, setLiabilities] = useState<FuturePayable[]>([])
    const [totalDue, setTotalDue] = useState(0)

    useEffect(() => {
        if (user) {
            loadData()
        }
    }, [user])

    const loadData = async () => {
        setLoading(true)
        try {
            const data = await FinanceDataManager.getInstance().getProjectedLiabilities()
            setLiabilities(data)
            setTotalDue(data.reduce((sum, item) => sum + item.amount, 0))
        } catch (error) {
            console.error('Failed to load liabilities', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Future Payables</h1>
                        <p className="text-gray-600 mt-2">
                            Real-time forecast of your credit card bills based on current usage.
                        </p>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-200 text-right">
                        <p className="text-sm text-gray-500 font-medium">Total Projected Due</p>
                        <p className="text-2xl font-bold text-gray-900">₹{totalDue.toLocaleString()}</p>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
                        </div>
                    ) : liabilities.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                            <h3 className="text-lg font-medium text-gray-900">No Upcoming Liabilities</h3>
                            <p className="text-gray-500 mt-1">You are all clear! No tracked credit card dues found.</p>
                        </div>
                    ) : (
                        <>
                            {/* Overdue Section (if any) */}
                            {liabilities.some(l => l.status === 'overdue') && (
                                <div className="mb-8">
                                    <h2 className="text-sm font-bold text-red-600 uppercase tracking-wide mb-3">Critical Action Required</h2>
                                    <div className="space-y-4">
                                        {liabilities.filter(l => l.status === 'overdue').map(l => (
                                            <LiabilityCard key={l.id} liability={l} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upcoming Section */}
                            <div>
                                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Upcoming Payments</h2>
                                <div className="space-y-4">
                                    {liabilities.filter(l => l.status !== 'overdue').map(l => (
                                        <LiabilityCard key={l.id} liability={l} />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    )
}
