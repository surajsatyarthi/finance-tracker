import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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

function calculateProgress(paid: number, total: number | null): number {
  if (!total || total === 0) return 0
  return (paid / total) * 100
}

export default async function LoansPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: loans } = await supabase
    .from('loans')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('current_balance', { ascending: false })

  const loansList = (loans || []) as Loan[]

  const totalPrincipal = loansList.reduce((sum, loan) => sum + loan.principal_amount, 0)
  const totalOutstanding = loansList.reduce((sum, loan) => sum + loan.current_balance, 0)
  const totalPaid = totalPrincipal - totalOutstanding

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Loans</h2>
            <Link
              href="/loans/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Loan
            </Link>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <span className="text-2xl">🏦</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Total Borrowed</div>
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(totalPrincipal)}</div>
                  <div className="text-xs text-gray-500 mt-1">principal amount</div>
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
                  <div className="text-xs text-gray-500 mt-1">remaining balance</div>
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
                  <div className="text-xs text-gray-500 mt-1">{totalPrincipal > 0 ? `${((totalPaid / totalPrincipal) * 100).toFixed(1)}% repaid` : '0% repaid'}</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Active Loans</div>
                  <div className="text-xl font-bold text-purple-600">{loansList.length}</div>
                  <div className="text-xs text-gray-500 mt-1">loan accounts</div>
                </div>
              </div>
            </div>
          </div>

          {loansList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No loans found. Add your first loan to get started.</p>
              <Link
                href="/loans/new"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Loan
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Principal
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outstanding
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EMI
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loansList.map((loan) => {
                    const progress = calculateProgress(loan.emis_paid, loan.total_emis)

                    return (
                      <tr key={loan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/loans/${loan.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                            {loan.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 capitalize">{loan.type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(loan.principal_amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-semibold text-red-600">
                            {formatCurrency(loan.current_balance)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm text-gray-900">
                            {loan.emi_amount !== null ? formatCurrency(loan.emi_amount) : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {loan.total_emis ? (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-blue-500"
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 w-12 text-right">
                                {loan.emis_paid}/{loan.total_emis}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/loans/${loan.id}/edit`}
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
