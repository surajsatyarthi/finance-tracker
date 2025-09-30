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
  ExclamationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  BellIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCard, setFilterCard] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Current date for calculations
  const today = new Date('2025-09-21') // Using your current date

  // Credit card bills data with unbilled expenses
  const cardBills: CreditCardBill[] = [
    {
      id: '1',
      cardName: 'SBI Card',
      cardNumber: '6358000000006358',
      amountDue: 197,
      dueDate: '2025-10-01',
      status: 'upcoming',
      paymentType: 'minimum',
      minimumDue: 197,
      totalOutstanding: 197,
      unbilledAmount: 0, // No recent spending mentioned
      unbilledSince: undefined,
      totalSpend: 197
    },
    {
      id: '2',
      cardName: 'IndusInd Bank',
      cardNumber: '0976000000000976',
      amountDue: 1628,
      dueDate: '2025-10-02',
      status: 'upcoming',
      paymentType: 'full',
      minimumDue: 325.60,
      totalOutstanding: 1628,
      unbilledAmount: 1199,
      unbilledSince: '2025-09-12',
      totalSpend: 2827 // 1628 + 1199
    },
    {
      id: '3',
      cardName: 'Amazon Pay ICICI',
      cardNumber: '8017000000008017',
      amountDue: 3200.33,
      dueDate: '2025-10-06',
      status: 'upcoming',
      paymentType: 'full',
      minimumDue: 640.07,
      totalOutstanding: 3200.33,
      unbilledAmount: 0, // This card wasn't in unbilled list
      unbilledSince: undefined,
      totalSpend: 3200.33
    },
    {
      id: '4',
      cardName: 'Yes Bank',
      cardNumber: '8238000000008238',
      amountDue: 311.25,
      dueDate: '2025-10-06',
      status: 'upcoming',
      paymentType: 'emi',
      isEMI: true,
      emiDetails: {
        currentEMI: 4,
        totalEMIs: 12,
        emiAmount: 311.25
      },
      minimumDue: 311.25,
      totalOutstanding: 2801.25,
      unbilledAmount: 440.49,
      unbilledSince: '2025-09-16',
      totalSpend: 751.74 // 311.25 + 440.49
    },
    {
      id: '5',
      cardName: 'SBI Paytm',
      cardNumber: '4092000000004092',
      amountDue: 184,
      dueDate: '2025-10-06',
      status: 'upcoming',
      paymentType: 'minimum',
      minimumDue: 184,
      totalOutstanding: 920,
      unbilledAmount: 0, // No recent spending mentioned
      unbilledSince: undefined,
      totalSpend: 184
    },
    // Additional cards with unbilled expenses only
    {
      id: '6',
      cardName: 'ICICI Bank',
      cardNumber: '7026000000007026',
      amountDue: 0, // No current bill
      dueDate: '2025-10-15', // Estimated next due date
      status: 'upcoming',
      paymentType: 'full',
      minimumDue: 0,
      totalOutstanding: 2672.88,
      unbilledAmount: 2672.88,
      unbilledSince: '2025-09-05',
      totalSpend: 2672.88
    },
    {
      id: '7',
      cardName: 'HDFC Bank',
      cardNumber: '5556000000005556',
      amountDue: 0, // No current bill
      dueDate: '2025-10-10', // Estimated next due date
      status: 'upcoming',
      paymentType: 'full',
      minimumDue: 0,
      totalOutstanding: 20,
      unbilledAmount: 20,
      unbilledSince: '2025-09-01',
      totalSpend: 20
    },
    {
      id: '8',
      cardName: 'Axis Bank',
      cardNumber: '9086000000009086',
      amountDue: 0, // No current bill
      dueDate: '2025-10-25', // Estimated next due date
      status: 'upcoming',
      paymentType: 'full',
      minimumDue: 0,
      totalOutstanding: 1397.17,
      unbilledAmount: 1397.17,
      unbilledSince: '2025-08-21',
      totalSpend: 1397.17
    },
    {
      id: '9',
      cardName: 'SBI Bank',
      cardNumber: '5905000000005905',
      amountDue: 0, // No current bill
      dueDate: '2025-10-12', // Estimated next due date
      status: 'upcoming',
      paymentType: 'full',
      minimumDue: 0,
      totalOutstanding: 1513.51,
      unbilledAmount: 1513.51,
      unbilledSince: '2025-09-07',
      totalSpend: 1513.51
    }
  ]

  // Calculate status based on due date
  const billsWithStatus = cardBills.map(bill => {
    const dueDate = new Date(bill.dueDate)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    let status: CreditCardBill['status']
    if (diffDays < 0) {
      status = 'overdue'
    } else if (diffDays <= 3) {
      status = 'due_soon'
    } else {
      status = 'upcoming'
    }
    
    return { ...bill, status, daysUntilDue: diffDays }
  })

  // Filter and sort logic
  const filteredAndSortedBills = useMemo(() => {
    const filtered = billsWithStatus.filter(bill => {
      const matchesSearch = bill.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bill.cardNumber.includes(searchTerm) ||
                           bill.paymentType.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' || bill.status === filterStatus
      const matchesCard = filterCard === 'all' || bill.cardName === filterCard
      
      return matchesSearch && matchesStatus && matchesCard
    })

    // Sort logic
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortBy as keyof CreditCardBill] as string | number
      let bValue: string | number = b[sortBy as keyof CreditCardBill] as string | number
      
      if (sortBy === 'dueDate') {
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
  }, [searchTerm, filterStatus, filterCard, sortBy, sortOrder, billsWithStatus])

  // Summary calculations
  const summaryStats = useMemo(() => {
    const totalCards = billsWithStatus.length
    const totalDue = billsWithStatus.reduce((sum, bill) => sum + bill.amountDue, 0)
    const dueSoon = billsWithStatus.filter(bill => bill.status === 'due_soon').length
    const overdue = billsWithStatus.filter(bill => bill.status === 'overdue').length
    const totalOutstanding = billsWithStatus.reduce((sum, bill) => sum + (bill.totalOutstanding || 0), 0)
    const emiPayments = billsWithStatus.filter(bill => bill.isEMI).length
    const totalUnbilled = billsWithStatus.reduce((sum, bill) => sum + (bill.unbilledAmount || 0), 0)
    const totalSpend = billsWithStatus.reduce((sum, bill) => sum + (bill.totalSpend || 0), 0)
    const cardsWithUnbilled = billsWithStatus.filter(bill => (bill.unbilledAmount || 0) > 0).length

    return {
      totalCards,
      totalDue,
      dueSoon,
      overdue,
      totalOutstanding,
      emiPayments,
      totalUnbilled,
      totalSpend,
      cardsWithUnbilled
    }
  }, [billsWithStatus])

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

  const uniqueCards = [...new Set(billsWithStatus.map(bill => bill.cardName))].sort()
  const statuses = [
    { key: 'all', label: 'All Status' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'due_soon', label: 'Due Soon' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'paid', label: 'Paid' }
  ]

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
              <button className="inline-flex items-center px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Bill
              </button>
            </div>
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
                <p className="text-sm font-medium text-gray-600">Active Cards</p>
                <p className="text-2xl font-bold text-indigo-600">{summaryStats.totalCards}</p>
                <p className="text-xs text-gray-500">{summaryStats.cardsWithUnbilled} with unbilled</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyRupeeIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Due</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summaryStats.totalDue)}</p>
                <p className="text-xs text-gray-500">This cycle</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BellIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unbilled</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(summaryStats.totalUnbilled)}</p>
                <p className="text-xs text-gray-500">Recent spending</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spend</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summaryStats.totalSpend)}</p>
                <p className="text-xs text-gray-500">Due + Unbilled</p>
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
                  placeholder="Search cards or payments..."
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
                  <option value="dueDate-asc">Due Date (Earliest)</option>
                  <option value="dueDate-desc">Due Date (Latest)</option>
                  <option value="amountDue-desc">Amount (High-Low)</option>
                  <option value="amountDue-asc">Amount (Low-High)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bills Cards */}
        <div className="space-y-6">
          {filteredAndSortedBills.map((bill) => {
            const daysUntilDue = getDaysUntilDue(bill.dueDate)
            
            return (
              <div
                key={bill.id}
                className={`bg-white/90 backdrop-blur-lg rounded-2xl shadow-premium border-l-4 border-white/20 p-6 hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1 ${getPriorityColor(daysUntilDue)}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Card Info */}
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
                      <CreditCardIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{bill.cardName}</h3>
                      <p className="text-sm text-gray-600 font-mono">••••{bill.cardNumber.slice(-4)}</p>
                      {bill.isEMI && bill.emiDetails && (
                        <p className="text-xs text-purple-600 font-medium">
                          EMI {bill.emiDetails.currentEMI}/{bill.emiDetails.totalEMIs}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Amount & Status */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-8">
                    <div className="text-center sm:text-left">
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(bill.amountDue || 0)}</p>
                      <p className="text-sm text-gray-600">
                        {bill.amountDue === 0 ? 'No Current Bill' :
                         bill.paymentType === 'emi' ? 'EMI Amount' : 
                         bill.paymentType === 'minimum' ? 'Minimum Due' : 'Full Payment'}
                      </p>
                      {bill.minimumDue && bill.paymentType !== 'minimum' && bill.paymentType !== 'emi' && (
                        <p className="text-xs text-gray-500">
                          Min: {formatCurrency(bill.minimumDue)}
                        </p>
                      )}
                      {bill.unbilledAmount && bill.unbilledAmount > 0 && (
                        <div className="mt-2 p-2 bg-purple-50 rounded-lg">
                          <p className="text-sm font-medium text-purple-700">
                            Unbilled: {formatCurrency(bill.unbilledAmount)}
                          </p>
                          <p className="text-xs text-purple-600">
                            Since {bill.unbilledSince ? new Date(bill.unbilledSince).toLocaleDateString('en-IN') : 'N/A'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {new Date(bill.dueDate).toLocaleDateString('en-IN')}
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
                        {getStatusIcon(bill.status)}
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(bill.status)}`}>
                          {bill.status.replace('_', ' ')}
                        </span>
                      </div>

                      <button className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200">
                        <ArrowRightIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  {bill.totalSpend && bill.totalSpend > (bill.amountDue || 0) && (
                    <div className="flex justify-between text-sm text-gray-700">
                      <span className="font-medium">Total Current Spend:</span>
                      <span className="font-semibold text-indigo-600">{formatCurrency(bill.totalSpend)}</span>
                    </div>
                  )}
                  {bill.totalOutstanding && bill.totalOutstanding > (bill.amountDue || 0) && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Total Outstanding:</span>
                      <span className="font-medium">{formatCurrency(bill.totalOutstanding)}</span>
                    </div>
                  )}
                  {bill.unbilledAmount && bill.unbilledAmount > 0 && (
                    <div className="flex justify-between text-xs text-purple-600">
                      <span>Days since first unbilled spend:</span>
                      <span className="font-medium">
                        {bill.unbilledSince ? Math.ceil((today.getTime() - new Date(bill.unbilledSince).getTime()) / (1000 * 60 * 60 * 24)) : 0} days
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* No Bills Found */}
        {filteredAndSortedBills.length === 0 && (
          <div className="text-center py-12">
            <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No bills found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}