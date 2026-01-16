import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

type MonthData = {
  month: string
  monthName: string
  income: number
  expenses: number
  net: number
}

type CategorySpending = {
  category: string
  amount: number
  percentage: number
  budget: number
  budgetUsed: number
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  // Get last 6 months of transactions
  const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1)

  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (
        name,
        type
      )
    `)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .gte('date', sixMonthsAgo.toISOString().split('T')[0])
    .order('date', { ascending: true })

  // Get budgets
  const { data: budgets } = await supabase
    .from('budgets')
    .select(`
      *,
      categories (
        id,
        name,
        type
      )
    `)
    .eq('user_id', user.id)
    .is('deleted_at', null)

  // Get accounts for net worth
  const { data: accounts } = await supabase
    .from('accounts')
    .select('balance')
    .eq('user_id', user.id)
    .eq('is_active', true)

  const totalNetWorth = accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0

  // Get investments
  const { data: investments } = await supabase
    .from('investments')
    .select('invested_amount, current_value')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  const totalInvested = investments?.reduce((sum, inv) => sum + inv.invested_amount, 0) || 0
  const totalInvestmentValue = investments?.reduce((sum, inv) => sum + inv.current_value, 0) || 0
  const investmentReturns = totalInvestmentValue - totalInvested
  const investmentReturnPercent = totalInvested > 0 ? (investmentReturns / totalInvested) * 100 : 0

  // Process monthly data
  const monthlyData: { [key: string]: MonthData } = {}

  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - i, 1)
    const monthKey = date.toISOString().split('T')[0].substring(0, 7)
    const monthName = date.toLocaleDateString('en-IN', { month: 'short' })

    monthlyData[monthKey] = {
      month: monthKey,
      monthName,
      income: 0,
      expenses: 0,
      net: 0
    }
  }

  transactions?.forEach((txn: any) => {
    const monthKey = txn.date.substring(0, 7)
    if (monthlyData[monthKey]) {
      if (txn.type === 'income') {
        monthlyData[monthKey].income += txn.amount
      } else {
        monthlyData[monthKey].expenses += txn.amount
      }
      monthlyData[monthKey].net = monthlyData[monthKey].income - monthlyData[monthKey].expenses
    }
  })

  const monthlyArray = Object.values(monthlyData)

  // Current month data
  const currentMonthKey = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0].substring(0, 7)
  const currentMonthData = monthlyData[currentMonthKey] || { income: 0, expenses: 0, net: 0 }

  // Previous month data
  const prevMonthKey = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0].substring(0, 7)
  const prevMonthData = monthlyData[prevMonthKey] || { income: 0, expenses: 0, net: 0 }

  // Category spending (current month)
  const categorySpending: { [key: string]: CategorySpending } = {}

  transactions?.forEach((txn: any) => {
    if (txn.type === 'expense' && txn.date.startsWith(currentMonthKey)) {
      const catName = txn.categories?.name || 'Uncategorized'
      if (!categorySpending[catName]) {
        categorySpending[catName] = {
          category: catName,
          amount: 0,
          percentage: 0,
          budget: 0,
          budgetUsed: 0
        }
      }
      categorySpending[catName].amount += txn.amount
    }
  })

  // Add budget data
  budgets?.forEach((budget: any) => {
    const catName = budget.categories?.name
    if (catName && budget.categories?.type === 'expense') {
      const monthlyBudget = budget.period === 'yearly' ? budget.amount / 12 : budget.amount
      if (categorySpending[catName]) {
        categorySpending[catName].budget = monthlyBudget
        categorySpending[catName].budgetUsed = (categorySpending[catName].amount / monthlyBudget) * 100
      }
    }
  })

  // Calculate percentages
  const totalCategoryExpense = Object.values(categorySpending).reduce((sum, cat) => sum + cat.amount, 0)
  Object.values(categorySpending).forEach(cat => {
    cat.percentage = totalCategoryExpense > 0 ? (cat.amount / totalCategoryExpense) * 100 : 0
  })

  const categoryArray = Object.values(categorySpending).sort((a, b) => b.amount - a.amount)

  // Calculate max for chart scaling
  const maxMonthlyAmount = Math.max(...monthlyArray.map(m => Math.max(m.income, m.expenses)))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const totalIncome = monthlyArray.reduce((sum, m) => sum + m.income, 0)
  const totalExpenses = monthlyArray.reduce((sum, m) => sum + m.expenses, 0)
  const avgMonthlyIncome = totalIncome / 6
  const avgMonthlyExpenses = totalExpenses / 6
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

  const incomeChange = prevMonthData.income > 0
    ? ((currentMonthData.income - prevMonthData.income) / prevMonthData.income) * 100
    : 0
  const expenseChange = prevMonthData.expenses > 0
    ? ((currentMonthData.expenses - prevMonthData.expenses) / prevMonthData.expenses) * 100
    : 0

  return (
    <AppLayout userEmail={user.email || ''}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">📊 Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">
              Financial insights and trends over the last 6 months
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500">💰 Net Worth</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalNetWorth)}</div>
              <div className="text-xs text-gray-500 mt-1">Across all accounts</div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500">💵 Avg Income</div>
              </div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(avgMonthlyIncome)}</div>
              <div className="text-xs text-gray-500 mt-1">Per month (6M avg)</div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500">💸 Avg Expenses</div>
              </div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(avgMonthlyExpenses)}</div>
              <div className="text-xs text-gray-500 mt-1">Per month (6M avg)</div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-500">📈 Savings Rate</div>
              </div>
              <div className={`text-2xl font-bold ${savingsRate >= 20 ? 'text-green-600' : savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                {savingsRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {savingsRate >= 20 ? '✅ Excellent' : savingsRate >= 10 ? '⚠️ Fair' : '🔴 Low'}
              </div>
            </div>
          </div>

          {/* Current vs Previous Month */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Current Month vs Last Month</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Income</span>
                    <span className={`text-sm font-semibold ${incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {incomeChange >= 0 ? '↑' : '↓'} {Math.abs(incomeChange).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-lg font-bold text-green-600">{formatCurrency(currentMonthData.income)}</div>
                    <div className="text-sm text-gray-500">vs {formatCurrency(prevMonthData.income)}</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Expenses</span>
                    <span className={`text-sm font-semibold ${expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {expenseChange >= 0 ? '↑' : '↓'} {Math.abs(expenseChange).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-lg font-bold text-red-600">{formatCurrency(currentMonthData.expenses)}</div>
                    <div className="text-sm text-gray-500">vs {formatCurrency(prevMonthData.expenses)}</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Net Savings</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`text-lg font-bold ${currentMonthData.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(currentMonthData.net)}
                    </div>
                    <div className="text-sm text-gray-500">vs {formatCurrency(prevMonthData.net)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Investment Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Invested</div>
                  <div className="text-xl font-bold text-gray-900">{formatCurrency(totalInvested)}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Current Value</div>
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(totalInvestmentValue)}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Returns</div>
                  <div className={`text-xl font-bold ${investmentReturns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {investmentReturns >= 0 ? '+' : ''}{formatCurrency(investmentReturns)} ({investmentReturnPercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Income vs Expenses Chart */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">📊 Income vs Expenses (Last 6 Months)</h3>
            <div className="space-y-6">
              {monthlyArray.map((month) => (
                <div key={month.month}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 w-16">{month.monthName}</span>
                    <div className="flex-1 mx-4">
                      <div className="relative h-8 bg-gray-100 rounded">
                        <div
                          className="absolute top-0 left-0 h-full bg-green-500 rounded-l"
                          style={{ width: `${(month.income / maxMonthlyAmount) * 100}%` }}
                        />
                        <div
                          className="absolute top-0 left-0 h-full bg-red-500 opacity-70 rounded-l"
                          style={{ width: `${(month.expenses / maxMonthlyAmount) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex space-x-4 text-sm w-64 justify-end">
                      <span className="text-green-600 font-semibold">{formatCurrency(month.income)}</span>
                      <span className="text-red-600 font-semibold">{formatCurrency(month.expenses)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-6 mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2" />
                <span className="text-gray-600">Income</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2" />
                <span className="text-gray-600">Expenses</span>
              </div>
            </div>
          </div>

          {/* Category Spending */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">🏷️ Spending by Category (Current Month)</h3>
            {categoryArray.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No expense data for current month</div>
            ) : (
              <div className="space-y-4">
                {categoryArray.map((cat, idx) => (
                  <div key={cat.category}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center flex-1">
                        <span className="text-sm font-medium text-gray-700 w-32">{cat.category}</span>
                        <div className="flex-1 mx-4">
                          <div className="relative h-6 bg-gray-100 rounded">
                            <div
                              className={`h-full rounded ${
                                idx === 0 ? 'bg-red-500' :
                                idx === 1 ? 'bg-orange-500' :
                                idx === 2 ? 'bg-yellow-500' :
                                'bg-blue-500'
                              }`}
                              style={{ width: `${cat.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 w-72 justify-end">
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(cat.amount)}</span>
                        <span className="text-xs text-gray-500 w-12 text-right">{cat.percentage.toFixed(1)}%</span>
                        {cat.budget > 0 && (
                          <span className={`text-xs font-medium w-20 text-right ${
                            cat.budgetUsed > 100 ? 'text-red-600' :
                            cat.budgetUsed > 80 ? 'text-orange-600' :
                            'text-green-600'
                          }`}>
                            {cat.budgetUsed > 100 ? '⚠️ ' : ''}{cat.budgetUsed.toFixed(0)}% of budget
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
