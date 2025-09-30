'use client'

import { useEffect, useState } from 'react'
import { useRequireAuth } from '../../contexts/AuthContext'
import { getAccounts } from '@/lib/simpleSupabaseManager'
import { getAccountBalanceWithTransfers } from '@/lib/transferManager'
import { 
  BuildingLibraryIcon,
  PencilIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'

interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  created_at: string
}

export default function BankAccounts() {
  const { user, LoadingComponent } = useRequireAuth()
  const [accounts, setAccounts] = useState<(Account & { computed_balance?: number })[]>([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const baseAccounts = await getAccounts()
        
        // Compute balances including transfers per account (RPC)
        const balances = await Promise.all(
          baseAccounts.map(async (acc: Account) => ({
            id: acc.id,
            computed: await getAccountBalanceWithTransfers(acc.id)
          }))
        )

        const balanceMap = new Map(balances.map(b => [b.id, b.computed]))
        const enriched = baseAccounts.map((acc: Account) => ({
          ...acc,
          computed_balance: balanceMap.get(acc.id) ?? acc.balance
        }))

        setAccounts(enriched)
        setTotalBalance(enriched.reduce((sum, a) => sum + (a.computed_balance ?? a.balance), 0))
      } catch (error) {
        console.error('Error loading accounts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAccounts()
  }, [])

  if (LoadingComponent) {
    return LoadingComponent
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-success-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-500 rounded-lg mr-3">
              <BuildingLibraryIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900">Bank Accounts</h1>
          </div>
          <div className="bg-gradient-to-r from-success-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-success-100 text-sm font-medium">Total Balance (incl. transfers)</p>
                <p className="text-3xl font-bold">₹{totalBalance.toLocaleString()}</p>
              </div>
              <BanknotesIcon className="h-12 w-12 text-success-200" />
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bank Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BuildingLibraryIcon className="h-5 w-5 text-blue-500 mr-3" />
                        <div className="text-sm font-medium text-gray-900">{account.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        account.type === 'savings' 
                          ? 'bg-blue-100 text-blue-800' 
                          : account.type === 'current'
                          ? 'bg-purple-100 text-purple-800'
                          : account.type === 'investment'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        ₹{(account.computed_balance ?? account.balance).toLocaleString()}
                      </div>
                      {account.computed_balance !== undefined && account.computed_balance !== account.balance && (
                        <div className="text-xs text-gray-500">Base: ₹{account.balance.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{account.currency}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(account.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={() => {
                          // TODO: Implement edit functionality
                          alert(`Edit ${account.name} balance`)
                        }}
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {accounts.length === 0 && (
          <div className="text-center py-12">
            <BuildingLibraryIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bank accounts found</h3>
            <p className="text-gray-500">Upload your data using the SQL script to see your accounts here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
