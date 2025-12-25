'use client'

import { useState, useEffect } from 'react'
import {
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FinanceDataManager } from '@/lib/supabaseDataManager'
import { BankAccount } from '@/types/finance'
import { useRequireAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { BankLogo } from '@/components/BankLogo'

export default function AccountsPage() {
  const { user } = useRequireAuth()
  const { showNotification } = useNotification()
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBalance, setEditBalance] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const financeManager = FinanceDataManager.getInstance()

  const fetchAccounts = async () => {
    try {
      const data = await financeManager.getAccounts()
      // Group by type: current first, then savings, then cash
      const sorted = data.sort((a, b) => {
        const typeOrder: Record<string, number> = { 'current': 0, 'savings': 1, 'cash': 2 }
        const aOrder = typeOrder[a.type] ?? 3
        const bOrder = typeOrder[b.type] ?? 3

        if (aOrder !== bOrder) return aOrder - bOrder
        return b.balance - a.balance // Within same type, highest balance first
      })
      setAccounts(sorted)
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      showNotification('Copied!', 'success')
      setTimeout(() => setCopiedField(null), 1500)
    } catch (err) {
      showNotification('Failed to copy', 'error')
    }
  }

  const getTotalLiquidity = () => accounts.reduce((sum, acc) => sum + acc.balance, 0)

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
            <p className="mt-1 text-sm text-gray-500">All bank account details with encrypted card information</p>
          </div>
          <div className="bg-green-100 px-6 py-3 rounded-lg">
            <span className="text-green-800 text-xs font-medium uppercase tracking-wide">Total Balance</span>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(getTotalLiquidity())}</p>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CVV</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IFSC</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map(account => {
                  const acc = account as any
                  return (
                    <tr key={account.id} className="hover:bg-gray-50">
                      {/* Account Name */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <BankLogo bankName={account.name} size="md" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{account.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{account.type}</div>
                          </div>
                        </div>
                      </td>

                      {/* Balance */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingId === account.id ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              className="w-24 rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-1"
                              value={editBalance}
                              onChange={(e) => setEditBalance(e.target.value)}
                              autoFocus
                            />
                            <button
                              onClick={() => handleUpdateBalance(account.id)}
                              className="p-1 text-green-600 hover:text-green-800"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-sm font-semibold text-gray-900">{formatCurrency(account.balance)}</div>
                        )}
                      </td>

                      {/* Card Number */}
                      <td className="px-4 py-4">
                        {acc.card_number ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono text-gray-700">{formatCardNumber(acc.card_number)}</span>
                            <button
                              onClick={() => copyToClipboard(acc.card_number, `card-${account.id}`)}
                              className="p-1 text-gray-400 hover:text-indigo-600"
                            >
                              {copiedField === `card-${account.id}` ?
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
                        {acc.card_expiry_month ? (
                          <span className="text-xs font-mono text-gray-700">
                            {String(acc.card_expiry_month).padStart(2, '0')}/{String(acc.card_expiry_year).slice(-2)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      {/* CVV */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {acc.card_cvv ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono text-gray-700">{acc.card_cvv}</span>
                            <button
                              onClick={() => copyToClipboard(acc.card_cvv, `cvv-${account.id}`)}
                              className="p-1 text-gray-400 hover:text-indigo-600"
                            >
                              {copiedField === `cvv-${account.id}` ?
                                <CheckIcon className="h-3 w-3" /> :
                                <ClipboardDocumentIcon className="h-3 w-3" />
                              }
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      {/* Account Number */}
                      <td className="px-4 py-4">
                        {acc.account_number ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono text-gray-700">{acc.account_number}</span>
                            <button
                              onClick={() => copyToClipboard(acc.account_number, `acc-${account.id}`)}
                              className="p-1 text-gray-400 hover:text-indigo-600"
                            >
                              {copiedField === `acc-${account.id}` ?
                                <CheckIcon className="h-3 w-3" /> :
                                <ClipboardDocumentIcon className="h-3 w-3" />
                              }
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      {/* IFSC */}
                      <td className="px-4 py-4">
                        {acc.ifsc_code ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono text-gray-700">{acc.ifsc_code}</span>
                            <button
                              onClick={() => copyToClipboard(acc.ifsc_code, `ifsc-${account.id}`)}
                              className="p-1 text-gray-400 hover:text-indigo-600"
                            >
                              {copiedField === `ifsc-${account.id}` ?
                                <CheckIcon className="h-3 w-3" /> :
                                <ClipboardDocumentIcon className="h-3 w-3" />
                              }
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingId !== account.id && (
                          <button
                            onClick={() => { setEditingId(account.id); setEditBalance(account.balance.toString()); }}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit balance"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {accounts.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500">No accounts found</p>
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
