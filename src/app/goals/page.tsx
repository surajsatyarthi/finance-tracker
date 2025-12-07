'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import { financeManager } from '@/lib/supabaseDataManager'
import { initialGoals } from '@/lib/goalsData'
import { useNotification } from '@/contexts/NotificationContext'
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
  EyeSlashIcon,
  TrashIcon,
  PencilIcon
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
  const { user } = useRequireAuth()
  const { showNotification } = useNotification()

  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showAmounts, setShowAmounts] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    category: 'savings',
    priority: 'medium'
  })

  // Load goals
  const loadGoals = useCallback(async () => {
    if (!user) return
    try {
      const data = await financeManager.getGoals()
      // Calculate progress
      const goalsWithProgress = data.map((goal: any) => ({
        ...goal,
        progress_percentage: goal.target_amount > 0
          ? (goal.current_amount / goal.target_amount) * 100
          : 0
      }))
      setGoals(goalsWithProgress)
    } catch (error) {
      console.error('Error loading goals:', error)
      showNotification('Failed to load goals', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, showNotification])

  useEffect(() => {
    loadGoals()
  }, [loadGoals])

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
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    if (progress >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const handleCreate = async () => {
    try {
      setSubmitting(true)
      const newGoal = {
        ...formData,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount || '0'),
        is_completed: false
      }
      await financeManager.createGoal(newGoal)
      showNotification('Goal created successfully', 'success')
      setShowAddModal(false)
      setFormData({ name: '', target_amount: '', current_amount: '', target_date: '', category: 'savings', priority: 'medium' })
      loadGoals()
    } catch (e) {
      showNotification('Failed to create goal', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this goal?')) return
    try {
      await financeManager.deleteGoal(id)
      showNotification('Goal deleted', 'success')
      loadGoals()
    } catch (e) {
      showNotification('Failed to delete', 'error')
    }
  }

  const handleAddAmount = async (goal: Goal, amountStr: string, inputElement: HTMLInputElement) => {
    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) return

    try {
      const newAmount = goal.current_amount + amount
      const isCompleted = newAmount >= goal.target_amount
      await financeManager.updateGoal(goal.id, {
        current_amount: newAmount,
        is_completed: isCompleted
      })
      showNotification('Amount added!', 'success')
      inputElement.value = ''
      loadGoals()
    } catch (e) {
      showNotification('Failed to update amount', 'error')
    }
  }

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
              <p className="text-gray-600">Track your savings targets and financial objectives (Cloud Sync Active)</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAmounts(!showAmounts)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                {showAmounts ? <EyeSlashIcon className="h-4 w-4 mr-2" /> : <EyeIcon className="h-4 w-4 mr-2" />}
                {showAmounts ? 'Hide Amounts' : 'Show Amounts'}
              </button>
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setShowAddModal(true)}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Goal
                Add Goal
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center">
              <TargetIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Goals</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalGoals}</p>
                <p className="text-sm text-gray-500">{summaryStats.activeGoals} active</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center">
              <CurrencyRupeeIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Target Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  {showAmounts ? formatCurrency(summaryStats.totalTargetAmount) : '₹••••••'}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  {showAmounts ? formatCurrency(summaryStats.totalCurrentAmount) : '₹••••••'}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-purple-600">{summaryStats.overallProgress.toFixed(1)}%</p>
                <p className="text-sm text-gray-500">{summaryStats.completedGoals} completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search goals..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="border rounded-lg px-3 py-2">
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="border rounded-lg px-3 py-2">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <div key={goal.id} className="glass-card p-6 hover:shadow-md transition-shadow relative group">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleDelete(goal.id, e)}
              >
                <TrashIcon className="h-5 w-5" />
              </button>

              <div className="flex justify-between mb-4 pr-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{goal.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{goal.category}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full h-fit ${getPriorityColor(goal.priority)}`}>
                  {goal.priority}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-600">Progress</span>
                  <span className="font-semibold">{goal.progress_percentage?.toFixed(1) || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${getProgressColor(goal.progress_percentage || 0)}`} style={{ width: `${Math.min(100, goal.progress_percentage || 0)}%` }}></div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current</span>
                  <span className="font-semibold text-green-600">{showAmounts ? formatCurrency(goal.current_amount) : '₹••••••'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target</span>
                  <span className="font-semibold text-gray-900">{showAmounts ? formatCurrency(goal.target_amount) : '₹••••••'}</span>
                </div>
                {goal.target_date && (
                  <div className="flex justify-between pt-2 border-t border-gray-100 mt-2">
                    <span className="text-gray-600 flex items-center"><ClockIcon className="h-4 w-4 mr-1" /> Target</span>
                    <span className="font-medium">{new Date(goal.target_date).toLocaleDateString()}</span>
                  </div>
                )}

                <div className="bg-gray-50 p-3 rounded-lg mt-3">
                  <p className="text-xs text-gray-500 mb-1">Add Contribution</p>
                  <div className="flex gap-2">
                    <input type="number" placeholder="₹" className="w-full border rounded px-2 py-1 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddAmount(goal, (e.target as HTMLInputElement).value, e.target as HTMLInputElement)
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Goal Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md glass-card p-6">
              <h2 className="text-xl font-bold mb-4">Add New Goal</h2>
              <div className="space-y-3">
                <input className="w-full border rounded px-3 py-2" placeholder="Goal Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <input className="w-full border rounded px-3 py-2" type="number" placeholder="Target Amount (₹)" value={formData.target_amount} onChange={e => setFormData({ ...formData, target_amount: e.target.value })} />
                <input className="w-full border rounded px-3 py-2" type="number" placeholder="Current Saved (Optional)" value={formData.current_amount} onChange={e => setFormData({ ...formData, current_amount: e.target.value })} />
                <input className="w-full border rounded px-3 py-2" type="date" placeholder="Target Date" value={formData.target_date} onChange={e => setFormData({ ...formData, target_date: e.target.value })} />
                <select className="w-full border rounded px-3 py-2" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <select className="w-full border rounded px-3 py-2" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  <option value="savings">Savings</option>
                  <option value="purchase">Purchase</option>
                  <option value="investment">Investment</option>
                  <option value="travel">Travel</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button onClick={handleCreate} disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
