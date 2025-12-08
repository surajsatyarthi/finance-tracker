'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  PlusIcon,
  FlagIcon,
  BanknotesIcon,
  ChartBarIcon,
  CheckCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { FinanceDataManager } from '@/lib/supabaseDataManager'
import { Goal } from '@/types/finance'
import { useRequireAuth } from '@/contexts/AuthContext'
import GlassCard from '@/components/GlassCard'
import { useNotification } from '@/contexts/NotificationContext'

export default function GoalsPage() {
  const { user } = useRequireAuth()
  const router = useRouter()
  const { showNotification } = useNotification()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)

  // Forms
  const [newGoal, setNewGoal] = useState({ name: '', target_amount: '', target_date: '', priority: 'medium' })
  const [contribution, setContribution] = useState('')

  const financeManager = FinanceDataManager.getInstance()

  const fetchGoals = async () => {
    try {
      const data = await financeManager.getGoals()
      setGoals(data)
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchGoals()
  }, [user])

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await financeManager.createGoal({
        name: newGoal.name,
        target_amount: parseFloat(newGoal.target_amount),
        target_date: newGoal.target_date || undefined,
        priority: newGoal.priority
      })
      showNotification('Goal created successfully!', 'success')
      setIsModalOpen(false)
      fetchGoals()
      setNewGoal({ name: '', target_amount: '', target_date: '', priority: 'medium' })
    } catch (error) {
      showNotification('Failed to create goal', 'error')
    }
  }

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGoal) return
    try {
      await financeManager.updateGoalProgress(selectedGoal.id, parseFloat(contribution))
      showNotification('Contribution recorded!', 'success')
      setIsContributeModalOpen(false)
      fetchGoals()
      setContribution('')
    } catch (error) {
      showNotification('Failed to update progress', 'error')
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this goal?')) return
    try {
      await financeManager.deleteGoal(id)
      showNotification('Goal deleted', 'success')
      fetchGoals()
    } catch (error) {
      showNotification('Failed to delete goal', 'error')
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Goals</h1>
            <p className="mt-1 text-sm text-gray-500">Track and achieve your dreams</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Goal
          </button>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
            const isCompleted = progress >= 100

            return (
              <GlassCard key={goal.id} className="relative hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                    <p className="text-sm text-gray-500">Target: {formatCurrency(goal.target_amount)}</p>
                  </div>
                  <div className={`p-2 rounded-full ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {isCompleted ? <CheckCircleIcon className="h-6 w-6" /> : <FlagIcon className="h-6 w-6" />}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{formatCurrency(goal.current_amount)}</span>
                    <span className="text-gray-500">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-indigo-600'}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {goal.target_date && (
                  <p className="text-xs text-gray-500 mb-4">
                    Target Date: {new Date(goal.target_date).toLocaleDateString()}
                  </p>
                )}

                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => { setSelectedGoal(goal); setIsContributeModalOpen(true); }}
                    className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    Contribute
                  </button>
                  <button
                    onClick={(e) => handleDelete(goal.id, e)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </GlassCard>
            )
          })}
          {goals.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <FlagIcon className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No goals yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new financial goal.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Goal</h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <input
                type="text"
                placeholder="Goal Name (e.g., Vacation)"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                value={newGoal.name}
                onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
              />
              <input
                type="number"
                placeholder="Target Amount (₹)"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                value={newGoal.target_amount}
                onChange={e => setNewGoal({ ...newGoal, target_amount: e.target.value })}
              />
              <input
                type="date"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                value={newGoal.target_date}
                onChange={e => setNewGoal({ ...newGoal, target_date: e.target.value })}
              />
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {isContributeModalOpen && selectedGoal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contribute to {selectedGoal.name}</h3>
            <form onSubmit={handleContribute} className="space-y-4">
              <input
                type="number"
                placeholder="Amount to Add (₹)"
                required
                autoFocus
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                value={contribution}
                onChange={e => setContribution(e.target.value)}
              />
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsContributeModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Add Funds</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
