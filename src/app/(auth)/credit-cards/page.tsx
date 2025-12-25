'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import {
  CreditCardIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { BankLogo } from '@/components/BankLogo'

type CreditCard = Database['public']['Tables']['credit_cards']['Row']

export default function CreditCardsPage() {
  const { user } = useRequireAuth()
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchCreditCards = async () => {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from('credit_cards')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .neq('card_type', 'debit') // Exclude debit cards
          .order('credit_limit', { ascending: false })

        if (error) throw error

        // Also filter out cards with credit_limit = 1 (debit cards)
        const creditOnly = (data || []).filter(card => card.credit_limit !== 1)
        setCreditCards(creditOnly)
      } catch (err) {
        console.error('Error fetching credit cards:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCreditCards()
  }, [user])

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatCardNumber = (cardNum: string) => {
    if (!cardNum) return 'N/A'
    return cardNum.replace(/(.{4})/g, '$1 ').trim()
  }

  const getTotalLiquidity = () => {
    return creditCards.reduce((sum, card) => sum + ((card.credit_limit || 0) - (card.current_balance || 0)), 0)
  }

  const getSummaryStats = () => {
    const totalLimit = creditCards.reduce((sum, card) => sum + (card.credit_limit || 0), 0)
    const totalUsed = creditCards.reduce((sum, card) => sum + (card.current_balance || 0), 0)
    const utilization = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0

    return {
      totalCards: creditCards.length,
      totalLimit,
      totalUsed,
      available: totalLimit - totalUsed,
      utilization
    }
  }

  const stats = getSummaryStats()

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Credit Cards</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your credit cards</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CreditCardIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cards</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalCards}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">₹</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Limit</p>
                <p className="text-2xl font-bold text-green-600">₹{stats.totalLimit.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-sm font-bold">₹</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Used</p>
                <p className="text-2xl font-bold text-orange-600">₹{stats.totalUsed.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${stats.utilization > 70 ? 'bg-red-100' : stats.utilization > 30 ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                <span className={`text-sm font-bold ${stats.utilization > 70 ? 'text-red-600' : stats.utilization > 30 ? 'text-yellow-600' : 'text-green-600'
                  }`}>{stats.utilization.toFixed(2)}%</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilization</p>
                <p className={`text-2xl font-bold ${stats.utilization > 70 ? 'text-red-600' : stats.utilization > 30 ? 'text-yellow-600' : 'text-green-600'
                  }`}>{stats.utilization.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Cards Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Card Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Limit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Card Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CVV
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statement Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {creditCards.map(card => {
                  const available = (card.credit_limit || 0) - (card.current_balance || 0)
                  const utilization = (card.credit_limit || 0) > 0 ? ((card.current_balance || 0) / (card.credit_limit || 0)) * 100 : 0

                  return (
                    <tr key={card.id} className="hover:bg-gray-50">
                      {/* Card Name */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <BankLogo bankName={card.name} size="md" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{card.name}</div>
                            <div className="text-xs text-gray-500">{(card as any).card_network || 'Credit Card'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Credit Limit */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">₹{(card.credit_limit || 0).toLocaleString('en-IN')}</span>
                      </td>

                      {/* Current Balance */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <span className="text-sm font-medium text-orange-600">₹{(card.current_balance || 0).toLocaleString('en-IN')}</span>
                          <div className="text-xs text-gray-500">{utilization.toFixed(2)}% used</div>
                        </div>
                      </td>

                      {/* Available Credit */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-green-600">₹{available.toLocaleString('en-IN')}</span>
                      </td>

                      {/* Card Number */}
                      <td className="px-4 py-4">
                        {(card as any).card_number ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono text-gray-700">{formatCardNumber((card as any).card_number)}</span>
                            <button
                              onClick={() => copyToClipboard((card as any).card_number, `card-${card.id}`)}
                              className="p-1 text-gray-400 hover:text-indigo-600"
                            >
                              {copiedField === `card-${card.id}` ?
                                <CheckIcon className="h-3 w-3" /> :
                                <ClipboardDocumentIcon className="h-3 w-3" />
                              }
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      {/* Expiry */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono text-gray-700">{(card as any).expiry_date || '-'}</span>
                      </td>

                      {/* CVV */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {(card as any).cvv ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono text-gray-700">{(card as any).cvv}</span>
                            <button
                              onClick={() => copyToClipboard((card as any).cvv, `cvv-${card.id}`)}
                              className="p-1 text-gray-400 hover:text-indigo-600"
                            >
                              {copiedField === `cvv-${card.id}` ?
                                <CheckIcon className="h-3 w-3" /> :
                                <ClipboardDocumentIcon className="h-3 w-3" />
                              }
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-700">
                          {card.due_date ? `${card.due_date}th of month` : '-'}
                        </span>
                      </td>

                      {/* Statement Date */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-700">
                          {card.statement_date ? `${card.statement_date}th of month` : '-'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {creditCards.length === 0 && (
            <div className="text-center py-12">
              <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No credit cards found</h3>
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Transaction Button */}
      <Link
        href="/expenses/add"
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
      >
        <PlusIcon className="h-6 w-6" />
      </Link>
    </div>
  )
}
