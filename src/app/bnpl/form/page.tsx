'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'

function BNPLFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const isEdit = !!editId

  const supabase = createClient()
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const providers = [
    'Amazon Pay Later',
    'LazyPay',
    'Simpl',
    'ZestMoney',
    'Flipkart Pay Later',
    'Paytm Postpaid',
    'Ola Money Postpaid',
    'Other'
  ]

  const [formData, setFormData] = useState({
    merchant: '',
    total_amount: '',      // Credit limit
    remaining_amount: '0', // Current balance owed
    installment_amount: '0',
    due_day: '',           // Day of month (1-31)
    notes: ''
  })

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserEmail(user.email || '')

      if (editId) {
        const { data: bnpl } = await supabase.from('bnpls').select('*').eq('id', editId).single()
        if (bnpl) {
          // Extract day from next_due_date if exists
          let dueDay = ''
          if (bnpl.next_due_date) {
            dueDay = new Date(bnpl.next_due_date).getDate().toString()
          }
          setFormData({
            merchant: bnpl.merchant,
            total_amount: bnpl.total_amount.toString(),
            remaining_amount: bnpl.remaining_amount.toString(),
            installment_amount: bnpl.installment_amount.toString(),
            due_day: dueDay,
            notes: bnpl.notes || ''
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

    const limit = parseFloat(formData.total_amount)
    const balance = parseFloat(formData.remaining_amount) || 0

    // Calculate next due date from day of month
    let nextDueDate = null
    if (formData.due_day) {
      const day = parseInt(formData.due_day)
      const now = new Date()
      let dueDate = new Date(now.getFullYear(), now.getMonth(), day)
      if (dueDate <= now) {
        dueDate = new Date(now.getFullYear(), now.getMonth() + 1, day)
      }
      nextDueDate = dueDate.toISOString().split('T')[0]
    }

    const payload = {
      merchant: formData.merchant,
      total_amount: limit,
      paid_amount: 0,
      remaining_amount: balance,
      installment_amount: parseFloat(formData.installment_amount) || 0,
      next_due_date: nextDueDate,
      linked_card_id: null,
      notes: formData.notes || null,
      updated_at: new Date().toISOString()
    }

    let err
    if (isEdit) {
      const res = await supabase.from('bnpls').update(payload).eq('id', editId)
      err = res.error
    } else {
      const res = await supabase.from('bnpls').insert({ ...payload, user_id: user.id })
      err = res.error
    }

    if (err) { setError(err.message); setLoading(false); return }
    router.push('/bnpl')
  }

  return (
    <AppLayout userEmail={userEmail}>
      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center mb-6">
            <Link href="/bnpl" className="text-blue-600 hover:text-blue-800 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h2 className="text-2xl font-semibold text-gray-900">{isEdit ? 'Edit' : 'Add'} BNPL</h2>
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

            <div>
              <label htmlFor="provider" className="block text-sm font-medium text-gray-700">Provider *</label>
              <select id="provider" required value={formData.merchant} onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!formData.merchant ? 'text-gray-500' : 'text-gray-900'}`}>
                <option value="">Select provider</option>
                {providers.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Credit Limit *</label>
                <input type="number" required min="0" step="1" value={formData.total_amount} onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900" placeholder="60000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Balance (Owed)</label>
                <input type="number" min="0" step="1" value={formData.remaining_amount} onChange={(e) => setFormData({ ...formData, remaining_amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900" placeholder="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly Installment</label>
                <input type="number" min="0" step="1" value={formData.installment_amount} onChange={(e) => setFormData({ ...formData, installment_amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900" placeholder="0" />
              </div>
              <div>
                <label htmlFor="due_day" className="block text-sm font-medium text-gray-700">Due Day (of month)</label>
                <input type="number" id="due_day" min="1" max="31" value={formData.due_day} onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900" placeholder="1-31" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400" placeholder="Optional notes..." />
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/bnpl" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</Link>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add BNPL'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </AppLayout>
  )
}

export default function BNPLFormPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <BNPLFormContent />
    </Suspense>
  )
}
