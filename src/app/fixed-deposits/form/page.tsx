'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'

function FDFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const isEdit = !!editId

  const supabase = createClient()
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    bank_name: '',
    fd_number: '',
    principal_amount: '',
    interest_rate: '',
    tenure_months: '',
    start_date: new Date().toISOString().split('T')[0],
    maturity_date: '',
    maturity_amount: '',
    auto_renew: false,
    nominee_name: '',
    notes: ''
  })

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserEmail(user.email || '')

      if (editId) {
        const { data: fd } = await supabase
          .from('fixed_deposits')
          .select('*')
          .eq('id', editId)
          .single()

        if (fd) {
          setFormData({
            bank_name: fd.bank_name,
            fd_number: fd.fd_number || '',
            principal_amount: fd.principal_amount.toString(),
            interest_rate: fd.interest_rate.toString(),
            tenure_months: fd.tenure_months.toString(),
            start_date: fd.start_date,
            maturity_date: fd.maturity_date,
            maturity_amount: fd.maturity_amount.toString(),
            auto_renew: fd.auto_renew || false,
            nominee_name: fd.nominee_name || '',
            notes: fd.notes || ''
          })
        }
      }
    }
    loadData()
  }, [editId, router, supabase])

  // Helper to calculate maturity date
  const calculateMaturityDate = (start: string, monthsStr: string) => {
    if (!start || !monthsStr) return ''
    const startDate = new Date(start)
    const months = parseInt(monthsStr)
    if (isNaN(months)) return ''
    
    const maturityDate = new Date(startDate)
    maturityDate.setMonth(maturityDate.getMonth() + months)
    return maturityDate.toISOString().split('T')[0]
  }

  // Helper to calculate maturity amount
  const calculateMaturityAmount = (principalStr: string, rateStr: string, monthsStr: string) => {
    const principal = parseFloat(principalStr)
    const rate = parseFloat(rateStr)
    const months = parseInt(monthsStr)

    if (isNaN(principal) || isNaN(rate) || isNaN(months)) return ''

    // Quarterly compounding
    const quarters = months / 3
    const ratePerQuarter = rate / 4 / 100
    const maturityAmount = principal * Math.pow(1 + ratePerQuarter, quarters)
    return maturityAmount.toFixed(2)
  }

  const handleTenureChange = (val: string) => {
    const newMaturityDate = calculateMaturityDate(formData.start_date, val)
    const newMaturityAmount = calculateMaturityAmount(formData.principal_amount, formData.interest_rate, val)
    
    setFormData(prev => ({
      ...prev,
      tenure_months: val,
      maturity_date: newMaturityDate || prev.maturity_date,
      maturity_amount: newMaturityAmount || prev.maturity_amount
    }))
  }

  const handleStartDateChange = (val: string) => {
    const newMaturityDate = calculateMaturityDate(val, formData.tenure_months)
    setFormData(prev => ({
      ...prev,
      start_date: val,
      maturity_date: newMaturityDate || prev.maturity_date
    }))
  }

  const handlePrincipalChange = (val: string) => {
    const newMaturityAmount = calculateMaturityAmount(val, formData.interest_rate, formData.tenure_months)
    setFormData(prev => ({
      ...prev,
      principal_amount: val,
      maturity_amount: newMaturityAmount || prev.maturity_amount
    }))
  }

  const handleInterestRateChange = (val: string) => {
    const newMaturityAmount = calculateMaturityAmount(formData.principal_amount, val, formData.tenure_months)
    setFormData(prev => ({
      ...prev,
      interest_rate: val,
      maturity_amount: newMaturityAmount || prev.maturity_amount
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const payload = {
      bank_name: formData.bank_name,
      fd_number: formData.fd_number || null,
      principal_amount: parseFloat(formData.principal_amount),
      interest_rate: parseFloat(formData.interest_rate),
      tenure_months: parseInt(formData.tenure_months),
      start_date: formData.start_date,
      maturity_date: formData.maturity_date,
      maturity_amount: parseFloat(formData.maturity_amount),
      auto_renew: formData.auto_renew,
      nominee_name: formData.nominee_name || null,
      notes: formData.notes || null,
      updated_at: new Date().toISOString()
    }

    let err
    if (isEdit) {
      const res = await supabase.from('fixed_deposits').update(payload).eq('id', editId)
      err = res.error
    } else {
      const res = await supabase.from('fixed_deposits').insert({ ...payload, user_id: user.id })
      err = res.error
    }

    if (err) { setError(err.message); setLoading(false); return }
    router.push('/fixed-deposits')
  }

  const interestAmount = formData.maturity_amount && formData.principal_amount
    ? parseFloat(formData.maturity_amount) - parseFloat(formData.principal_amount)
    : 0

  return (
    <AppLayout userEmail={userEmail}>
      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center mb-6">
            <Link href="/fixed-deposits" className="text-blue-600 hover:text-blue-800 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h2 className="text-2xl font-semibold text-gray-900">{isEdit ? 'Edit' : 'Add'} Fixed Deposit</h2>
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

            <div>
              <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700">Bank/Institution *</label>
              <input
                type="text"
                id="bank_name"
                required
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                placeholder="e.g., HDFC Bank, SBI"
              />
            </div>

            <div>
              <label htmlFor="fd_number" className="block text-sm font-medium text-gray-700">FD Number</label>
              <input
                type="text"
                id="fd_number"
                value={formData.fd_number}
                onChange={(e) => setFormData({ ...formData, fd_number: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                placeholder="Optional FD reference number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="principal_amount" className="block text-sm font-medium text-gray-700">Principal Amount *</label>
                <input
                  type="number"
                  id="principal_amount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.principal_amount}
                  onChange={(e) => handlePrincipalChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="100000"
                />
              </div>

              <div>
                <label htmlFor="interest_rate" className="block text-sm font-medium text-gray-700">Interest Rate (%) *</label>
                <input
                  type="number"
                  id="interest_rate"
                  required
                  min="0"
                  step="0.01"
                  value={formData.interest_rate}
                  onChange={(e) => handleInterestRateChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="6.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="tenure_months" className="block text-sm font-medium text-gray-700">Tenure (Months) *</label>
                <input
                  type="number"
                  id="tenure_months"
                  required
                  min="1"
                  value={formData.tenure_months}
                  onChange={(e) => handleTenureChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="12"
                />
              </div>

              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date *</label>
                <input
                  type="date"
                  id="start_date"
                  required
                  value={formData.start_date}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="maturity_date" className="block text-sm font-medium text-gray-700">Maturity Date *</label>
                <input
                  type="date"
                  id="maturity_date"
                  required
                  value={formData.maturity_date}
                  onChange={(e) => setFormData({ ...formData, maturity_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                />
                <p className="mt-1 text-xs text-gray-500">Auto-calculated based on tenure</p>
              </div>

              <div>
                <label htmlFor="maturity_amount" className="block text-sm font-medium text-gray-700">Maturity Amount *</label>
                <input
                  type="number"
                  id="maturity_amount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.maturity_amount}
                  onChange={(e) => setFormData({ ...formData, maturity_amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                />
                <p className="mt-1 text-xs text-gray-500">Auto-calculated with quarterly compounding</p>
              </div>
            </div>

            {interestAmount > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-700">
                  Interest Earnings: <span className="font-semibold text-blue-600">
                    ₹{interestAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="nominee_name" className="block text-sm font-medium text-gray-700">Nominee Name</label>
              <input
                type="text"
                id="nominee_name"
                value={formData.nominee_name}
                onChange={(e) => setFormData({ ...formData, nominee_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                placeholder="Optional"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto_renew"
                checked={formData.auto_renew}
                onChange={(e) => setFormData({ ...formData, auto_renew: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="auto_renew" className="ml-2 block text-sm text-gray-900">
                Auto-renew on maturity
              </label>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                placeholder="Optional notes"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/fixed-deposits" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</Link>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add FD'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </AppLayout>
  )
}

export default function FDFormPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <FDFormContent />
    </Suspense>
  )
}
