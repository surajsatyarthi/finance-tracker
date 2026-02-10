import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

type MonthProjection = {
  month: string
  monthName: string
  income: number
  expenses: number
  netFlow: number
  balance: number
  emiPayments: number
  loanPayments: number
  bnplPayments: number
  creditCardPayments: number
  fdMaturities: number
}

export default async function ProjectionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // Get current account balances
  const { data: accounts } = await supabase
    .from('accounts')
    .select('balance')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1000)

  const currentBalance = accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0

  // Get budgets for income/expense estimation
  const { data: budgets } = await supabase
    .from('budgets')
    .select(`
      *,
      categories (
        type
      )
    `)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .limit(1000)

  // Get EMIs
  const { data: emis } = await supabase
    .from('emis')
    .select('monthly_emi')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .not('next_due_date', 'is', null)
    .limit(1000)

  const totalMonthlyEmi = emis?.reduce((sum, emi) => sum + emi.monthly_emi, 0) || 0

  // Get BNPLs
  const { data: bnpls } = await supabase
    .from('bnpls')
    .select('installment_amount')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .not('next_due_date', 'is', null)
    .limit(1000)

  const totalMonthlyBnpl = bnpls?.reduce((sum, bnpl) => sum + bnpl.installment_amount, 0) || 0

  // Get Loans
  const { data: loans } = await supabase
    .from('loans')
    .select('emi_amount')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .not('emi_amount', 'is', null)
    .limit(1000)

  const totalMonthlyLoan = loans?.reduce((sum, loan) => sum + (loan.emi_amount || 0), 0) || 0

  // Get Credit Cards (estimate monthly payment as 5% of balance)
  const { data: creditCards } = await supabase
    .from('credit_cards')
    .select('current_balance')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1000)

  const totalCreditCardBalance = creditCards?.reduce((sum, cc) => sum + cc.current_balance, 0) || 0
  const estimatedMonthlyCC = totalCreditCardBalance * 0.05

  // Get FD maturities
  const { data: fds } = await supabase
    .from('fixed_deposits')
    .select('maturity_date, maturity_amount')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .limit(1000)

  // Calculate monthly income and expenses from budgets
  let monthlyIncome = 0
  let monthlyExpense = 0

  type BudgetWithCategory = {
    amount: number
    period: string
    categories: {
      type: string
    } | null
  }

  budgets?.forEach((budget: unknown) => {
    const b = budget as BudgetWithCategory
    const amount = b.period === 'yearly' ? b.amount / 12 : b.amount
    if (b.categories?.type === 'income') {
      monthlyIncome += amount
    } else {
      monthlyExpense += amount
    }
  })

  // Generate 12-month projections
  const projections: MonthProjection[] = []
  let runningBalance = currentBalance

  for (let i = 0; i < 12; i++) {
    const projectionDate = new Date(currentYear, currentMonth + i, 1)
    const monthStr = projectionDate.toISOString().split('T')[0].substring(0, 7)
    const monthName = projectionDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })

    // Check for FD maturities in this month
    const fdMaturityAmount = fds?.reduce((sum, fd) => {
      const maturityDate = new Date(fd.maturity_date)
      if (maturityDate.getMonth() === projectionDate.getMonth() &&
          maturityDate.getFullYear() === projectionDate.getFullYear()) {
        return sum + fd.maturity_amount
      }
      return sum
    }, 0) || 0

    const income = monthlyIncome + fdMaturityAmount
    const expenses = monthlyExpense + totalMonthlyEmi + totalMonthlyBnpl + totalMonthlyLoan + estimatedMonthlyCC
    const netFlow = income - expenses
    runningBalance += netFlow

    projections.push({
      month: monthStr,
      monthName,
      income,
      expenses,
      netFlow,
      balance: runningBalance,
      emiPayments: totalMonthlyEmi,
      loanPayments: totalMonthlyLoan,
      bnplPayments: totalMonthlyBnpl,
      creditCardPayments: estimatedMonthlyCC,
      fdMaturities: fdMaturityAmount
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const totalProjectedIncome = projections.reduce((sum, p) => sum + p.income, 0)
  const totalProjectedExpenses = projections.reduce((sum, p) => sum + p.expenses, 0)
  const totalNetFlow = totalProjectedIncome - totalProjectedExpenses
  const endBalance = projections[projections.length - 1]?.balance || 0

  const lowestBalance = Math.min(...projections.map(p => p.balance))
  const lowestBalanceMonth = projections.find(p => p.balance === lowestBalance)

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">📊 12-Month Financial Projections</h1>
            <p className="text-sm text-gray-600 mt-1">
              Forecast based on budgets, recurring payments, and current balances
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Current Balance</div>
                  <div className="text-xl font-bold text-gray-900">{formatCurrency(currentBalance)}</div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Projected (12M)</div>
                  <div className={`text-xl font-bold ${endBalance >= currentBalance ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(endBalance)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${totalNetFlow >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <span className="text-2xl">{totalNetFlow >= 0 ? '✅' : '⚠️'}</span>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Net Flow (12M)</div>
                  <div className={`text-xl font-bold ${totalNetFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalNetFlow)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${lowestBalance >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
                  <span className="text-2xl">{lowestBalance >= 0 ? '📊' : '🔴'}</span>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Lowest Balance</div>
                  <div className={`text-lg font-bold ${lowestBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(lowestBalance)}
                  </div>
                  <div className="text-xs text-gray-500">{lowestBalanceMonth?.monthName}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Projection Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <div className="max-h-[600px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Month
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        💵 Income
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        💸 Expenses
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        📅 EMIs
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        💰 Loans
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        🛒 BNPL
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        💳 CC
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        🏛️ FD Maturity
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Net Flow
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projections.map((proj, idx) => {
                      const isCurrentMonth = idx === 0
                      const isLowBalance = proj.balance < currentBalance * 0.2

                      return (
                        <tr
                          key={proj.month}
                          className={`hover:bg-gray-50 ${isCurrentMonth ? 'bg-blue-50' : ''} ${isLowBalance ? 'bg-red-50' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {isCurrentMonth && <span className="mr-2">👉</span>}
                              <span className="text-sm font-medium text-gray-900">{proj.monthName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-green-600">
                            {formatCurrency(proj.income)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-red-600">
                            {formatCurrency(proj.expenses)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                            {proj.emiPayments > 0 ? formatCurrency(proj.emiPayments) : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                            {proj.loanPayments > 0 ? formatCurrency(proj.loanPayments) : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                            {proj.bnplPayments > 0 ? formatCurrency(proj.bnplPayments) : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                            {proj.creditCardPayments > 0 ? formatCurrency(proj.creditCardPayments) : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-blue-600 font-semibold">
                            {proj.fdMaturities > 0 ? formatCurrency(proj.fdMaturities) : '—'}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${
                            proj.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {proj.netFlow >= 0 ? '+' : ''}{formatCurrency(proj.netFlow)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${
                            proj.balance >= currentBalance ? 'text-green-600' :
                            proj.balance >= 0 ? 'text-gray-900' : 'text-red-600'
                          }`}>
                            {formatCurrency(proj.balance)}
                            {isLowBalance && <span className="ml-2">⚠️</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-gray-100 font-bold">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Total</td>
                      <td className="px-6 py-4 text-right text-sm text-green-600 font-bold">
                        {formatCurrency(totalProjectedIncome)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-red-600 font-bold">
                        {formatCurrency(totalProjectedExpenses)}
                      </td>
                      <td className="px-6 py-4" colSpan={5}></td>
                      <td className={`px-6 py-4 text-right text-sm font-bold ${
                        totalNetFlow >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {totalNetFlow >= 0 ? '+' : ''}{formatCurrency(totalNetFlow)}
                      </td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Insights</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              {lowestBalance < 0 && (
                <li>⚠️ Warning: Your balance is projected to go negative in {lowestBalanceMonth?.monthName}. Consider reducing expenses or increasing income.</li>
              )}
              {lowestBalance >= 0 && lowestBalance < currentBalance * 0.2 && (
                <li>⚠️ Caution: Your balance may drop to {formatCurrency(lowestBalance)} in {lowestBalanceMonth?.monthName}, which is less than 20% of your current balance.</li>
              )}
              {totalNetFlow >= 0 && (
                <li>✅ Good news: You&apos;re projected to save {formatCurrency(totalNetFlow)} over the next 12 months.</li>
              )}
              {endBalance >= currentBalance * 1.5 && (
                <li>🎉 Excellent: Your balance is projected to grow by {((endBalance - currentBalance) / currentBalance * 100).toFixed(1)}% over the next year!</li>
              )}
            </ul>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
