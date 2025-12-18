'use client'

import { useEffect, useState } from 'react'
import { FinanceDataManager } from '@/lib/supabaseDataManager'
import { Transaction } from '@/types/finance'
import { useRequireAuth } from '@/contexts/AuthContext'
import GlassCard from '@/components/GlassCard'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar, Legend
} from 'recharts'

export default function AnalyticsPage() {
    const { user } = useRequireAuth()
    const financeManager = FinanceDataManager.getInstance()
    const [data, setData] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            financeManager.getTransactions(1000).then(res => {
                setData(res as unknown as Transaction[])
                setLoading(false)
            })
        }
    }, [user])

    // --- Processing Logic ---

    // 1. Monthly Spending Trend (Last 6 months)
    const getMonthlyTrend = () => {
        const months: { [key: string]: number } = {}
        data.filter(t => t.type === 'expense').forEach(t => {
            const date = new Date(t.date)
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` // YYYY-MM
            months[key] = (months[key] || 0) + t.amount
        })
        return Object.entries(months).sort().map(([date, amount]) => ({ date, amount }))
    }

    // 2. Category Split
    const getCategorySplit = () => {
        const categories: { [key: string]: number } = {}
        data.filter(t => t.type === 'expense').forEach(t => {
            const cat = t.category || 'Uncategorized'
            categories[cat] = (categories[cat] || 0) + t.amount
        })
        return Object.entries(categories)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5) // Top 5
    }

    // 3. Cash Flow (Income vs Expense vs Savings) - Last 30 days
    const getCashFlow = () => {
        let income = 0
        let expense = 0
        data.forEach(t => {
            if (t.type === 'income') income += t.amount
            else expense += t.amount
        })
        return [
            { name: 'Income', amount: income, fill: '#10B981' },
            { name: 'Expense', amount: expense, fill: '#EF4444' },
            { name: 'Savings', amount: Math.max(0, income - expense), fill: '#3B82F6' },
        ]
    }

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981']

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Analytics...</div>

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <h1 className="text-2xl font-bold text-gray-900">Financial Analytics</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Spending Trend */}
                    <GlassCard className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Spending Trend</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={getMonthlyTrend()}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(val: number) => `₹${val}`} />
                                    <Area type="monotone" dataKey="amount" stroke="#6366f1" fill="#e0e7ff" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    {/* Category Split */}
                    <GlassCard className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Expenses by Category</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={getCategorySplit()}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {getCategorySplit().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val: number) => `₹${val}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    {/* Cash Flow */}
                    <GlassCard className="p-6 md:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Total Cash Flow Overview</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={getCashFlow()} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} />
                                    <Tooltip formatter={(val: number) => `₹${val}`} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                                        {getCashFlow().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}
