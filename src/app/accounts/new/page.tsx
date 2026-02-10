'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'

export default function NewAccountPage() {
  const router = useRouter()
  const supabase = createClient()

  const [userEmail, setUserEmail] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    type: '' as '' | 'savings' | 'current' | 'fd' | 'investment' | 'crypto' | 'cash',
    balance: '',
    account_number: '',
    ifsc_code: '',
    card_number: '',
    customer_id: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUserEmail(user.email || '')
      }
    }
    checkUser()
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

    const { error: insertError } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance) || 0,
        currency: 'INR',
        is_active: true,
        account_number: formData.account_number || null,
        ifsc_code: formData.ifsc_code || null,
        card_number: formData.card_number || null,
        customer_id: formData.customer_id || null
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push('/accounts')
      router.refresh()
    }
  }

  if (!userEmail) {
    return null
  }

  return (
    <AppLayout userEmail={userEmail}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link href="/accounts" className="text-sm text-blue-600 hover:text-blue-800">
              ← Back to Accounts
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Account</h2>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Account Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., HDFC Savings"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Account Type *
                </label>
                <select
                  id="type"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as '' | 'savings' | 'current' | 'fd' | 'investment' | 'crypto' | 'cash' })}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${formData.type === '' ? 'text-gray-500' : 'text-gray-900'}`}
                >
                  <option value="" disabled>Select account type</option>
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                </select>
              </div>

              <div>
                <label htmlFor="balance" className="block text-sm font-medium text-gray-700">
                  Current Balance *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    id="balance"
                    required
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="account_number" className="block text-sm font-medium text-gray-700">
                  Account Number
                </label>
                <input
                  type="text"
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., 1234567890"
                />
              </div>

              <div>
                <label htmlFor="ifsc_code" className="block text-sm font-medium text-gray-700">
                  IFSC Code
                </label>
                <input
                  type="text"
                  id="ifsc_code"
                  value={formData.ifsc_code}
                  onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., HDFC0001234"
                />
              </div>

              <div>
                <label htmlFor="card_number" className="block text-sm font-medium text-gray-700">
                  Card Number (if linked)
                </label>
                <input
                  type="text"
                  id="card_number"
                  value={formData.card_number}
                  onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., 1234567890123456"
                />
              </div>

              <div>
                <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700">
                  Customer ID
                </label>
                <input
                  type="text"
                  id="customer_id"
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="Your customer ID with the bank"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Link
                  href="/accounts"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
