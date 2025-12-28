'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import { financeManager } from '@/lib/supabaseDataManager'
import GlassCard from '@/components/GlassCard'
import { usePrivacy } from '@/contexts/PrivacyContext'
import { CurrencyRupeeIcon, CalendarIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { formatDate } from '@/lib/dateUtils'

type FDForm = {
  name: string
  amount: string
  rate: string
  startDate: string
  duration: string // in days
  maturityDate: string
  autoRenew: boolean
  notes: string
}

export default function SavingsFDsPage() {
  useRequireAuth()
  const { locked } = usePrivacy()
  const [fds, setFds] = useState<any[]>([])

  useEffect(() => {
    loadFds()
  }, [])

  const loadFds = async () => {
    const data = await financeManager.getFDs()
    setFds(data)
  }
  const [form, setForm] = useState<FDForm>({ name: '', amount: '', rate: '', startDate: '', duration: '', maturityDate: '', autoRenew: false, notes: '' })
  const [editingId, setEditingId] = useState<string | null>(null)

  // Auto-calculate maturity date when start date and duration change
  const handleDurationChange = (days: string) => {
    setForm({ ...form, duration: days })
    if (form.startDate && days) {
      const start = new Date(form.startDate)
      start.setDate(start.getDate() + parseInt(days))
      setForm({ ...form, duration: days, maturityDate: start.toISOString().split('T')[0] })
    }
  }

  const handleStartDateChange = (date: string) => {
    setForm({ ...form, startDate: date })
    if (date && form.duration) {
      const start = new Date(date)
      start.setDate(start.getDate() + parseInt(form.duration))
      setForm({ ...form, startDate: date, maturityDate: start.toISOString().split('T')[0] })
    }
  }

  const maturityCalendar = useMemo(() => {
    return [...fds].sort((a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime())
  }, [fds])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name: form.name,
      amount: parseFloat(form.amount || '0'),
      rate: parseFloat(form.rate || '0'),
      startDate: form.startDate,
      maturityDate: form.maturityDate,
      autoRenew: form.autoRenew,
      notes: form.notes,
    }
    if (editingId) {
      await financeManager.updateFD(editingId, payload)
      await loadFds()
      setEditingId(null)
    } else {
      await financeManager.storeFD(payload)
      await loadFds()
    }
    setForm({ name: '', amount: '', rate: '', startDate: '', duration: '', maturityDate: '', autoRenew: false, notes: '' })
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  const calculateMaturityAmount = (principal: number, rate: number, startDate: string, maturityDate: string) => {
    const start = new Date(startDate)
    const maturity = new Date(maturityDate)
    const days = (maturity.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    const years = days / 365
    
    // Quarterly compounding: A = P(1 + r/4)^(4*t)
    const quarterlyRate = rate / 100 / 4
    const quarters = years * 4
    return principal * Math.pow(1 + quarterlyRate, quarters)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Savings & FDs</h1>
            <p className="text-gray-600">Track fixed deposits and savings ladder with maturity dates</p>
          </div>
        </div>

        <GlassCard className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add / Edit FD</h2>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="glass-input px-3 py-2 rounded-md" placeholder="Name (e.g., SBI)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="glass-input px-3 py-2 rounded-md" type="number" placeholder="Amount (₹)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <input className="glass-input px-3 py-2 rounded-md" type="number" step="0.01" placeholder="Rate (% per annum)" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} required />
            <input className="glass-input px-3 py-2 rounded-md" type="date" placeholder="Start Date" value={form.startDate} onChange={(e) => handleStartDateChange(e.target.value)} required />
            <input className="glass-input px-3 py-2 rounded-md" type="number" placeholder="Duration (days)" value={form.duration} onChange={(e) => handleDurationChange(e.target.value)} required />
            <input className="glass-input px-3 py-2 rounded-md" type="date" placeholder="Maturity Date (auto-calculated)" value={form.maturityDate} onChange={(e) => setForm({ ...form, maturityDate: e.target.value })} required />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.autoRenew} onChange={(e) => setForm({ ...form, autoRenew: e.target.checked })} />
              Auto Renew
            </label>
            <textarea className="glass-input px-3 py-2 rounded-md md:col-span-2" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary inline-flex items-center px-4 py-2 rounded-md">
                <PlusIcon className="h-4 w-4 mr-2" />
                {editingId ? 'Update FD' : 'Add FD'}
              </button>
              {editingId && (
                <button type="button" className="px-4 py-2 rounded-md border" onClick={() => { setEditingId(null); setForm({ name: '', amount: '', rate: '', startDate: '', duration: '', maturityDate: '', autoRenew: false, notes: '' }) }}>Cancel</button>
              )}
            </div>
          </form>
        </GlassCard>

        <GlassCard>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">FDs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maturity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maturity Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fds.map(fd => {
                  const maturityAmount = calculateMaturityAmount(fd.amount, fd.rate, fd.startDate, fd.maturityDate)
                  return (
                    <tr key={fd.id}>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{fd.name}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900">{locked ? '₹••••••' : formatCurrency(fd.amount)}</td>
                      <td className="px-6 py-3 text-sm text-gray-900">{fd.rate}%</td>
                      <td className="px-6 py-3 text-sm text-gray-900">{formatDate(fd.startDate)}</td>
                      <td className="px-6 py-3 text-sm text-gray-900">{formatDate(fd.maturityDate)}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-green-700">{locked ? '₹••••••' : formatCurrency(maturityAmount)}</td>
                      <td className="px-6 py-3 text-right text-sm">
                        <button className="px-3 py-1 rounded border mr-2 hover:bg-indigo-50 text-indigo-600 inline-flex items-center gap-1" onClick={() => {
                          const start = new Date(fd.startDate)
                          const maturity = new Date(fd.maturityDate)
                          const durationDays = Math.round((maturity.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                          setEditingId(fd.id)
                          setForm({ name: fd.name, amount: String(fd.amount), rate: String(fd.rate), startDate: fd.startDate, duration: String(durationDays), maturityDate: fd.maturityDate, autoRenew: fd.autoRenew, notes: fd.notes || '' })
                        }}>
                          <PencilIcon className="h-4 w-4" />
                          Edit
                        </button>
                        <button className="px-3 py-1 rounded border hover:bg-red-50 text-red-600 inline-flex items-center gap-1" onClick={async () => { 
                          if (confirm('Delete this FD?')) {
                            await financeManager.deleteFD(fd.id); 
                            loadFds() 
                          }
                        }}>
                          <TrashIcon className="h-4 w-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {fds.length === 0 && (
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={7}>No records</td>
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

