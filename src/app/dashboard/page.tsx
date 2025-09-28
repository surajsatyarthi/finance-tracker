'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRequireAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  CreditCardIcon, 
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
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
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
  const { user, loading } = useRequireAuth()
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
    if (!user) return
    try {
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()

      // Load accounts (assets)
      const { data: accounts } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', user?.id)
        .eq('is_active', true)

      const totalAssets = accounts?.reduce((sum, account) => sum + Number(account.balance), 0) || 0

      // Load loans (liabilities)
      const { data: loans } = await supabase
        .from('loans')
        .select('current_balance')
        .eq('user_id', user?.id)
        .eq('is_active', true)

      const totalLiabilities = loans?.reduce((sum, loan) => sum + Number(loan.current_balance), 0) || 0

      // Load credit cards
      const { data: creditCards } = await supabase
        .from('credit_cards')
        .select('current_balance')
        .eq('user_id', user?.id)
        .eq('is_active', true)

      const totalCreditCardBalance = creditCards?.reduce((sum, card) => sum + Number(card.current_balance), 0) || 0

      // Load current month transactions
      const { data: monthlyTransactions } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user?.id)
        .eq('month', currentMonth)
        .eq('year', currentYear)

      let monthlyIncome = 0
      let monthlyExpenses = 0
      
      monthlyTransactions?.forEach(transaction => {
        if (transaction.type === 'income') {
          monthlyIncome += Number(transaction.amount)
        } else if (transaction.type === 'expense') {
          monthlyExpenses += Number(transaction.amount)
        }
      })

      // Load recent transactions
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select(`
          id,
          amount,
          type,
          description,
          date,
          categories!category_id (name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Load active goals count
      const { data: goals } = await supabase
        .from('goals')
        .select('id')
        .eq('user_id', user?.id)
        .eq('is_completed', false)

      setStats({
        totalAssets,
        totalLiabilities: totalLiabilities + totalCreditCardBalance,
        monthlyIncome,
        monthlyExpenses,
        activeLoans: loans?.length || 0,
        activeGoals: goals?.length || 0,
        totalCreditCardBalance,
        recentTransactions: recentTransactions || []
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setDataLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const netWorth = stats.totalAssets - stats.totalLiabilities
  const monthlySavings = stats.monthlyIncome - stats.monthlyExpenses

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
            Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-sm sm:text-base text-premium-600 font-medium">Here&apos;s an overview of your financial portfolio</p>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-white/90 backdrop-blur-lg rounded-xl lg:rounded-2xl shadow-premium border border-white/20 p-4 sm:p-5 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg lg:rounded-xl">
                  <BanknotesIcon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-700" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-bold text-black mb-1">Net Worth</dt>
                  <dd className={`text-lg sm:text-xl lg:text-2xl font-bold ${netWorth >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    ₹{netWorth.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-xl lg:rounded-2xl shadow-premium border border-white/20 p-4 sm:p-5 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg lg:rounded-xl">
                  <ArrowTrendingUpIcon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-700" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-bold text-black mb-1">Monthly Income</dt>
                  <dd className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700">₹{stats.monthlyIncome.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-xl lg:rounded-2xl shadow-premium border border-white/20 p-4 sm:p-5 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 sm:p-3 bg-red-100 rounded-lg lg:rounded-xl">
                  <ArrowTrendingDownIcon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-red-700" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-bold text-black mb-1">Monthly Expenses</dt>
                  <dd className="text-lg sm:text-xl lg:text-2xl font-bold text-red-700">₹{stats.monthlyExpenses.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-xl lg:rounded-2xl shadow-premium border border-white/20 p-4 sm:p-5 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 sm:p-3 bg-purple-100 rounded-lg lg:rounded-xl">
                  <ChartBarIcon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-purple-700" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-bold text-black mb-1">Monthly Savings</dt>
                  <dd className={`text-lg sm:text-xl lg:text-2xl font-bold ${monthlySavings >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    ₹{monthlySavings.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
          {/* Asset vs Liability Pie Chart */}
          <div className="bg-white/90 backdrop-blur-lg rounded-xl lg:rounded-2xl shadow-premium border border-white/20 p-4 sm:p-5 lg:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">Asset vs Liability Breakdown</h3>
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
          <div className="bg-white/90 backdrop-blur-lg rounded-xl lg:rounded-2xl shadow-premium border border-white/20 p-4 sm:p-5 lg:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">Monthly Financial Overview</h3>
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
          {/* Quick Actions */}
          <div className="bg-white/90 backdrop-blur-lg rounded-xl lg:rounded-2xl shadow-premium border border-white/20">
            <div className="p-4 sm:p-6 lg:p-8">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-4 sm:mb-5 lg:mb-6 flex items-center">
                <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-indigo-700 mr-2 sm:mr-3" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Link
                  href="/accounts"
                  className="flex items-center justify-center px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-2 border-gray-400 rounded-lg lg:rounded-xl shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 text-xs sm:text-sm font-bold text-gray-800 hover:from-gray-100 hover:to-gray-200 hover:shadow-xl transition-all duration-200"
                >
                  <BuildingLibraryIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-1 sm:mr-2 text-gray-700" />
                  <span className="hidden sm:inline">View </span>Accounts<span className="hidden sm:inline"> (10)</span>
                </Link>
                <Link
                  href="/transactions/add"
                  className="flex items-center justify-center px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-2 border-indigo-400 rounded-lg lg:rounded-xl shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-xs sm:text-sm font-bold text-white hover:from-indigo-600 hover:to-indigo-700 hover:shadow-xl transition-all duration-200"
                >
                  <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Add </span>Transaction
                </Link>
                <Link
                  href="/budget"
                  className="flex items-center justify-center px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-2 border-gray-400 rounded-lg lg:rounded-xl shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 text-xs sm:text-sm font-bold text-gray-800 hover:from-gray-100 hover:to-gray-200 hover:shadow-xl transition-all duration-200"
                >
                  <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-1 sm:mr-2 text-gray-700" />
                  <span className="hidden sm:inline">View </span>Budget<span className="hidden sm:inline"> (12)</span>
                </Link>
                <Link
                  href="/goals"
                  className="flex items-center justify-center px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-2 border-gray-400 rounded-lg lg:rounded-xl shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 text-xs sm:text-sm font-bold text-gray-800 hover:from-gray-100 hover:to-gray-200 hover:shadow-xl transition-all duration-200"
                >
                  <TargetIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-1 sm:mr-2 text-gray-700" />
                  <span className="hidden sm:inline">View </span>Goals<span className="hidden sm:inline"> (15)</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white/90 backdrop-blur-lg rounded-xl lg:rounded-2xl shadow-premium border border-white/20">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black flex items-center">
                  <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-green-700 mr-2 sm:mr-3" />
                  <span className="hidden sm:inline">Recent </span>Transactions
                </h3>
                <Link
                  href="/transactions"
                  className="text-xs sm:text-sm font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-100 hover:bg-indigo-200 px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-md lg:rounded-lg transition-colors border-2 border-indigo-300"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {stats.recentTransactions.length > 0 ? (
                  stats.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg lg:rounded-xl border-2 border-gray-300 hover:shadow-lg transition-shadow">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-bold text-black truncate">
                          {transaction.description || 'Transaction'}
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-700">
                          {transaction.categories?.name} • {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`text-sm sm:text-lg font-black px-2 sm:px-3 py-1 sm:py-2 rounded-md lg:rounded-lg ml-2 flex-shrink-0 ${transaction.type === 'income' ? 'text-green-800 bg-green-100 border-2 border-green-300' : 'text-red-800 bg-red-100 border-2 border-red-300'}`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <ChartBarIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg font-semibold text-gray-600">No transactions yet</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">Start by adding your first transaction!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-4 sm:mt-6 lg:mt-8">
          <div className="bg-gradient-to-br from-red-50 to-red-100 backdrop-blur-lg rounded-xl lg:rounded-2xl shadow-premium border-2 border-red-200 p-4 sm:p-6 lg:p-8 text-center hover:shadow-xl transition-shadow">
            <div className="p-2 sm:p-3 lg:p-4 bg-red-200 rounded-xl lg:rounded-2xl inline-block mb-3 sm:mb-4 lg:mb-6">
              <CreditCardIcon className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-red-800" />
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-black mb-2 lg:mb-3">Credit Card Balance</h3>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-red-800">₹{stats.totalCreditCardBalance.toLocaleString()}</p>
            <div className="mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm font-semibold text-red-700">
              Outstanding Amount
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 backdrop-blur-lg rounded-xl lg:rounded-2xl shadow-premium border-2 border-orange-200 p-4 sm:p-6 lg:p-8 text-center hover:shadow-xl transition-shadow">
            <div className="p-2 sm:p-3 lg:p-4 bg-orange-200 rounded-xl lg:rounded-2xl inline-block mb-3 sm:mb-4 lg:mb-6">
              <BanknotesIcon className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-orange-800" />
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-black mb-2 lg:mb-3">Active Loans</h3>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-orange-800">{stats.activeLoans}</p>
            <div className="mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm font-semibold text-orange-700">
              Ongoing Loan Accounts
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 backdrop-blur-lg rounded-xl lg:rounded-2xl shadow-premium border-2 border-purple-200 p-4 sm:p-6 lg:p-8 text-center hover:shadow-xl transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="p-2 sm:p-3 lg:p-4 bg-purple-200 rounded-xl lg:rounded-2xl inline-block mb-3 sm:mb-4 lg:mb-6">
              <TargetIcon className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-purple-800" />
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-black mb-2 lg:mb-3">Active Goals</h3>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-purple-800">{stats.activeGoals}</p>
            <div className="mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm font-semibold text-purple-700">
              Financial Goals in Progress
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
