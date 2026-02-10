import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import CopyButton from '@/components/CopyButton'
import Link from 'next/link'
import type { Account } from '@/types/database'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

export default async function AccountsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('balance', { ascending: false })
    .limit(1000)

  const accountsList = (accounts || []) as Account[]

  const totalBalance = accountsList.reduce((sum, acc) => sum + acc.balance, 0)
  const savingsBalance = accountsList.filter(acc => acc.type === 'savings').reduce((sum, acc) => sum + acc.balance, 0)
  const currentBalance = accountsList.filter(acc => acc.type === 'current').reduce((sum, acc) => sum + acc.balance, 0)
  const cashBalance = accountsList.filter(acc => acc.type === 'cash').reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">🏦 Accounts</h2>
            <Link
              href="/accounts/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Account
            </Link>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Total Balance</div>
                  <div className="text-xl font-bold text-green-600">{formatCurrency(totalBalance)}</div>
                  <div className="text-xs text-gray-500 mt-1">{accountsList.length} accounts</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <span className="text-2xl">🏦</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Savings</div>
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(savingsBalance)}</div>
                  <div className="text-xs text-gray-500 mt-1">{accountsList.filter(a => a.type === 'savings').length} accounts</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <span className="text-2xl">💳</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Current/Checking</div>
                  <div className="text-xl font-bold text-purple-600">{formatCurrency(currentBalance)}</div>
                  <div className="text-xs text-gray-500 mt-1">{accountsList.filter(a => a.type === 'current').length} accounts</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <span className="text-2xl">💵</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Cash</div>
                  <div className="text-xl font-bold text-yellow-600">{formatCurrency(cashBalance)}</div>
                  <div className="text-xs text-gray-500 mt-1">{accountsList.filter(a => a.type === 'cash').length} accounts</div>
                </div>
              </div>
            </div>
          </div>

          {accountsList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No accounts found. Add your first account to get started.</p>
              <Link
                href="/accounts/new"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Account
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IFSC Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Card Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CVV
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accountsList.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/accounts/${account.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          {account.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 uppercase">{account.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {account.account_number ? (
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900">{account.account_number}</span>
                            <CopyButton text={account.account_number} />
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {account.ifsc_code ? (
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900">{account.ifsc_code}</span>
                            <CopyButton text={account.ifsc_code} />
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {account.card_number ? (
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900">{account.card_number}</span>
                            <CopyButton text={account.card_number} />
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {account.card_cvv ? (
                          <span className="text-sm text-gray-900">{account.card_cvv}</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {account.card_expiry_month && account.card_expiry_year ? (
                          <span className="text-sm text-gray-900">
                            {String(account.card_expiry_month).padStart(2, '0')}/{String(account.card_expiry_year).slice(-2)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-sm font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(account.balance)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/accounts/${account.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  )
}
