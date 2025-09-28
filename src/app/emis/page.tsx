'use client'

import { useState, useMemo } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
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
  PlusIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface EMIData {
  id: string
  cardName: string
  cardNumber: string
  purchaseItem: string
  emiAmount: number
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  emisPaid: number
  totalEmis: number
  startDate: string
  nextDueDate: string
  status: 'active' | 'completed' | 'overdue'
  interestRate?: number
  vendor?: string
}

export default function EMITracker() {
  const { user } = useRequireAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCard, setFilterCard] = useState('all')
  const [sortBy, setSortBy] = useState('nextDueDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // EMI data with your current EMIs
  const emiData: EMIData[] = [
    {
      id: '1',
      cardName: 'ICICI Amazon',
      cardNumber: '4315812748438018', // +1 for safety
      purchaseItem: 'Manyreach',
      emiAmount: 1320.44,
      totalAmount: 34957.90,
      paidAmount: 5281.76,
      remainingAmount: 29676.14,
      emisPaid: 4,
      totalEmis: 24,
      startDate: '2024-06-01',
      nextDueDate: '2025-10-18', // Assuming monthly cycle
      status: 'active',
      interestRate: 13.5,
      vendor: 'Manyreach'
    },
    {
      id: '2',
      cardName: 'ICICI Amazon',
      cardNumber: '4315812748438018', // +1 for safety
      purchaseItem: 'Amazon Shopping',
      emiAmount: 530.67,
      totalAmount: 6015.42,
      paidAmount: 5837.37,
      remainingAmount: 178.05,
      emisPaid: 11,
      totalEmis: 12,
      startDate: '2024-10-01',
      nextDueDate: '2025-10-18', // Last EMI
      status: 'active',
      interestRate: 13.5,
      vendor: 'Amazon'
    },
    {
      id: '3',
      cardName: 'Yes Bank',
      cardNumber: '8238000000008238', // Masked for security
      purchaseItem: 'Purchase',
      emiAmount: 311.25,
      totalAmount: 3735.00, // 12 * 311.25
      paidAmount: 933.75, // 3 * 311.25
      remainingAmount: 2801.25, // 9 * 311.25
      emisPaid: 3,
      totalEmis: 12,
      startDate: '2024-09-01', // Estimated based on payment schedule
      nextDueDate: '2025-06-10', // 4th EMI due date
      status: 'active',
      interestRate: 15.0, // Estimated typical Yes Bank rate
      vendor: 'Yes Bank Purchase'
    }
  ]

  // Filter and sort logic
  const filteredAndSortedEmis = useMemo(() => {
    const filtered = emiData.filter(emi => {
      const matchesSearch = emi.purchaseItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emi.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emi.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) || ''
      
      const matchesStatus = filterStatus === 'all' || emi.status === filterStatus
      const matchesCard = filterCard === 'all' || emi.cardName === filterCard
      
      return matchesSearch && matchesStatus && matchesCard
    })

    // Sort logic
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortBy as keyof EMIData] as string | number
      let bValue: string | number = b[sortBy as keyof EMIData] as string | number
      
      if (sortBy === 'nextDueDate' || sortBy === 'startDate') {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [searchTerm, filterStatus, filterCard, sortBy, sortOrder])

  // Summary calculations
  const summaryStats = useMemo(() => {
    const totalEmis = emiData.length
    const activeEmis = emiData.filter(emi => emi.status === 'active').length
    const completedEmis = emiData.filter(emi => emi.status === 'completed').length
    const totalMonthlyPayment = emiData
      .filter(emi => emi.status === 'active')
      .reduce((sum, emi) => sum + emi.emiAmount, 0)
    const totalOutstanding = emiData
      .filter(emi => emi.status === 'active')
      .reduce((sum, emi) => sum + emi.remainingAmount, 0)
    const totalPaid = emiData.reduce((sum, emi) => sum + emi.paidAmount, 0)

    return {
      totalEmis,
      activeEmis,
      completedEmis,
      totalMonthlyPayment,
      totalOutstanding,
      totalPaid
    }
  }, [emiData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getProgressPercentage = (paid: number, total: number) => {
    return Math.round((paid / total) * 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'overdue':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      default:
        return <ClockIcon className="h-5 w-5 text-blue-600" />
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const uniqueCards = [...new Set(emiData.map(emi => emi.cardName))].sort()
  const statuses = [
    { key: 'all', label: 'All Status' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'overdue', label: 'Overdue' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                EMI Tracker
              </h1>
              <p className="text-premium-600 font-medium">
                Track your credit card EMIs and installment payments
              </p>
            </div>
            <button className="inline-flex items-center px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add EMI
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active EMIs</p>
                <p className="text-2xl font-bold text-indigo-600">{summaryStats.activeEmis}</p>
                <p className="text-xs text-gray-500">{summaryStats.totalEmis} total</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyRupeeIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Payment</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summaryStats.totalMonthlyPayment)}</p>
                <p className="text-xs text-gray-500">Combined EMIs</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(summaryStats.totalOutstanding)}</p>
                <p className="text-xs text-gray-500">Remaining amount</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summaryStats.totalPaid)}</p>
                <p className="text-xs text-gray-500">Amount paid so far</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search EMIs..."
                  className="pl-10 pr-4 py-2 w-full border border-premium-200 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-premium-200 rounded-xl px-3 py-2 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  {statuses.map(status => (
                    <option key={status.key} value={status.key}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

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
                    setSortBy(by)
                    setSortOrder(order as 'asc' | 'desc')
                  }}
                  className="border border-premium-200 rounded-xl px-3 py-2 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="nextDueDate-asc">Due Date (Earliest)</option>
                  <option value="nextDueDate-desc">Due Date (Latest)</option>
                  <option value="emiAmount-desc">EMI Amount (High-Low)</option>
                  <option value="emiAmount-asc">EMI Amount (Low-High)</option>
                  <option value="remainingAmount-desc">Outstanding (High-Low)</option>
                  <option value="remainingAmount-asc">Outstanding (Low-High)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* EMI Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredAndSortedEmis.map((emi) => {
            const progressPercent = getProgressPercentage(emi.paidAmount, emi.totalAmount)
            const daysUntilDue = getDaysUntilDue(emi.nextDueDate)
            
            return (
              <div
                key={emi.id}
                className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6 hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
                      <CreditCardIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{emi.purchaseItem}</h3>
                      <p className="text-sm text-gray-600">{emi.cardName}</p>
                      <p className="text-xs text-gray-500 font-mono">••••{emi.cardNumber.slice(-4)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(emi.status)}
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(emi.status)}`}>
                      {emi.status}
                    </span>
                  </div>
                </div>

                {/* EMI Progress */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {emi.emisPaid} / {emi.totalEmis} EMIs ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-blue-500 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <p className="text-xs font-medium text-gray-600 mb-1">Monthly EMI</p>
                    <p className="text-lg font-bold text-green-700">{formatCurrency(emi.emiAmount)}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                    <p className="text-xs font-medium text-gray-600 mb-1">Outstanding</p>
                    <p className="text-lg font-bold text-orange-700">{formatCurrency(emi.remainingAmount)}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-xs font-medium text-gray-600 mb-1">Total Amount</p>
                    <p className="text-lg font-bold text-blue-700">{formatCurrency(emi.totalAmount)}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                    <p className="text-xs font-medium text-gray-600 mb-1">Amount Paid</p>
                    <p className="text-lg font-bold text-purple-700">{formatCurrency(emi.paidAmount)}</p>
                  </div>
                </div>

                {/* Timeline Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Next Due: {new Date(emi.nextDueDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  
                  <div className={`text-sm font-medium ${
                    daysUntilDue <= 7 
                      ? 'text-red-600' 
                      : daysUntilDue <= 15 
                        ? 'text-orange-600' 
                        : 'text-green-600'
                  }`}>
                    {daysUntilDue > 0 ? `${daysUntilDue} days left` : 'Due now'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* No EMIs Found */}
        {filteredAndSortedEmis.length === 0 && (
          <div className="text-center py-12">
            <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No EMIs found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}