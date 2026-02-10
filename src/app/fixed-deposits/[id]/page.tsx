import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'

type FixedDeposit = {
  id: string
  user_id: string
  bank_name: string
  fd_number: string | null
  principal_amount: number
  interest_rate: number
  tenure_months: number
  start_date: string
  maturity_date: string
  maturity_amount: number
  auto_renew: boolean
  nominee_name: string | null
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

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

function getMaturityStatus(maturityDate: string): { label: string; color: string } {
  const today = new Date()
  const maturity = new Date(maturityDate)
  const daysToMaturity = Math.ceil((maturity.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysToMaturity < 0) return { label: 'Matured', color: 'bg-green-100 text-green-800' }
  if (daysToMaturity <= 30) return { label: 'Maturing Soon', color: 'bg-orange-100 text-orange-800' }
  return { label: 'Active', color: 'bg-blue-100 text-blue-800' }
}

export default async function FixedDepositDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: fd } = await supabase
    .from('fixed_deposits')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!fd) {
    notFound()
  }

  const fdData = fd as FixedDeposit
  const interestEarned = fdData.maturity_amount - fdData.principal_amount
  const status = getMaturityStatus(fdData.maturity_date)
  const daysRemaining = Math.ceil((new Date(fdData.maturity_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const tenureYears = (fdData.tenure_months / 12).toFixed(1)

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex justify-between items-center">
            <Link href="/fixed-deposits" className="text-sm text-blue-600 hover:text-blue-800">
              ← Back to Fixed Deposits
            </Link>
            <Link
              href={`/fixed-deposits/form?id=${params.id}`}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Edit FD
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{fdData.bank_name}</h2>
                  {fdData.fd_number && (
                    <p className="text-sm text-gray-500">FD Number: {fdData.fd_number}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* FD Summary */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Deposit Summary</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Principal Amount</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {formatCurrency(fdData.principal_amount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Maturity Amount</dt>
                    <dd className="mt-1 text-lg font-semibold text-green-600">
                      {formatCurrency(fdData.maturity_amount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Interest Earned</dt>
                    <dd className="mt-1 text-lg font-semibold text-blue-600">
                      {formatCurrency(interestEarned)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Interest Rate</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {fdData.interest_rate}% p.a.
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Tenure & Dates */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tenure & Important Dates</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tenure</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {fdData.tenure_months} months ({tenureYears} {parseFloat(tenureYears) === 1 ? 'year' : 'years'})
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Days to Maturity</dt>
                    <dd className={`mt-1 text-lg font-semibold ${daysRemaining < 0 ? 'text-green-600' : daysRemaining <= 30 ? 'text-orange-600' : 'text-gray-900'}`}>
                      {daysRemaining < 0 ? 'Matured' : `${daysRemaining} days`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(fdData.start_date)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Maturity Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(fdData.maturity_date)}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Auto-Renew & Nominee */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Auto Renewal</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${fdData.auto_renew ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {fdData.auto_renew ? 'Enabled' : 'Disabled'}
                      </span>
                    </dd>
                  </div>
                  {fdData.nominee_name && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nominee</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {fdData.nominee_name}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Notes */}
              {fdData.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{fdData.notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Record Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(fdData.created_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(fdData.updated_at)}
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
