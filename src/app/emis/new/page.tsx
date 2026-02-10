'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'
import type { CreditCard } from '@/types/database'

export default function NewEMIPage() {
  const router = useRouter()
  const supabase = createClient()

  const [userEmail, setUserEmail] = useState('')
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [formData, setFormData] = useState({
    emi_name: '',
    total_amount: '',
    monthly_emi: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    next_due_date: '',
    linked_card_id: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserEmail(user.email || '')

      const { data: cards } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(100)
      setCreditCards((cards || []) as CreditCard[])
    }
    loadData()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const totalAmount = parseFloat(formData.total_amount)
    const monthlyEmi = parseFloat(formData.monthly_emi)

    const { error: insertError } = await supabase
      .from('emis')
      .insert({
        user_id: user.id,
        emi_name: formData.emi_name,
        total_amount: totalAmount,
        paid_amount: 0,
        remaining_amount: totalAmount,
        monthly_emi: monthlyEmi,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        next_due_date: formData.next_due_date || null,
        linked_card_id: formData.linked_card_id || null,
        notes: formData.notes || null
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/emis')
  }

  return (
    <AppLayout userEmail={userEmail}>
      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center mb-6">
            <Link href="/emis" className="text-blue-600 hover:text-blue-800 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h2 className="text-2xl font-semibold text-gray-900">Add New EMI</h2>
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">EMI Name *</label>
              <input
                type="text"
                required
                value={formData.emi_name}
                onChange={(e) => setFormData({ ...formData, emi_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 text-gray-900 placeholder:text-gray-400"
                placeholder="e.g., iPhone 15 Pro EMI"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Amount *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 text-gray-900 placeholder:text-gray-400"
                  placeholder="150000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly EMI *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.monthly_emi}
                  onChange={(e) => setFormData({ ...formData, monthly_emi: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 text-gray-900 placeholder:text-gray-400"
                  placeholder="12500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Next Due Date</label>
                <input
                  type="date"
                  value={formData.next_due_date}
                  onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Linked Credit Card</label>
              <select
                value={formData.linked_card_id}
                onChange={(e) => setFormData({ ...formData, linked_card_id: e.target.value })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${formData.linked_card_id === '' ? 'text-gray-500' : 'text-gray-900'}`}
              >
                <option value="">No linked card</option>
                {creditCards.map((card) => (
                  <option key={card.id} value={card.id}>{card.name} ({card.bank})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 text-gray-900 placeholder:text-gray-400"
                placeholder="Any additional notes..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/emis"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add EMI'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </AppLayout>
  )
}
