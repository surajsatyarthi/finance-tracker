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
  PlusIcon,
  BellIcon,
  ArrowRightIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface PayLaterAccount {
  id: string
  serviceName: string
  serviceCode: string
  creditLimit: number
  usedAmount: number
  availableAmount: number
  currentDue: number
  nextDueDate: string
  dueSchedule: string // e.g., "5th of every month"
  status: 'active' | 'due_soon' | 'overdue' | 'suspended'
  lastUsed?: string
  interestRate?: number
  penaltyFee?: number
}

export default function PayLaterPage() {
  const { user } = useRequireAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('nextDueDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Current date for calculations
  const today = new Date('2025-09-21')

  // Pay Later accounts data
  const payLaterAccounts: PayLaterAccount[] = [
    {
      id: '1',
      serviceName: 'Amazon Pay Later',
      serviceCode: 'AMZN-PAY-LATER',
      creditLimit: 80000,
      usedAmount: 1792,
      availableAmount: 78208, // 80000 - 1792
      currentDue: 1792,
      nextDueDate: '2025-10-05',
      dueSchedule: '5th of every month',
      status: 'active',
      lastUsed: '2025-09-15',
      interestRate: 24.0,
      penaltyFee: 100
    },
    {
      id: '2',
      serviceName: 'Simpl',
      serviceCode: 'SIMPL-BNPL',
      creditLimit: 5000,
      usedAmount: 0, // Currently no outstanding
      availableAmount: 5000,
      currentDue: 0,
      nextDueDate: '2025-09-30', // Next due date (30th)
      dueSchedule: '15th & 30th of every month',
      status: 'active',
      lastUsed: '2025-09-01',
      interestRate: 18.0,
      penaltyFee: 50
    },
    {
      id: '3',
      serviceName: 'LazyPay',
      serviceCode: 'LAZY-PAY',
      creditLimit: 2000,
      usedAmount: 0, // Currently no outstanding
      availableAmount: 2000,
      currentDue: 0,
      nextDueDate: '2025-10-01',
      dueSchedule: '1st of every month',
      status: 'active',
      lastUsed: '2025-08-25',
      interestRate: 30.0,
      penaltyFee: 75
    }
  ]

  // Calculate status based on due date
  const accountsWithStatus = payLaterAccounts.map(account => {
    const dueDate = new Date(account.nextDueDate)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    let status: PayLaterAccount['status']
    if (diffDays < 0) {
      status = 'overdue'
    } else if (diffDays <= 3) {
      status = 'due_soon'
    } else {
      status = 'active'
    }
    
    return { ...account, status, daysUntilDue: diffDays }
  })

  // Filter and sort logic
  const filteredAndSortedAccounts = useMemo(() => {
    const filtered = accountsWithStatus.filter(account => {
      const matchesSearch = account.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           account.serviceCode.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' || account.status === filterStatus
      
      return matchesSearch && matchesStatus
    })

    // Sort logic
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortBy as keyof PayLaterAccount] as string | number
      let bValue: string | number = b[sortBy as keyof PayLaterAccount] as string | number
      
      if (sortBy === 'nextDueDate') {
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
  }, [searchTerm, filterStatus, sortBy, sortOrder, accountsWithStatus])

  // Summary calculations
  const summaryStats = useMemo(() => {
    const totalAccounts = accountsWithStatus.length
    const totalCreditLimit = accountsWithStatus.reduce((sum, acc) => sum + acc.creditLimit, 0)
    const totalUsed = accountsWithStatus.reduce((sum, acc) => sum + acc.usedAmount, 0)
    const totalAvailable = accountsWithStatus.reduce((sum, acc) => sum + acc.availableAmount, 0)
    const totalDue = accountsWithStatus.filter(acc => acc.currentDue > 0).reduce((sum, acc) => sum + acc.currentDue, 0)
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'due_soon':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'suspended':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      case 'due_soon':
        return <BellIcon className="h-5 w-5 text-orange-600" />
      case 'suspended':
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-600" />
      default:
        return <CheckCircleIcon className="h-5 w-5 text-blue-600" />
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
              <button className="inline-flex items-center px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
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

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6 mb-8">
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
                  <option value="usedAmount-desc">Used Amount (High-Low)</option>
                  <option value="usedAmount-asc">Used Amount (Low-High)</option>
                  <option value="creditLimit-desc">Credit Limit (High-Low)</option>
                  <option value="creditLimit-asc">Credit Limit (Low-High)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Pay Later Cards */}
        <div className="space-y-6">
          {filteredAndSortedAccounts.map((account) => {
            const daysUntilDue = getDaysUntilDue(account.nextDueDate)
            const utilization = account.creditLimit > 0 ? (account.usedAmount / account.creditLimit) * 100 : 0
            
            return (
              <div
                key={account.id}
                className={`bg-white/90 backdrop-blur-lg rounded-2xl shadow-premium border-l-4 border-white/20 p-6 hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1 ${getPriorityColor(daysUntilDue)}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Service Info */}
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
                      <BanknotesIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{account.serviceName}</h3>
                      <p className="text-sm text-gray-600">{account.serviceCode}</p>
                      <p className="text-xs text-gray-500">{account.dueSchedule}</p>
                    </div>
                  </div>

                  {/* Credit Info & Status */}
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
                      <div className="text-center">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {new Date(account.nextDueDate).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <p className={`text-xs font-medium mt-1 ${
                          daysUntilDue < 0 
                            ? 'text-red-600' 
                            : daysUntilDue <= 3 
                              ? 'text-orange-600' 
                              : 'text-blue-600'
                        }`}>
                          {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : 
                           daysUntilDue === 0 ? 'Due today' :
                           `${daysUntilDue} days left`}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        {getStatusIcon(account.status)}
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(account.status)}`}>
                          {account.status.replace('_', ' ')}
                        </span>
                      </div>

                      <button className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200">
                        <ArrowRightIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Available:</span>
                      <span className="ml-2 font-semibold text-green-600">{formatCurrency(account.availableAmount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Current Due:</span>
                      <span className="ml-2 font-semibold text-orange-600">{formatCurrency(account.currentDue)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Interest Rate:</span>
                      <span className="ml-2 font-medium text-purple-600">{account.interestRate}% p.a.</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Used:</span>
                      <span className="ml-2 font-medium text-gray-700">
                        {account.lastUsed ? new Date(account.lastUsed).toLocaleDateString('en-IN') : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Credit Utilization Bar */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Credit Utilization</span>
                    <span className={`text-sm font-semibold ${getUtilizationColor(utilization)}`}>
                      {utilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        utilization <= 30 ? 'bg-green-500' :
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

        {/* No Services Found */}
        {filteredAndSortedAccounts.length === 0 && (
          <div className="text-center py-12">
            <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No pay later services found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}