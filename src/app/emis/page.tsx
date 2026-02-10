import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'
import type { EMI } from '@/types/database'

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

function getProgress(paid: number, total: number): number {
  return total > 0 ? (paid / total) * 100 : 0
}

export default async function EMIsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: emis } = await supabase
    .from('emis')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('next_due_date', { ascending: true })
    .limit(1000)

  const emisList = (emis || []) as EMI[]

  const totalAmount = emisList.reduce((sum, e) => sum + e.total_amount, 0)
  const totalPaid = emisList.reduce((sum, e) => sum + e.paid_amount, 0)
  const totalRemaining = emisList.reduce((sum, e) => sum + e.remaining_amount, 0)
  const monthlyOutflow = emisList.reduce((sum, e) => sum + e.monthly_emi, 0)

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">EMIs</h2>
            <Link
              href="/emis/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Add EMI
            </Link>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
                  <span className="text-2xl">💳</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Monthly Outflow</div>
                  <div className="text-xl font-bold text-orange-600">{formatCurrency(monthlyOutflow)}</div>
                  <div className="text-xs text-gray-500 mt-1">{emisList.length} active EMIs</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Total Outstanding</div>
                  <div className="text-xl font-bold text-red-600">{formatCurrency(totalRemaining)}</div>
                  <div className="text-xs text-gray-500 mt-1">remaining to pay</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Total Paid</div>
                  <div className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
                  <div className="text-xs text-gray-500 mt-1">{totalAmount > 0 ? `${((totalPaid / totalAmount) * 100).toFixed(1)}% completed` : '0% completed'}</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <span className="text-2xl">🏦</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Total Amount</div>
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(totalAmount)}</div>
                  <div className="text-xs text-gray-500 mt-1">original borrowed</div>
                </div>
              </div>
            </div>
          </div>

          {emisList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No EMIs found. Add your first EMI to get started.</p>
              <Link
                href="/emis/new"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Add EMI
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly EMI</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Due</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {emisList.map((emi) => {
                      const progress = getProgress(emi.paid_amount, emi.total_amount)
                      return (
                        <tr key={emi.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href={`/emis/${emi.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                              {emi.emi_name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(emi.monthly_emi)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm font-semibold text-red-600">{formatCurrency(emi.remaining_amount)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                              </div>
                              <span className="text-xs text-gray-600">{progress.toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{formatDate(emi.next_due_date)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link href={`/emis/${emi.id}/edit`} className="text-blue-600 hover:text-blue-900">Edit</Link>
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
