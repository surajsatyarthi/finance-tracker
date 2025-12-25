'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import {
  BanknotesIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  TagIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface ExpenseTransaction {
  id: string
  user_id: string
  account_id?: string | null
  amount: number
  type: 'income' | 'expense' | 'transfer'
  category_id?: string | null
  subcategory?: string | null
  description: string | null
  payment_method: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque'
  date: string
  month?: number | null
  year?: number | null
  is_recurring: boolean
  recurring_pattern?: Record<string, unknown> | null
  tags?: string[] | null
  created_at: string
  updated_at: string
}

type SortKey = 'date' | 'amount' | 'description' | 'payment_method'

export default function Expenses() {
  const { user } = useRequireAuth() // Get authenticated user
  const [expenses, setExpenses] = useState<ExpenseTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const pageSize = 20

  // Load expenses from Supabase
  useEffect(() => {
    if (!user) return // Wait for user to be loaded

    const loadExpenses = async () => {
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id) // Use actual authenticated user ID
          .eq('type', 'expense')
          .order('date', { ascending: false })

        if (error) {
          console.error('Error loading expenses:', error)
        } else {
          setExpenses((data || []) as ExpenseTransaction[])
          console.log('📊 Loaded expenses from Supabase:', data?.length || 0)
        }
      } catch (error) {
        console.error('Error loading expenses:', error)
      } finally {
        setLoading(false)
      }
    }

    loadExpenses()
  }, [user])

  const uniquePaymentMethods = useMemo(() =>
    [...new Set(expenses.map(e => e.payment_method))].sort(),
    [expenses]
  )
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

  const filteredSorted = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return expenses.filter(expense => {
      const matchesSearch = term === '' ||
        (expense.description && expense.description.toLowerCase().includes(term)) ||
        expense.payment_method.toLowerCase().includes(term)

      const matchesPaymentMethod = !filterPaymentMethod || expense.payment_method === filterPaymentMethod
      const expenseMonth = expense.date.split('-')[1]
      const matchesMonth = !filterMonth || expenseMonth === filterMonth

      return matchesSearch && matchesPaymentMethod && matchesMonth
    }).sort((a, b) => {
      let aVal: number | string
      let bVal: number | string
      if (sortBy === 'amount') {
        aVal = a.amount
        bVal = b.amount
      } else if (sortBy === 'date') {
        aVal = new Date(a.date).getTime()
        bVal = new Date(b.date).getTime()
      } else if (sortBy === 'description') {
        aVal = (a.description || '').toLowerCase()
        bVal = (b.description || '').toLowerCase()
      } else {
        aVal = a.payment_method.toLowerCase()
        bVal = b.payment_method.toLowerCase()
      }

      if (aVal === bVal) return 0
      const cmp = aVal > bVal ? 1 : -1
      return sortOrder === 'asc' ? cmp : -cmp
    })
  }, [expenses, searchTerm, filterPaymentMethod, filterMonth, sortBy, sortOrder])

  const paginatedExpenses = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredSorted.slice(start, start + pageSize)
  }, [filteredSorted, page, pageSize])

  const totalPages = Math.ceil(filteredSorted.length / pageSize)

  const summaryStats = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() + 1 === currentMonth &&
        expenseDate.getFullYear() === currentYear
    })

    return {
      totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
      thisMonthExpenses: currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0),
      transactionCount: expenses.length,
      thisMonthCount: currentMonthExpenses.length
    }
  }, [expenses])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <BanknotesIcon className="h-5 w-5 text-green-600" />
      case 'upi':
        return <CreditCardIcon className="h-5 w-5 text-blue-600" />
      case 'card':
        return <CreditCardIcon className="h-5 w-5 text-purple-600" />
      case 'bank_transfer':
        return <BuildingLibraryIcon className="h-5 w-5 text-indigo-600" />
      default:
        return <TagIcon className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading expenses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Expenses</h1>
              <p className="text-gray-600">Track and analyze your spending patterns from Supabase</p>
            </div>
            <Link
              href="/expenses/add"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Expense
            </Link>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BanknotesIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(summaryStats.totalExpenses)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarDaysIcon className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(summaryStats.thisMonthExpenses)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.transactionCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TagIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month Count</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.thisMonthCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Payment Methods</option>
              {uniquePaymentMethods.map(method => (
                <option key={method} value={method}>
                  {method.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Months</option>
              {months.map(month => (
                <option key={month} value={month}>
                  {new Date(2025, parseInt(month) - 1, 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field as SortKey)
                setSortOrder(order as 'asc' | 'desc')
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="description-asc">Description (A-Z)</option>
              <option value="payment_method-asc">Payment Method</option>
            </select>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Expenses</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {paginatedExpenses.length} of {filteredSorted.length} transactions (Live data from Supabase)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedExpenses.map((expense, index) => (
                  <tr key={expense.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {expense.description || 'No description'}
                      </div>
                      {expense.subcategory && (
                        <div className="text-sm text-gray-500">{expense.subcategory}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getPaymentMethodIcon(expense.payment_method)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">
                          {expense.payment_method.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-bold text-red-600">
                        {formatCurrency(expense.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {expenses.length === 0 && !loading && (
          <div className="text-center py-12">
            <BanknotesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-500 mb-4">Start tracking your expenses by adding your first transaction to Supabase.</p>
            <Link
              href="/expenses/add"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Expense
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}