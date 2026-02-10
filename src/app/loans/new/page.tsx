'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'

export default function NewLoanPage() {
  const router = useRouter()
  const supabase = createClient()

  const [userEmail, setUserEmail] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    type: '' as '' | 'personal' | 'home' | 'car' | 'education' | 'other',
    principal_amount: '',
    current_balance: '',
    interest_rate: '',
    emi_amount: '',
    total_emis: '',
    start_date: '',
    end_date: '',
    next_emi_date: ''
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

    const totalEmis = formData.total_emis ? parseInt(formData.total_emis) : null
    const emisRemaining = totalEmis ? totalEmis - 0 : null

    const { error: insertError } = await supabase
      .from('loans')
      .insert({
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        principal_amount: parseFloat(formData.principal_amount),
        current_balance: parseFloat(formData.current_balance) || parseFloat(formData.principal_amount),
        interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : null,
        emi_amount: formData.emi_amount ? parseFloat(formData.emi_amount) : null,
        total_emis: totalEmis,
        emis_paid: 0,
        emis_remaining: emisRemaining,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        next_emi_date: formData.next_emi_date || null,
        is_active: true
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/loans')
  }

  if (!userEmail) {
    return null
  }

  return (
    <AppLayout userEmail={userEmail}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link href="/loans" className="text-sm text-blue-600 hover:text-blue-800">
              ← Back to Loans
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Loan</h2>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Loan Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Loan Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="e.g., Home Loan - HDFC"
                  />
                </div>

                {/* Loan Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Loan Type *
                  </label>
                  <select
                    id="type"
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'personal' | 'home' | 'car' | 'education' | 'other' })}
                    className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${formData.type === '' ? 'text-gray-500' : 'text-gray-900'}`}
                  >
                    <option value="" disabled>Select loan type</option>
                    <option value="personal">Personal</option>
                    <option value="home">Home</option>
                    <option value="car">Car</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Principal Amount */}
                <div>
                  <label htmlFor="principal_amount" className="block text-sm font-medium text-gray-700">
                    Principal Amount *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">₹</span>
                    </div>
                    <input
                      type="number"
                      id="principal_amount"
                      required
                      min="0"
                      step="0.01"
                      value={formData.principal_amount}
                      onChange={(e) => setFormData({ ...formData, principal_amount: e.target.value })}
                      className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Current Balance */}
                <div>
                  <label htmlFor="current_balance" className="block text-sm font-medium text-gray-700">
                    Current Outstanding
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">₹</span>
                    </div>
                    <input
                      type="number"
                      id="current_balance"
                      min="0"
                      step="0.01"
                      value={formData.current_balance}
                      onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })}
                      className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                      placeholder="Leave blank to use principal"
                    />
                  </div>
                </div>

                {/* Interest Rate */}
                <div>
                  <label htmlFor="interest_rate" className="block text-sm font-medium text-gray-700">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    id="interest_rate"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.interest_rate}
                    onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="e.g., 8.5"
                  />
                </div>

                {/* EMI Amount */}
                <div>
                  <label htmlFor="emi_amount" className="block text-sm font-medium text-gray-700">
                    EMI Amount
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">₹</span>
                    </div>
                    <input
                      type="number"
                      id="emi_amount"
                      min="0"
                      step="0.01"
                      value={formData.emi_amount}
                      onChange={(e) => setFormData({ ...formData, emi_amount: e.target.value })}
                      className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Total EMIs */}
                <div>
                  <label htmlFor="total_emis" className="block text-sm font-medium text-gray-700">
                    Total EMIs
                  </label>
                  <input
                    type="number"
                    id="total_emis"
                    min="0"
                    value={formData.total_emis}
                    onChange={(e) => setFormData({ ...formData, total_emis: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="e.g., 60"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                {/* Next EMI Date */}
                <div>
                  <label htmlFor="next_emi_date" className="block text-sm font-medium text-gray-700">
                    Next EMI Date
                  </label>
                  <input
                    type="date"
                    id="next_emi_date"
                    value={formData.next_emi_date}
                    onChange={(e) => setFormData({ ...formData, next_emi_date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Link
                  href="/loans"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
