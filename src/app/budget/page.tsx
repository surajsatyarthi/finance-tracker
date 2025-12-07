'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import { financeManager } from '@/lib/supabaseDataManager'
import { useNotification } from '@/contexts/NotificationContext'
import { usePrivacy } from '@/contexts/PrivacyContext'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts'
import { budgetCategories, budgetProjections2025 } from '@/lib/budgetData'

// Helper to get dates
const getMonthDates = (year: number, month: number) => {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0]
  }
}

export default function BudgetPage() {
  const { user } = useRequireAuth()
  const { locked } = usePrivacy()
  const { showNotification } = useNotification()

  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [transactions, setTransactions] = useState<any[]>([])
  const [budgetLimits, setBudgetLimits] = useState<any[]>([])

  // Selection state
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [drillCategory, setDrillCategory] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { startDate, endDate } = getMonthDates(selectedYear, selectedMonth)
      const [txs, limits] = await Promise.all([
        financeManager.getTransactionsByDateRange(startDate, endDate),
        financeManager.getBudgetLimits(selectedMonth, selectedYear)
      ])
      // Filter out incomes, keep expenses
      setTransactions(txs.filter((t: any) => t.type === 'expense'))
      setBudgetLimits(limits || [])
    } catch (e) {
      console.error(e)
      showNotification('Failed to load budget data', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, selectedMonth, selectedYear, showNotification])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Analysis Logic
  const analysis = useMemo(() => {
    const categories: any[] = []
    let totalBudgeted = 0
    let totalActual = 0

    // Iterate defined categories
    Object.entries(budgetCategories).forEach(([key, info]) => {
      // Find limit
      const limitObj = budgetLimits.find((b: any) => b.category_name === key)
      const budgeted = limitObj ? limitObj.monthly_limit : 0

      // Calculate actuals
      const catTransactions = transactions.filter((t: any) => t.subcategory === key || t.category === key) // Support legacy/mixed fields
      const actual = catTransactions.reduce((sum, t) => sum + t.amount, 0)

      totalBudgeted += budgeted
      totalActual += actual

      categories.push({
        category: key,
        name: info.name,
        budgeted,
        actual,
        remaining: budgeted - actual,
        percentage: budgeted > 0 ? (actual / budgeted) * 100 : 0,
        transactions: catTransactions
      })
    })

    // Sort by actual DESC
    categories.sort((a, b) => b.actual - a.actual)

    // Alerts
    const alerts: any[] = []
    categories.forEach(cat => {
      if (cat.budgeted > 0 && cat.actual > cat.budgeted) {
        alerts.push({ type: 'danger', message: `Exceeded budget for ${cat.name}`, amount: cat.actual - cat.budgeted })
      } else if (cat.budgeted > 0 && cat.actual > cat.budgeted * 0.9) {
        alerts.push({ type: 'warning', message: `Approaching limit for ${cat.name}`, amount: cat.budgeted - cat.actual })
      }
    })

    return {
      categories,
      totalBudgeted,
      totalActual,
      overallPercentage: totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0,
      remaining: totalBudgeted - totalActual,
      overallStatus: totalActual > totalBudgeted ? 'over' : 'under',
      alerts
    }
  }, [transactions, budgetLimits])

  const handleUpdateLimit = async (category: string, amount: number) => {
    try {
      await financeManager.setBudgetLimit(selectedMonth, selectedYear, category, amount)
      await loadData() // Refresh
      showNotification('Budget limit updated', 'success')
    } catch (e) {
      showNotification('Failed to update limit', 'error')
    }
  }

  const handleCopyPrevious = async () => {
    try {
      // Fetch prev month
      let prevMonth = selectedMonth - 1
      let prevYear = selectedYear
      if (prevMonth < 0) { prevMonth = 11; prevYear -= 1 }

      const limits = await financeManager.getBudgetLimits(prevMonth, prevYear)
      if (limits.length === 0) {
        showNotification('No budget found for previous month', 'warning')
        return
      }

      // Apply to current
      await Promise.all(limits.map((l: any) =>
        financeManager.setBudgetLimit(selectedMonth, selectedYear, l.category_name, l.monthly_limit)
      ))

      await loadData()
      showNotification('Copied budget from previous month', 'success')
    } catch (e) {
      console.error(e)
      showNotification('Failed to copy budget', 'error')
    }
  }

  const handleImportProjections = async () => {
    if (!confirm('This will overwrite budget limits for 2025 with default projections. Continue?')) return

    setLoading(true)
    try {
      await financeManager.importYearlyBudget(2025, budgetProjections2025)

      await loadData()
      showNotification('Budget projections imported successfully', 'success')
    } catch (e) {
      console.error(e)
      showNotification('Failed to import projections', 'error')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Analysis</h1>
            <p className="text-gray-600">Real-time budget tracking (Cloud Sync)</p>
          </div>

          <div className="flex gap-4">
            <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} className="border rounded px-3 py-2 bg-white">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
            <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="border rounded px-3 py-2 bg-white">
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </div>

        {/* Alerts */}
        {analysis.alerts.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.alerts.map((alert, i) => (
              <div key={i} className={`p-4 rounded-lg flex items-center ${alert.type === 'danger' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'}`}>
                <ExclamationTriangleIcon className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-sm">Difference: {formatCurrency(alert.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <p className="text-sm text-gray-600">Total Budget</p>
            <p className="text-2xl font-bold text-indigo-600">{locked ? '₹••••••' : formatCurrency(analysis.totalBudgeted)}</p>
          </div>
          <div className="glass-card p-6">
            <p className="text-sm text-gray-600">Total Spent</p>
            <p className={`text-2xl font-bold ${analysis.overallStatus === 'over' ? 'text-red-600' : 'text-green-600'}`}>
              {locked ? '₹••••••' : formatCurrency(analysis.totalActual)}
            </p>
          </div>
          <div className="glass-card p-6">
            <p className="text-sm text-gray-600">Remaining</p>
            <p className="text-2xl font-bold text-gray-900">{locked ? '₹••••••' : formatCurrency(analysis.remaining)}</p>
          </div>
          <div className="glass-card p-6">
            <p className="text-sm text-gray-600">Performance</p>
            <p className="text-2xl font-bold text-indigo-600">{analysis.overallPercentage.toFixed(0)}%</p>
          </div>
        </div>

        {/* Charts & Progress */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Category Breakdown</h2>
          <div className="overflow-x-auto pb-4">
            <div className="h-80" style={{ minWidth: Math.max(600, analysis.categories.length * 80) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.categories} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    formatter={(val: number) => formatCurrency(val)}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="budgeted" fill="#8884d8" name="Budget" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="budgeted" position="top" formatter={(val: number) => val > 0 ? formatCurrency(val) : ''} style={{ fill: '#4B5563', fontSize: '10px' }} />
                  </Bar>
                  <Bar dataKey="actual" fill="#82ca9d" name="Actual" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="actual" position="top" formatter={(val: number) => val > 0 ? formatCurrency(val) : ''} style={{ fill: '#4B5563', fontSize: '10px' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            {analysis.categories.map(cat => (
              <div key={cat.category} className="cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={() => setDrillCategory(cat.category)}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-sm text-gray-600">{cat.percentage.toFixed(0)}% ({formatCurrency(cat.actual)} / {formatCurrency(cat.budgeted)})</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${cat.actual > cat.budgeted ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, cat.percentage)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">Budget Settings</h2>
            <div className="flex gap-2">
              <button
                onClick={handleImportProjections}
                className="px-4 py-2 text-sm font-medium text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm !text-indigo-700"
              >
                Import 2026 Projections
              </button>
              <button onClick={handleCopyPrevious} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 px-3 py-2">Copy Last Month</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {analysis.categories.map(cat => (
              <div key={cat.category} className="border p-4 rounded-lg">
                <label className="block text-sm font-medium mb-1">{cat.name}</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Limit"
                  defaultValue={cat.budgeted || ''}
                  onBlur={(e) => handleUpdateLimit(cat.category, parseFloat(e.target.value || '0'))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Drill Modal */}
        {drillCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Transactions: {budgetCategories[drillCategory as keyof typeof budgetCategories]?.name}</h3>
                <button onClick={() => setDrillCategory(null)}>✕</button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.categories.find(c => c.category === drillCategory)?.transactions.map((t: any) => (
                    <tr key={t.id} className="border-b last:border-0">
                      <td className="py-2">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="py-2">{t.description}</td>
                      <td className="py-2 text-right">{formatCurrency(t.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
