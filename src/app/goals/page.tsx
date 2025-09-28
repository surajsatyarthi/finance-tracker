'use client'

import { useState, useMemo } from 'react'
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

// Goals data with budget, achieved, and progress
const goalsData = [
  {
    id: 'new_car',
    name: 'New Car',
    description: 'Save for a new vehicle purchase',
    budget: 500000,
    achieved: 0,
    progress: 0.000,
    category: 'transportation',
    priority: 'high',
    targetDate: '2025-12-31',
    status: 'active'
  },
  {
    id: 'life_insurance',
    name: 'Life Insurance',
    description: 'Annual life insurance premium',
    budget: 20000,
    achieved: 0,
    progress: 0.000,
    category: 'insurance',
    priority: 'high',
    targetDate: '2025-06-30',
    status: 'active'
  },
  {
    id: 'medical_insurance',
    name: 'Medical Insurance',
    description: 'Health insurance premium coverage',
    budget: 12000,
    achieved: 0,
    progress: 0.000,
    category: 'insurance',
    priority: 'high',
    targetDate: '2025-04-30',
    status: 'active'
  },
  {
    id: 'gym_setup',
    name: 'Gym Setup',
    description: 'Home gym equipment and setup',
    budget: 20000,
    achieved: 0,
    progress: 0.000,
    category: 'health',
    priority: 'medium',
    targetDate: '2025-08-31',
    status: 'active'
  },
  {
    id: 'massage_chair',
    name: 'Massage Chair',
    description: 'Premium massage chair for relaxation',
    budget: 250000,
    achieved: 0,
    progress: 0.000,
    category: 'wellness',
    priority: 'medium',
    targetDate: '2025-10-31',
    status: 'active'
  },
  {
    id: 'emergency_fund',
    name: 'Emergency Fund',
    description: 'Emergency savings for unexpected expenses',
    budget: 100000,
    achieved: 0,
    progress: 0.000,
    category: 'savings',
    priority: 'high',
    targetDate: '2025-06-30',
    status: 'active'
  },
  {
    id: 'one_year_fund',
    name: '1 Year Fund',
    description: 'One year expense coverage fund',
    budget: 300000,
    achieved: 0,
    progress: 0.000,
    category: 'savings',
    priority: 'high',
    targetDate: '2025-12-31',
    status: 'active'
  },
  {
    id: 'interior_work',
    name: 'Interior Work',
    description: 'Home interior renovation and design',
    budget: 500000,
    achieved: 0,
    progress: 0.000,
    category: 'home',
    priority: 'medium',
    targetDate: '2025-11-30',
    status: 'active'
  },
  {
    id: 'travel_fund',
    name: 'Travel Fund',
    description: 'Travel and vacation expenses',
    budget: 400000,
    achieved: 0,
    progress: 0.000,
    category: 'lifestyle',
    priority: 'medium',
    targetDate: '2025-12-31',
    status: 'active'
  },
  {
    id: 'forex_card',
    name: 'Forex Card',
    description: 'Foreign exchange card for international travel',
    budget: 120000,
    achieved: 0,
    progress: 0.000,
    category: 'travel',
    priority: 'low',
    targetDate: '2025-09-30',
    status: 'active'
  },
  {
    id: 'mobile_upgrade',
    name: 'Mobile Upgrade',
    description: 'Latest smartphone purchase',
    budget: 150000,
    achieved: 0,
    progress: 0.000,
    category: 'technology',
    priority: 'low',
    targetDate: '2025-07-31',
    status: 'active'
  },
  {
    id: 'laptop_upgrade',
    name: 'Laptop Upgrade',
    description: 'High-performance laptop for work',
    budget: 150000,
    achieved: 0,
    progress: 0.000,
    category: 'technology',
    priority: 'medium',
    targetDate: '2025-08-31',
    status: 'active'
  },
  {
    id: 'company_closure',
    name: 'Company Closure',
    description: 'Business closure and legal expenses',
    budget: 60000,
    achieved: 0,
    progress: 0.000,
    category: 'business',
    priority: 'high',
    targetDate: '2025-03-31',
    status: 'active'
  },
  {
    id: 'tiwari_sir',
    name: 'Tiwari Sir',
    description: 'Payment or investment related to Tiwari Sir',
    budget: 50000,
    achieved: 0,
    progress: 0.000,
    category: 'personal',
    priority: 'medium',
    targetDate: '2025-05-31',
    status: 'active'
  },
  {
    id: 'education_loan',
    name: 'Education Loan',
    description: 'Education loan repayment or new education funding',
    budget: 2000000,
    achieved: 0,
    progress: 0.000,
    category: 'education',
    priority: 'high',
    targetDate: '2026-12-31',
    status: 'active'
  }
]

