'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
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
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { ExpenseData } from '@/lib/budgetAnalysis'
import {
  monthlyBudgets,
  budgetCategories,
  annualBudgetSummary,
  getCurrentMonthBudget,
  formatCurrency
} from '@/lib/budgetData'
import { setLocalBudgetCategory, copyBudgetFromPrevious } from '@/lib/dataManager'
import {
  getCurrentMonthAnalysis,
  type MonthlyAnalysis,
  type BudgetAlert
} from '@/lib/budgetAnalysis'

export default function BudgetPage() {
  const { user, loading: authLoading, LoadingComponent } = useRequireAuth()
  const { locked } = usePrivacy()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedQuarter, setSelectedQuarter] = useState('all')
  const [analysis, setAnalysis] = useState<MonthlyAnalysis | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [drillCategory, setDrillCategory] = useState<string | null>(null)
  const drillTransactions = useMemo(() => {
    if (!analysis || !drillCategory) return []
    const cat = analysis.categories.find(c => c.category === drillCategory)
    return cat ? cat.transactions : []
  }, [analysis, drillCategory])
  const [editorMonthIndex, setEditorMonthIndex] = useState(new Date().getMonth())
  const [editorYear, setEditorYear] = useState(new Date().getFullYear())
  const currentBudget = getCurrentMonthBudget()

  // Filter budget data based on search and filters
  const filteredBudgetData = useMemo(() => {
    return monthlyBudgets.filter(month => {
      const matchesSearch = month.month.toLowerCase().includes(searchTerm.toLowerCase())
      
      let matchesCategory = true
      if (selectedCategory !== 'all') {
        const categoryValue = month.categories[selectedCategory]
        matchesCategory = categoryValue > 0
      }

      let matchesQuarter = true
      if (selectedQuarter !== 'all') {
        const monthNum = month.monthIndex + 1
        if (selectedQuarter === 'q1') matchesQuarter = monthNum <= 3
        else if (selectedQuarter === 'q2') matchesQuarter = monthNum >= 4 && monthNum <= 6
        else if (selectedQuarter === 'q3') matchesQuarter = monthNum >= 7 && monthNum <= 9
        else if (selectedQuarter === 'q4') matchesQuarter = monthNum >= 10
      }

      return matchesSearch && matchesCategory && matchesQuarter
    })
  }, [searchTerm, selectedCategory, selectedQuarter])

  // Load budget analysis
  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setAnalysisLoading(true)
        const monthAnalysis = await getCurrentMonthAnalysis()
        setAnalysis(monthAnalysis)
      } catch (error) {
        console.error('Error loading budget analysis:', error)
      } finally {
        setAnalysisLoading(false)
      }
    }

    loadAnalysis()
  }, [])

  // Alert component
  const AlertCard = ({ alert }: { alert: BudgetAlert }) => {
    const getAlertIcon = () => {
      switch (alert.type) {
        case 'danger':
          return <XCircleIcon className="h-5 w-5 text-red-500" />
        case 'warning':
          return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
        case 'success':
          return <CheckCircleIcon className="h-5 w-5 text-green-500" />
        default:
          return <BellIcon className="h-5 w-5 text-blue-500" />
      }
    }

    const getAlertStyle = () => {
      switch (alert.type) {
        case 'danger':
          return 'bg-red-50 border-red-200 text-red-800'
        case 'warning':
          return 'bg-yellow-50 border-yellow-200 text-yellow-800'
        case 'success':
          return 'bg-green-50 border-green-200 text-green-800'
        default:
          return 'bg-blue-50 border-blue-200 text-blue-800'
      }
    }

    return (
      <div className={`border rounded-lg p-4 ${getAlertStyle()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getAlertIcon()}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{alert.message}</p>
            {alert.amount !== 0 && (
              <p className="text-sm mt-1">
                {alert.amount > 0 ? 'Over by' : 'Under by'} {formatCurrency(Math.abs(alert.amount))}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Progress bar component
  const ProgressBar = ({ 
    budgeted, 
    actual, 
    category 
  }: { 
    budgeted: number
    actual: number
    category: string 
  }) => {
    const percentage = budgeted > 0 ? Math.min((actual / budgeted) * 100, 150) : 0
    const status = actual > budgeted * 1.1 ? 'over' : actual < budgeted * 0.8 ? 'under' : 'on-track'
    
    const getProgressColor = () => {
      if (status === 'over') return 'bg-red-500'
      if (status === 'under') return 'bg-yellow-500'
      return 'bg-green-500'
    }

    return (
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{budgetCategories[category as keyof typeof budgetCategories]?.name || category}</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatCurrency(actual)}</span>
          <span>of {formatCurrency(budgeted)}</span>
        </div>
      </div>
    )
  }

  // Show loading screen
  if (LoadingComponent) return LoadingComponent
  if (analysisLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading budget analysis...</p>
        </div>
      </div>
    )
  }

  const categories = [
    { key: 'all', label: 'All Categories' },
    ...Object.entries(budgetCategories).map(([key, value]) => ({
      key,
      label: value.name
    }))
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Budget Management</h1>
          <p className="text-gray-600">Track your 2025 budget with real-time analysis and smart alerts</p>
        </div>

        {/* Budget Alerts */}
        {analysis && analysis.alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BellIcon className="h-5 w-5 mr-2 text-red-500" />
              Budget Alerts ({analysis.alerts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.alerts.map((alert, index) => (
                <AlertCard key={index} alert={alert} />
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyRupeeIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Annual Budget</p>
                <p className="text-2xl font-bold text-gray-900">{locked ? '₹••••••' : formatCurrency(annualBudgetSummary.totalBudget)}</p>
                <p className="text-sm text-gray-500">₹12.3 Lakhs total</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Average</p>
                <p className="text-2xl font-bold text-gray-900">{locked ? '₹••••••' : formatCurrency(annualBudgetSummary.averageMonthly)}</p>
                <p className="text-sm text-gray-500">Planned spending</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className={`h-8 w-8 ${
                  analysis?.overallStatus === 'over' ? 'text-red-600' : 
                  analysis?.overallStatus === 'under' ? 'text-yellow-600' : 'text-green-600'
                }`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className={`text-2xl font-bold ${
                  analysis?.overallStatus === 'over' ? 'text-red-600' : 
                  analysis?.overallStatus === 'under' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {analysis ? `${analysis.overallPercentage.toFixed(0)}%` : '0%'}
                </p>
                <p className="text-sm text-gray-500">
                  {analysis ? formatCurrency(analysis.totalActual) : '₹0'} spent
                </p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(budgetCategories).length}</p>
                <p className="text-sm text-gray-500">Budget categories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Progress Visualization */}
        {analysis && (
          <div className="glass-card mb-8 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Budget vs Actual Progress</h2>
            <div className="space-y-6">
              {analysis.categories
                .filter(cat => cat.budgeted > 0)
                .slice(0, 8)
                .map((category) => (
                <div key={category.category} className="space-y-2">
                  <ProgressBar 
                    budgeted={category.budgeted}
                    actual={category.actual}
                    category={category.category}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget vs Actual Chart */}
        {analysis && (
          <div className="glass-card mb-8 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Category Comparison</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analysis.categories
                    .filter(cat => cat.budgeted > 0)
                    .slice(0, 10)
                    .map(cat => ({
                      name: budgetCategories[cat.category as keyof typeof budgetCategories]?.name || cat.category,
                      budgeted: cat.budgeted,
                      actual: cat.actual,
                      category: cat.category
                    }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#374151" 
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#374151" fontSize={12} />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatCurrency(Number(value)), 
                      name === 'budgeted' ? 'Budgeted' : 'Actual'
                    ]} 
                  />
                  <Legend />
                  <Bar dataKey="budgeted" fill="#3B82F6" name="Budgeted" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="actual" fill="#10B981" name="Actual" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {analysis.categories
                .filter(cat => cat.budgeted > 0)
                .slice(0, 12)
                .map((cat) => (
                  <button key={cat.category} className="px-3 py-2 rounded-lg border text-left hover:bg-gray-50" onClick={() => setDrillCategory(cat.category)}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{budgetCategories[cat.category as keyof typeof budgetCategories]?.name || cat.category}</span>
                      <span className="text-xs text-gray-500">{(cat.percentage || 0).toFixed(0)}%</span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Annual Category Breakdown */}
        <div className="glass-card mb-8 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Annual Category Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(annualBudgetSummary.categoryTotals).map(([category, total]) => {
              const percentage = (total / annualBudgetSummary.totalBudget * 100).toFixed(1)
              const categoryInfo = budgetCategories[category as keyof typeof budgetCategories]
              return (
                <div key={category} className={`rounded-lg border-2 p-4 ${categoryInfo?.color || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{categoryInfo?.icon || '💼'}</span>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                  <h3 className="font-semibold mb-1">{categoryInfo?.name || category}</h3>
                  <p className="text-xl font-bold">{formatCurrency(total)}</p>
                  <p className="text-sm opacity-75">{formatCurrency(total / 12)}/month</p>
                </div>
              )
            })}
          </div>
        </div>

        {drillCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-3xl glass-card">
              <div className="px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Transactions — {budgetCategories[drillCategory as keyof typeof budgetCategories]?.name || drillCategory}</h3>
                <button className="px-3 py-1 rounded border" onClick={() => setDrillCategory(null)}>Close</button>
              </div>
              <div className="px-6 pb-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {drillTransactions.map((t: ExpenseData) => (
                      <tr key={t.id}>
                        <td className="px-6 py-3 text-sm text-gray-900">{new Date(t.date).toLocaleDateString('en-IN')}</td>
                        <td className="px-6 py-3 text-sm text-gray-900">{t.description || '-'}</td>
                        <td className="px-6 py-3 text-sm text-gray-900">{t.payment_method}</td>
                        <td className="px-6 py-3 text-sm font-semibold text-right text-gray-900">{formatCurrency(t.amount)}</td>
                      </tr>
                    ))}
                    {drillTransactions.length === 0 && (
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>No transactions</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="glass-card p-6 mb-6">
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
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Monthly Budget Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredBudgetData.length} of {monthlyBudgets.length} months
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
                      <span className="text-sm text-gray-900 font-medium">{formatCurrency(month.categories.loan || 0)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{formatCurrency(month.categories.transport || 0)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{formatCurrency(month.categories.food || 0)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{formatCurrency(month.categories.health || 0)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{formatCurrency(month.categories.subscriptions || 0)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{formatCurrency(month.categories.insurance || 0)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{formatCurrency(month.categories.miscellaneous || 0)}</span>
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

        <div className="glass-card p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit This Month Budget</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Year</label>
              <input type="number" className="border rounded-lg px-3 py-2 w-full" value={editorYear} onChange={(e) => setEditorYear(parseInt(e.target.value || '2025'))} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Month</label>
              <select className="border rounded-lg px-3 py-2 w-full" value={editorMonthIndex} onChange={(e) => setEditorMonthIndex(parseInt(e.target.value))}>
                {monthlyBudgets.map(m => (
                  <option key={m.monthIndex} value={m.monthIndex}>{m.month}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                className="btn-primary px-4 py-2 rounded-md"
                onClick={() => {
                  const base = monthlyBudgets.find(m => m.monthIndex === editorMonthIndex)
                  const categories = base?.categories || {}
                  copyBudgetFromPrevious(editorMonthIndex, editorYear, categories)
                }}
              >
                Copy Previous Month
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.keys(budgetCategories).map(cat => (
              <div key={cat} className="rounded-lg border p-4">
                <div className="text-sm font-medium mb-2">{budgetCategories[cat as keyof typeof budgetCategories].name}</div>
                <input
                  type="number"
                  className="border rounded-lg px-3 py-2 w-full"
                  placeholder="₹"
                  onBlur={(e) => {
                    const amt = parseFloat(e.target.value || '0')
                    setLocalBudgetCategory(editorMonthIndex, editorYear, cat, amt)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
import { usePrivacy } from '@/contexts/PrivacyContext'
