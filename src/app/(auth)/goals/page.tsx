'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  PlusIcon,
  FlagIcon,
  BanknotesIcon,
  ChartBarIcon,
  CheckCircleIcon,
  TrashIcon,
  PencilIcon
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)

  // Forms
  const [newGoal, setNewGoal] = useState({ name: '', target_amount: '', target_date: '', priority: 'medium', category: '' })
  const [editGoal, setEditGoal] = useState({ name: '', target_amount: '', category: '' })
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
        priority: newGoal.priority,
        category: newGoal.category || undefined
      })
      showNotification('Goal created successfully!', 'success')
      setIsModalOpen(false)
      fetchGoals()
      setNewGoal({ name: '', target_amount: '', target_date: '', priority: 'medium', category: '' })
    } catch (error) {
      showNotification('Failed to create goal', 'error')
    }
  }

  const handleEditGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGoal) return
    try {
      await financeManager.updateGoal(selectedGoal.id, {
        name: editGoal.name,
        target_amount: parseFloat(editGoal.target_amount),
        category: editGoal.category || undefined
      })
      showNotification('Goal updated!', 'success')
      setIsEditModalOpen(false)
      fetchGoals()
    } catch (error) {
      showNotification('Failed to update goal', 'error')
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

        {/* Goals Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-indigo-100">
                <th className="px-4 py-3 text-left font-semibold text-gray-900">#</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Goal Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Category</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-900">Target</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-900">Saved</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-900">Remaining</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900">Progress</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900">Priority</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-900">
              {goals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    <FlagIcon className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>No goals yet. Click &quot;Add Goal&quot; to get started.</p>
                  </td>
                </tr>
              ) : (
                [...goals].sort((a, b) => a.target_amount - b.target_amount).map((goal, idx) => {
                  const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
                  const remaining = Math.max(goal.target_amount - goal.current_amount, 0)
                  const isCompleted = progress >= 100

                  return (
                    <tr key={goal.id} className={`border-b border-gray-200 hover:bg-gray-50 ${isCompleted ? 'bg-green-50' : ''}`}>
                      <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium">{goal.name}</td>
                      <td className="px-4 py-3 text-gray-600">{goal.category || '-'}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(goal.target_amount)}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium tabular-nums">{formatCurrency(goal.current_amount)}</td>
                      <td className="px-4 py-3 text-right text-red-600 tabular-nums">{formatCurrency(remaining)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-indigo-600'}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-10 text-right">{Math.round(progress)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                          goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                          {goal.priority || 'medium'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => { setSelectedGoal(goal); setIsContributeModalOpen(true); }}
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium hover:bg-indigo-100"
                          >
                            + Add
                          </button>
                          <button
                            onClick={() => {
                              setSelectedGoal(goal);
                              setEditGoal({
                                name: goal.name,
                                target_amount: goal.target_amount.toString(),
                                category: goal.category || ''
                              });
                              setIsEditModalOpen(true);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-500"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(goal.id, e)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}

              {/* Totals Row */}
              {goals.length > 0 && (
                <tr className="bg-indigo-100 font-bold">
                  <td className="px-4 py-3" colSpan={3}>TOTAL ({goals.length} Goals)</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(goals.reduce((sum, g) => sum + g.target_amount, 0))}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600 tabular-nums">
                    {formatCurrency(goals.reduce((sum, g) => sum + g.current_amount, 0))}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600 tabular-nums">
                    {formatCurrency(goals.reduce((sum, g) => sum + Math.max(g.target_amount - g.current_amount, 0), 0))}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {Math.round((goals.reduce((sum, g) => sum + g.current_amount, 0) / goals.reduce((sum, g) => sum + g.target_amount, 0)) * 100)}%
                  </td>
                  <td className="px-4 py-3" colSpan={2}></td>
                </tr>
              )}
            </tbody>
          </table>
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

      {/* Edit Goal Modal */}
      {isEditModalOpen && selectedGoal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Goal</h3>
            <form onSubmit={handleEditGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                <input
                  type="text"
                  placeholder="Goal Name"
                  required
                  autoFocus
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  value={editGoal.name}
                  onChange={e => setEditGoal({ ...editGoal, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Target Amount"
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  value={editGoal.target_amount}
                  onChange={e => setEditGoal({ ...editGoal, target_amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="Category (e.g., Savings, Insurance)"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  value={editGoal.category}
                  onChange={e => setEditGoal({ ...editGoal, category: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
