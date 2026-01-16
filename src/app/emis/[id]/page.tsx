import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'
import type { EMI, CreditCard } from '@/types/database'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export default async function EMIDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: emi } = await supabase
    .from('emis')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!emi) notFound()

  const emiData = emi as EMI
  let linkedCard: CreditCard | null = null
  if (emiData.linked_card_id) {
    const { data } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('id', emiData.linked_card_id)
      .single()
    linkedCard = data as CreditCard | null
  }

  const progress = emiData.total_amount > 0 ? (emiData.paid_amount / emiData.total_amount) * 100 : 0

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Link href="/emis" className="text-blue-600 hover:text-blue-800 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h2 className="text-2xl font-semibold text-gray-900">{emiData.emi_name}</h2>
            </div>
            <Link
              href={`/emis/${id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit
            </Link>
          </div>

          {/* Progress Card */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-gray-900">Payment Progress</span>
              <span className="text-2xl font-bold text-blue-600">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div className="bg-green-600 h-4 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Paid</p>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(emiData.paid_amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Remaining</p>
                <p className="text-lg font-semibold text-red-600">{formatCurrency(emiData.remaining_amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(emiData.total_amount)}</p>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">Monthly EMI</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(emiData.monthly_emi)}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">Start Date</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatDate(emiData.start_date)}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">End Date</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatDate(emiData.end_date)}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">Next Due Date</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatDate(emiData.next_due_date)}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">Linked Card</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {linkedCard ? (
                      <Link href={`/credit-cards/${linkedCard.id}`} className="text-blue-600 hover:text-blue-800">
                        {linkedCard.name} ({linkedCard.bank})
                      </Link>
                    ) : '-'}
                  </td>
                </tr>
                {emiData.notes && (
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">Notes</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{emiData.notes}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
