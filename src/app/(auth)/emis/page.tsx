'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import { financeManager } from '@/lib/supabaseDataManager'
import {
  MagnifyingGlassIcon,
  CreditCardIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowRightIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import GlassCard from '@/components/GlassCard'
import { useNotification } from '@/contexts/NotificationContext'
import { formatDate } from '@/lib/dateUtils'

// Modal Component for Adding/Editing EMI
const EMIModal = ({ isOpen, onClose, onSave, loading }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    principal: '',
    monthlyAmount: '',
    tenureMonths: '',
    startDate: new Date().toISOString().slice(0, 10),
    type: 'EMI'
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Add New EMI</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name (Item/Loan)</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. iPhone 15"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Principal Amount</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  value={formData.principal}
                  onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly EMI</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  value={formData.monthlyAmount}
                  onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tenure (Months)</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  value={formData.tenureMonths}
                  onChange={(e) => setFormData({ ...formData, tenureMonths: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="EMI">EMI (Credit Card/Other)</option>
                <option value="LOAN">Personal/Home Loan</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(formData)}
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save EMI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EMITracker() {
  const { user } = useRequireAuth()
  const { showNotification } = useNotification()
  const [loans, setLoans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [cards, setCards] = useState<any[]>([])

  const loadData = async () => {
    if (!user) return
    try {
      setLoading(true)
      const fetchedLoans = await financeManager.getLoans()
      setLoans(fetchedLoans)
      const fetchedCards = await financeManager.getCreditCards() // Needed for mapping if implemented
      setCards(fetchedCards)
    } catch (e) {
      console.error('Error loading EMIs', e)
      showNotification('Failed to load EMIs', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleAddEMI = async (data: any) => {
    setModalLoading(true)
    try {
      // Calculate next due date approximately based on start date
      const start = new Date(data.startDate)
      const nextDue = new Date(start) // Logic to find next future date could be added here
      // For now, simple start date as next due if future, or next month from now?
      // Defaulting to user provided start date.

      await financeManager.createLoan({
        name: data.name,
        principal: parseFloat(data.principal),
        monthlyAmount: parseFloat(data.monthlyAmount),
        tenureMonths: parseInt(data.tenureMonths),
        startDate: data.startDate,
        nextDueDate: data.startDate, // Initial Next Due
        type: data.type,
        rate: 0 // Optional
      })
      await loadData()
      setIsModalOpen(false)
      showNotification('EMI added successfully', 'success')
    } catch (e) {
      showNotification('Failed to add EMI', 'error')
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this EMI tracker?')) return
    try {
      await financeManager.deleteLoan(id)
      await loadData()
      showNotification('EMI deleted', 'success')
    } catch (e) {
      showNotification('Failed to delete', 'error')
    }
  }

  const handlePreAdd = async (emi: any) => {
    // Logic to pre-add transaction
    if (!confirm(`Post expense of ${formatCurrency(emi.monthlyAmount)} for ${emi.name} to transactions?`)) return
    try {
      // Determine if we can link to a card.
      // Since we don't store card_id in loans table yet (unless we use metadata), we'll Create generic expense.
      // IF user named it "iPhone (HDFC)", we can't easily parse.
      // Future improvement: Add 'source_account_id' to loans table.

      await financeManager.createTransaction({
        amount: emi.monthlyAmount,
        type: 'expense',
        category: 'EMI', // Ensure category exists or string
        description: `EMI: ${emi.name}`,
        paymentMethod: 'Credit Card', // Default or ask?
        date: new Date().toISOString(), // Today
      })
      showNotification('Example transaction posted', 'success')
    } catch (e) {
      showNotification('Failed to post transaction', 'error')
    }
  }


  const filteredLoans = useMemo(() => {
    return loans.filter(l =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [loans, searchTerm])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate stats
  const stats = useMemo(() => {
    const active = filteredLoans.length
    const monthly = filteredLoans.reduce((sum, l) => sum + (l.monthlyAmount || 0), 0)
    const outstanding = filteredLoans.reduce((sum, l) => sum + (l.currentBalance || 0), 0)
    return { active, monthly, outstanding }
  }, [filteredLoans])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
              EMI Tracker
            </h1>
            <p className="text-premium-600 font-medium">
              Manage your loans and credit card installments
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary inline-flex items-center px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add New EMI
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6">
            <p className="text-sm font-medium text-gray-600">Active EMIs</p>
            <p className="text-2xl font-bold text-indigo-600">{stats.active}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6">
            <p className="text-sm font-medium text-gray-600">Total Monthly Liability</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.monthly)}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6">
            <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.outstanding)}</p>
          </div>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLoans.map((emi) => (
            <div key={emi.id} className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6 hover:shadow-premium-lg transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{emi.name}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {emi.type || 'LOAN'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handlePreAdd(emi)} className="text-green-600 hover:text-green-800 p-1" title="Post to Expenses">
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(emi.id)} className="text-red-500 hover:text-red-700 p-1">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Monthly</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(emi.monthlyAmount)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Remaining</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(emi.currentBalance)}</p>
                </div>
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>Tenure: {emi.emisPaid || 0} / {emi.tenureMonths} Months</span>
                <span>Next Due: {emi.nextDueDate ? formatDate(emi.nextDueDate) : 'N/A'}</span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${Math.min(((emi.emisPaid || 0) / (emi.tenureMonths || 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {filteredLoans.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No active EMIs or Loans found. Add one to get started.
          </div>
        )}
      </div>

      <EMIModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddEMI}
        loading={modalLoading}
      />
    </div>
  )
}
