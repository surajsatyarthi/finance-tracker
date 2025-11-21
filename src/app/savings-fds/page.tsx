'use client'

import { useState, useMemo } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import { getFDs, storeFD, updateFD, deleteFD } from '@/lib/dataManager'
import GlassCard from '@/components/GlassCard'
import { usePrivacy } from '@/contexts/PrivacyContext'
import { CurrencyRupeeIcon, CalendarIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

type FDForm = {
  name: string
  amount: string
  rate: string
  startDate: string
  maturityDate: string
  autoRenew: boolean
  notes: string
}

export default function SavingsFDsPage() {
  useRequireAuth()
  const { locked } = usePrivacy()
  const [fds, setFds] = useState(getFDs())
  const [form, setForm] = useState<FDForm>({ name: '', amount: '', rate: '', startDate: '', maturityDate: '', autoRenew: false, notes: '' })
  const [editingId, setEditingId] = useState<string | null>(null)

  const maturityCalendar = useMemo(() => {
    return [...fds].sort((a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime())
  }, [fds])

  const onSubmit = (e: React.FormEvent) => {
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
      updateFD(editingId, payload)
      setFds(getFDs())
      setEditingId(null)
    } else {
      storeFD(payload)
      setFds(getFDs())
    }
    setForm({ name: '', amount: '', rate: '', startDate: '', maturityDate: '', autoRenew: false, notes: '' })
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

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
            <input className="glass-input px-3 py-2 rounded-md" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="glass-input px-3 py-2 rounded-md" type="number" placeholder="Amount (₹)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <input className="glass-input px-3 py-2 rounded-md" type="number" step="0.01" placeholder="Rate (%)" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
            <input className="glass-input px-3 py-2 rounded-md" type="date" placeholder="Start Date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <input className="glass-input px-3 py-2 rounded-md" type="date" placeholder="Maturity Date" value={form.maturityDate} onChange={(e) => setForm({ ...form, maturityDate: e.target.value })} />
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
                <button type="button" className="px-4 py-2 rounded-md border" onClick={() => { setEditingId(null); setForm({ name: '', amount: '', rate: '', startDate: '', maturityDate: '', autoRenew: false, notes: '' }) }}>Cancel</button>
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fds.map(fd => (
                  <tr key={fd.id}>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{fd.name}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">{locked ? '₹••••••' : formatCurrency(fd.amount)}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{fd.rate}%</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{fd.startDate}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{fd.maturityDate}</td>
                    <td className="px-6 py-3 text-right text-sm">
                      <button className="px-3 py-1 rounded border mr-2" onClick={() => {
                        setEditingId(fd.id)
                        setForm({ name: fd.name, amount: String(fd.amount), rate: String(fd.rate), startDate: fd.startDate, maturityDate: fd.maturityDate, autoRenew: fd.autoRenew, notes: fd.notes || '' })
                      }}>
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="px-3 py-1 rounded border" onClick={() => { deleteFD(fd.id); setFds(getFDs()) }}>
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {fds.length === 0 && (
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={6}>No records</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <GlassCard>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Maturity Calendar</h3>
            <div className="space-y-3">
              {maturityCalendar.map(fd => (
                <div key={fd.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-900">{fd.name}</span>
                  </div>
                  <div className="text-sm text-gray-700">{new Date(fd.maturityDate).toLocaleDateString('en-IN')}</div>
                </div>
              ))}
              {maturityCalendar.length === 0 && <p className="text-sm text-gray-500">No upcoming maturities</p>}
            </div>
          </GlassCard>
          <GlassCard>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Savings Ladder</h3>
            <div className="space-y-3">
              {fds.map(fd => (
                <div key={fd.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <CurrencyRupeeIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">{fd.name}</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{locked ? '₹••••••' : formatCurrency(fd.amount)}</div>
                </div>
              ))}
              {fds.length === 0 && <p className="text-sm text-gray-500">No savings records</p>}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

