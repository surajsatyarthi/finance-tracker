import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'
import type { Account, Transaction } from '@/types/database'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

export default async function AccountDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!account) {
    redirect('/accounts')
  }

  const accountData = account as Account

  // Fetch recent transactions for this account
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', params.id)
    .is('deleted_at', null)
    .order('date', { ascending: false })
    .limit(10)

  const transactionsList = (transactions || []) as Transaction[]

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link href="/accounts" className="text-sm text-blue-600 hover:text-blue-800">
              ← Back to Accounts
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{accountData.name}</h2>
                <p className="text-sm text-gray-500 mt-1 uppercase">{accountData.type}</p>
              </div>
              <Link
                href={`/accounts/${params.id}/edit`}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Edit
              </Link>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Current Balance</span>
                <span className={`text-2xl font-bold ${accountData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(accountData.balance)}
                </span>
              </div>

              {accountData.account_number && (
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm font-medium text-gray-500">Account Number</span>
                  <span className="text-sm text-gray-900">{accountData.account_number}</span>
                </div>
              )}

              {accountData.ifsc_code && (
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm font-medium text-gray-500">IFSC Code</span>
                  <span className="text-sm text-gray-900">{accountData.ifsc_code}</span>
                </div>
              )}

              {accountData.card_number && (
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm font-medium text-gray-500">Card Number</span>
                  <span className="text-sm text-gray-900">•••• {accountData.card_number.slice(-4)}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm font-medium text-gray-500">Created</span>
                <span className="text-sm text-gray-900">
                  {new Date(accountData.created_at).toLocaleDateString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Last Updated</span>
                <span className="text-sm text-gray-900">
                  {new Date(accountData.updated_at).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
            </div>

            {transactionsList.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No transactions found for this account.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {transactionsList.map((transaction) => (
                  <li key={transaction.id} className="px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(transaction.date).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className={`text-sm font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {transactionsList.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 text-center">
                <Link href="/transactions" className="text-sm text-blue-600 hover:text-blue-800">
                  View All Transactions →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
