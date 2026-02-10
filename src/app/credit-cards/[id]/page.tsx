import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import CopyButton from '@/components/CopyButton'
import Link from 'next/link'
import type { CreditCard } from '@/types/database'
import DeleteCreditCardButton from '../DeleteButton'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

function maskCardNumber(lastFour: string | null): string {
  if (!lastFour) return '—'
  return `•••• ${lastFour}`
}

function calculateUtilization(balance: number, limit: number): number {
  return limit > 0 ? (balance / limit) * 100 : 0
}

function getUtilizationColor(utilization: number): string {
  if (utilization >= 70) return 'bg-red-500'
  if (utilization >= 30) return 'bg-yellow-500'
  return 'bg-green-500'
}

export default async function CreditCardDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: card } = await supabase
    .from('credit_cards')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!card) {
    notFound()
  }

  const creditCard = card as CreditCard
  const available = creditCard.credit_limit - creditCard.current_balance
  const utilization = calculateUtilization(creditCard.current_balance, creditCard.credit_limit)

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex justify-between items-center">
            <Link href="/credit-cards" className="text-sm text-blue-600 hover:text-blue-800">
              ← Back to Credit Cards
            </Link>
            <div className="flex gap-3">
              <Link
                href={`/credit-cards/${params.id}/edit`}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Edit Card
              </Link>
              <DeleteCreditCardButton id={params.id} cardName={creditCard.name} />
            </div>
          </div>
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-semibold text-gray-900">{creditCard.name}</h2>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Card Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Card Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Bank</dt>
                    <dd className="mt-1 text-sm text-gray-900">{creditCard.bank || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Card Network</dt>
                    <dd className="mt-1 text-sm text-gray-900 uppercase">{creditCard.card_type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Card Number</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      {maskCardNumber(creditCard.last_four_digits)}
                      {creditCard.last_four_digits && <CopyButton text={creditCard.last_four_digits} />}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{creditCard.expiry_date || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Annual Fee</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {creditCard.annual_fee !== null ? formatCurrency(creditCard.annual_fee) : '—'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Financial Summary */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Summary</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Credit Limit</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {formatCurrency(creditCard.credit_limit)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Current Outstanding</dt>
                    <dd className="mt-1 text-lg font-semibold text-red-600">
                      {formatCurrency(creditCard.current_balance)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Available Credit</dt>
                    <dd className="mt-1 text-lg font-semibold text-green-600">
                      {formatCurrency(available)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Utilization</dt>
                    <dd className="mt-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getUtilizationColor(utilization)}`}
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {utilization.toFixed(1)}%
                        </span>
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Billing Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Statement Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {creditCard.statement_date ? `${creditCard.statement_date} of every month` : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {creditCard.due_date ? `${creditCard.due_date} of every month` : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Statement Amount</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {creditCard.last_statement_amount !== null ? formatCurrency(creditCard.last_statement_amount) : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Statement Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {creditCard.last_statement_date || '—'}
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
