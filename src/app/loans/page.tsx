'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import { financeManager } from '@/lib/supabaseDataManager'
import { useNotification } from '@/contexts/NotificationContext'
import GlassCard from '@/components/GlassCard'
import { usePrivacy } from '@/contexts/PrivacyContext'
import { CurrencyRupeeIcon, CalendarIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

type LoanForm = {
  name: string
  principal: string
  rate: string
  tenureMonths: string
  startDate: string
}

export default function LoansPage() {
  const { user } = useRequireAuth()
  const { locked } = usePrivacy()
  const { showNotification } = useNotification()

  const [loans, setLoans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<LoanForm>({ name: '', principal: '', rate: '', tenureMonths: '', startDate: '' })
  const [submitting, setSubmitting] = useState(false)

  const loadLoans = useCallback(async () => {
    if (!user) return
    try {
      const data = await financeManager.getLoans()
      setLoans(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadLoans()
  }, [loadLoans])

  const summary = useMemo(() => {
    const totalMonthly = loans.reduce((sum, l) => sum + (l.monthlyAmount || 0), 0)
    const totalOutstandingEmis = loans.reduce((sum, l) => sum + Math.max((l.tenureMonths || 0) - (l.emisPaid || 0), 0), 0)
    return { totalMonthly, totalOutstandingEmis }
  }, [loans])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await financeManager.createLoan({
        name: form.name,
        principal: parseFloat(form.principal || '0'),
        rate: parseFloat(form.rate || '0'),
        tenureMonths: parseInt(form.tenureMonths || '0', 10),
        startDate: form.startDate || new Date().toISOString().split('T')[0],
      })
      showNotification('Loan added successfully', 'success')
      await loadLoans()
      setForm({ name: '', principal: '', rate: '', tenureMonths: '', startDate: '' })
    } catch (error) {
      console.error(error)
      showNotification('Failed to add loan', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this loan?')) return
    try {
      await financeManager.deleteLoan(id)
      showNotification('Loan deleted', 'success')
      loadLoans()
    } catch (e) {
      showNotification('Failed to delete loan', 'error')
    }
  }

  const handleMarkPaid = async (id: string) => {
    try {
      await financeManager.markLoanEmiPaid(id)
      showNotification('EMI marked as paid', 'success')
      loadLoans()
    } catch (e) {
      showNotification('Failed to update EMI', 'error')
    }
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Loans & EMIs</h1>
          <p className="text-gray-600">Track loans, monthly EMIs, and due dates</p>
        </div>

        <GlassCard className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Loan</h2>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="glass-input px-3 py-2 rounded-md" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="glass-input px-3 py-2 rounded-md" type="number" placeholder="Principal (₹)" value={form.principal} onChange={(e) => setForm({ ...form, principal: e.target.value })} required />
            <input className="glass-input px-3 py-2 rounded-md" type="number" step="0.01" placeholder="Rate (%)" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} required />
            <input className="glass-input px-3 py-2 rounded-md" type="number" placeholder="Tenure (months)" value={form.tenureMonths} onChange={(e) => setForm({ ...form, tenureMonths: e.target.value })} required />
            <input className="glass-input px-3 py-2 rounded-md" type="date" placeholder="Start Date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <div className="md:col-span-2">
              <button type="submit" disabled={submitting} className="btn-primary inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                <PlusIcon className="h-4 w-4 mr-2" />
                {submitting ? 'Adding...' : 'Add Loan'}
              </button>
            </div>
          </form>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard>
            <div className="flex items-center">
              <CurrencyRupeeIcon className="h-8 w-8 text-rose-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Monthly EMI</p>
                <p className="text-2xl font-bold text-gray-900">{locked ? '₹••••••' : formatCurrency(summary.totalMonthly)}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Outstanding EMIs</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalOutstandingEmis}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Loans</p>
                <p className="text-2xl font-bold text-gray-900">{loans.length}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Loans</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EMI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid/Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Due</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loans.map(loan => (
                  <tr
                    key={loan.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-3 text-sm font-medium text-gray-900" onClick={() => window.location.href = `/loans/${loan.id}`}>{loan.name}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">{locked ? '₹••••••' : formatCurrency(loan.principal)}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{loan.rate}%</td>
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">{locked ? '₹••••••' : formatCurrency(loan.monthlyAmount)}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{loan.emisPaid}/{loan.tenureMonths}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{loan.nextDueDate}</td>
                    <td className="px-6 py-3 text-right text-sm">
                      <button className="px-3 py-1 rounded border mr-2 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); handleMarkPaid(loan.id); }}>Mark Paid</button>
                      <button className="px-3 py-1 rounded border text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(loan.id); }}>Delete</button>
                    </td>
                  </tr>
                ))}
                {loans.length === 0 && (
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={7}>No loans</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
