'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CreditCardIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  BellIcon,
  ArrowRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { financeManager } from '@/lib/supabaseDataManager'
import GlassCard from '@/components/GlassCard'
import { usePrivacy } from '@/contexts/PrivacyContext'
import { useNotification } from '@/contexts/NotificationContext'

interface CreditCardBill {
  id: string
  cardName: string
  cardNumber: string
  amountDue: number
  dueDate: string
  status: 'upcoming' | 'due_soon' | 'overdue' | 'paid'
  paymentType: 'minimum' | 'full' | 'emi' | 'partial'
  isEMI?: boolean
  emiDetails?: {
    currentEMI: number
    totalEMIs: number
    emiAmount: number
  }
  lastPaymentDate?: string
  minimumDue?: number
  totalOutstanding?: number
  unbilledAmount?: number
  unbilledSince?: string
  totalSpend?: number // amountDue + unbilledAmount
}

export default function CardsPage() {
  useRequireAuth() // Just call for authentication check
  const { locked } = usePrivacy()
  const { showNotification } = useNotification()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCard, setFilterCard] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'utilization' | 'limit' | 'balance'>('utilization')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [cardsState, setCardsState] = useState<any[]>([])

  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = async () => {
    const data = await financeManager.getCreditCards()
    setCardsState(data)
  }

  const [editOpen, setEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    lastFourDigits: '',
    creditLimit: 0,
    currentBalance: 0,
    dueDate: 1,
    statementDate: '',
    isActive: true,
  })

  const cards = cardsState
  // Recalculate summary locally based on fetched cards for now or refactor to async
  const summary = useMemo(() => {
    const totalLimit = cards.reduce((sum, card) => sum + (card.creditLimit || 0), 0)
    const totalOutstanding = cards.reduce((sum, card) => sum + (card.currentBalance || 0), 0)
    const overallUtilization = totalLimit > 0 ? Math.round((totalOutstanding / totalLimit) * 100) : 0
    return {
      totalCards: cards.length,
      totalLimit,
      totalOutstanding,
      overallUtilization
    }
  }, [cards])

  const getCreditCardUtilization = (id: string) => {
    const c = cards.find(x => x.id === id)
    if (!c || !c.creditLimit) return 0
    return Math.round((c.currentBalance / c.creditLimit) * 100)
  }
  const cardsWithMetrics = cards.map(card => ({
    id: card.id,
    name: card.name,
    lastFour: card.lastFourDigits,
    limit: card.creditLimit,
    balance: card.currentBalance,
    utilization: getCreditCardUtilization(card.id),
    statementDate: card.statementDate,
    dueDate: card.dueDate,
    isActive: card.isActive,
  }))

  // Calculate status based on due date
  const billsWithStatus: { id: string; status: string; daysUntilDue: number }[] = []

  // Filter and sort logic
  const filteredAndSortedCards = useMemo(() => {
    const filtered = cardsWithMetrics.filter(c => {
      const query = searchTerm.toLowerCase()
      const matchesCard = filterCard === 'all' || c.name === filterCard
      return matchesCard && (c.name.toLowerCase().includes(query) || c.lastFour.includes(searchTerm))
    })
    filtered.sort((a, b) => {
      const aVal = sortBy === 'name' ? a.name : sortBy === 'utilization' ? a.utilization : sortBy === 'limit' ? a.limit : a.balance
      const bVal = sortBy === 'name' ? b.name : sortBy === 'utilization' ? b.utilization : sortBy === 'limit' ? b.limit : b.balance
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1
      return aVal < bVal ? 1 : -1
    })
    return filtered
  }, [cardsWithMetrics, searchTerm, filterCard, sortBy, sortOrder])

  // Summary calculations
  const summaryStats = useMemo(() => {
    return {
      totalCards: cards.length,
      totalOutstanding: summary.totalOutstanding,
      totalLimit: summary.totalLimit,
      overallUtilization: summary.overallUtilization,
    }
  }, [cards, summary])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'due_soon':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      case 'due_soon':
        return <ExclamationCircleIcon className="h-5 w-5 text-orange-600" />
      case 'paid':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      default:
        return <ClockIcon className="h-5 w-5 text-blue-600" />
    }
  }

  const getPriorityColor = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return 'border-l-red-500 bg-red-50'
    if (daysUntilDue <= 3) return 'border-l-orange-500 bg-orange-50'
    if (daysUntilDue <= 7) return 'border-l-yellow-500 bg-yellow-50'
    return 'border-l-blue-500 bg-blue-50'
  }

  const uniqueCards = [...new Set(cardsWithMetrics.map(c => c.name))].sort()

  const openEdit = (id?: string) => {
    if (id) {
      const c = cards.find(x => x.id === id)
      if (!c) return
      setEditingId(id)
      setForm({
        name: c.name,
        lastFourDigits: c.lastFourDigits || '',
        creditLimit: c.creditLimit,
        currentBalance: c.currentBalance,
        dueDate: c.dueDate,
        statementDate: c.statementDate,
        isActive: c.isActive,
      })
    } else {
      setEditingId(null)
      setForm({ name: '', lastFourDigits: '', creditLimit: 0, currentBalance: 0, dueDate: 1, statementDate: '', isActive: true })
    }
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (editingId) {
      await financeManager.updateCreditCard(editingId, {
        name: form.name,
        lastFourDigits: form.lastFourDigits,
        creditLimit: form.creditLimit,
        currentBalance: form.currentBalance,
        dueDate: form.dueDate,
        statementDate: form.statementDate,
        isActive: form.isActive,
      })
      await loadCards()
      setEditOpen(false)
    } else {
      await financeManager.storeCreditCard({
        name: form.name,
        lastFourDigits: form.lastFourDigits,
        creditLimit: form.creditLimit,
        currentBalance: form.currentBalance,
        dueDate: form.dueDate,
        statementDate: form.statementDate,
        isActive: form.isActive,
      })
      await loadCards()
      setEditOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                Credit Card Bills & Payments
              </h1>
              <p className="text-premium-600 font-medium">
                Track your credit card due payments and EMIs
              </p>
            </div>
            <div className="flex space-x-4">

              <Link
                href="/emis"
                className="inline-flex items-center px-4 py-2 rounded-xl font-medium text-primary-600 bg-white border border-primary-200 hover:bg-primary-50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-sm"
              >
                <CreditCardIcon className="h-4 w-4 mr-2" />
                EMI Tracker
              </Link>
              <Link
                href="/pay-later"
                className="inline-flex items-center px-4 py-2 rounded-xl font-medium text-purple-600 bg-white border border-purple-200 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-sm"
              >
                <BellIcon className="h-4 w-4 mr-2" />
                Pay Later
              </Link>
              <button className="btn-primary inline-flex items-center px-6 py-3 rounded-xl font-medium" onClick={() => openEdit()}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Card
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Cards</p>
                <p className="text-2xl font-bold text-indigo-600">{summaryStats.totalCards}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyRupeeIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summaryStats.totalOutstanding)}</p>
                <p className="text-xs text-gray-500">This cycle</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BellIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Limit</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(summaryStats.totalLimit)}</p>
                <p className="text-xs text-gray-500">All active cards</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilization</p>
                <p className="text-2xl font-bold text-green-600">{summaryStats.overallUtilization}%</p>
                <p className="text-xs text-gray-500">Total / Limit</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cards or payments..."
                  className="pl-10 pr-4 py-2 w-full border border-premium-200 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">


              <div className="flex items-center space-x-2">
                <CreditCardIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={filterCard}
                  onChange={(e) => setFilterCard(e.target.value)}
                  className="border border-premium-200 rounded-xl px-3 py-2 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Cards</option>
                  {uniqueCards.map(card => (
                    <option key={card} value={card}>{card}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Sort:</span>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [by, order] = e.target.value.split('-')
                    setSortBy(by as 'name' | 'utilization' | 'limit' | 'balance')
                    setSortOrder(order as 'asc' | 'desc')
                  }}
                  className="border border-premium-200 rounded-xl px-3 py-2 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="dueDate-asc">Due Date (Earliest)</option>
                  <option value="dueDate-desc">Due Date (Latest)</option>
                  <option value="amountDue-desc">Amount (High-Low)</option>
                  <option value="amountDue-asc">Amount (Low-High)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Cards List */}
        <GlassCard>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Limit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cycle Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedCards.map((c) => {
                  // Calculate days metrics
                  const today = new Date()
                  const currentDay = today.getDate()

                  // Due Date Calculation
                  let dueDay = parseInt(c.dueDate?.toString() || '0')
                  if (isNaN(dueDay) || dueDay === 0) dueDay = 1 // Default or handle NA

                  let targetDueDate = new Date(today.getFullYear(), today.getMonth(), dueDay)
                  if (currentDay > dueDay) {
                    targetDueDate = new Date(today.getFullYear(), today.getMonth() + 1, dueDay)
                  }
                  const daysToDue = Math.ceil((targetDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

                  // Statement Date Calculation
                  let stmtDay = parseInt(c.statementDate?.toString() || '0')
                  let daysToStmt = 0
                  let stmtLabel = 'NA'

                  if (!isNaN(stmtDay) && stmtDay > 0) {
                    let targetStmtDate = new Date(today.getFullYear(), today.getMonth(), stmtDay)
                    if (currentDay > stmtDay) {
                      targetStmtDate = new Date(today.getFullYear(), today.getMonth() + 1, stmtDay)
                    }
                    daysToStmt = Math.ceil((targetStmtDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                    stmtLabel = `${daysToStmt} days`
                  }

                  return (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CreditCardIcon className="h-5 w-5 text-indigo-600 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{c.name}</div>
                            <div className="group relative cursor-pointer" onClick={() => {
                              showNotification(`Copied ${c.lastFour}`, 'success')
                            }}>
                              <div className="text-xs text-gray-500 font-mono flex items-center gap-1">
                                <span>••••</span>
                                <span className="group-hover:text-black transition-colors">{c.lastFour}</span>
                                <EyeIcon className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">{locked ? '₹••••••' : `₹${c.limit.toLocaleString()}`}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold ${c.balance > 0 ? 'text-rose-600' : 'text-gray-400'}`}>{locked ? '₹••••••' : `₹${c.balance.toLocaleString()}`}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-24">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${c.utilization > 30 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${Math.min(c.utilization, 100)}%` }}></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">{c.utilization}% used</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {/* Due Date Indicator */}
                          <div className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-full w-fit ${daysToDue <= 3 ? 'bg-red-100 text-red-700' :
                            daysToDue <= 7 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                            }`}>
                            <ClockIcon className="w-3 h-3 mr-1" />
                            Due in {daysToDue} days
                          </div>
                          {/* Statement Indicator */}
                          {stmtDay > 0 && (
                            <div className="text-xs text-gray-400 pl-1">
                              Stmt in {stmtLabel}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="px-3 py-1 rounded border mr-2 text-sm hover:bg-gray-100" onClick={() => openEdit(c.id)}>Edit</button>
                        <button className="px-3 py-1 rounded border text-sm text-red-600 hover:bg-red-50" onClick={async () => { await financeManager.deleteCreditCard(c.id); loadCards() }}>Delete</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* No Bills Found */}
        {filteredAndSortedCards.length === 0 && (
          <div className="text-center py-12">
            <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No bills found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md glass-card">
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Edit Card' : 'Add Card'}</h3>
              <div className="space-y-3">
                <input className="glass-input px-3 py-2 rounded-md w-full" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="glass-input px-3 py-2 rounded-md w-full" placeholder="Last Four (optional)" value={form.lastFourDigits} onChange={(e) => setForm({ ...form, lastFourDigits: e.target.value })} />
                <input type="number" className="glass-input px-3 py-2 rounded-md w-full" placeholder="Credit Limit (₹)" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) })} />
                <input type="number" className="glass-input px-3 py-2 rounded-md w-full" placeholder="Current Balance (₹)" value={form.currentBalance} onChange={(e) => setForm({ ...form, currentBalance: Number(e.target.value) })} />
                <input type="number" className="glass-input px-3 py-2 rounded-md w-full" placeholder="Due Day of Month" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: Number(e.target.value) })} />
                <input className="glass-input px-3 py-2 rounded-md w-full" placeholder="Statement Date (e.g., 18 July)" value={form.statementDate} onChange={(e) => setForm({ ...form, statementDate: e.target.value })} />
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active
                </label>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button className="px-3 py-2 rounded-md border" onClick={() => setEditOpen(false)}>Cancel</button>
                <button className="btn-primary px-3 py-2 rounded-md" onClick={saveEdit}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
