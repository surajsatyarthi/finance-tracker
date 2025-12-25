'use client'

import { useState, useEffect } from 'react'
import {
  BanknotesIcon,
  CreditCardIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { FinanceDataManager } from '@/lib/supabaseDataManager'
import { BankAccount } from '@/types/finance'
import { useRequireAuth } from '@/contexts/AuthContext'
import GlassCard from '@/components/GlassCard'
import { useNotification } from '@/contexts/NotificationContext'

export default function AccountsPage() {
  const { user } = useRequireAuth()
  const { showNotification } = useNotification()
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showCardDetails, setShowCardDetails] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBalance, setEditBalance] = useState('')

  const financeManager = FinanceDataManager.getInstance()

  const fetchAccounts = async () => {
    try {
      const data = await financeManager.getAccounts()
      // Sort by balance descending (highest first)
      setAccounts(data.sort((a, b) => b.balance - a.balance))
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchAccounts()
  }, [user])

  const handleUpdateBalance = async (id: string) => {
    try {
      const newBal = parseFloat(editBalance)
      if (isNaN(newBal)) return

      await financeManager.updateAccountBalance(id, newBal)
      showNotification('Balance updated!', 'success')
      setEditingId(null)
      fetchAccounts()
    } catch (error) {
      showNotification('Failed to update balance', 'error')
    }
  }

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(amount)

  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      showNotification('Copied to clipboard!', 'success')
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      showNotification('Failed to copy', 'error')
    }
  }

  const toggleCardDetails = (accountId: string) => {
    setShowCardDetails(prev => prev === accountId ? null : accountId)
  }

  const getTotalLiquidity = () => accounts.reduce((sum, acc) => sum + acc.balance, 0)

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accounts & Liquidity</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your liquid assets and bank balances</p>
          </div>
          <div className="bg-green-100 px-4 py-2 rounded-lg">
            <span className="text-green-800 text-sm font-medium uppercase tracking-wide">Total Liquidity</span>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(getTotalLiquidity(), 'INR')}</p>
          </div>
        </div>

        {/* Accounts List */}
        <div className="space-y-4">
          {accounts.map(account => (
            <GlassCard key={account.id} className="p-6">
              {/* Main Account Info */}
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0 w-full sm:w-auto">
                  <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                    {account.type === 'cash' ? <BanknotesIcon className="h-6 w-6" /> : <CreditCardIcon className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{account.type} • {account.currency}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-end">
                  {editingId === account.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        className="w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        value={editBalance}
                        onChange={(e) => setEditBalance(e.target.value)}
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateBalance(account.id)}
                        className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                      >
                        <ArrowPathIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-sm text-gray-500 hover:text-gray-700 px-2"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <span className="text-xl font-bold text-gray-900">{formatCurrency(account.balance, account.currency)}</span>
                      <button
                        onClick={() => { setEditingId(account.id); setEditBalance(account.balance.toString()); }}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      {account.type !== 'cash' && (account as any).card_number && (
                        <button
                          onClick={() => toggleCardDetails(account.id)}
                          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                          title="View card details"
                        >
                          {showCardDetails === account.id ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Details (Expandable) */}
              {showCardDetails === account.id && account.type !== 'cash' && (account as any).card_number && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
                    <p className="text-xs uppercase tracking-wider mb-4 opacity-90">Debit Card Details (Encrypted +1)</p>

                    {/* Card Number */}
                    <div className="mb-4">
                      <p className="text-xs opacity-75 mb-1">Card Number</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-mono tracking-wider">
                          {formatCardNumber((account as any).card_number)}
                        </span>
                        <button
                          onClick={() => copyToClipboard((account as any).card_number, `card-${account.id}`)}
                          className="p-2 hover:bg-white/20 rounded transition-colors"
                        >
                          {copiedField === `card-${account.id}` ?
                            <CheckIcon className="h-4 w-4" /> :
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          }
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Expiry */}
                      {(account as any).card_expiry_month && (
                        <div>
                          <p className="text-xs opacity-75 mb-1">Valid Thru</p>
                          <p className="text-sm font-mono">
                            {String((account as any).card_expiry_month).padStart(2, '0')}/{String((account as any).card_expiry_year).slice(-2)}
                          </p>
                        </div>
                      )}

                      {/* CVV */}
                      {(account as any).card_cvv && (
                        <div>
                          <p className="text-xs opacity-75 mb-1">CVV</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-mono">{(account as any).card_cvv}</span>
                            <button
                              onClick={() => copyToClipboard((account as any).card_cvv, `cvv-${account.id}`)}
                              className="p-1 hover:bg-white/20 rounded transition-colors"
                            >
                              {copiedField === `cvv-${account.id}` ?
                                <CheckIcon className="h-3 w-3" /> :
                                <ClipboardDocumentIcon className="h-3 w-3" />
                              }
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Account Number & IFSC */}
                    <div className="mt-6 pt-4 border-t border-white/20 space-y-3">
                      {(account as any).account_number && (
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs opacity-75">Account Number</p>
                            <p className="text-sm font-mono mt-1">{(account as any).account_number}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard((account as any).account_number, `acc-${account.id}`)}
                            className="p-2 hover:bg-white/20 rounded transition-colors"
                          >
                            {copiedField === `acc-${account.id}` ?
                              <CheckIcon className="h-4 w-4" /> :
                              <ClipboardDocumentIcon className="h-4 w-4" />
                            }
                          </button>
                        </div>
                      )}

                      {(account as any).ifsc_code && (
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs opacity-75">IFSC Code</p>
                            <p className="text-sm font-mono mt-1">{(account as any).ifsc_code}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard((account as any).ifsc_code, `ifsc-${account.id}`)}
                            className="p-2 hover:bg-white/20 rounded transition-colors"
                          >
                            {copiedField === `ifsc-${account.id}` ?
                              <CheckIcon className="h-4 w-4" /> :
                              <ClipboardDocumentIcon className="h-4 w-4" />
                            }
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="mt-4 text-xs opacity-60 italic">
                      ⚠️ Values shown are encrypted (+1). Subtract 1 from each digit when using.
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>
          ))}

          {accounts.length === 0 && (
            <div className="py-12 text-center bg-white rounded-lg border border-dashed border-gray-300">
              <BanknotesIcon className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts found</h3>
              <p className="mt-1 text-sm text-gray-500">Accounts are typically added during initial setup.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
