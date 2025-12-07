'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import {
  CreditCardIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'

type CreditCard = Database['public']['Tables']['credit_cards']['Row']

export default function CreditCardsPage() {
  const { user } = useRequireAuth() // Get authenticated user
  const [showBalances, setShowBalances] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [showCardDetails, setShowCardDetails] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch credit cards from Supabase or localStorage
  useEffect(() => {
    if (!user) return

    const fetchCreditCards = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try Supabase first
        const { data, error: fetchError } = await supabase
          .from('credit_cards')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('name')

        if (fetchError) {
          throw fetchError
        }

        setCreditCards(data || [])
      } catch (err) {
        console.error('Error fetching from Supabase, falling back to localStorage:', err)
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          const { getCreditCards: getLocalCards } = await import('@/lib/dataManager')
          const localCards = getLocalCards()
          // Convert to Supabase format
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setCreditCards(localCards.map(card => ({
            id: card.id,
            user_id: user?.id || '',
            name: card.name,
            card_type: 'Credit Card',
            bank: null,
            last_four_digits: card.lastFourDigits,
            credit_limit: card.creditLimit,
            current_balance: card.currentBalance,
            due_date: card.dueDate,
            statement_date: parseInt(card.statementDate) || null,
            annual_fee: card.annualFee,
            cashback_rate: null,
            partner_merchants: null,
            benefits: null,
            is_active: card.isActive,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          })) as any)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCreditCards()
  }, [user])

  // Filtered credit cards based on search
  const filteredCards = useMemo(() => {
    return creditCards.filter(card =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [creditCards, searchTerm])

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalLimit = creditCards.reduce((sum, card) => sum + (card.credit_limit || 0), 0)
    const totalBalance = creditCards.reduce((sum, card) => sum + (card.current_balance || 0), 0)
    const availableCredit = totalLimit - totalBalance
    const utilization = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0

    return {
      totalCards: creditCards.length,
      activeCards: creditCards.filter(card => card.is_active).length,
      totalLimit,
      totalBalance,
      availableCredit,
      utilization
    }
  }, [creditCards])

  const maskCardNumber = (lastFour: string | null) => `**** **** **** ${lastFour || 'XXXX'}`

  // Copy to clipboard function
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  // Format due date
  const formatDueDate = (dueDate: number | null) => {
    if (!dueDate || dueDate === 0) return 'N/A'
    return `${dueDate}${getDaySuffix(dueDate)} of month`
  }

  const getDaySuffix = (day: number) => {
    if (day >= 11 && day <= 13) return 'th'
    switch (day % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Credit Cards</h1>
            <p className="text-gray-600 mt-2">Manage your credit cards and track usage</p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Toggle Balance Visibility */}
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {showBalances ? (
                <EyeSlashIcon className="h-4 w-4 mr-2" />
              ) : (
                <EyeIcon className="h-4 w-4 mr-2" />
              )}
              {showBalances ? 'Hide' : 'Show'} Balances
            </button>

            {/* Toggle Card Details Visibility */}
            <button
              onClick={() => setShowCardDetails(!showCardDetails)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <CreditCardIcon className="h-4 w-4 mr-2" />
              {showCardDetails ? 'Hide' : 'Show'} Card Details
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cards</p>
                <p className="text-2xl font-bold text-blue-600">{summaryStats.totalCards}</p>
                <p className="text-sm text-gray-500">{summaryStats.activeCards} active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Credit Limit</p>
                <p className="text-2xl font-bold text-green-600">
                  {showBalances ? `₹${summaryStats.totalLimit.toLocaleString()}` : '₹***,***'}
                </p>
                <p className="text-sm text-gray-500">Total available</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarDaysIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold text-orange-600">
                  {showBalances ? `₹${summaryStats.totalBalance.toLocaleString()}` : '₹***,***'}
                </p>
                <p className="text-sm text-gray-500">Outstanding amount</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${summaryStats.utilization > 70 ? 'bg-red-100 text-red-600' :
                  summaryStats.utilization > 30 ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                  <span className="text-sm font-bold">{Math.round(summaryStats.utilization)}%</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilization</p>
                <p className={`text-2xl font-bold ${summaryStats.utilization > 70 ? 'text-red-600' :
                  summaryStats.utilization > 30 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                  {Math.round(summaryStats.utilization)}%
                </p>
                <p className="text-sm text-gray-500">Credit usage</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search credit cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading credit cards...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading credit cards</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Credit Cards Table */}
        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Credit Cards ({filteredCards.length})</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Card Details
                    </th>
                    {showCardDetails && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Benefits & Partners
                      </th>
                    )}
                    {showCardDetails && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bank Details
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit Limit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available Credit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statement Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCards.map((card) => {
                    const availableCredit = (card.credit_limit || 0) - (card.current_balance || 0)
                    const utilization = (card.credit_limit || 0) > 0 ? ((card.current_balance || 0) / (card.credit_limit || 0)) * 100 : 0

                    return (
                      <tr
                        key={card.id}
                        onClick={() => window.location.href = `/credit-cards/${card.id}`}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CreditCardIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{card.name}</div>
                              <div className="text-sm text-gray-500">{card.card_type} • {maskCardNumber(card.last_four_digits)}</div>
                              {(card.annual_fee || 0) > 0 && (
                                <div className="text-xs text-orange-600 mt-1">
                                  Annual Fee: ₹{card.annual_fee}
                                </div>
                              )}
                              {card.cashback_rate && (
                                <div className="text-xs text-green-600 mt-1">
                                  {card.cashback_rate}% cashback
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Benefits & Partners - Only show when toggled */}
                        {showCardDetails && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-2">
                              <div className="space-y-3">
                                {/* Partners */}
                                {card.partner_merchants && card.partner_merchants.length > 0 && (
                                  <div>
                                    <div className="text-xs font-semibold text-gray-700 mb-1">Partners</div>
                                    <div className="flex flex-wrap gap-1">
                                      {card.partner_merchants.map((partner, idx) => (
                                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                          {partner}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Benefits JSON Rendering */}
                                {card.benefits && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                    {/* Rewards & Cashback */}
                                    {(card.benefits as any).cashback !== 'NA' && (
                                      <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                                        <span className="block text-xs font-semibold text-green-800 uppercase tracking-wide">Cashback</span>
                                        <span className="text-xs text-green-700">{(card.benefits as any).cashback}</span>
                                      </div>
                                    )}
                                    {(card.benefits as any).rewardPoints !== 'NA' && (
                                      <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                                        <span className="block text-xs font-semibold text-purple-800 uppercase tracking-wide">Rewards</span>
                                        <span className="text-xs text-purple-700">{(card.benefits as any).rewardPoints}</span>
                                      </div>
                                    )}

                                    {/* Lounge Access */}
                                    <div className="col-span-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                      <span className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Lounge Access</span>
                                      <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div>
                                          <span className="text-gray-500">National:</span>
                                          <span className="ml-1 font-medium text-gray-900">{(card.benefits as any).lounge?.national || 'NA'}</span>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Intl:</span>
                                          <span className="ml-1 font-medium text-gray-900">{(card.benefits as any).lounge?.international || 'NA'}</span>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">Railway:</span>
                                          <span className="ml-1 font-medium text-gray-900">{(card.benefits as any).lounge?.railway || 'NA'}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        )}

                        {/* Bank Details - Only show when toggled */}
                        {showCardDetails && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div className="font-medium">{card.bank || 'N/A'}</div>
                              <div className="text-xs text-gray-500 mt-1">{card.card_type}</div>
                            </div>
                          </td>
                        )}

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {showBalances ? `₹${(card.credit_limit || 0).toLocaleString()}` : '₹***,***'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {showBalances ? `₹${(card.current_balance || 0).toLocaleString()}` : '₹***,***'}
                          </div>
                          {showBalances && (card.credit_limit || 0) > 0 && (
                            <div className="text-xs text-gray-500">
                              {Math.round(utilization)}% utilization
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">
                            {showBalances ? `₹${availableCredit.toLocaleString()}` : '₹***,***'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <CalendarDaysIcon className="h-4 w-4 text-gray-400 mr-1" />
                            {formatDueDate(card.due_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <CalendarDaysIcon className="h-4 w-4 text-gray-400 mr-1" />
                            {card.statement_date ? `${card.statement_date}${getDaySuffix(card.statement_date)} of month` : 'N/A'}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredCards.length === 0 && (
              <div className="text-center py-12">
                <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No credit cards found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding your first credit card.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
