'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRequireAuth } from '../../contexts/AuthContext'
// All data now comes from Supabase exclusively
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
      // Use Supabase data exclusively - NO localStorage fallback
      const { getTotalLiquidity } = await import('@/lib/simpleSupabaseManager')
      const { supabase } = await import('@/lib/supabase')
      
      // Get total assets from Supabase
      const totalAssets = await getTotalLiquidity()
      console.log('📊 Supabase total assets:', totalAssets)
      
      // Get credit card data from Supabase
      const { data: creditCards, error: ccError } = await supabase
        .from('credit_cards')
        .select('current_balance')
        .eq('user_id', user!.id)
        .eq('is_active', true)
      
      const totalCreditCardBalance = ccError || !creditCards 
        ? 0 
        : creditCards.reduce((sum, card) => sum + (card.current_balance || 0), 0)
      
      console.log('💳 Credit card liabilities:', totalCreditCardBalance)
      
      // Get transactions from Supabase
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()
      
      // Get current month transactions from Supabase
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user!.id)
        .gte('date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('date', currentMonth === 12 
          ? `${currentYear + 1}-01-01` 
          : `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`)
      
      let monthlyIncome = 0
      let monthlyExpenses = 0
      let recentTransactions: Transaction[] = []
      
      if (!txError && transactions) {
        const incomeTransactions = transactions.filter(t => t.type === 'income')
        const expenseTransactions = transactions.filter(t => t.type === 'expense')
        
        monthlyIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
        monthlyExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
        
        // Get recent 5 transactions
        recentTransactions = transactions
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
          .map(t => ({
            id: t.id,
            amount: t.amount,
            type: t.type,
            description: t.description || '',
            date: t.date,
            categories: null
          }))
      }
      
      console.log('📈 Monthly income from Supabase:', monthlyIncome)
      console.log('📉 Monthly expenses from Supabase:', monthlyExpenses)

      setStats({
        totalAssets,
        totalLiabilities: totalCreditCardBalance, // Only credit cards for now, will add loans later
        monthlyIncome,
        monthlyExpenses,
        activeLoans: 0, // Will get from Supabase loans table later
        activeGoals: 0, // Will get from Supabase goals table later
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="icon-golden-card">
                  <BanknotesIcon className="h-8 w-8 icon-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Worth</p>
                <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{Math.abs(netWorth).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Assets - Liabilities</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="icon-golden-card">
                  <ArrowTrendingUpIcon className="h-8 w-8 icon-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-blue-600">₹{stats.monthlyIncome.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Current Month Earnings</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="icon-golden-card">
                  <ArrowTrendingDownIcon className="h-8 w-8 icon-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                <p className="text-2xl font-bold text-red-600">₹{stats.monthlyExpenses.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Current Month Spending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="icon-golden-card">
                  <ChartBarIcon className="h-8 w-8 icon-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Savings</p>
                <p className={`text-2xl font-bold ${monthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{Math.abs(monthlySavings).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Income - Expenses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Asset vs Liability Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
          </div>

          {/* Monthly Income vs Expenses Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Clean Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
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
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
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
          </div>
        </div>
      </div>
    </div>
  )
}
