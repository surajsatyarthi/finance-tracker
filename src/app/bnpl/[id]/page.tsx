import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'
import type { BNPL } from '@/types/database'

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

function calculateProgress(paid: number, total: number): number {
  if (total === 0) return 0
  return (paid / total) * 100
}

export default async function BNPLDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: bnpl } = await supabase
    .from('bnpls')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!bnpl) {
    notFound()
  }

  const bnplData = bnpl as BNPL
  const progress = calculateProgress(bnplData.paid_amount, bnplData.total_amount)
  const available = bnplData.total_amount - bnplData.remaining_amount
  const utilizationPercent = bnplData.total_amount > 0 ? (bnplData.remaining_amount / bnplData.total_amount) * 100 : 0

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex justify-between items-center">
            <Link href="/bnpl" className="text-sm text-blue-600 hover:text-blue-800">
              ← Back to BNPL
            </Link>
            <Link
              href={`/bnpl/form?id=${params.id}`}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Edit BNPL
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-semibold text-gray-900">{bnplData.merchant}</h2>
              <p className="text-sm text-gray-500">Buy Now Pay Later</p>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* BNPL Summary */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Summary</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {formatCurrency(bnplData.total_amount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Remaining Amount</dt>
                    <dd className="mt-1 text-lg font-semibold text-red-600">
                      {formatCurrency(bnplData.remaining_amount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Paid Amount</dt>
                    <dd className="mt-1 text-lg font-semibold text-green-600">
                      {formatCurrency(bnplData.paid_amount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Available Limit</dt>
                    <dd className="mt-1 text-lg font-semibold text-blue-600">
                      {formatCurrency(available)}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Installment Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Installment Details</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Installment Amount</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {formatCurrency(bnplData.installment_amount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Next Due Date</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {formatDate(bnplData.next_due_date)}
                    </dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 mb-2">Repayment Progress</dt>
                    <dd>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div
                            className="h-4 rounded-full bg-green-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                    </dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 mb-2">Utilization</dt>
                    <dd>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div
                            className={`h-4 rounded-full ${utilizationPercent > 80 ? 'bg-red-500' : utilizationPercent > 50 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                          {utilizationPercent.toFixed(1)}%
                        </span>
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Linked Card */}
              {bnplData.linked_card_id && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Linked Payment Method</h3>
                  <dl className="grid grid-cols-1 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Linked Card ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <Link href={`/credit-cards/${bnplData.linked_card_id}`} className="text-blue-600 hover:text-blue-800">
                          View Card Details →
                        </Link>
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              {/* Notes */}
              {bnplData.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{bnplData.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
