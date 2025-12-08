'use client'

import { useState, useEffect, useMemo } from 'react'
import { FinanceDataManager } from '@/lib/supabaseDataManager'
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/solid'
import { useNotification } from '@/contexts/NotificationContext'

interface BudgetCategory {
  category: string
  limit: number
  spent: number
}

export default function BudgetPage() {
  const [budgetData, setBudgetData] = useState<BudgetCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const financeManager = FinanceDataManager.getInstance()
  const { showNotification } = useNotification()

  useEffect(() => {
    loadBudget()
  }, [currentMonth, currentYear])

  const loadBudget = async () => {
    setLoading(true)
    try {
      await financeManager.initialize()
      const data = await financeManager.getMonthlyCategorySpending(currentMonth, currentYear)
      setBudgetData(data)
    } catch (error) {
      console.error('Error loading budget:', error)
      showNotification('Failed to load budget data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    const totalLimit = budgetData.reduce((sum, item) => sum + item.limit, 0)
    const totalSpent = budgetData.reduce((sum, item) => sum + item.spent, 0)
    const totalSurplus = totalLimit - totalSpent
    return { totalLimit, totalSpent, totalSurplus }
  }, [budgetData])

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })
  }

  const handleSetLimit = async (category: string) => {
    const currentLimit = budgetData.find(b => b.category === category)?.limit || 0
    const newLimitStr = prompt(`Set budget limit for ${category}:`, currentLimit.toString())
    if (newLimitStr === null) return

    const newLimit = parseFloat(newLimitStr)
    if (isNaN(newLimit) || newLimit < 0) {
      alert('Invalid amount')
      return
    }

    try {
      await financeManager.setBudgetLimit(currentMonth, currentYear, category, newLimit)
      loadBudget() // Reload to reflect changes
    } catch (error) {
      alert('Failed to update limit')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budget vs Real</h1>
            <p className="text-gray-600">
              {getMonthName(currentMonth)} {currentYear} Overview
            </p>
          </div>

          <div className="mt-4 md:mt-0 bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex gap-8">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Total Budget</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalLimit)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Total Spent</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(stats.totalSpent)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Current Status</p>
              <p className={`text-xl font-bold ${stats.totalSurplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.totalSurplus >= 0 ? 'Surplus' : 'Deficit'} {formatCurrency(Math.abs(stats.totalSurplus))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
            <div className="col-span-4">Category</div>
            <div className="col-span-2 text-right">Spent</div>
            <div className="col-span-2 text-right">Limit</div>
            <div className="col-span-4">Utilization</div>
          </div>

          <div className="divide-y divide-gray-100">
            {budgetData.map((item) => {
              const percentage = item.limit > 0 ? (item.spent / item.limit) * 100 : 0
              const isOverBudget = item.limit > 0 && item.spent > item.limit

              return (
                <div key={item.category} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-4 font-medium text-gray-900 truncate" title={item.category}>
                    {item.category}
                  </div>

                  <div className="col-span-2 text-right font-medium">
                    {formatCurrency(item.spent)}
                  </div>

                  <div className="col-span-2 text-right">
                    <button
                      onClick={() => handleSetLimit(item.category)}
                      className="text-gray-400 hover:text-indigo-600 transition-colors text-sm"
                    >
                      {item.limit > 0 ? formatCurrency(item.limit) : 'Set Limit'}
                    </button>
                  </div>

                  <div className="col-span-4 flex items-center gap-3">
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="w-8 shrink-0">
                      {isOverBudget ? (
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" title="Over Budget" />
                      ) : item.limit > 0 ? (
                        <span className="text-xs font-medium text-gray-500">{Math.round(percentage)}%</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
