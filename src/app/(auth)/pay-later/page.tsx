'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import { financeManager } from '@/lib/supabaseDataManager'
import { PayLaterService } from '@/types/finance'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CreditCardIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  BellIcon,
  ArrowRightIcon,
  BanknotesIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function PayLaterPage() {
  const { user } = useRequireAuth()
  const [services, setServices] = useState<PayLaterService[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('nextDueDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    serviceName: '',
    serviceCode: '',
    creditLimit: '',
    usedAmount: '',
    currentDue: '',
    nextDueDate: '',
    dueSchedule: '',
    status: 'active',
    interestRate: '',
    penaltyFee: ''
  })

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await financeManager.getPayLaterServices()
      setServices(data)
    } catch (error) {
      console.error('Error fetching pay later services:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  // Current date for calculations
  const today = new Date()

  // Calculate status based on due date
  const accountsWithStatus = services.map(account => {
    const dueDate = new Date(account.nextDueDate)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Auto-update status if not overridden by manual status? 
    // For now, keep visual status separate from DB status or use DB status as base
    // Logic: if overdue by date, visually flag it, even if DB says 'active'
    let visualStatus = account.status
    if (diffDays < 0) visualStatus = 'overdue'
    else if (diffDays <= 3) visualStatus = 'due_soon'

    return { ...account, status: visualStatus, daysUntilDue: diffDays }
  })

  // Filter and sort logic
  const filteredAndSortedAccounts = useMemo(() => {
    const filtered = accountsWithStatus.filter(account => {
      const matchesSearch = account.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (account.serviceCode || '').toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === 'all' || account.status === filterStatus

      return matchesSearch && matchesStatus
    })

    // Sort logic
    filtered.sort((a, b) => {
      let aValue: string | number | Date = ''
      let bValue: string | number | Date = ''

      if (sortBy === 'nextDueDate') {
        aValue = new Date(a.nextDueDate || 0).getTime()
        bValue = new Date(b.nextDueDate || 0).getTime()
      } else {
        // @ts-ignore
        aValue = a[sortBy] || 0
        // @ts-ignore
        bValue = b[sortBy] || 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [searchTerm, filterStatus, sortBy, sortOrder, accountsWithStatus])

  // Summary calculations
  const summaryStats = useMemo(() => {
    const totalAccounts = accountsWithStatus.length
    const totalCreditLimit = accountsWithStatus.reduce((sum, acc) => sum + (acc.creditLimit || 0), 0)
    const totalUsed = accountsWithStatus.reduce((sum, acc) => sum + (acc.usedAmount || 0), 0)
    const totalAvailable = accountsWithStatus.reduce((sum, acc) => sum + (acc.availableAmount || 0), 0)
    const totalDue = accountsWithStatus.filter(acc => (acc.currentDue || 0) > 0).reduce((sum, acc) => sum + acc.currentDue, 0)
    const dueSoon = accountsWithStatus.filter(acc => acc.status === 'due_soon').length
    const overdue = accountsWithStatus.filter(acc => acc.status === 'overdue').length
    const utilizationRate = totalCreditLimit > 0 ? (totalUsed / totalCreditLimit) * 100 : 0

    return {
      totalAccounts,
      totalCreditLimit,
      totalUsed,
      totalAvailable,
      totalDue,
      dueSoon,
      overdue,
      utilizationRate
    }
  }, [accountsWithStatus])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Handle Form Logic
  const openAddModal = () => {
    setFormData({
      serviceName: '',
      serviceCode: '',
      creditLimit: '',
      usedAmount: '0',
      currentDue: '0',
      nextDueDate: new Date().toISOString().split('T')[0],
      dueSchedule: '5th of every month',
      status: 'active',
      interestRate: '',
      penaltyFee: ''
    })
    setIsEditMode(false)
    setCurrentServiceId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (service: PayLaterService) => {
    setFormData({
      serviceName: service.serviceName,
      serviceCode: service.serviceCode || '',
      creditLimit: service.creditLimit.toString(),
      usedAmount: service.usedAmount.toString(),
      currentDue: service.currentDue.toString(),
      nextDueDate: service.nextDueDate ? service.nextDueDate.split('T')[0] : '',
      dueSchedule: service.dueSchedule || '',
      status: service.status,
      interestRate: service.interestRate?.toString() || '',
      penaltyFee: service.penaltyFee?.toString() || ''
    })
    setIsEditMode(true)
    setCurrentServiceId(service.id)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      serviceName: formData.serviceName,
      serviceCode: formData.serviceCode,
      creditLimit: parseFloat(formData.creditLimit) || 0,
      usedAmount: parseFloat(formData.usedAmount) || 0,
      currentDue: parseFloat(formData.currentDue) || 0,
      nextDueDate: formData.nextDueDate,
      dueSchedule: formData.dueSchedule,
      status: formData.status,
      interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
      penaltyFee: formData.penaltyFee ? parseFloat(formData.penaltyFee) : undefined,
    }

    try {
      if (isEditMode && currentServiceId) {
        await financeManager.updatePayLaterService(currentServiceId, payload)
      } else {
        await financeManager.createPayLaterService(payload)
      }
      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      console.error('Failed to save service', err)
      alert('Failed to save service')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await financeManager.deletePayLaterService(id)
        fetchData()
      } catch (err) {
        console.error(err)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'due_soon': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200'
      case 'suspended': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue': return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      case 'due_soon': return <BellIcon className="h-5 w-5 text-orange-600" />
      case 'suspended': return <ExclamationTriangleIcon className="h-5 w-5 text-gray-600" />
      default: return <CheckCircleIcon className="h-5 w-5 text-blue-600" />
    }
  }

  const getPriorityColor = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return 'border-l-red-500 bg-red-50'
    if (daysUntilDue <= 3) return 'border-l-orange-500 bg-orange-50'
    if (daysUntilDue <= 7) return 'border-l-yellow-500 bg-yellow-50'
    return 'border-l-blue-500 bg-blue-50'
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization <= 30) return 'text-green-600'
    if (utilization <= 60) return 'text-yellow-600'
    if (utilization <= 80) return 'text-orange-600'
    return 'text-red-600'
  }

  const statuses = [
    { key: 'all', label: 'All Status' },
    { key: 'active', label: 'Active' },
    { key: 'due_soon', label: 'Due Soon' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'suspended', label: 'Suspended' }
  ]

  if (loading && services.length === 0) {
    return <div className="min-h-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                Pay Later Services
              </h1>
              <p className="text-premium-600 font-medium">
                Track your Buy Now Pay Later (BNPL) accounts and credit limits
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/cards"
                className="inline-flex items-center px-6 py-3 rounded-xl font-medium text-primary-600 bg-white border border-primary-200 hover:bg-primary-50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Credit Cards
              </Link>
              <button
                onClick={openAddModal}
                className="inline-flex items-center px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Service
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Credit Limit</p>
                <p className="text-2xl font-bold text-indigo-600">{formatCurrency(summaryStats.totalCreditLimit)}</p>
                <p className="text-xs text-gray-500">{summaryStats.totalAccounts} services</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyRupeeIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Amount Used</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summaryStats.totalUsed)}</p>
                <p className="text-xs text-gray-500">{summaryStats.utilizationRate.toFixed(1)}% utilization</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Credit</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summaryStats.totalAvailable)}</p>
                <p className="text-xs text-gray-500">Ready to use</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BellIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Amount Due</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(summaryStats.totalDue)}</p>
                <p className="text-xs text-gray-500">{summaryStats.dueSoon} due soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters ... (Keep same as before mostly) */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6 mb-8">
          {/* ... (Search Logic same as previous) ... */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pay later services..."
                  className="pl-10 pr-4 py-2 w-full border border-premium-200 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {/* Sort & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-premium-200 rounded-xl px-3 py-2 bg-white/80 backdrop-blur-sm"
              >
                {statuses.map(status => <option key={status.key} value={status.key}>{status.label}</option>)}
              </select>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-')
                  setSortBy(by)
                  setSortOrder(order as 'asc' | 'desc')
                }}
                className="border border-premium-200 rounded-xl px-3 py-2 bg-white/80 backdrop-blur-sm"
              >
                <option value="nextDueDate-asc">Due Date (Earliest)</option>
                <option value="nextDueDate-desc">Due Date (Latest)</option>
                <option value="usedAmount-desc">Used Amount (High-Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pay Later Cards */}
        <div className="space-y-6">
          {filteredAndSortedAccounts.map((account) => {
            const daysUntilDue = account.daysUntilDue
            const utilization = account.creditLimit > 0 ? (account.usedAmount / account.creditLimit) * 100 : 0

            return (
              <div
                key={account.id}
                className={`group bg-white/90 backdrop-blur-lg rounded-2xl shadow-premium border-l-4 border-white/20 p-6 hover:shadow-premium-lg transition-all duration-300 ${getPriorityColor(daysUntilDue)}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Service Info */}
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
                      <BanknotesIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        {account.serviceName}
                        <button onClick={() => openEditModal(account)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded">
                          <PencilIcon className="h-4 w-4 text-gray-500" />
                        </button>
                      </h3>
                      <p className="text-sm text-gray-600">{account.serviceCode}</p>
                      <p className="text-xs text-gray-500">{account.dueSchedule}</p>
                    </div>
                  </div>

                  {/* Credit Info & Status - Reusing existing refined layout */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-8">
                    <div className="text-center sm:text-left">
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(account.creditLimit)}</p>
                      <p className="text-sm text-gray-600">Credit Limit</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">Used:</span>
                        <span className={`text-xs font-medium ${getUtilizationColor(utilization)}`}>
                          {formatCurrency(account.usedAmount)} ({utilization.toFixed(1)}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">

                      <div className="text-center min-w-[100px]">
                        <div className="flex items-center justify-center space-x-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {new Date(account.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className={`text-xs font-medium mt-1 ${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 3 ? 'text-orange-600' : 'text-blue-600'
                          }`}>
                          {daysUntilDue < 0 ? 'Overdue' : daysUntilDue === 0 ? 'Today' : `${daysUntilDue} days`}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        {getStatusIcon(account.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Available:</span>
                    <span className="ml-2 font-semibold text-green-600">{formatCurrency(account.availableAmount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Due:</span>
                    <span className="ml-2 font-semibold text-orange-600">{formatCurrency(account.currentDue)}</span>
                  </div>
                </div>

                {/* Credit Utilization Bar (Same as before) */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${utilization <= 30 ? 'bg-green-500' :
                          utilization <= 60 ? 'bg-yellow-500' :
                            utilization <= 80 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {services.length === 0 && !loading && (
          <div className="text-center py-12">
            <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No pay later services found</h3>
            <button onClick={openAddModal} className="mt-2 text-primary-600 hover:underline">Add your first BNPL account</button>
          </div>
        )}

        {/* ADD/EDIT MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" onClick={() => setIsModalOpen(false)}>
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      {isEditMode ? 'Edit Pay Later Service' : 'Add New Pay Later Service'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Service Name</label>
                      <input type="text" required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2"
                        value={formData.serviceName}
                        onChange={e => setFormData({ ...formData, serviceName: e.target.value })}
                        placeholder="e.g. Amazon Pay Later"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Service Code (Optional)</label>
                      <input type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2"
                        value={formData.serviceCode}
                        onChange={e => setFormData({ ...formData, serviceCode: e.target.value })}
                        placeholder="e.g. AMZN"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Credit Limit</label>
                        <input type="number" required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2"
                          value={formData.creditLimit}
                          onChange={e => setFormData({ ...formData, creditLimit: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Used Amount</label>
                        <input type="number" required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2"
                          value={formData.usedAmount}
                          onChange={e => setFormData({ ...formData, usedAmount: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Current Due</label>
                        <input type="number"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2"
                          value={formData.currentDue}
                          onChange={e => setFormData({ ...formData, currentDue: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Next Due Date</label>
                        <input type="date"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2"
                          value={formData.nextDueDate}
                          onChange={e => setFormData({ ...formData, nextDueDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      {isEditMode && (
                        <button type="button" onClick={() => handleDelete(currentServiceId!)} className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md">
                          Delete
                        </button>
                      )}
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                        Cancel
                      </button>
                      <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md">
                        {isEditMode ? 'Update' : 'Add Service'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}