import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'
import type { BNPL } from '@/types/database'
import DeleteBNPLButton from './DeleteButton'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function BNPLPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bnpls } = await supabase
    .from('bnpls')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('next_due_date', { ascending: true })

  const list = (bnpls || []) as BNPL[]
  const totalLimit = list.reduce((sum, b) => sum + b.total_amount, 0)
  const totalOwed = list.reduce((sum, b) => sum + b.remaining_amount, 0)
  const totalAvailable = totalLimit - totalOwed

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Buy Now Pay Later</h2>
            <Link href="/bnpl/form" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
              Add BNPL
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
                  <div className="text-sm font-medium text-gray-500">Total Limit</div>
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(totalLimit)}</div>
                  <div className="text-xs text-gray-500 mt-1">{list.length} accounts</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Total Owed</div>
                  <div className="text-xl font-bold text-red-600">{formatCurrency(totalOwed)}</div>
                  <div className="text-xs text-gray-500 mt-1">{totalLimit > 0 ? `${((totalOwed / totalLimit) * 100).toFixed(1)}% utilized` : '0% utilized'}</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Available</div>
                  <div className="text-xl font-bold text-green-600">{formatCurrency(totalAvailable)}</div>
                  <div className="text-xs text-gray-500 mt-1">to spend</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Active Accounts</div>
                  <div className="text-xl font-bold text-purple-600">{list.length}</div>
                  <div className="text-xs text-gray-500 mt-1">BNPL providers</div>
                </div>
              </div>
            </div>
          </div>

          {list.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No BNPL records found.</p>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Limit</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Owed</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Available</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {list.map((bnpl) => {
                      const available = bnpl.total_amount - bnpl.remaining_amount
                      return (
                        <tr key={bnpl.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{bnpl.merchant}</td>
                          <td className="px-6 py-4 text-sm text-right text-gray-900">{formatCurrency(bnpl.total_amount)}</td>
                          <td className="px-6 py-4 text-sm text-right text-red-600 font-semibold">{formatCurrency(bnpl.remaining_amount)}</td>
                          <td className="px-6 py-4 text-sm text-right text-green-600 font-semibold">{formatCurrency(available)}</td>
                          <td className="px-6 py-4 text-right text-sm space-x-3">
                            <Link href={`/bnpl/form?id=${bnpl.id}`} className="text-blue-600 hover:text-blue-800">Edit</Link>
                            <DeleteBNPLButton id={bnpl.id} />
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
