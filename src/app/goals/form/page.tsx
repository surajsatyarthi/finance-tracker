'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'

function GoalFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const isEdit = !!editId

  const supabase = createClient()
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    goal_name: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    notes: ''
  })

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserEmail(user.email || '')

      if (editId) {
        const { data: goal } = await supabase
          .from('goals')
          .select('*')
          .eq('id', editId)
          .single()

        if (goal) {
          setFormData({
            goal_name: goal.goal_name,
            target_amount: goal.target_amount.toString(),
            current_amount: goal.current_amount.toString(),
            target_date: goal.target_date || '',
            notes: goal.notes || ''
          })
        }
      }
    }
    loadData()
  }, [editId, router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const payload = {
      goal_name: formData.goal_name,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount || '0'),
      target_date: formData.target_date || null,
      notes: formData.notes || null,
      updated_at: new Date().toISOString()
    }

    let err
    if (isEdit) {
      const res = await supabase.from('goals').update(payload).eq('id', editId)
      err = res.error
    } else {
      const res = await supabase.from('goals').insert({ ...payload, user_id: user.id })
      err = res.error
    }

    if (err) { setError(err.message); setLoading(false); return }
    router.push('/goals')
  }

  const progressPercentage = formData.target_amount && formData.current_amount
    ? ((parseFloat(formData.current_amount) / parseFloat(formData.target_amount)) * 100).toFixed(1)
    : '0'

  return (
    <AppLayout userEmail={userEmail}>
      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center mb-6">
            <Link href="/goals" className="text-blue-600 hover:text-blue-800 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h2 className="text-2xl font-semibold text-gray-900">{isEdit ? 'Edit' : 'Add'} Goal</h2>
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

            <div>
              <label htmlFor="goal_name" className="block text-sm font-medium text-gray-700">Goal Name *</label>
              <input
                type="text"
                id="goal_name"
                required
                value={formData.goal_name}
                onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                placeholder="e.g., Emergency Fund, Down Payment, Vacation"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="target_amount" className="block text-sm font-medium text-gray-700">Target Amount *</label>
                <input
                  type="number"
                  id="target_amount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="100000"
                />
              </div>

              <div>
                <label htmlFor="current_amount" className="block text-sm font-medium text-gray-700">Current Amount</label>
                <input
                  type="number"
                  id="current_amount"
                  min="0"
                  step="0.01"
                  value={formData.current_amount}
                  onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="0"
                />
              </div>
            </div>

            {formData.target_amount && parseFloat(formData.target_amount) > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 font-medium">Progress</span>
                  <span className="text-gray-900 font-semibold">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      parseFloat(progressPercentage) >= 100 ? 'bg-green-600' : parseFloat(progressPercentage) >= 75 ? 'bg-blue-600' : parseFloat(progressPercentage) >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min(parseFloat(progressPercentage), 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="target_date" className="block text-sm font-medium text-gray-700">Target Date</label>
              <input
                type="date"
                id="target_date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                placeholder="Optional notes about this goal"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/goals" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</Link>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Goal'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </AppLayout>
  )
}

export default function GoalFormPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <GoalFormContent />
    </Suspense>
  )
}
