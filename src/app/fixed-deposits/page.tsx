import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'
import DeleteFDButton from './DeleteButton'

import { FixedDeposit } from '@/types/database'

export default async function FixedDepositsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: fds } = await supabase
    .from('fixed_deposits')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('maturity_date', { ascending: true })
    .limit(1000)

  const list = (fds || []) as FixedDeposit[]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const totalPrincipal = list.reduce((sum: number, fd: FixedDeposit) => sum + fd.principal_amount, 0)
  const totalMaturity = list.reduce((sum: number, fd: FixedDeposit) => sum + fd.maturity_amount, 0)
  const totalInterest = totalMaturity - totalPrincipal

  const getStatus = (maturityDate: string) => {
    const today = new Date()
    const maturity = new Date(maturityDate)
    const daysToMaturity = Math.ceil((maturity.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysToMaturity < 0) return { label: 'Matured', color: 'bg-green-100 text-green-800' }
    if (daysToMaturity <= 30) return { label: 'Maturing Soon', color: 'bg-orange-100 text-orange-800' }
    return { label: 'Active', color: 'bg-blue-100 text-blue-800' }
  }

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Fixed Deposits</h1>
            <Link
              href="/fixed-deposits/form"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              + Add FD
            </Link>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Total Principal</div>
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(totalPrincipal)}</div>
                  <div className="text-xs text-gray-500 mt-1">{list.length} FDs</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Maturity Value</div>
                  <div className="text-xl font-bold text-green-600">{formatCurrency(totalMaturity)}</div>
                  <div className="text-xs text-gray-500 mt-1">at maturity</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Total Interest</div>
                  <div className="text-xl font-bold text-purple-600">{formatCurrency(totalInterest)}</div>
                  <div className="text-xs text-gray-500 mt-1">{totalPrincipal > 0 ? `${((totalInterest / totalPrincipal) * 100).toFixed(1)}% return` : '0% return'}</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Active FDs</div>
                  <div className="text-xl font-bold text-orange-600">{list.length}</div>
                  <div className="text-xs text-gray-500 mt-1">fixed deposits</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <div className="max-h-[600px] overflow-y-auto">
                {list.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    No fixed deposits found. Add your first FD to start tracking.
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Bank/Institution</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">FD Number</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Principal</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Interest Rate</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Tenure</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Start Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Maturity Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Maturity Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {list.map((fd: FixedDeposit) => {
                        const status = getStatus(fd.maturity_date)
                        return (
                          <tr key={fd.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link href={`/fixed-deposits/${fd.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                {fd.bank_name}
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {fd.fd_number || '—'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                              {formatCurrency(fd.principal_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {fd.interest_rate}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {fd.tenure_months} months
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(fd.start_date).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(fd.maturity_date).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-green-600">
                              {formatCurrency(fd.maturity_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${status.color}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <Link href={`/fixed-deposits/form?id=${fd.id}`} className="text-blue-600 hover:text-blue-800 mr-4">
                                Edit
                              </Link>
                              <DeleteFDButton id={fd.id} />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
