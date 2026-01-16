import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'
import type { Transaction } from '@/types/database'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export default async function TransactionDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: transaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!transaction) {
    notFound()
  }

  const txn = transaction as Transaction

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex justify-between items-center">
            <Link href="/transactions" className="text-sm text-blue-600 hover:text-blue-800">
              ← Back to Transactions
            </Link>
            <Link
              href={`/transactions/${params.id}/edit`}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Edit Transaction
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-semibold text-gray-900">{txn.description}</h2>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  txn.type === 'income'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {txn.type}
                </span>
                <span className="text-sm text-gray-500">{formatDate(txn.date)}</span>
              </div>
            </div>

            <div className="px-6 py-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Amount</dt>
                  <dd className={`mt-1 text-3xl font-semibold ${
                    txn.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="mt-1 text-lg text-gray-900">{formatDate(txn.date)}</dd>
                </div>

                {txn.notes && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{txn.notes}</dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-gray-500">Recurring</dt>
                  <dd className="mt-1 text-sm text-gray-900">{txn.is_recurring ? 'Yes' : 'No'}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(txn.created_at).toLocaleString('en-IN')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
