'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  PlusIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ChartPieIcon,
  CreditCardIcon,
  HomeIcon,
  AcademicCapIcon,
  ArrowLongRightIcon
} from '@heroicons/react/24/outline'
import { FinanceDataManager } from '@/lib/supabaseDataManager'
import { type Loan } from '@/types/finance'
import { formatDate } from '@/lib/dateUtils'
import { useRequireAuth } from '@/contexts/AuthContext'

export default function LoansPage() {
  const { user, loading: authLoading } = useRequireAuth()
  const router = useRouter()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)

  const financeManager = FinanceDataManager.getInstance()

  useEffect(() => {
    if (!user) return

    const fetchLoans = async () => {
      try {
        setLoading(true)
        const data = await financeManager.getLoans()
        setLoans(data)
      } catch (error) {
        console.error('Error fetching loans:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLoans()
  }, [user])

  const stats = useMemo(() => {
    const totalOutstanding = loans.reduce((sum, loan) => sum + loan.current_balance, 0)
    const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principal_amount, 0)
    const monthlyCommitment = loans.reduce((sum, loan) => sum + (loan.emi_amount || 0), 0)
    const paidPercentage = totalPrincipal > 0
      ? Math.round(((totalPrincipal - totalOutstanding) / totalPrincipal) * 100)
      : 0

    return {
      totalOutstanding,
      monthlyCommitment,
      paidPercentage,
      activeCount: loans.length
    }
  }, [loans])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  const getLoanIcon = (type: string) => {
    switch (type) {
      case 'home': return <HomeIcon className="h-6 w-6 text-blue-500" />
      case 'education': return <AcademicCapIcon className="h-6 w-6 text-purple-500" />
      case 'credit_card': return <CreditCardIcon className="h-6 w-6 text-orange-500" />
      case 'personal': return <BanknotesIcon className="h-6 w-6 text-green-500" />
      default: return <BanknotesIcon className="h-6 w-6 text-gray-500" />
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Loans</h1>
            <p className="mt-1 text-sm text-gray-500">Track your liabilities and EMI schedules</p>
          </div>
          <button
            onClick={() => router.push('/loans/add')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add New Loan
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BanknotesIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Outstanding</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.totalOutstanding)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarDaysIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Monthly EMI Total</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.monthlyCommitment)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartPieIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Paid Off</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.paidPercentage}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BanknotesIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Loans</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.activeCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loan List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {loans.map((loan) => {
              const progress = loan.principal_amount > 0
                ? ((loan.principal_amount - loan.current_balance) / loan.principal_amount) * 100
                : 0

              return (
                <li key={loan.id}>
                  <div
                    onClick={() => router.push(`/loans/${loan.id}`)}
                    className="block hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-4">
                            {getLoanIcon(loan.type)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-indigo-600 truncate">{loan.name}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">{loan.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {formatCurrency(loan.current_balance)} left
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          {loan.emi_amount && (
                            <p className="flex items-center text-sm text-gray-500 mr-6">
                              <CalendarDaysIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                              EMI: {formatCurrency(loan.emi_amount)}
                            </p>
                          )}
                          {loan.next_emi_date && (
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              <CalendarDaysIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                              Next Due: {formatDate(loan.next_emi_date)}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                          <span>{Math.round(progress)}% Paid</span>
                          <ArrowLongRightIcon className="ml-2 h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
            {loans.length === 0 && (
              <li className="px-4 py-12 text-center text-gray-500">
                No active loans found. Click "Add New Loan" to get started.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
