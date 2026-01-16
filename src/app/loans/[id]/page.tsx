import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'
import type { Loan } from '@/types/database'

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

function calculateProgress(paid: number, total: number | null): number {
  if (!total || total === 0) return 0
  return (paid / total) * 100
}

export default async function LoanDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: loan } = await supabase
    .from('loans')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!loan) {
    notFound()
  }

  const loanData = loan as Loan
  const paid = loanData.principal_amount - loanData.current_balance
  const progress = calculateProgress(loanData.emis_paid, loanData.total_emis)

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex justify-between items-center">
            <Link href="/loans" className="text-sm text-blue-600 hover:text-blue-800">
              ← Back to Loans
            </Link>
            <Link
              href={`/loans/${params.id}/edit`}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Edit Loan
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-semibold text-gray-900">{loanData.name}</h2>
              <p className="text-sm text-gray-500 capitalize">{loanData.type} Loan</p>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Loan Summary */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Summary</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Principal Amount</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {formatCurrency(loanData.principal_amount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Current Outstanding</dt>
                    <dd className="mt-1 text-lg font-semibold text-red-600">
                      {formatCurrency(loanData.current_balance)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Amount Paid</dt>
                    <dd className="mt-1 text-lg font-semibold text-green-600">
                      {formatCurrency(paid)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Interest Rate</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {loanData.interest_rate !== null ? `${loanData.interest_rate}%` : '—'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* EMI Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">EMI Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">EMI Amount</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {loanData.emi_amount !== null ? formatCurrency(loanData.emi_amount) : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total EMIs</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {loanData.total_emis || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">EMIs Paid</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {loanData.emis_paid}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">EMIs Remaining</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {loanData.emis_remaining || '—'}
                    </dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 mb-2">Repayment Progress</dt>
                    <dd>
                      {loanData.total_emis ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div
                              className="h-4 rounded-full bg-blue-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                            {progress.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No EMI schedule</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Important Dates</h3>
                <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(loanData.start_date)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">End Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(loanData.end_date)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Next EMI Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(loanData.next_emi_date)}
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
