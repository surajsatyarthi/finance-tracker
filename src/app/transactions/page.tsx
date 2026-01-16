import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'
import type { Transaction } from '@/types/database'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export default async function TransactionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('date', { ascending: false })
    .limit(100)

  const transactionsList = (transactions || []) as Transaction[]

  const totalIncome = transactionsList
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactionsList
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netCashFlow = totalIncome - totalExpense

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Transactions</h2>
            <Link
              href="/transactions/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Transaction
            </Link>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Income</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Expense</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Cash Flow</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-6 py-4 text-lg font-semibold text-green-600">{formatCurrency(totalIncome)}</td>
                  <td className="px-6 py-4 text-lg font-semibold text-red-600">{formatCurrency(totalExpense)}</td>
                  <td className={`px-6 py-4 text-lg font-semibold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netCashFlow)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {transactionsList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No transactions found. Add your first transaction to get started.</p>
              <Link
                href="/transactions/new"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Transaction
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactionsList.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{formatDate(transaction.date)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/transactions/${transaction.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          {transaction.description}
                        </Link>
                        {transaction.notes && (
                          <p className="text-xs text-gray-500 mt-1">{transaction.notes}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-sm font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/transactions/${transaction.id}/edit`}
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
