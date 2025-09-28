'use client'

import { useState, useMemo } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  ChartPieIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

// Account data with current balances
const accountsData = [
  {
    id: 'cash',
    name: 'Cash',
    type: 'cash',
    balance: 1229,
    accountNumber: 'CASH-001',
    isActive: true,
    bank: 'Cash Holdings',
    description: 'Physical cash on hand'
  },
  {
    id: 'sbi',
    name: 'State Bank of India',
    type: 'savings',
    balance: 6.58,
    accountNumber: 'SBI-****8765',
    isActive: true,
    bank: 'State Bank of India',
    description: 'Primary savings account'
  },
  {
    id: 'cbi',
    name: 'Central Bank of India',
    type: 'savings',
    balance: 20.34,
    accountNumber: 'CBI-****4321',
    isActive: true,
    bank: 'Central Bank of India',
    description: 'Secondary savings account'
  },
  {
    id: 'slice',
    name: 'Slice Account',
    type: 'digital_bank',
    balance: 16368,
    accountNumber: 'SLICE-****9876',
    isActive: true,
    bank: 'Slice',
    description: 'Digital banking account'
  },
  {
    id: 'jupiter',
    name: 'Jupiter Account',
    type: 'digital_bank',
    balance: 613.78,
    accountNumber: 'JUPITER-****5432',
    isActive: true,
    bank: 'Jupiter',
    description: 'Digital banking account'
  },
  {
    id: 'tide',
    name: 'Tide Account',
    type: 'digital_bank',
    balance: 187.80,
    accountNumber: 'TIDE-****1098',
    isActive: true,
    bank: 'Tide',
    description: 'Digital banking account'
  },
  {
    id: 'dcb',
    name: 'DCB Bank',
    type: 'savings',
    balance: 0,
    accountNumber: 'DCB-****7654',
    isActive: false,
    bank: 'DCB Bank',
    description: 'Zero balance account'
  },
  {
    id: 'sbm',
    name: 'SBM Bank',
    type: 'savings',
    balance: 0,
    accountNumber: 'SBM-****3210',
    isActive: false,
    bank: 'SBM Bank',
    description: 'Zero balance account'
  },
  {
    id: 'post_office',
    name: 'Post Office Bank',
    type: 'savings',
    balance: 1000,
    accountNumber: 'POST-****6789',
    isActive: true,
    bank: 'India Post Payments Bank',
    description: 'Post office savings account'
  },
  {
    id: 'fd_sbi',
    name: 'Fixed Deposit SBI',
    type: 'fixed_deposit',
    balance: 17233,
    accountNumber: 'FD-SBI-****2468',
    isActive: true,
    bank: 'State Bank of India',
    description: 'Fixed deposit investment'
  },
  {
    id: 'paytm_upi_lite',
    name: 'Paytm UPI Lite',
    type: 'digital_wallet',
    balance: 50,
    accountNumber: 'PAYTM-UPI-LITE',
    isActive: true,
    bank: 'Paytm',
    description: 'UPI Lite wallet balance'
  },
  {
    id: 'amazon_wallet',
    name: 'Amazon Pay Wallet',
    type: 'digital_wallet',
    balance: 151.91,
    accountNumber: 'AMAZON-WALLET',
    isActive: true,
    bank: 'Amazon Pay',
    description: 'Amazon Pay wallet balance'
  }
]

const accountTypeColors = {
  cash: 'bg-green-100 text-green-800 border-green-200',
  savings: 'bg-blue-100 text-blue-800 border-blue-200',
  digital_bank: 'bg-purple-100 text-purple-800 border-purple-200',
  digital_wallet: 'bg-pink-100 text-pink-800 border-pink-200',
  fixed_deposit: 'bg-orange-100 text-orange-800 border-orange-200',
  current: 'bg-indigo-100 text-indigo-800 border-indigo-200'
}

const accountTypeIcons = {
  cash: '💵',
  savings: '🏦',
  digital_bank: '📱',
  digital_wallet: '💳',
  fixed_deposit: '🏛️',
  current: '💼'
}

