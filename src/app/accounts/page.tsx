'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { financeManager, BankAccount } from '@/lib/supabaseDataManager'
import { initialLiquidity } from '@/lib/liquidityData'
import { usePrivacy } from '@/contexts/PrivacyContext'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  BuildingLibraryIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  ChartPieIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'

interface Account extends BankAccount {
  is_active?: boolean
  computed_balance?: number
}

const accountTypeColors = {
  cash: 'bg-green-100 text-green-800 border-green-200',
  savings: 'bg-blue-100 text-blue-800 border-blue-200',
  current: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  investment: 'bg-orange-100 text-orange-800 border-orange-200',
  wallet: 'bg-pink-100 text-pink-800 border-pink-200',
  credit_card: 'bg-purple-100 text-purple-800 border-purple-200',
  digital_bank: 'bg-cyan-100 text-cyan-800 border-cyan-200'
}

const accountTypeIcons = {
  cash: '💵',
  savings: '🏦',
  current: '💼',
  investment: '🏛️',
  wallet: '💳',
  credit_card: '💳',
  digital_bank: '📱'
}

export default function AccountsPage() {
  const { user: authUser } = useRequireAuth()
  const { showNotification } = useNotification()
  const { locked } = usePrivacy()

  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showBalances, setShowBalances] = useState(true)

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [newBalance, setNewBalance] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const loadAccounts = useCallback(async () => {
    if (!authUser) return
    try {
      const { bankAccounts, cashBalance } = await financeManager.getLiquidityData()

      // If no cash account exists in the list but we have a balance, implies aggregation or missing row.
      // For editing purposes, we need a real row ID. 
      // If 'Cash' is missing from bankAccounts but cashBalance > 0, we might display it but not allow edit 
      // unless we find the ID. 
      // Ideally financeManager.getLiquidityData() returns ALL accounts including cash type.

      // Assuming bankAccounts includes ALL rows from 'accounts' table:
      const mapped: Account[] = bankAccounts.map(b => ({
        ...b,
        is_active: true, // Defaulting to true as getLiquidityData filters active?
        computed_balance: b.balance
      }))

      setAccounts(mapped)
    } catch (error) {
      console.error('Error loading accounts:', error)
      showNotification('Failed to load accounts', 'error')
    } finally {
      setLoading(false)
    }
  }, [authUser, showNotification])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const pick = (a: Account) => (typeof a.computed_balance === 'number' ? a.computed_balance : a.balance)
    const totalBalance = accounts.reduce((sum, account) => sum + pick(account), 0)
    // Assuming all fetched are active for now as per getLiquidityData query
    const activeAccounts = accounts
    const totalActiveBalance = activeAccounts.reduce((sum, account) => sum + pick(account), 0)

    // Type breakdown
    const typeBreakdown = accounts.reduce((acc, account) => {
      const type = account.type || 'savings'
      if (!acc[type]) acc[type] = { count: 0, balance: 0 }
      acc[type].count += 1
      acc[type].balance += pick(account)
      return acc
    }, {} as Record<string, { count: number; balance: number }>)

    const highestBalanceAccount = accounts.length > 0 ? accounts.reduce((prev, current) =>
      prev.balance > current.balance ? prev : current
    ) : null

    return {
      totalBalance,
      totalActiveBalance,
      totalAccounts: accounts.length,
      activeAccountsCount: activeAccounts.length,
      inactiveAccountsCount: 0,
      typeBreakdown,
      highestBalanceAccount
    }
  }, [accounts])

  // Filter accounts based on search and filters
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase())

      let matchesType = true
      if (selectedType !== 'all') {
        matchesType = account.type === selectedType
      }

      // Status filter is currently moot if we only fetch active, but keeping for future
      let matchesStatus = true
      if (selectedStatus === 'active') {
        matchesStatus = true
      } else if (selectedStatus === 'inactive') {
        matchesStatus = false
      }

      return matchesSearch && matchesType && matchesStatus
    })
  }, [searchTerm, selectedType, selectedStatus, accounts])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const accountTypes = [
    { key: 'all', label: 'All Types' },
    { key: 'cash', label: 'Cash' },
    { key: 'savings', label: 'Savings' },
    { key: 'digital_bank', label: 'Digital Bank' },
    { key: 'investment', label: 'Investment' },
    { key: 'credit_card', label: 'Credit Card' },
    { key: 'current', label: 'Current' }
  ]

  const statusOptions = [
    { key: 'all', label: 'All Accounts' },
    { key: 'active', label: 'Active Only' },
    { key: 'inactive', label: 'Inactive Only' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading accounts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Accounts</h1>
              <p className="text-gray-600">Track your bank accounts, cash holdings, investment assets (balances include transfers)</p>
            </div>
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {showBalances ? (
                <>
                  <EyeSlashIcon className="h-4 w-4 mr-2" />
                  Hide Balances
                </>
              ) : (
                <>
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Show Balances
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyRupeeIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-green-600">
                  {locked ? '₹••••••' : (showBalances ? formatCurrency(summaryStats.totalBalance) : '₹••••••')}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Balance</p>
                <p className="text-2xl font-bold text-blue-600">
                  {locked ? '₹••••••' : (showBalances ? formatCurrency(summaryStats.totalActiveBalance) : '₹••••••')}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingLibraryIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Accounts</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalAccounts}</p>
                <p className="text-sm text-gray-500">{summaryStats.activeAccountsCount} active</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartPieIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Highest Balance</p>
                <p className="text-lg font-bold text-gray-900">
                  {summaryStats.highestBalanceAccount ? summaryStats.highestBalanceAccount.name : 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  {summaryStats.highestBalanceAccount && !locked && showBalances
                    ? formatCurrency(summaryStats.highestBalanceAccount.balance)
                    : summaryStats.highestBalanceAccount ? '₹••••••' : 'No data'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Type Breakdown */}
        <div className="glass-card mb-8 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Type Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(summaryStats.typeBreakdown).map(([type, data]) => {
              const percentage = summaryStats.totalBalance > 0
                ? (data.balance / summaryStats.totalBalance * 100).toFixed(1)
                : '0.0'
              // Fallback color/icon
              const colorClass = accountTypeColors[type as keyof typeof accountTypeColors] || 'bg-gray-100 text-gray-800 border-gray-200'
              const icon = accountTypeIcons[type as keyof typeof accountTypeIcons] || '📦'

              return (
                <div key={type} className={`rounded-lg border-2 p-4 ${colorClass}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                  <h3 className="font-semibold capitalize mb-1">{type.replace('_', ' ')}</h3>
                  <p className="text-xl font-bold">
                    {showBalances ? formatCurrency(data.balance) : '₹••••••'}
                  </p>
                  <p className="text-sm opacity-75">{data.count} account{data.count !== 1 ? 's' : ''}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {accountTypes.map(type => (
                    <option key={type.key} value={type.key}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Account Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredAccounts.length} of {accounts.length} accounts
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account, index) => {
                  const typeIcon = accountTypeIcons[account.type as keyof typeof accountTypeIcons] || '📦'
                  const colorClass = accountTypeColors[account.type as keyof typeof accountTypeColors] || 'bg-gray-100 text-gray-800'

                  return (
                    <tr key={account.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{typeIcon}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{account.name}</div>
                            <div className="text-sm text-gray-500">{account.type.replace('_', ' ')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
                          {account.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-medium">{account.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold ${(account.computed_balance ?? account.balance) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                          {locked ? '₹••••••' : (showBalances ? formatCurrency(account.computed_balance ?? account.balance) : '₹••••••')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => {
                            setEditingAccount(account)
                            setNewBalance((account.computed_balance ?? account.balance).toString())
                            setPassword('')
                            setConfirmPassword('')
                            setEditOpen(true)
                          }}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State / Initialize Data */}
        {accounts.length === 0 && !loading && (
          <div className="glass-card p-8 text-center mb-6 mt-6">
            <BuildingLibraryIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No accounts found</h3>
            <p className="text-gray-500 mb-4">It looks like your financial data hasn't been set up yet.</p>
            <button
              onClick={async () => {
                setLoading(true)
                try {
                  await financeManager.seedLiquidity(initialLiquidity)
                  await loadAccounts()
                  showNotification('Data initialized successfully', 'success')
                } catch (e) {
                  showNotification('Failed to initialize data', 'error')
                } finally {
                  setLoading(false)
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Initialize Default Accounts
            </button>
          </div>
        )}
      </div>

      {/* Edit Balance Modal */}
      {editOpen && editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md glass-card">
            <div className="px-6 py-4 glass-panel flex items-center justify-between rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <LockClosedIcon className="h-5 w-5 text-gray-600 mr-2" />
                Edit Balance (Sensitive)
              </h3>
              <button
                onClick={() => setEditOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                <div className="text-sm text-gray-900 font-semibold">{editingAccount.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Balance (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Password Protection (Kept Local for now as per minimal change) */}
              {(() => {
                const hasHash = typeof window !== 'undefined' && !!localStorage.getItem('finance-tracker-pass-hash')
                if (!hasHash) {
                  return (
                    <div className="space-y-3">
                      <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                        No password set yet. Create a password to protect sensitive updates.
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Set Password</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )
                }
                return (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enter Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )
              })()}
            </div>
            <div className="px-6 py-4 glass-panel flex items-center justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    setSaving(true)

                    // Validate amount
                    const amount = parseFloat(newBalance)
                    if (isNaN(amount) || amount < 0) {
                      showNotification('Please enter a valid non-negative amount', 'error')
                      setSaving(false)
                      return
                    }

                    // Prepare password/hash (Client-side check)
                    const email = localStorage.getItem('finance-tracker-user-email') || 'user'
                    const hasHash = !!localStorage.getItem('finance-tracker-pass-hash')
                    const encoder = new TextEncoder()

                    const hashHex = async (text: string) => {
                      const data = encoder.encode(text)
                      const digest = await crypto.subtle.digest('SHA-256', data)
                      const bytes = Array.from(new Uint8Array(digest))
                      return bytes.map(b => b.toString(16).padStart(2, '0')).join('')
                    }

                    const salted = (pwd: string) => `${email}|${pwd}|ft_v1_salt`

                    if (!hasHash) {
                      if (!password || password.length < 6) {
                        showNotification('Password must be at least 6 characters', 'error')
                        setSaving(false)
                        return
                      }
                      if (password !== confirmPassword) {
                        showNotification('Passwords do not match', 'error')
                        setSaving(false)
                        return
                      }
                      const newHash = await hashHex(salted(password))
                      localStorage.setItem('finance-tracker-pass-hash', newHash)
                    } else {
                      const stored = localStorage.getItem('finance-tracker-pass-hash') || ''
                      const entered = await hashHex(salted(password))
                      if (!stored || entered !== stored) {
                        showNotification('Incorrect password', 'error')
                        setSaving(false)
                        return
                      }
                    }

                    // Update account balance via Supabase
                    const { success } = await financeManager.updateAccount(editingAccount!.id, { balance: amount })

                    if (success) {
                      showNotification('Balance updated successfully', 'success')
                      setEditOpen(false)
                      await loadAccounts()
                    } else {
                      throw new Error('Update failed')
                    }
                  } catch (e) {
                    console.error(e)
                    showNotification('Update failed. Please try again.', 'error')
                  } finally {
                    setSaving(false)
                  }
                }}
                className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
