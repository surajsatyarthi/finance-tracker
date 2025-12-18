'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    BanknotesIcon,
    PlusIcon,
    ArrowTrendingUpIcon,
    ChartPieIcon,
    CurrencyRupeeIcon,
    TrashIcon
} from '@heroicons/react/24/outline'
import { FinanceDataManager } from '@/lib/supabaseDataManager'
import { Investment } from '@/types/finance'
import { useNotification } from '@/contexts/NotificationContext'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export default function InvestmentsPage() {
    const router = useRouter()
    const { showNotification } = useNotification()
    const [investments, setInvestments] = useState<Investment[]>([])
    const [loading, setLoading] = useState(true)

    const financeManager = FinanceDataManager.getInstance()

    useEffect(() => {
        loadInvestments()
    }, [])

    const loadInvestments = async () => {
        try {
            await financeManager.initialize()
            const data = await financeManager.getInvestments()
            setInvestments(data as Investment[])
        } catch (error) {
            console.error('Error loading investments:', error)
            showNotification('Failed to load investments', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to remove ${name}?`)) {
            try {
                await financeManager.deleteInvestment(id)
                showNotification('Investment removed', 'success')
                loadInvestments()
            } catch (error) {
                showNotification('Error deleting investment', 'error')
            }
        }
    }

    const stats = useMemo(() => {
        const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount_invested), 0)
        const currentValue = investments.reduce((sum, inv) => sum + Number(inv.current_value), 0)
        const totalReturns = currentValue - totalInvested
        const returnsPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0

        return { totalInvested, currentValue, totalReturns, returnsPercentage }
    }, [investments])

    const chartData = useMemo(() => {
        const dataByType = investments.reduce((acc, inv) => {
            acc[inv.type] = (acc[inv.type] || 0) + Number(inv.current_value)
            return acc
        }, {} as Record<string, number>)

        return Object.entries(dataByType).map(([name, value]) => ({
            name: name.replace('_', ' ').toUpperCase(),
            value
        }))
    }, [investments])

    const COLORS = ['#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6']

    const formatCurrency = (amount: number) =>
        `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Investments</h1>
                        <p className="text-gray-600">Track and manage your long-term assets</p>
                    </div>
                    <Link
                        href="/investments/add"
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Asset
                    </Link>
                </div>

                {/* Portfolio Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Current Value</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.currentValue)}</p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Invested</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalInvested)}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <BanknotesIcon className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Returns</p>
                                <div className={`flex items-baseline mt-1 ${stats.totalReturns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.totalReturns)}</p>
                                    <span className="ml-2 text-sm font-medium">({stats.returnsPercentage.toFixed(1)}%)</span>
                                </div>
                            </div>
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${stats.totalReturns >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                <ArrowTrendingUpIcon className={`h-6 w-6 ${stats.totalReturns >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Chart */}
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                            <ChartPieIcon className="h-5 w-5 mr-2 text-gray-500" />
                            Allocation
                        </h3>
                        {chartData.length > 0 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                                No data available
                            </div>
                        )}
                    </div>

                    {/* List */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">Your Assets</h3>
                        </div>
                        {investments.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No investments found. Start building your portfolio!
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {investments.map((inv) => (
                                    <div key={inv.id} className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{inv.name}</h4>
                                            <p className="text-sm text-gray-500 capitalize">{inv.type.replace('_', ' ')}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="text-right mr-6">
                                                <p className="font-bold text-gray-900">{formatCurrency(inv.current_value)}</p>
                                                <p className={`text-xs ${inv.current_value >= inv.amount_invested ? 'text-green-600' : 'text-red-600'}`}>
                                                    {inv.current_value >= inv.amount_invested ? '+' : ''}
                                                    {formatCurrency(inv.current_value - inv.amount_invested)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(inv.id, inv.name)}
                                                className="p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
