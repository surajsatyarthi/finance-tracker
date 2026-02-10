import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'
import type { Investment, Account } from '@/types/database'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function getInvestmentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    stocks: 'Stocks',
    mf: 'Mutual Funds',
    bonds: 'Bonds',
    ppf: 'PPF',
    nps: 'NPS',
    other: 'Other'
  }
  return labels[type] || type
}

export default async function InvestmentDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: investment } = await supabase
    .from('investments')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!investment) {
    notFound()
  }

  const investmentData = investment as Investment
  const gainLoss = investmentData.current_value - investmentData.invested_amount
  const gainLossPercent = investmentData.invested_amount > 0
    ? (gainLoss / investmentData.invested_amount) * 100
    : 0

  let linkedAccount: Account | null = null
  if (investmentData.account_id) {
    const { data } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', investmentData.account_id)
      .single()
    linkedAccount = data as Account | null
  }

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex justify-between items-center">
            <Link href="/investments" className="text-sm text-blue-600 hover:text-blue-800">
              ← Back to Investments
            </Link>
            <Link
              href={`/investments/form?id=${params.id}`}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Edit Investment
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-semibold text-gray-900">{investmentData.investment_name}</h2>
              <p className="text-sm text-gray-500">{getInvestmentTypeLabel(investmentData.investment_type)}</p>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Investment Summary */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Summary</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Invested Amount</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {formatCurrency(investmentData.invested_amount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Current Value</dt>
                    <dd className="mt-1 text-lg font-semibold text-blue-600">
                      {formatCurrency(investmentData.current_value)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Gain/Loss</dt>
                    <dd className={`mt-1 text-lg font-semibold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Returns</dt>
                    <dd className={`mt-1 text-lg font-semibold ${gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Performance Visualization */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-end justify-between h-48">
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-full flex flex-col items-center justify-end" style={{ height: '100%' }}>
                        <div
                          className="bg-blue-500 w-16 rounded-t-lg"
                          style={{ height: '70%' }}
                        />
                      </div>
                      <span className="mt-2 text-sm font-medium text-gray-700">Invested</span>
                      <span className="text-xs text-gray-500">{formatCurrency(investmentData.invested_amount)}</span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-full flex flex-col items-center justify-end" style={{ height: '100%' }}>
                        <div
                          className={`${gainLoss >= 0 ? 'bg-green-500' : 'bg-red-500'} w-16 rounded-t-lg`}
                          style={{ height: `${Math.min(Math.abs((investmentData.current_value / investmentData.invested_amount) * 70), 100)}%` }}
                        />
                      </div>
                      <span className="mt-2 text-sm font-medium text-gray-700">Current</span>
                      <span className="text-xs text-gray-500">{formatCurrency(investmentData.current_value)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Linked Account */}
              {linkedAccount && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Linked Account</h3>
                  <dl className="grid grid-cols-1 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Account</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <Link href={`/accounts/${linkedAccount.id}`} className="text-blue-600 hover:text-blue-800">
                          {linkedAccount.name} ({linkedAccount.type})
                        </Link>
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              {/* Notes */}
              {investmentData.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{investmentData.notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Record Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(investmentData.created_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(investmentData.updated_at)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
