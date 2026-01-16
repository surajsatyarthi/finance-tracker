'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'

export default function EditTransactionPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const [userEmail, setUserEmail] = useState('')
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    notes: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkUserAndLoadTransaction() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUserEmail(user.email || '')

      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !transaction) {
        setError('Transaction not found')
        setLoading(false)
        return
      }

      setFormData({
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount.toString(),
        type: transaction.type,
        notes: transaction.notes || ''
      })
      setLoading(false)
    }

    checkUserAndLoadTransaction()
  }, [params.id, router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        date: formData.date,
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        notes: formData.notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push('/transactions')
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    setError(null)

    const { error: deleteError } = await supabase
      .from('transactions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id)

    if (deleteError) {
      setError(deleteError.message)
      setDeleting(false)
      return
    }

    router.push('/transactions')
    router.refresh()
  }

  if (!userEmail || loading) {
    return null
  }

  return (
    <AppLayout userEmail={userEmail}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link href="/transactions" className="text-sm text-blue-600 hover:text-blue-800">
              ← Back to Transactions
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Transaction</h2>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Type *
                  </label>
                  <select
                    id="type"
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <input
                    type="text"
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="e.g., Grocery shopping"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Amount *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">₹</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      required
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="Additional details..."
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Transaction'}
                </button>
                <div className="flex gap-4">
                  <Link
                    href="/transactions"
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
