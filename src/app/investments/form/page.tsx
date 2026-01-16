'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'

const investmentTypes = [
  { value: 'stocks', label: 'Stocks' },
  { value: 'mf', label: 'Mutual Funds' },
  { value: 'bonds', label: 'Bonds' },
  { value: 'ppf', label: 'PPF' },
  { value: 'nps', label: 'NPS' },
  { value: 'other', label: 'Other' }
]

function InvestmentFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const isEdit = !!editId

  const supabase = createClient()
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    investment_name: '',
    investment_type: '',
    invested_amount: '',
    current_value: '',
    notes: ''
  })

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserEmail(user.email || '')

      if (editId) {
        const { data: investment } = await supabase
          .from('investments')
          .select('*')
          .eq('id', editId)
          .single()

        if (investment) {
          setFormData({
            investment_name: investment.investment_name,
            investment_type: investment.investment_type,
            invested_amount: investment.invested_amount.toString(),
            current_value: investment.current_value.toString(),
            notes: investment.notes || ''
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
      investment_name: formData.investment_name,
      investment_type: formData.investment_type,
      invested_amount: parseFloat(formData.invested_amount),
      current_value: parseFloat(formData.current_value) || parseFloat(formData.invested_amount),
      notes: formData.notes || null,
      updated_at: new Date().toISOString()
    }

    let err
    if (isEdit) {
      const res = await supabase.from('investments').update(payload).eq('id', editId)
      err = res.error
    } else {
      const res = await supabase.from('investments').insert({ ...payload, user_id: user.id })
      err = res.error
    }

    if (err) { setError(err.message); setLoading(false); return }
    router.push('/investments')
  }

  return (
    <AppLayout userEmail={userEmail}>
      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center mb-6">
            <Link href="/investments" className="text-blue-600 hover:text-blue-800 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h2 className="text-2xl font-semibold text-gray-900">{isEdit ? 'Edit' : 'Add'} Investment</h2>
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

            <div>
              <label htmlFor="investment_name" className="block text-sm font-medium text-gray-700">Investment Name *</label>
              <input
                type="text"
                id="investment_name"
                required
                value={formData.investment_name}
                onChange={(e) => setFormData({ ...formData, investment_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                placeholder="e.g., HDFC Mid Cap Fund"
              />
            </div>

            <div>
              <label htmlFor="investment_type" className="block text-sm font-medium text-gray-700">Type *</label>
              <select
                id="investment_type"
                required
                value={formData.investment_type}
                onChange={(e) => setFormData({ ...formData, investment_type: e.target.value })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!formData.investment_type ? 'text-gray-500' : 'text-gray-900'}`}
              >
                <option value="">Select type</option>
                {investmentTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="invested_amount" className="block text-sm font-medium text-gray-700">Invested Amount *</label>
                <input
                  type="number"
                  id="invested_amount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.invested_amount}
                  onChange={(e) => setFormData({ ...formData, invested_amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="100000"
                />
              </div>
              <div>
                <label htmlFor="current_value" className="block text-sm font-medium text-gray-700">Current Value</label>
                <input
                  type="number"
                  id="current_value"
                  min="0"
                  step="0.01"
                  value={formData.current_value}
                  onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="Same as invested if blank"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                placeholder="Optional notes..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/investments" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</Link>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Investment'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </AppLayout>
  )
}

export default function InvestmentFormPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <InvestmentFormContent />
    </Suspense>
  )
}