export default function AccountsPage() {
  const { user } = useRequireAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showBalances, setShowBalances] = useState(true)

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalBalance = accountsData.reduce((sum, account) => sum + account.balance, 0)
    const activeAccounts = accountsData.filter(account => account.isActive)
    const inactiveAccounts = accountsData.filter(account => !account.isActive)
    const totalActiveBalance = activeAccounts.reduce((sum, account) => sum + account.balance, 0)
    
    // Type breakdown
    const typeBreakdown = accountsData.reduce((acc, account) => {
      if (!acc[account.type]) acc[account.type] = { count: 0, balance: 0 }
      acc[account.type].count += 1
      acc[account.type].balance += account.balance
      return acc
    }, {} as Record<string, { count: number; balance: number }>)

    const highestBalanceAccount = accountsData.reduce((prev, current) => 
      prev.balance > current.balance ? prev : current
    )

    return {
      totalBalance,
      totalActiveBalance,
      totalAccounts: accountsData.length,
      activeAccountsCount: activeAccounts.length,
      inactiveAccountsCount: inactiveAccounts.length,
      typeBreakdown,
      highestBalanceAccount
    }
  }, [])

  // Filter accounts based on search and filters
  const filteredAccounts = useMemo(() => {
    return accountsData.filter(account => {
      const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           account.bank.toLowerCase().includes(searchTerm.toLowerCase())
      
      let matchesType = true
      if (selectedType !== 'all') {
        matchesType = account.type === selectedType
      }

      let matchesStatus = true
      if (selectedStatus === 'active') {
        matchesStatus = account.isActive
      } else if (selectedStatus === 'inactive') {
        matchesStatus = !account.isActive
      }

      return matchesSearch && matchesType && matchesStatus
    })
  }, [searchTerm, selectedType, selectedStatus])

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
    { key: 'fixed_deposit', label: 'Fixed Deposit' },
    { key: 'current', label: 'Current' }
  ]

  const statusOptions = [
    { key: 'all', label: 'All Accounts' },
    { key: 'active', label: 'Active Only' },
    { key: 'inactive', label: 'Inactive Only' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Accounts & Assets</h1>
              <p className="text-gray-600">Track your bank accounts, cash holdings, and investment assets</p>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyRupeeIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-green-600">
                  {showBalances ? formatCurrency(summaryStats.totalBalance) : '₹••••••'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Balance</p>
                <p className="text-2xl font-bold text-blue-600">
                  {showBalances ? formatCurrency(summaryStats.totalActiveBalance) : '₹••••••'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartPieIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Highest Balance</p>
                <p className="text-lg font-bold text-gray-900">{summaryStats.highestBalanceAccount.name}</p>
                <p className="text-sm text-gray-500">
                  {showBalances ? formatCurrency(summaryStats.highestBalanceAccount.balance) : '₹••••••'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Type Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Type Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(summaryStats.typeBreakdown).map(([type, data]) => {
              const percentage = (data.balance / summaryStats.totalBalance * 100).toFixed(1)
              return (
                <div key={type} className={`rounded-lg border-2 p-4 ${accountTypeColors[type as keyof typeof accountTypeColors]}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{accountTypeIcons[type as keyof typeof accountTypeIcons]}</span>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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

              <div className="flex items-center space-x-2">
                <BuildingLibraryIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {statusOptions.map(status => (
                    <option key={status.key} value={status.key}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Account Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredAccounts.length} of {accountsData.length} accounts
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
                    Account Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account, index) => (
                  <tr key={account.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{accountTypeIcons[account.type as keyof typeof accountTypeIcons]}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{account.name}</div>
                          <div className="text-sm text-gray-500">{account.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${accountTypeColors[account.type as keyof typeof accountTypeColors]}`}>
                        {account.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{account.bank}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 font-mono">{account.accountNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${account.balance > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {showBalances ? formatCurrency(account.balance) : '₹••••••'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        account.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {account.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}