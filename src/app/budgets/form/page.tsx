'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'

function BudgetFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const isEdit = !!editId

  const supabase = createClient()
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])

  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    period: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  })

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserEmail(user.email || '')

      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('type')
        .order('name')

      setCategories(cats || [])

      if (editId) {
        const { data: budget } = await supabase
          .from('budgets')
          .select('*')
          .eq('id', editId)
          .single()

        if (budget) {
          setFormData({
            category_id: budget.category_id,
            amount: budget.amount.toString(),
            period: budget.period,
            start_date: budget.start_date,
            end_date: budget.end_date || ''
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
      category_id: formData.category_id,
      amount: parseFloat(formData.amount),
      period: formData.period,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      updated_at: new Date().toISOString()
    }

    let err
    if (isEdit) {
      const res = await supabase.from('budgets').update(payload).eq('id', editId)
      err = res.error
    } else {
      const res = await supabase.from('budgets').insert({ ...payload, user_id: user.id })
      err = res.error
    }

    if (err) { setError(err.message); setLoading(false); return }
    router.push('/budgets')
  }

  return (
    <AppLayout userEmail={userEmail}>
      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center mb-6">
            <Link href="/budgets" className="text-blue-600 hover:text-blue-800 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h2 className="text-2xl font-semibold text-gray-900">{isEdit ? 'Edit' : 'Add'} Budget</h2>
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Category *</label>
              <select
                id="category_id"
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!formData.category_id ? 'text-gray-500' : 'text-gray-900'}`}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.type})
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  No categories found. <Link href="/categories/form" className="text-blue-600 hover:text-blue-800">Create one first</Link>.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount *</label>
                <input
                  type="number"
                  id="amount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="10000"
                />
              </div>

              <div>
                <label htmlFor="period" className="block text-sm font-medium text-gray-700">Period *</label>
                <select
                  id="period"
                  required
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!formData.period ? 'text-gray-500' : 'text-gray-900'}`}
                >
                  <option value="">Select period</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date *</label>
                <input
                  type="date"
                  id="start_date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  id="end_date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/budgets" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</Link>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Budget'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </AppLayout>
  )
}

export default function BudgetFormPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <BudgetFormContent />
    </Suspense>
  )
}
