import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import CopyButton from '@/components/CopyButton'
import Link from 'next/link'
import type { CreditCard } from '@/types/database'

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
  if (utilization >= 70) return 'text-red-600'
  if (utilization >= 30) return 'text-yellow-600'
  return 'text-green-600'
}

export default async function CreditCardsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: cards } = await supabase
    .from('credit_cards')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('credit_limit', { ascending: false })

  const cardsList = (cards || []) as CreditCard[]

  const totalLimit = cardsList.reduce((sum, card) => sum + card.credit_limit, 0)
  const totalOutstanding = cardsList.reduce((sum, card) => sum + card.current_balance, 0)
  const totalAvailable = totalLimit - totalOutstanding
  const avgUtilization = totalLimit > 0 ? (totalOutstanding / totalLimit) * 100 : 0

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Credit Cards</h2>
            <Link
              href="/credit-cards/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Card
            </Link>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <span className="text-2xl">💳</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Total Limit</div>
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(totalLimit)}</div>
                  <div className="text-xs text-gray-500 mt-1">{cardsList.length} cards</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Outstanding</div>
                  <div className="text-xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</div>
                  <div className="text-xs text-gray-500 mt-1">current balance</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Available Credit</div>
                  <div className="text-xl font-bold text-green-600">{formatCurrency(totalAvailable)}</div>
                  <div className="text-xs text-gray-500 mt-1">to spend</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${avgUtilization >= 70 ? 'bg-red-100' : avgUtilization >= 30 ? 'bg-yellow-100' : 'bg-green-100'}`}>
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Avg Utilization</div>
                  <div className={`text-xl font-bold ${getUtilizationColor(avgUtilization)}`}>
                    {avgUtilization.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{avgUtilization >= 70 ? 'high usage' : avgUtilization >= 30 ? 'moderate' : 'healthy'}</div>
                </div>
              </div>
            </div>
          </div>

          {cardsList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No credit cards found. Add your first card to get started.</p>
              <Link
                href="/credit-cards/new"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Card
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Card Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Network
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Card Number
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Limit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outstanding
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilization
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cardsList.map((card) => {
                    const available = card.credit_limit - card.current_balance
                    const utilization = calculateUtilization(card.current_balance, card.credit_limit)

                    return (
                      <tr key={card.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/credit-cards/${card.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                            {card.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{card.bank || '—'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 uppercase">{card.card_type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {card.last_four_digits ? (
                            <div className="flex items-center">
                              <span className="text-sm text-gray-900">{maskCardNumber(card.last_four_digits)}</span>
                              <CopyButton text={card.last_four_digits} />
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(card.credit_limit)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-semibold text-red-600">
                            {formatCurrency(card.current_balance)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-semibold text-green-600">
                            {formatCurrency(available)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`text-sm font-semibold ${getUtilizationColor(utilization)}`}>
                            {utilization.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/credit-cards/${card.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
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