const categoryColors = {
  transportation: 'bg-blue-100 text-blue-800 border-blue-200',
  insurance: 'bg-green-100 text-green-800 border-green-200',
  health: 'bg-purple-100 text-purple-800 border-purple-200',
  wellness: 'bg-pink-100 text-pink-800 border-pink-200',
  savings: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  home: 'bg-orange-100 text-orange-800 border-orange-200',
  lifestyle: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  travel: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  technology: 'bg-gray-100 text-gray-800 border-gray-200',
  business: 'bg-red-100 text-red-800 border-red-200',
  personal: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  education: 'bg-violet-100 text-violet-800 border-violet-200'
}

const categoryIcons = {
  transportation: '🚗',
  insurance: '🛡️',
  health: '⚕️',
  wellness: '💆',
  savings: '💰',
  home: '🏠',
  lifestyle: '🌟',
  travel: '✈️',
  technology: '📱',
  business: '💼',
  personal: '👤',
  education: '🎓'
}

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
}

export default function GoalsPage() {
  const { user } = useRequireAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [showAmounts, setShowAmounts] = useState(true)
  const [sortBy, setSortBy] = useState('budget')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showAddGoalForm, setShowAddGoalForm] = useState(false)

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalBudget = goalsData.reduce((sum, goal) => sum + goal.budget, 0)
    const totalAchieved = goalsData.reduce((sum, goal) => sum + goal.achieved, 0)
    const totalGoals = goalsData.length
    const completedGoals = goalsData.filter(goal => goal.progress >= 100).length
    const activeGoals = goalsData.filter(goal => goal.status === 'active').length
    
    // Category breakdown
    const categoryBreakdown = goalsData.reduce((acc, goal) => {
      if (!acc[goal.category]) acc[goal.category] = { count: 0, budget: 0, achieved: 0 }
      acc[goal.category].count += 1
      acc[goal.category].budget += goal.budget
      acc[goal.category].achieved += goal.achieved
      return acc
    }, {} as Record<string, { count: number; budget: number; achieved: number }>)

    // Priority breakdown
    const priorityBreakdown = goalsData.reduce((acc, goal) => {
      if (!acc[goal.priority]) acc[goal.priority] = { count: 0, budget: 0 }
      acc[goal.priority].count += 1
      acc[goal.priority].budget += goal.budget
      return acc
    }, {} as Record<string, { count: number; budget: number }>)

    const overallProgress = totalBudget > 0 ? (totalAchieved / totalBudget) * 100 : 0

    return {
      totalBudget,
      totalAchieved,
      totalGoals,
      completedGoals,
      activeGoals,
      categoryBreakdown,
      priorityBreakdown,
      overallProgress
    }
  }, [])

  // Filter and sort goals
  const filteredAndSortedGoals = useMemo(() => {
    const filtered = goalsData.filter(goal => {
      const matchesSearch = goal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           goal.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      let matchesCategory = true
      if (selectedCategory !== 'all') {
        matchesCategory = goal.category === selectedCategory
      }

      let matchesPriority = true
      if (selectedPriority !== 'all') {
        matchesPriority = goal.priority === selectedPriority
      }

      return matchesSearch && matchesCategory && matchesPriority
    })

    // Sort goals
    filtered.sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case 'budget':
          aValue = a.budget
          bValue = b.budget
          break
        case 'achieved':
          aValue = a.achieved
          bValue = b.achieved
          break
        case 'progress':
          aValue = a.progress
          bValue = b.progress
          break
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        default:
          aValue = a.budget
          bValue = b.budget
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [searchTerm, selectedCategory, selectedPriority, sortBy, sortOrder])

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
    { key: 'transportation', label: 'Transportation' },
    { key: 'insurance', label: 'Insurance' },
    { key: 'health', label: 'Health' },
    { key: 'wellness', label: 'Wellness' },
    { key: 'savings', label: 'Savings' },
    { key: 'home', label: 'Home' },
    { key: 'lifestyle', label: 'Lifestyle' },
    { key: 'travel', label: 'Travel' },
    { key: 'technology', label: 'Technology' },
    { key: 'business', label: 'Business' },
    { key: 'personal', label: 'Personal' },
    { key: 'education', label: 'Education' }
  ]

  const priorities = [
    { key: 'all', label: 'All Priorities' },
    { key: 'high', label: 'High Priority' },
    { key: 'medium', label: 'Medium Priority' },
    { key: 'low', label: 'Low Priority' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Goals</h1>
              <p className="text-gray-600">Track your savings goals and financial objectives for 2025-2026</p>
            </div>
            <div className="flex space-x-3">
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
              <button 
                onClick={() => {
                  alert('Add Goal functionality coming soon! This will open a form to create new financial goals.')
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
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
                <CurrencyRupeeIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  {showAmounts ? formatCurrency(summaryStats.totalBudget) : '₹••••••••'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Achieved</p>
                <p className="text-2xl font-bold text-green-600">
                  {showAmounts ? formatCurrency(summaryStats.totalAchieved) : '₹••••••'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TargetIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Goals</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.activeGoals}</p>
                <p className="text-sm text-gray-500">{summaryStats.completedGoals} completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-blue-600">{summaryStats.overallProgress.toFixed(1)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(summaryStats.overallProgress, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Priority Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(summaryStats.priorityBreakdown).map(([priority, data]) => {
              const percentage = (data.budget / summaryStats.totalBudget * 100).toFixed(1)
              return (
                <div key={priority} className={`rounded-lg border-2 p-4 ${priorityColors[priority as keyof typeof priorityColors]} border-current`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold capitalize">{priority} Priority</span>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                  <p className="text-xl font-bold">
                    {showAmounts ? formatCurrency(data.budget) : '₹••••••'}
                  </p>
                  <p className="text-sm opacity-75">{data.count} goal{data.count !== 1 ? 's' : ''}</p>
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
                <TargetIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {priorities.map(priority => (
                    <option key={priority.key} value={priority.key}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort:</span>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [by, order] = e.target.value.split('-')
                    setSortBy(by)
                    setSortOrder(order)
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="budget-desc">Budget (High to Low)</option>
                  <option value="budget-asc">Budget (Low to High)</option>
                  <option value="progress-desc">Progress (High to Low)</option>
                  <option value="progress-asc">Progress (Low to High)</option>
                  <option value="name-asc">Name (A to Z)</option>
                  <option value="name-desc">Name (Z to A)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedGoals.map((goal) => (
            <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{categoryIcons[goal.category as keyof typeof categoryIcons]}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                    <p className="text-sm text-gray-500">{goal.description}</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[goal.priority as keyof typeof priorityColors]}`}>
                  {goal.priority}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-gray-900">{goal.progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Target:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {showAmounts ? formatCurrency(goal.budget) : '₹••••••'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Achieved:</span>
                  <span className="text-sm font-medium text-green-600">
                    {showAmounts ? formatCurrency(goal.achieved) : '₹••••••'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Remaining:</span>
                  <span className="text-sm font-medium text-orange-600">
                    {showAmounts ? formatCurrency(goal.budget - goal.achieved) : '₹••••••'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[goal.category as keyof typeof categoryColors]}`}>
                    {goal.category}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {new Date(goal.targetDate).toLocaleDateString('en-IN', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show message if no goals found */}
        {filteredAndSortedGoals.length === 0 && (
          <div className="text-center py-12">
            <TargetIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No goals found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}