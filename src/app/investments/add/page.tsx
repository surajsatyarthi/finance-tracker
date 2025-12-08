'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { FinanceDataManager } from '@/lib/supabaseDataManager'
import { useNotification } from '@/contexts/NotificationContext'

export default function AddInvestmentPage() {
    const router = useRouter()
    const { showNotification } = useNotification()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        type: 'stock',
        amount_invested: '',
        current_value: '',
        quantity: '',
        purchase_date: new Date().toISOString().split('T')[0]
    })

    const financeManager = FinanceDataManager.getInstance()

    const investmentTypes = [
        { id: 'stock', label: 'Stock' },
        { id: 'mutual_fund', label: 'Mutual Fund' },
        { id: 'gold', label: 'Gold' },
        { id: 'fd', label: 'Fixed Deposit' },
        { id: 'real_estate', label: 'Real Estate' },
        { id: 'crypto', label: 'Crypto' },
        { id: 'other', label: 'Other' }
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!formData.name || !formData.amount_invested) {
                showNotification('Please fill in required fields', 'error')
                return
            }

            await financeManager.createInvestment({
                name: formData.name,
                type: formData.type,
                amount_invested: parseFloat(formData.amount_invested),
                current_value: parseFloat(formData.current_value) || parseFloat(formData.amount_invested),
                quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
                purchase_date: formData.purchase_date
            })

            showNotification('Investment added successfully', 'success')
            router.push('/investments')
        } catch (error) {
            console.error('Error adding investment:', error)
            showNotification('Failed to add investment', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Back to Investments
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Asset</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Asset Name
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="e.g., Apple Stock, HDFC Mutual Fund"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type
                                </label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    {investmentTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Purchase Date
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.purchase_date}
                                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Invested Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.amount_invested}
                                    onChange={(e) => setFormData({ ...formData, amount_invested: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Current Value (₹)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Leave empty if same"
                                    value={formData.current_value}
                                    onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Updates automatically later via API (Roadmap)</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity / Units (Optional)
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="e.g., 10 shares, 5.5 grams"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Adding Asset...' : 'Add Investment'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
