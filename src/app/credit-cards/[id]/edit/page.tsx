'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'

export default function EditCreditCardPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const [userEmail, setUserEmail] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    card_type: '',
    last_four_digits: '',
    credit_limit: '',
    current_balance: '',
    statement_date: '',
    due_date: '',
    annual_fee: '',
    expiry_date: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkUserAndLoadCard() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUserEmail(user.email || '')

      const { data: card, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !card) {
        setError('Card not found')
        setLoading(false)
        return
      }

      setFormData({
        name: card.name,
        bank: card.bank || '',
        card_type: card.card_type,
        last_four_digits: card.last_four_digits || '',
        credit_limit: card.credit_limit.toString(),
        current_balance: card.current_balance.toString(),
        statement_date: card.statement_date?.toString() || '',
        due_date: card.due_date?.toString() || '',
        annual_fee: card.annual_fee?.toString() || '',
        expiry_date: card.expiry_date || ''
      })
      setLoading(false)
    }

    checkUserAndLoadCard()
  }, [params.id, router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('credit_cards')
      .update({
        name: formData.name,
        bank: formData.bank || null,
        card_type: formData.card_type,
        last_four_digits: formData.last_four_digits || null,
        credit_limit: parseFloat(formData.credit_limit),
        current_balance: parseFloat(formData.current_balance),
        statement_date: formData.statement_date ? parseInt(formData.statement_date) : null,
        due_date: formData.due_date ? parseInt(formData.due_date) : null,
        annual_fee: formData.annual_fee ? parseFloat(formData.annual_fee) : null,
        expiry_date: formData.expiry_date || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push('/credit-cards')
  }

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to deactivate this card? You can reactivate it later.')) {
      return
    }

    setDeleting(true)
    setError(null)

    const { error: deactivateError } = await supabase
      .from('credit_cards')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', params.id)

    if (deactivateError) {
      setError(deactivateError.message)
      setDeleting(false)
      return
    }

    router.push('/credit-cards')
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
            <Link href="/credit-cards" className="text-sm text-blue-600 hover:text-blue-800">
              ← Back to Credit Cards
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Credit Card</h2>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Card Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="e.g., HDFC Regalia"
                  />
                </div>

                {/* Bank Name */}
                <div>
                  <label htmlFor="bank" className="block text-sm font-medium text-gray-700">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    id="bank"
                    value={formData.bank}
                    onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="e.g., HDFC Bank"
                  />
                </div>

                {/* Card Network */}
                <div>
                  <label htmlFor="card_type" className="block text-sm font-medium text-gray-700">
                    Card Network *
                  </label>
                  <select
                    id="card_type"
                    required
                    value={formData.card_type}
                    onChange={(e) => setFormData({ ...formData, card_type: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="VISA">VISA</option>
                    <option value="MASTERCARD">MASTERCARD</option>
                    <option value="RUPAY">RUPAY</option>
                    <option value="AMEX">AMEX</option>
                    <option value="JCB">JCB</option>
                    <option value="DISCOVER">DISCOVER</option>
                  </select>
                </div>

                {/* Last 4 Digits */}
                <div>
                  <label htmlFor="last_four_digits" className="block text-sm font-medium text-gray-700">
                    Last 4 Digits
                  </label>
                  <input
                    type="text"
                    id="last_four_digits"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    value={formData.last_four_digits}
                    onChange={(e) => setFormData({ ...formData, last_four_digits: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="1234"
                  />
                </div>

                {/* Credit Limit */}
                <div>
                  <label htmlFor="credit_limit" className="block text-sm font-medium text-gray-700">
                    Credit Limit *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">₹</span>
                    </div>
                    <input
                      type="number"
                      id="credit_limit"
                      required
                      min="0"
                      step="0.01"
                      value={formData.credit_limit}
                      onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                      className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Current Balance */}
                <div>
                  <label htmlFor="current_balance" className="block text-sm font-medium text-gray-700">
                    Current Outstanding *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">₹</span>
                    </div>
                    <input
                      type="number"
                      id="current_balance"
                      required
                      min="0"
                      step="0.01"
                      value={formData.current_balance}
                      onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })}
                      className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Statement Date */}
                <div>
                  <label htmlFor="statement_date" className="block text-sm font-medium text-gray-700">
                    Statement Date (Day of Month)
                  </label>
                  <input
                    type="number"
                    id="statement_date"
                    min="1"
                    max="31"
                    value={formData.statement_date}
                    onChange={(e) => setFormData({ ...formData, statement_date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="e.g., 15"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                    Due Date (Day of Month)
                  </label>
                  <input
                    type="number"
                    id="due_date"
                    min="1"
                    max="31"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="e.g., 5"
                  />
                </div>

                {/* Annual Fee */}
                <div>
                  <label htmlFor="annual_fee" className="block text-sm font-medium text-gray-700">
                    Annual Fee
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">₹</span>
                    </div>
                    <input
                      type="number"
                      id="annual_fee"
                      min="0"
                      step="0.01"
                      value={formData.annual_fee}
                      onChange={(e) => setFormData({ ...formData, annual_fee: e.target.value })}
                      className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Expiry Date */}
                <div>
                  <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    id="expiry_date"
                    maxLength={5}
                    pattern="[0-9]{2}/[0-9]{2}"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="MM/YY"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={deleting}
                  className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting ? 'Deactivating...' : 'Deactivate Card'}
                </button>
                <div className="flex gap-4">
                  <Link
                    href="/credit-cards"
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
