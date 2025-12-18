'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FinanceDataManager } from '@/lib/supabaseDataManager'
import { useRequireAuth } from '@/contexts/AuthContext'

export default function AddLoanPage() {
    const { user } = useRequireAuth()
    const router = useRouter()
    const financeManager = FinanceDataManager.getInstance()

    const [form, setForm] = useState({
        name: '',
        type: 'personal',
        principal_amount: '',
        interest_rate: '',
        tenure_months: '',
        start_date: new Date().toISOString().split('T')[0]
    })

    // Computed EMI for preview
    const emiPreview = (() => {
        const P = parseFloat(form.principal_amount)
        const R = parseFloat(form.interest_rate) / 12 / 100
        const N = parseInt(form.tenure_months)

        if (P && R && N) {
            const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1)
            return Math.round(emi)
        }
        return 0
    })()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (!user) return

            await financeManager.createLoan({
                name: form.name,
                type: form.type,
                principal_amount: parseFloat(form.principal_amount),
                interest_rate: parseFloat(form.interest_rate),
                total_emis: parseInt(form.tenure_months),
                emi_amount: emiPreview || 0, // Fallback or strict calc
                start_date: form.start_date
            })

            router.push('/loans')
        } catch (error) {
            console.error('Failed to create loan:', error)
            alert('Failed to create loan')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Add New Loan</h2>
                    <p className="mt-1 text-sm text-gray-500">Track a new liability</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Loan Name</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                            placeholder="e.g. HDFC Home Loan"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                            value={form.type}
                            onChange={e => setForm({ ...form, type: e.target.value })}
                        >
                            <option value="personal">Personal Loan</option>
                            <option value="home">Home Loan</option>
                            <option value="auto">Auto Loan</option>
                            <option value="education">Education Loan</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Principal (₹)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                                value={form.principal_amount}
                                onChange={e => setForm({ ...form, principal_amount: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                            <input
                                type="number"
                                required
                                step="0.1"
                                min="0"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                                value={form.interest_rate}
                                onChange={e => setForm({ ...form, interest_rate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tenure (Months)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                                value={form.tenure_months}
                                onChange={e => setForm({ ...form, tenure_months: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                                value={form.start_date}
                                onChange={e => setForm({ ...form, start_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-500">Projected EMI</span>
                            <span className="text-xl font-bold text-indigo-600">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(emiPreview)}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Create Loan
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
