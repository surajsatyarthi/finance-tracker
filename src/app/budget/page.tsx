'use client'

import { useState, useMemo } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

// Budget data for all months in 2025
const budgetData = [
  {
    month: 'January 2025',
    loan: 18000,
    transport: 8000,
    food: 15000,
    health: 5000,
    subscriptions: 1000,
    insurance: 5000,
    miscellaneous: 10000,
    total: 62000
  },
  {
    month: 'February 2025',
    loan: 18000,
    transport: 8000,
    food: 15000,
    health: 5000,
    subscriptions: 1000,
    insurance: 5000,
    miscellaneous: 10000,
    total: 62000
  },
  {
    month: 'March 2025',
    loan: 18000,
    transport: 8000,
    food: 15000,
    health: 5000,
    subscriptions: 1000,
    insurance: 5000,
    miscellaneous: 10000,
    total: 62000
  },
  {
    month: 'April 2025',
    loan: 18000,
    transport: 8000,
    food: 15000,
    health: 5000,
    subscriptions: 1000,
    insurance: 5000,
    miscellaneous: 10000,
    total: 62000
  },
  {
    month: 'May 2025',
    loan: 18000,
    transport: 8000,
    food: 15000,
    health: 5000,
    subscriptions: 1000,
    insurance: 5000,
    miscellaneous: 10000,
    total: 62000
  },
  {
    month: 'June 2025',
    loan: 18000,
    transport: 8000,
    food: 15000,
    health: 5000,
    subscriptions: 1000,
    insurance: 5000,
    miscellaneous: 10000,
    total: 62000
  },
  {
    month: 'July 2025',
    loan: 18000,
    transport: 8000,
    food: 15000,
    health: 5000,
    subscriptions: 1000,
    insurance: 5000,
    miscellaneous: 10000,
    total: 62000
  },
  {
    month: 'August 2025',
    loan: 18000,
    transport: 8000,
    food: 15000,
    health: 5000,
    subscriptions: 1000,
    insurance: 5000,
    miscellaneous: 10000,
    total: 62000
  },
  {
    month: 'September 2025',
    loan: 18000,
    transport: 8000,
    food: 15000,
    health: 5000,
    subscriptions: 1000,
    insurance: 5000,
    miscellaneous: 10000,
    total: 62000
  },
  {
    month: 'October 2025',
    loan: 18000,
    transport: 8000,
    food: 15000,
    health: 5000,
    subscriptions: 1000,
    insurance: 5000,
    miscellaneous: 10000,
    total: 62000
  },
  {
    month: 'November 2025',
    loan: 18000,
    transport: 8000,
    food: 15000,
    health: 5000,
    subscriptions: 1000,
    insurance: 5000,
    miscellaneous: 10000,
    total: 62000
  },
  {
    month: 'December 2025',
    loan: 18000,
    transport: 8000,
    food: 15000,
    health: 5000,
    subscriptions: 1000,
    insurance: 5000,
    miscellaneous: 10000,
    total: 62000
  }
]

const categoryColors = {
  loan: 'bg-red-100 text-red-800 border-red-200',
  transport: 'bg-blue-100 text-blue-800 border-blue-200',
  food: 'bg-green-100 text-green-800 border-green-200',
  health: 'bg-purple-100 text-purple-800 border-purple-200',
  subscriptions: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  insurance: 'bg-orange-100 text-orange-800 border-orange-200',
  miscellaneous: 'bg-gray-100 text-gray-800 border-gray-200'
}

const categoryIcons = {
  loan: '🏠',
  transport: '🚗',
  food: '🍽️',
  health: '⚕️',
  subscriptions: '📱',
  insurance: '🛡️',
  miscellaneous: '💼'
}

