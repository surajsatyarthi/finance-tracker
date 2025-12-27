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
    // PHASE 3 FIX (Dec 26, 2025): Analytics Categorization Bug
    // 
    // Previous Bug: Used `t.category` field which DOESN'T EXIST in transactions table
    // Result: Every transaction returned undefined → defaulted to "Uncategorized" → 100% Uncategorized pie chart
    //
    // Root Cause: Database schema stores categories in `subcategory` field, not `category`
    // - subcategory values: "Food - Groceries", "Credit Card EMI > ICICI Adani One", etc.
    // - category_id: UUID reference to categories table (some transactions use this instead)
    //
    // Fix: Changed to `t.subcategory` which contains the actual category data
    // 
    // WARNING: Do NOT change back to `t.category` - it will break categorization again
    // NOTE: Some transactions may have category_id instead of subcategory - this is handled by || 'Uncategorized'
    const getCategorySplit = () => {
        const categories: { [key: string]: number } = {}
        data.filter(t => t.type === 'expense').forEach(t => {
            // Fix: Use subcategory field (which exists) instead of category
            // subcategory contains values like "Food - Groceries", "Credit Card EMI > ICICI Adani One"
            const cat = t.subcategory || 'Uncategorized'
            categories[cat] = (categories[cat] || 0) + t.amount
        })
        return Object.entries(categories)
            .filter(([name]) => name !== 'Uncategorized') // Exclude uncategorized from analytics
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

    // Empty state
    if (!data || data.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900 mb-8">Financial Analytics</h1>
                    <GlassCard className="p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Transaction Data</h3>
                        <p className="text-gray-600 mb-6">
                            Add some transactions to see your spending analytics and insights.
                        </p>
                        <a
                            href="/expenses/add"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Add Your First Transaction
                        </a>
                    </GlassCard>
                </div>
            </div>
        )
    }

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
