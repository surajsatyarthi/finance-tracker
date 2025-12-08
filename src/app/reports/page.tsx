'use client'

import { useState, useEffect, useMemo } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts'
import { ArrowDownTrayIcon, FunnelIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { FinanceDataManager } from '@/lib/supabaseDataManager'
import { useNotification } from '@/contexts/NotificationContext'
import GlassCard from '@/components/GlassCard'

export default function ReportsPage() {
    const { showNotification } = useNotification()
    const [loading, setLoading] = useState(true)
    const [year, setYear] = useState(new Date().getFullYear())
    const [flows, setFlows] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [netWorth, setNetWorth] = useState<any[]>([])

    const financeManager = FinanceDataManager.getInstance()

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6']

    useEffect(() => {
        loadData()
    }, [year])

    const loadData = async () => {
        try {
            setLoading(true)
            await financeManager.initialize()

            const [monthlyFlows, catBreakdown, history] = await Promise.all([
                financeManager.getMonthlyFlows(year),
                financeManager.getCategoryBreakdown(`${year}-01-01`, `${year}-12-31`),
                financeManager.getNetWorthHistory(30) // Last 30 days trend
            ])

            // Format flows for Chart
            const chartFlows = monthlyFlows.map((m: any) => ({
                name: MONTHS[m.month],
                Income: m.income,
                Expense: m.expense,
                Savings: m.income - m.expense
            }))

            setFlows(chartFlows)
            setCategories(catBreakdown)
            setNetWorth(history.map((h: any) => ({
                date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                value: h.net_worth
            })))

        } catch (error) {
            console.error('Error loading report data:', error)
            showNotification('Failed to load report data', 'error')
        } finally {
            setLoading(false)
        }
    }

    const exportReport = () => {
        // Placeholder for export
        showNotification('Export feature coming soon', 'info')
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            Reports & Analytics
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Detailed insights into your financial performance for {year}.
                        </p>
                    </div>
                    <div className="mt-4 flex md:ml-4 md:mt-0">
                        <div className="relative mr-2">
                            <select
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-3 pr-8"
                            >
                                {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={exportReport}
                            type="button"
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            <ArrowDownTrayIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="space-y-8">

                    {/* Row 1: Monthly Trends (Full Width) */}
                    <GlassCard>
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Monthly Income vs Expenses</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={flows} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{ fill: '#f3f4f6' }} />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    <Bar dataKey="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    {/* Row 2: Category Pie & Net Worth Line */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Category Breakdown */}
                        <GlassCard>
                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Expense Breakdown</h3>
                            <div className="h-80 w-full flex flex-col md:flex-row items-center">
                                <div className="h-72 w-full md:w-1/2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categories}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {categories.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-full md:w-1/2 pl-0 md:pl-8 mt-4 md:mt-0">
                                    <ul className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                                        {categories.map((cat, idx) => (
                                            <li key={idx} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center">
                                                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                                    <span className="text-gray-600 truncate max-w-[120px]" title={cat.name}>{cat.name}</span>
                                                </div>
                                                <span className="font-semibold text-gray-900">{formatCurrency(cat.value)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Net Worth Trend */}
                        <GlassCard>
                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Net Worth Trend (30 Days)</h3>
                            <div className="h-80 w-full">
                                {netWorth.length > 1 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={netWorth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} />
                                            <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                        <CalendarIcon className="h-12 w-12 mb-2 opacity-50" />
                                        <p>Not enough history yet</p>
                                        <p className="text-xs mt-1">Check back tomorrow!</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>

                </div>
            </div>
        </div>
    )
}
