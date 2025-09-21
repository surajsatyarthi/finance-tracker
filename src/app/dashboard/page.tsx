'use client'

import { useEffect, useState } from 'react'
import { useRequireAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  ChartBarIcon,
  TargetIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface DashboardStats {
  totalAssets: number
  totalLiabilities: number
  monthlyIncome: number
  monthlyExpenses: number
  activeLoans: number
  activeGoals: number
  totalCreditCardBalance: number
  recentTransactions: any[]
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

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
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
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finance Tracker</h1>
              <p className="text-gray-600">Welcome back, {user?.user_metadata?.name || user?.email}</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/transactions/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Transaction
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Net Worth</dt>
                  <dd className={`text-lg font-medium ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{netWorth.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Income</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{stats.monthlyIncome.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingDownIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Expenses</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{stats.monthlyExpenses.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Savings</dt>
                  <dd className={`text-lg font-medium ${monthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{monthlySavings.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/transactions/new"
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <PlusIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Add Transaction
                </Link>
                <Link
                  href="/goals/new"
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <TargetIcon className="h-5 w-5 mr-2 text-gray-400" />
                  New Goal
                </Link>
                <Link
                  href="/credit-cards"
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <CreditCardIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Credit Cards
                </Link>
                <Link
                  href="/loans"
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <BanknotesIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Loans
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Transactions</h3>
                <Link
                  href="/transactions"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {stats.recentTransactions.length > 0 ? (
                  stats.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description || 'Transaction'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.categories?.name} • {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No transactions yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <CreditCardIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Credit Card Balance</h3>
            <p className="text-2xl font-bold text-red-600">₹{stats.totalCreditCardBalance.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <BanknotesIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Active Loans</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.activeLoans}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <TargetIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Active Goals</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.activeGoals}</p>
          </div>
        </div>
      </div>
    </div>
  )
}