import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'
import DeleteGoalButton from './DeleteButton'

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('target_date', { ascending: true })

  const list = goals || []

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const totalTarget = list.reduce((sum: number, g: any) => sum + g.target_amount, 0)
  const totalCurrent = list.reduce((sum: number, g: any) => sum + g.current_amount, 0)
  const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0
  const totalRemaining = totalTarget - totalCurrent
  const achievedGoals = list.filter((g: any) => g.current_amount >= g.target_amount).length
  const pendingGoals = list.length - achievedGoals

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">🎯 Goals</h1>
            <Link
              href="/goals/form"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              + Add Goal
            </Link>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Total Target</div>
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(totalTarget)}</div>
                  <div className="text-xs text-gray-500 mt-1">{list.length} goals</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Current Saved</div>
                  <div className="text-xl font-bold text-green-600">{formatCurrency(totalCurrent)}</div>
                  <div className="text-xs text-gray-500 mt-1">{overallProgress.toFixed(1)}% of target</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${totalRemaining > 0 ? 'bg-orange-100' : 'bg-green-100'}`}>
                  <span className="text-2xl">{totalRemaining > 0 ? '⏳' : '✅'}</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Remaining</div>
                  <div className={`text-xl font-bold ${totalRemaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {formatCurrency(Math.abs(totalRemaining))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{totalRemaining > 0 ? 'to save' : 'surplus'}</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <div className="text-xl font-bold text-purple-600">
                    {achievedGoals} / {list.length}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {achievedGoals > 0 ? `${achievedGoals} achieved` : `${pendingGoals} pending`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {list.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-500 mb-4">No goals found. Add your first goal to start tracking.</p>
              <Link
                href="/goals/form"
                className="inline-flex px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                + Add Goal
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((goal: any) => {
                const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
                const remaining = goal.target_amount - goal.current_amount
                const daysLeft = goal.target_date
                  ? Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  : null

                return (
                  <div key={goal.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{goal.goal_name}</h3>
                        <div className="flex space-x-2">
                          <Link href={`/goals/form?id=${goal.id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                            Edit
                          </Link>
                          <DeleteGoalButton id={goal.id} />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium text-gray-900">{progress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                progress >= 100 ? 'bg-green-600' : progress >= 75 ? 'bg-blue-600' : progress >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Current</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(goal.current_amount)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Target</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(goal.target_amount)}</span>
                        </div>

                        {remaining > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Remaining</span>
                            <span className="font-semibold text-red-600">{formatCurrency(remaining)}</span>
                          </div>
                        )}

                        {goal.target_date && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Target Date</span>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">
                                {new Date(goal.target_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                              {daysLeft !== null && (
                                <div className={`text-xs ${daysLeft < 0 ? 'text-red-600' : daysLeft < 30 ? 'text-orange-600' : 'text-gray-500'}`}>
                                  {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {goal.notes && (
                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-500">{goal.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  )
}
