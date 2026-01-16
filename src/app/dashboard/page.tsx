import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDashboardMetrics } from '@/lib/dashboard-service'
import AppLayout from '@/components/AppLayout'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const metrics = await getDashboardMetrics(supabase, user.id)

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h2>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`text-2xl font-semibold ${metrics.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(metrics.netWorth)}
                    </div>
                  </div>
                </div>
                <div className="mt-1">
                  <p className="text-sm text-gray-500">Net Worth</p>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`text-2xl font-semibold ${metrics.savingsRate >= 20 ? 'text-green-600' : metrics.savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {formatPercent(metrics.savingsRate)}
                    </div>
                  </div>
                </div>
                <div className="mt-1">
                  <p className="text-sm text-gray-500">Savings Rate</p>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`text-2xl font-semibold ${metrics.creditUtilization < 30 ? 'text-green-600' : metrics.creditUtilization < 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {formatPercent(metrics.creditUtilization)}
                    </div>
                  </div>
                </div>
                <div className="mt-1">
                  <p className="text-sm text-gray-500">Credit Utilization</p>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`text-2xl font-semibold ${metrics.debtServiceRatio < 30 ? 'text-green-600' : metrics.debtServiceRatio < 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {formatPercent(metrics.debtServiceRatio)}
                    </div>
                  </div>
                </div>
                <div className="mt-1">
                  <p className="text-sm text-gray-500">Debt Service Ratio</p>
                </div>
              </div>
            </div>
          </div>

          {/* Assets & Liabilities Breakdown */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assets & Liabilities</h3>
              <table className="min-w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 text-sm text-gray-600">Total Assets</td>
                    <td className="py-3 text-sm font-semibold text-green-600 text-right">{formatCurrency(metrics.totalAssets)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-sm text-gray-600">Total Liabilities</td>
                    <td className="py-3 text-sm font-semibold text-red-600 text-right">{formatCurrency(metrics.totalLiabilities)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td className="py-3 text-sm font-medium text-gray-900">Net Worth</td>
                    <td className={`py-3 text-sm font-bold text-right ${metrics.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(metrics.netWorth)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio Summary</h3>
              <table className="min-w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 text-sm text-gray-600">Accounts</td>
                    <td className="py-3 text-sm font-semibold text-gray-900 text-right">{metrics.counts.accounts}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-sm text-gray-600">Credit Cards</td>
                    <td className="py-3 text-sm font-semibold text-gray-900 text-right">{metrics.counts.creditCards}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-sm text-gray-600">Loans</td>
                    <td className="py-3 text-sm font-semibold text-gray-900 text-right">{metrics.counts.loans}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-sm text-gray-600">Investments</td>
                    <td className="py-3 text-sm font-semibold text-gray-900 text-right">{metrics.counts.investments}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td className="py-3 text-sm font-medium text-gray-900">Liquidity Ratio</td>
                    <td className="py-3 text-sm font-bold text-gray-900 text-right">{metrics.liquidityRatio.toFixed(1)}x</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Upcoming Payments */}
          {metrics.upcomingPayments.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Upcoming Payments (Next 30 Days)
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({metrics.upcomingPayments.length} payment{metrics.upcomingPayments.length !== 1 ? 's' : ''})
                </span>
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {metrics.upcomingPayments.map((payment, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                          {payment.dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="px-3 py-3 text-sm font-medium text-gray-900">
                          {payment.name}
                        </td>
                        <td className="px-3 py-3 text-sm whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            payment.category === 'Credit Card' ? 'bg-purple-100 text-purple-800' :
                            payment.category === 'Loan' ? 'bg-blue-100 text-blue-800' :
                            payment.category === 'EMI' ? 'bg-green-100 text-green-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {payment.category}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-600">
                          {payment.subType || '-'}
                        </td>
                        <td className="px-3 py-3 text-sm font-semibold text-gray-900 text-right whitespace-nowrap">
                          {formatCurrency(payment.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-3 py-3 text-sm font-medium text-gray-900">
                        Total
                      </td>
                      <td className="px-3 py-3 text-sm font-bold text-gray-900 text-right whitespace-nowrap">
                        {formatCurrency(metrics.upcomingPayments.reduce((sum, p) => sum + p.amount, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  )
}
