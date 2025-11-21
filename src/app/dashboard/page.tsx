'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRequireAuth } from '../../contexts/AuthContext'
import {
  BanknotesIcon,
  ChartBarIcon,
  FlagIcon as TargetIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts'
import {
  getLiquidityData,
  getIncomeTransactions,
  getExpenseTransactions,
  getCreditCardLiabilitySummary,
  getFuturePayables,
  getLoans
} from '@/lib/dataManager'
import { getFDs, getCreditCards } from '@/lib/dataManager'
import { usePrivacy } from '@/contexts/PrivacyContext'
import GlassCard from '@/components/GlassCard'

interface Transaction {
  id: string
  amount: number
  type: string
  description: string | null
  date: string
  categories?: { name: string } | null
}

interface DashboardStats {
  totalAssets: number
  totalLiabilities: number
  monthlyIncome: number
  monthlyExpenses: number
  activeLoans: number
  activeGoals: number
  totalCreditCardBalance: number
  recentTransactions: Transaction[]
}

export default function Dashboard() {
  const { user, loading, LoadingComponent } = useRequireAuth()
  const { locked } = usePrivacy()
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    totalLiabilities: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    activeLoans: 0,
    activeGoals: 0,
    totalCreditCardBalance: 0,
    recentTransactions: []
  })
  const [dataLoading, setDataLoading] = useState(true)

  const loadDashboardData = useCallback(async () => {
    try {
      const liquidity = getLiquidityData()
      const totalAssets = liquidity.totalLiquidity
      const ccSummary = getCreditCardLiabilitySummary()
      const totalCreditCardBalance = ccSummary.totalOutstanding

      const currentDate = new Date()
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const incomes = getIncomeTransactions().filter(t => {
        const d = new Date(t.date)
        return d >= startOfMonth && d <= endOfMonth
      })
      const expenses = getExpenseTransactions().filter(t => {
        const d = new Date(t.date)
        return d >= startOfMonth && d <= endOfMonth
      })

      const monthlyIncome = incomes.reduce((sum, t) => sum + t.amount, 0)
      const monthlyExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)

      const recentTransactions: Transaction[] = [...incomes, ...expenses]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(t => ({
          id: t.id,
          amount: t.amount,
          type: (t as { type?: string; paymentMethod?: string }).type || (t as { paymentMethod?: string }).paymentMethod ? 'expense' : 'income',
          description: (t as { description?: string }).description || '',
          date: t.date,
          categories: null
        }))

      setStats({
        totalAssets,
        totalLiabilities: totalCreditCardBalance,
        monthlyIncome,
        monthlyExpenses,
        activeLoans: 0,
        activeGoals: 0,
        totalCreditCardBalance,
        recentTransactions
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const netWorth = stats.totalAssets - stats.totalLiabilities
  const monthlySavings = stats.monthlyIncome - stats.monthlyExpenses
  const partitionSplit = (() => {
    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const incomes = getIncomeTransactions().filter(t => {
      const d = new Date(t.date)
      return d >= startOfMonth && d <= endOfMonth
    })
    const expenses = getExpenseTransactions().filter(t => {
      const d = new Date(t.date)
      return d >= startOfMonth && d <= endOfMonth
    })
    const bi = incomes.filter(t => t.partition === 'business').reduce((s, t) => s + t.amount, 0)
    const pi = incomes.filter(t => t.partition !== 'business').reduce((s, t) => s + t.amount, 0)
    const be = expenses.filter(t => t.partition === 'business').reduce((s, t) => s + t.amount, 0)
    const pe = expenses.filter(t => t.partition !== 'business').reduce((s, t) => s + t.amount, 0)
    return { bi, pi, be, pe }
  })()

  const projection = (() => {
    const payables = getFuturePayables().filter(p => p.status !== 'paid')
    const recurringIncome = getIncomeTransactions().filter(t => t.recurring)
    const recurringExpense = getExpenseTransactions().filter(t => t.recurring)
    const now = new Date()
    const months = [0, 1, 2].map(offset => {
      const start = new Date(now.getFullYear(), now.getMonth() + offset, 1)
      const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)
      const outflows = payables
        .filter(p => {
          const d = new Date(p.dueDate)
          return d >= start && d <= end
        })
        .reduce((sum, p) => sum + p.amount, 0)
      const recurOut = recurringExpense.reduce((sum, t) => {
        const d = new Date(t.date)
        const isMonthly = t.recurring?.frequency === 'monthly'
        const isQuarter = t.recurring?.frequency === 'quarterly'
        const include = isMonthly || (isQuarter && ((start.getMonth() - d.getMonth() + 12) % 3 === 0))
        return include ? sum + t.amount : sum
      }, 0)
      const recurIn = recurringIncome.reduce((sum, t) => {
        const d = new Date(t.date)
        const isMonthly = t.recurring?.frequency === 'monthly'
        const isQuarter = t.recurring?.frequency === 'quarterly'
        const include = isMonthly || (isQuarter && ((start.getMonth() - d.getMonth() + 12) % 3 === 0))
        return include ? sum + t.amount : sum
      }, 0)
      return {
        label: start.toLocaleString('en-IN', { month: 'short' }),
        outflows: outflows + recurOut,
        inflows: recurIn,
      }
    })
    const startLiquidity = getLiquidityData().totalLiquidity
    const path = months.reduce<{ points: number[] }>((acc, m) => {
      const last = acc.points[acc.points.length - 1] ?? startLiquidity
      acc.points.push(Math.max(0, last + (m.inflows || 0) - m.outflows))
      return acc
    }, { points: [] })
    return { months, startLiquidity, path }
  })()

  const upcoming = (() => {
    const payables = getFuturePayables().filter(p => p.status !== 'paid')
    const now = new Date()
    const in30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30)
    const upcomingList = payables.filter(p => {
      const d = new Date(p.dueDate)
      return d >= now && d <= in30
    })
    const amount = upcomingList.reduce((sum, p) => sum + p.amount, 0)
    return { count: upcomingList.length, amount }
  })()

  const ratios = (() => {
    const loans = getLoans()
    const monthlyEmi = loans.reduce((sum, l) => sum + l.monthlyAmount, 0)
    const savingsRate = stats.monthlyIncome > 0 ? Math.round((monthlySavings / stats.monthlyIncome) * 100) : 0
    const debtService = stats.monthlyIncome > 0 ? Math.round((monthlyEmi / stats.monthlyIncome) * 100) : 0
    const liquidityRatio = stats.totalAssets > 0 ? Math.round(((stats.totalAssets - stats.totalLiabilities) / stats.totalAssets) * 100) : 0
    return { monthlyEmi, savingsRate, debtService, liquidityRatio }
  })()

  const csvStats = (() => {
    if (typeof window === 'undefined') return { loanInr: 0, annualExpenseInr: 0 }
    try {
      const loan = JSON.parse(localStorage.getItem('dashboard_total_loan') || '{"inr":0}')
      const annual = JSON.parse(localStorage.getItem('dashboard_annual_expense') || '{"inr":0}')
      return { loanInr: loan.inr || 0, annualExpenseInr: annual.inr || 0 }
    } catch {
      return { loanInr: 0, annualExpenseInr: 0 }
    }
  })()

  const reminders = (() => {
    const now = new Date()
    const soon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14)
    const emis = getFuturePayables()
      .filter(p => p.type === 'emi' && p.status !== 'paid')
      .filter(p => {
        const d = new Date(p.dueDate)
        return d >= now && d <= soon
      })
      .map(p => ({ kind: 'EMI', label: p.description, due: p.dueDate, amount: p.amount }))
    const fds = getFDs()
      .filter(fd => {
        const d = new Date(fd.maturityDate)
        return d >= now && d <= new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30)
      })
      .map(fd => ({ kind: 'FD', label: fd.name, due: fd.maturityDate, amount: fd.amount }))
    const cards = getCreditCards()
      .filter(c => c.isActive)
      .filter(c => {
        const due = new Date(now.getFullYear(), now.getMonth(), c.dueDate || 1)
        const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        return diff >= 0 && diff <= 14
      })
      .map(c => ({ kind: 'Card', label: c.name, due: new Date(now.getFullYear(), now.getMonth(), c.dueDate || 1).toISOString().split('T')[0], amount: c.currentBalance }))
    return [...emis, ...fds, ...cards].sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
  })()

  // Show auth loading screen if authenticating or redirecting
  if (LoadingComponent) {
    return LoadingComponent
  }

  // Show data loading screen if loading dashboard data
  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-success-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-semibold text-2xl">₹</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-success-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Clean Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
            Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-neutral-600">Here&apos;s an overview of your financial portfolio</p>
        </div>
        {/* Professional Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Worth</p>
                <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {locked ? '₹••••••' : `₹${Math.abs(netWorth).toLocaleString()}`}
                </p>
                <p className="text-sm text-gray-500">Assets minus liabilities</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-gray-900">{locked ? '₹••••••' : `₹${stats.monthlyIncome.toLocaleString()}`}</p>
                <p className="text-sm text-gray-500">Current month</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingDownIcon className="h-8 w-8 text-rose-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                <p className="text-2xl font-bold text-gray-900">{locked ? '₹••••••' : `₹${stats.monthlyExpenses.toLocaleString()}`}</p>
                <p className="text-sm text-gray-500">Current month</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Savings</p>
                <p className={`text-2xl font-bold ${monthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {locked ? '₹••••••' : `₹${Math.abs(monthlySavings).toLocaleString()}`}
                </p>
                <p className="text-sm text-gray-500">Income - Expenses</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard>
            <div className="flex items-center">
              <BuildingLibraryIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CSV Total Loan</p>
                <p className="text-2xl font-bold text-gray-900">₹{csvStats.loanInr.toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CSV Annual Expense</p>
                <p className="text-2xl font-bold text-gray-900">₹{csvStats.annualExpenseInr.toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Reminders</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reminders.map((r, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-3 text-sm text-gray-900">{r.kind}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{r.label}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{new Date(r.due).toLocaleDateString('en-IN')}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-right text-gray-900">₹{Number(r.amount || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {reminders.length === 0 && (
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>No upcoming reminders</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard>
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Business Income</p>
                <p className="text-2xl font-bold text-gray-900">₹{partitionSplit.bi.toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Personal Income</p>
                <p className="text-2xl font-bold text-gray-900">₹{partitionSplit.pi.toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center">
              <ArrowTrendingDownIcon className="h-8 w-8 text-rose-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Business Expenses</p>
                <p className="text-2xl font-bold text-gray-900">₹{partitionSplit.be.toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center">
              <ArrowTrendingDownIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Personal Expenses</p>
                <p className="text-2xl font-bold text-gray-900">₹{partitionSplit.pe.toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard>
            <div className="flex items-center">
              <ArrowTrendingDownIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming in 30 days</p>
                <p className="text-2xl font-bold text-gray-900">₹{upcoming.amount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{upcoming.count} items</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                <p className="text-2xl font-bold text-gray-900">{ratios.savingsRate}%</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center">
              <BuildingLibraryIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Debt Service</p>
                <p className="text-2xl font-bold text-gray-900">{ratios.debtService}%</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center">
              <BanknotesIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Liquidity Ratio</p>
                <p className="text-2xl font-bold text-gray-900">{ratios.liquidityRatio}%</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Financial Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Asset vs Liability Pie Chart */}
          <GlassCard>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Asset vs Liability Breakdown</h3>
            <div className="h-64 sm:h-72 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Assets', value: stats.totalAssets, fill: '#10B981' },
                      { name: 'Liabilities', value: stats.totalLiabilities, fill: '#EF4444' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#10B981" stroke="#ffffff" strokeWidth={3} />
                    <Cell fill="#EF4444" stroke="#ffffff" strokeWidth={3} />
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Monthly Income vs Expenses Bar Chart */}
          <GlassCard>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Monthly Financial Overview</h3>
            <div className="h-64 sm:h-72 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: 'This Month',
                      Income: stats.monthlyIncome,
                      Expenses: stats.monthlyExpenses,
                      Savings: monthlySavings > 0 ? monthlySavings : 0
                    }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#374151" fontSize={12} />
                  <YAxis stroke="#374151" fontSize={12} />
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="Income" fill="#10B981" stroke="#ffffff" strokeWidth={2} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#EF4444" stroke="#ffffff" strokeWidth={2} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Savings" fill="#3B82F6" stroke="#ffffff" strokeWidth={2} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* 3-Month Projection */}
        <GlassCard className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">3-Month Projection</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {projection.months.map((m, idx) => (
              <div key={m.label} className="rounded-lg border p-4">
                <p className="text-sm text-gray-600">{m.label}</p>
                <p className="text-lg font-bold text-rose-600">₹{m.outflows.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Projected outflows</p>
                {m.inflows ? (
                  <p className="text-sm mt-1 text-green-700">Inflows: <span className="font-semibold">₹{m.inflows.toLocaleString()}</span></p>
                ) : null}
                <p className="text-sm mt-2">Liquidity: <span className="font-semibold">₹{projection.path.points[idx].toLocaleString()}</span></p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">Start Liquidity: ₹{projection.startLiquidity.toLocaleString()}</p>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Clean Quick Actions */}
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/accounts"
                  className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    <div className="icon-golden-card">
                      <BuildingLibraryIcon className="h-5 w-5 icon-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Accounts</p>
                    <p className="text-sm text-gray-500">(10)</p>
                  </div>
                </Link>
                <Link
                  href="/transactions/add"
                  className="flex items-center p-4 rounded-lg bg-success-50 border border-success-200 hover:bg-success-100 transition-colors"
                >
                  <div className="p-2 bg-success-500 rounded-lg mr-3">
                    <div className="icon-golden-card">
                      <PlusIcon className="h-5 w-5 icon-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-success-900">Add Transaction</p>
                    <p className="text-sm text-success-600">Record Activity</p>
                  </div>
                </Link>
                <Link
                  href="/budget"
                  className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    <div className="icon-golden-card">
                      <ChartBarIcon className="h-5 w-5 icon-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Budget</p>
                    <p className="text-sm text-gray-500">(12)</p>
                  </div>
                </Link>
                <Link
                  href="/goals"
                  className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    <div className="icon-golden-card">
                      <TargetIcon className="h-5 w-5 icon-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Goals</p>
                    <p className="text-sm text-gray-500">(15)</p>
                  </div>
                </Link>
              </div>
            </div>
          </GlassCard>

          {/* Recent Transactions */}
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="icon-golden-card mr-2">
                    <ChartBarIcon className="h-5 w-5 icon-white" />
                  </div>
                  Recent Transactions
                </h3>
                <Link
                  href="/activity"
                  className="text-sm font-medium text-success-600 hover:text-success-700"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {stats.recentTransactions.length > 0 ? (
                  stats.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {transaction.description || 'Transaction'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.categories?.name} • {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`text-sm font-semibold px-2 py-1 rounded ${transaction.type === 'income' ? 'text-success-700 bg-success-100' : 'text-error-700 bg-error-100'}`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ChartBarIcon className="h-12 w-12 text-golden-500 icon-golden-shine mx-auto mb-4" />
                    <p className="text-gray-600">No transactions yet</p>
                    <p className="text-sm text-gray-500 mt-2">Start by adding your first transaction!</p>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
