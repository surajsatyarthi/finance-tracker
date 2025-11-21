'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyRupeeIcon,
  FlagIcon as TargetIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ClockIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface Goal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  target_date?: string | null
  category?: string | null
  priority: string
  is_completed: boolean
  progress_percentage?: number
  created_at: string
  updated_at: string
}

export default function GoalsPage() {
  useRequireAuth() // Just call for authentication check
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showAmounts, setShowAmounts] = useState(true)

  // Load goals from local storage
  useEffect(() => {
    const loadGoals = async () => {
      try {
        const { getGoals } = await import('@/lib/dataManager')
        const data = getGoals()
        const goalsWithProgress = data.map(goal => ({
          ...goal,
          progress_percentage: goal.target_amount > 0
            ? (goal.current_amount / goal.target_amount) * 100
            : 0
        }))
        setGoals(goalsWithProgress)
      } catch (error) {
        console.error('Error loading goals:', error)
      } finally {
        setLoading(false)
      }
    }
    loadGoals()
  }, [])

  const suggestMonthly = (g: Goal) => {
    if (!g.target_date) return 0
    const end = new Date(g.target_date as string)
    const now = new Date()
    const months = Math.max(1, (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth()))
    const remaining = Math.max(0, g.target_amount - g.current_amount)
    return Math.ceil(remaining / months)
  }

  // Summary statistics
  const summaryStats = useMemo(() => {
    const totalGoals = goals.length
    const activeGoals = goals.filter(goal => !goal.is_completed).length
    const completedGoals = goals.filter(goal => goal.is_completed).length
    const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.target_amount, 0)
    const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.current_amount, 0)
    const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      totalTargetAmount,
      totalCurrentAmount,
      overallProgress
    }
  }, [goals])

  // Filter goals based on search and filters
  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      const matchesSearch = goal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (goal.category && goal.category.toLowerCase().includes(searchTerm.toLowerCase()))
      
      let matchesPriority = true
      if (selectedPriority !== 'all') {
        matchesPriority = goal.priority === selectedPriority
      }

      let matchesStatus = true
      if (selectedStatus === 'completed') {
        matchesStatus = goal.is_completed
      } else if (selectedStatus === 'active') {
        matchesStatus = !goal.is_completed
      }

      return matchesSearch && matchesPriority && matchesStatus
    })
  }, [goals, searchTerm, selectedPriority, selectedStatus])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    if (progress >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const priorityOptions = [
    { key: 'all', label: 'All Priorities' },
    { key: 'high', label: 'High Priority' },
    { key: 'medium', label: 'Medium Priority' },
    { key: 'low', label: 'Low Priority' }
  ]

  const statusOptions = [
    { key: 'all', label: 'All Goals' },
    { key: 'active', label: 'Active Goals' },
    { key: 'completed', label: 'Completed Goals' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading goals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Goals</h1>
              <p className="text-gray-600">Track your savings targets and financial objectives (Live data from Supabase)</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAmounts(!showAmounts)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {showAmounts ? (
                  <>
                    <EyeSlashIcon className="h-4 w-4 mr-2" />
                    Hide Amounts
                  </>
                ) : (
                  <>
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Show Amounts
                  </>
                )}
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                onClick={async () => {
                  const { storeGoal } = await import('@/lib/dataManager')
                  const sample = storeGoal({
                    name: 'New Goal',
                    target_amount: 50000,
                    current_amount: 0,
                    target_date: new Date(new Date().getFullYear(), new Date().getMonth() + 6, 1).toISOString().split('T')[0],
                    category: 'savings',
                    priority: 'medium',
                    is_completed: false,
                  })
                  setGoals((prev) => ([
                    ...prev,
                    { ...sample, progress_percentage: 0 }
                  ]))
                }}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Goal
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TargetIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Goals</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalGoals}</p>
                <p className="text-sm text-gray-500">{summaryStats.activeGoals} active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyRupeeIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Target Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  {showAmounts ? formatCurrency(summaryStats.totalTargetAmount) : '₹••••••'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  {showAmounts ? formatCurrency(summaryStats.totalCurrentAmount) : '₹••••••'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-purple-600">{summaryStats.overallProgress.toFixed(1)}%</p>
                <p className="text-sm text-gray-500">{summaryStats.completedGoals} completed</p>
              </div>
            </div>
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
                  placeholder="Search goals..."
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
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {priorityOptions.map(priority => (
                    <option key={priority.key} value={priority.key}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <TargetIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {statusOptions.map(status => (
                    <option key={status.key} value={status.key}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{goal.name}</h3>
                  {goal.category && (
                    <p className="text-sm text-gray-500 capitalize">{goal.category}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(goal.priority)}`}>
                    {goal.priority}
                  </span>
                  {goal.is_completed && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Progress</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {goal.progress_percentage?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(goal.progress_percentage || 0)}`}
                    style={{ width: `${Math.min(100, goal.progress_percentage || 0)}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current</span>
                  <span className="text-sm font-semibold text-green-600">
                    {showAmounts ? formatCurrency(goal.current_amount) : '₹••••••'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Target</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {showAmounts ? formatCurrency(goal.target_amount) : '₹••••••'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Remaining</span>
                  <span className="text-sm font-semibold text-red-600">
                    {showAmounts ? formatCurrency(Math.max(0, goal.target_amount - goal.current_amount)) : '₹••••••'}
                  </span>
                </div>
                {goal.target_date && (
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      Target Date
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(goal.target_date).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="mt-3 p-3 rounded-lg border bg-gray-50">
                  <p className="text-sm text-gray-700">Suggested Monthly Contribution</p>
                  <p className="text-lg font-bold text-indigo-600">₹{suggestMonthly(goal).toLocaleString()}</p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Add amount (₹)"
                    className="border rounded px-3 py-2 w-32"
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        const amt = Number((e.target as HTMLInputElement).value || '0')
                        if (amt > 0) {
                          const { updateGoalAmount } = await import('@/lib/dataManager')
                          updateGoalAmount(goal.id, goal.current_amount + amt)
                          setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, current_amount: g.current_amount + amt, progress_percentage: ((g.current_amount + amt) / g.target_amount) * 100 } : g))
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }
                    }}
                  />
                  <span className="text-xs text-gray-500">Press Enter</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {goals.length === 0 && !loading && (
          <div className="text-center py-12">
            <TargetIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals found</h3>
            <p className="text-gray-500 mb-4">Start setting your financial goals to track your progress.</p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Goal
            </button>
          </div>
        )}

        {filteredGoals.length === 0 && goals.length > 0 && (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals match your filters</h3>
            <p className="text-gray-500">Try adjusting your search term or filters to see more goals.</p>
          </div>
        )}
      </div>
    </div>
  )
}
