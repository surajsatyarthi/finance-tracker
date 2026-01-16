import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'
import DeleteInvestmentButton from './DeleteButton'
import type { Investment } from '@/types/database'

export default async function InvestmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: investments } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('investment_name')

  const list = (investments || []) as Investment[]

  const totalInvested = list.reduce((sum, i) => sum + i.invested_amount, 0)
  const totalCurrent = list.reduce((sum, i) => sum + i.current_value, 0)
  const totalGainLoss = totalCurrent - totalInvested
  const gainLossPercent = totalInvested > 0 ? ((totalGainLoss / totalInvested) * 100).toFixed(2) : '0.00'

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getTypeLabel = (type: string) => {
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

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Investments</h1>
            <Link
              href="/investments/form"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              + Add Investment
            </Link>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <span className="text-2xl">💼</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Total Invested</div>
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(totalInvested)}</div>
                  <div className="text-xs text-gray-500 mt-1">{list.length} investments</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Current Value</div>
                  <div className="text-xl font-bold text-green-600">{formatCurrency(totalCurrent)}</div>
                  <div className="text-xs text-gray-500 mt-1">portfolio value</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${totalGainLoss >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <span className="text-2xl">{totalGainLoss >= 0 ? '📈' : '📉'}</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Gain/Loss</div>
                  <div className={`text-xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">absolute change</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${parseFloat(gainLossPercent) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Return %</div>
                  <div className={`text-xl font-bold ${parseFloat(gainLossPercent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(gainLossPercent) >= 0 ? '+' : ''}{gainLossPercent}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">overall return</div>
                </div>
              </div>
            </div>
          </div>

          {/* Investment List Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <div className="max-h-[600px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Type</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Invested</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Current</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Gain/Loss</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Return</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {list.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          No investments found. Add your first investment to get started.
                        </td>
                      </tr>
                    ) : (
                      list.map((investment) => {
                        const gainLoss = investment.current_value - investment.invested_amount
                        const returnPercent = investment.invested_amount > 0
                          ? ((gainLoss / investment.invested_amount) * 100).toFixed(2)
                          : '0.00'
                        return (
                          <tr key={investment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{investment.investment_name}</div>
                              {investment.notes && (
                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{investment.notes}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {getTypeLabel(investment.investment_type)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {formatCurrency(investment.invested_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {formatCurrency(investment.current_value)}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${parseFloat(returnPercent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {parseFloat(returnPercent) >= 0 ? '+' : ''}{returnPercent}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <Link href={`/investments/form?id=${investment.id}`} className="text-blue-600 hover:text-blue-800 mr-4">
                                Edit
                              </Link>
                              <DeleteInvestmentButton id={investment.id} />
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