export default function BudgetPage() {
  const { user } = useRequireAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedQuarter, setSelectedQuarter] = useState('all')

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalBudget = budgetData.reduce((sum, month) => sum + month.total, 0)
    const avgMonthlyBudget = totalBudget / budgetData.length
    
    // Category totals across all months
    const categoryTotals = budgetData.reduce((acc, month) => {
      acc.loan += month.loan
      acc.transport += month.transport
      acc.food += month.food
      acc.health += month.health
      acc.subscriptions += month.subscriptions
      acc.insurance += month.insurance
      acc.miscellaneous += month.miscellaneous
      return acc
    }, {
      loan: 0,
      transport: 0,
      food: 0,
      health: 0,
      subscriptions: 0,
      insurance: 0,
      miscellaneous: 0
    })

    const highestCategory = Object.entries(categoryTotals).reduce((a, b) => 
      categoryTotals[a[0] as keyof typeof categoryTotals] > categoryTotals[b[0] as keyof typeof categoryTotals] ? a : b
    )

    return {
      totalBudget,
      avgMonthlyBudget,
      categoryTotals,
      highestCategory: highestCategory[0],
      highestCategoryAmount: highestCategory[1]
    }
  }, [])

  // Filter budget data based on search and filters
  const filteredBudgetData = useMemo(() => {
    return budgetData.filter(month => {
      const matchesSearch = month.month.toLowerCase().includes(searchTerm.toLowerCase())
      
      let matchesCategory = true
      if (selectedCategory !== 'all') {
        const categoryValue = month[selectedCategory as keyof typeof month]
        matchesCategory = typeof categoryValue === 'number' && categoryValue > 0
      }

      let matchesQuarter = true
      if (selectedQuarter !== 'all') {
        const monthNum = new Date(month.month).getMonth() + 1
        if (selectedQuarter === 'q1') matchesQuarter = monthNum <= 3
        else if (selectedQuarter === 'q2') matchesQuarter = monthNum >= 4 && monthNum <= 6
        else if (selectedQuarter === 'q3') matchesQuarter = monthNum >= 7 && monthNum <= 9
        else if (selectedQuarter === 'q4') matchesQuarter = monthNum >= 10
      }

      return matchesSearch && matchesCategory && matchesQuarter
    })
  }, [searchTerm, selectedCategory, selectedQuarter])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const categories = [
    { key: 'all', label: 'All Categories' },
    { key: 'loan', label: 'Loan' },
    { key: 'transport', label: 'Transport' },
    { key: 'food', label: 'Food' },
    { key: 'health', label: 'Health' },
    { key: 'subscriptions', label: 'Subscriptions' },
    { key: 'insurance', label: 'Insurance' },
    { key: 'miscellaneous', label: 'Miscellaneous' }
  ]

  const quarters = [
    { key: 'all', label: 'All Quarters' },
    { key: 'q1', label: 'Q1 (Jan-Mar)' },
    { key: 'q2', label: 'Q2 (Apr-Jun)' },
    { key: 'q3', label: 'Q3 (Jul-Sep)' },
    { key: 'q4', label: 'Q4 (Oct-Dec)' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Overview</h1>
          <p className="text-gray-600">Track your monthly budget allocation across all categories for 2025</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyRupeeIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Annual Budget</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summaryStats.totalBudget)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Monthly</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summaryStats.avgMonthlyBudget)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Highest Category</p>
                <p className="text-xl font-bold text-gray-900 capitalize">{summaryStats.highestCategory}</p>
                <p className="text-sm text-gray-500">{formatCurrency(summaryStats.highestCategoryAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">7</p>
                <p className="text-sm text-gray-500">Budget categories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Annual Category Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(summaryStats.categoryTotals).map(([category, total]) => {
              const percentage = (total / summaryStats.totalBudget * 100).toFixed(1)
              return (
                <div key={category} className={`rounded-lg border-2 p-4 ${categoryColors[category as keyof typeof categoryColors]}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                  <h3 className="font-semibold capitalize mb-1">{category}</h3>
                  <p className="text-xl font-bold">{formatCurrency(total)}</p>
                  <p className="text-sm opacity-75">{formatCurrency(total / 12)}/month</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search months..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.key} value={category.key}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {quarters.map(quarter => (
                    <option key={quarter.key} value={quarter.key}>
                      {quarter.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Budget Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Monthly Budget Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredBudgetData.length} of {budgetData.length} months
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transport
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Food
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscriptions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Insurance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miscellaneous
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBudgetData.map((month, index) => (
                  <tr key={month.month} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{month.month}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{formatCurrency(month.loan)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{formatCurrency(month.transport)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{formatCurrency(month.food)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{formatCurrency(month.health)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{formatCurrency(month.subscriptions)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{formatCurrency(month.insurance)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{formatCurrency(month.miscellaneous)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-indigo-600">{formatCurrency(month.total)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}