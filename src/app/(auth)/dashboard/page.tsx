'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import {
  BanknotesIcon,
  ChartBarIcon,
  FlagIcon as TargetIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BuildingLibraryIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link' // Existing


import { initialLiquidity } from '@/lib/liquidityData'
import { initialGoals } from '@/lib/goalsData'
import { initialCards } from '@/lib/cardsData'
import { budgetProjections2025 } from '@/lib/budgetData'
import { initialLoans } from '@/lib/loansData'
import { useNotification } from '@/contexts/NotificationContext'
// ... imports

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts'
import { financeManager } from '@/lib/supabaseDataManager'
import GlassCard from '@/components/GlassCard'
import { formatDate, formatDateShort } from '@/lib/dateUtils'

interface Transaction {
  id: string
  amount: number
  type: string
  description: string | null
  date: string
  categories?: { name: string } | null
}

interface BudgetProjection {
  category: string
  limits: number[]
}

interface DashboardStats {
  totalAssets: number
  totalLiabilities: number
  monthlyIncome: number
  monthlyExpenses: number
  activeLoans: number
  totalLoanOutstanding: number // Added
  projectedAnnualExpense: number // Added
  activeGoals: number
  totalCreditCardBalance: number
  recentTransactions: Transaction[]
  partitionSplit: { bi: number; pi: number; be: number; pe: number }
  projection: { months: any[]; startLiquidity: number; path: { points: number[] } }
  upcoming: { count: number; amount: number }
  upcomingList: any[]
  ratios: { monthlyEmi: number; savingsRate: number; debtService: number; liquidityRatio: number }
  reminders: any[]
}

export default function Dashboard() {
  const { user, loading, LoadingComponent } = useRequireAuth()
  const { showNotification } = useNotification()
  const [dataLoading, setDataLoading] = useState(true)
  const [budgetProjections, setBudgetProjections] = useState<BudgetProjection[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    totalLiabilities: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    activeLoans: 0,
    totalLoanOutstanding: 0,
    projectedAnnualExpense: 0,
    activeGoals: 0,
    totalCreditCardBalance: 0,
    recentTransactions: [],
    partitionSplit: { bi: 0, pi: 0, be: 0, pe: 0 },
    projection: { months: [], startLiquidity: 0, path: { points: [] } },
    upcoming: { count: 0, amount: 0 },
    upcomingList: [],
    ratios: { monthlyEmi: 0, savingsRate: 0, debtService: 0, liquidityRatio: 0 },
    reminders: []
  })

  // Moved to top to avoid conditional hook error
  const [showBudgetModal, setShowBudgetModal] = useState(false)

  // Calculate annual totals for the modal
  const budgetBreakdown = useMemo(() => {
    return budgetProjections.map(item => ({
      category: item.category,
      total: item.limits.reduce((a, b) => a + b, 0)
    })).sort((a, b) => b.total - a.total)
  }, [budgetProjections])

  // Helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const [refreshTrigger, setRefreshTrigger] = useState(0)


  // Auto-seed data on mount (User Request for direct persistence)
  useEffect(() => {
    const seedData = async () => {
      if (!user) return

      try {
        // Fetch current counts to decide what to seed
        const [existingAccounts, existingGoals, existingCards] = await Promise.all([
          financeManager.getAccounts(),
          financeManager.getGoals(),
          financeManager.getCreditCards()
        ])

        const promises = []
        let seeded = false

        // 1. Seed Accounts if empty
        if (existingAccounts.length === 0) {
          console.log('Seeding Accounts...')
          promises.push(financeManager.seedLiquidity(initialLiquidity))
          seeded = true
        }

        // 2. Seed Goals if empty
        if (existingGoals.length === 0) {
          console.log('Seeding Goals...')
          promises.push(financeManager.seedGoals(initialGoals))
          seeded = true
        }

        // 3. Seed Loans if missing (Fix for Zero Outstanding Loan)
        // Checks inside seedLoans for existence
        promises.push(financeManager.seedLoans(initialLoans))

        // 3. Seed Credit Cards if empty, OR if data looks incomplete (Smart Repair)
        // Check first card for 'benefits' column data presence
        const needsRestock = existingCards.length === 0 || (existingCards.length > 0 && !existingCards[0].benefits)

        if (needsRestock) {
          console.log('Seeding/Updating Credit Cards with rich data...')
          // This will upsert (update) existing cards with new rich data
          promises.push(financeManager.seedCreditCards(initialCards))
          seeded = true
        }

        // 4. Seed Budget (always try idempotent upsert if we seeded anything else, or just check?)
        // Let's seed budget if we seeded accounts, or just for safety.
        // It's low cost upsert.
        if (seeded) {
          promises.push(financeManager.importYearlyBudget(2026, budgetProjections2025))
        }

        if (promises.length > 0) {
          await Promise.all(promises)
          setRefreshTrigger(prev => prev + 1)

        }

      } catch (e) {
        console.error('Auto-seed failed', e)
      }
    }

    // Slight delay to ensure auth is stable
    const timer = setTimeout(() => {
      seedData()
    }, 1500)

    return () => clearTimeout(timer)
  }, [user, showNotification])

  const loadDashboardData = useCallback(async () => {
    try {
      if (!user) return

      // Fetch all data in parallel
      const [
        liquidity,
        incomes,
        expenses,
        ccSummary,
        payables,
        loans, // Need loans for ratios
        cards, // Need cards for reminders
        goals,  // Need goals for reminders/stats
        budgets,
        payLater
      ] = await Promise.all([
        financeManager.getLiquidityData(),
        financeManager.getIncomeTransactions(),
        financeManager.getExpenseTransactions(),
        financeManager.getCreditCardLiabilitySummary(),
        financeManager.getFuturePayables(),
        financeManager.getLoans(), // Helper needed
        financeManager.getCreditCards(),
        financeManager.getGoals(),
        financeManager.getBudgets(2026),
        financeManager.getPayLaterServices()
      ])




      const totalAssets = liquidity.totalLiquidity
      const totalCreditCardBalance = ccSummary.totalOutstanding
      const totalLoanOutstanding = loans.reduce((sum: number, l: any) => sum + (Number(l.current_balance) || 0), 0)
      const totalPayLaterUsed = payLater.reduce((sum: number, s: any) => sum + (Number(s.usedAmount) || 0), 0)
      const totalLiabilities = totalCreditCardBalance + totalLoanOutstanding + totalPayLaterUsed

      // Auto-save Daily Snapshot (Idempotent)
      await financeManager.saveDailySnapshot({
        totalAssets,
        totalLiabilities
      })

      const currentDate = new Date()
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const monthlyIncomes = incomes.filter(t => {
        const d = new Date(t.date)
        return d >= startOfMonth && d <= endOfMonth
      })
      const monthlyExpensesList = expenses.filter(t => {
        const d = new Date(t.date)
        return d >= startOfMonth && d <= endOfMonth
      })

      const monthlyIncome = monthlyIncomes.reduce((sum: number, t: any) => sum + t.amount, 0)
      const monthlyExpenses = monthlyExpensesList.reduce((sum: number, t: any) => sum + t.amount, 0)
      const monthlySavings = monthlyIncome - monthlyExpenses

      const recentTransactions: Transaction[] = [...incomes, ...expenses]
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map((t: any) => ({
          id: t.id,
          amount: t.amount,
          type: t.type,
          description: t.description || '',
          date: t.date,
          categories: t.category ? { name: t.category } : null
        }))

      // Partition Split
      const bi = monthlyIncomes.filter((t: any) => t.category === 'Business').reduce((s: number, t: any) => s + t.amount, 0)
      const pi = monthlyIncome - bi
      const be = monthlyExpensesList.filter((t: any) => t.category === 'Business').reduce((s: number, t: any) => s + t.amount, 0)
      const pe = monthlyExpenses - be

      // Projection (Simplified for Cloud MVP - mostly reusing payable logic)
      const now = new Date()
      const months = [0, 1, 2].map(offset => {
        const start = new Date(now.getFullYear(), now.getMonth() + offset, 1)
        const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)

        // Sum payables (card EMIs) in this month
        const cardPayments = payables
          .filter(p => {
            const d = new Date(p.dueDate)
            return d >= start && d <= end && p.status !== 'paid'
          })
          .reduce((sum, p) => sum + p.amount, 0)

        // Sum loan EMIs in this month
        const loanEMIs = loans
          .filter((l: any) => {
            if (!l.next_emi_date || !l.is_active) return false
            const nextEmi = new Date(l.next_emi_date)
            return nextEmi >= start && nextEmi <= end
          })
          .reduce((sum: number, l: any) => sum + (Number(l.emi_amount) || 0), 0)

        const outflows = cardPayments + loanEMIs

        return {
          label: start.toLocaleString('en-IN', { month: 'short' }),
          outflows,
          inflows: 0 // Placeholder
        }
      })

      // Calculate 2026 Projection from budgetData
      // Calculate 2026 Projection from Dynamic Budgets (DB)
      // Transform DB records to projection format first
      const projectionMap = new Map<string, number[]>()
      const dbBudgets = await financeManager.getBudgets(2026)
      dbBudgets.forEach(b => {
        if (!projectionMap.has(b.category_name)) projectionMap.set(b.category_name, new Array(12).fill(0))
        projectionMap.get(b.category_name)![b.month - 1] = Number(b.monthly_limit)
      })
      const dynamicProjections = Array.from(projectionMap.entries()).map(([c, l]) => ({ category: c, limits: l }))
      setBudgetProjections(dynamicProjections)

      const projectedAnnualExpense = dynamicProjections.reduce((total: number, item: { limits: number[] }) => {
        return total + item.limits.reduce((sum: number, limit: number) => sum + limit, 0)
      }, 0)

      const path = months.reduce<{ points: number[] }>((acc, m) => {
        const last = acc.points[acc.points.length - 1] ?? totalAssets
        acc.points.push(Math.max(0, last + m.inflows - m.outflows))
        return acc
      }, { points: [] })

      // Upcoming in 30 days
      const in30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30)

      // 1. EMIs from payables (card EMIs)
      const upcomingEMIs = payables.filter(p => {
        const d = new Date(p.dueDate)
        return d >= now && d <= in30 && p.status !== 'paid'
      })


      // Note: Credit card statement dues are NOT included in upcoming payments
      // because we don't track statement generation dates - only due_date (day of month)
      // Card balances are already visible in the Credit Cards section

      const upcomingList = [...upcomingEMIs]
      const upcomingAmount = upcomingList.reduce((sum, p) => sum + p.amount, 0)

      // Ratios
      const monthlyEmi = loans.reduce((sum: number, l: any) => sum + (Number(l.emi_amount) || 0), 0)
      const savingsRate = monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0
      const debtService = monthlyIncome > 0 ? Math.round((monthlyEmi / monthlyIncome) * 100) : 0
      const liquidityRatio = totalAssets > 0 ? Math.round(((totalAssets - totalCreditCardBalance) / totalAssets) * 100) : 0

      // Reminders
      const soon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14)
      const emiReminders = payables
        .filter(p => p.type === 'loan_emi' && p.status !== 'paid')
        .filter(p => {
          const d = new Date(p.dueDate)
          return d >= now && d <= soon
        })
        .map(p => ({ kind: 'EMI', label: p.description, due: p.dueDate, amount: p.amount }))

      const cardReminders = payables
        .filter(p => p.type === 'credit_card_due' && p.status !== 'paid')
        .filter(p => {
          const d = new Date(p.dueDate)
          return d >= now && d <= soon
        })
        .map(p => ({ kind: 'Card', label: p.source, due: p.dueDate, amount: p.amount }))

      const bnplReminders = payLater
        .filter((s: any) => s.currentDue > 0) // Only if something is explicitly due? Or if usedAmount > 0 and date near?
        // Schema has currentDue. Let's use that.
        // Wait, seed script set currentDue to 0 for all.
        // But users might have edited it.
        // If currentDue is 0, maybe we check nextDueDate vs now?
        // For now let's show if status is active and nextDueDate is soon?
        // Or strictly current_due > 0?
        // Better: If they have `usedAmount > 0`, they likely have a bill upcoming.
        // Let's filter by usedAmount > 0 just to be safe for reminders, OR stick to currentDue if trustworthy.
        // Seed script has current_due. Let's assume current_due is what matters for "Immediate Payment".
        // However, providing a reminder based on nextDueDate for *any* used amount is helpful.
        .filter((s: any) => s.usedAmount > 0)
        .filter((s: any) => {
          if (!s.nextDueDate) return false
          const d = new Date(s.nextDueDate)
          return d >= now && d <= soon
        })
        .map((s: any) => ({
          kind: 'BNPL',
          label: s.serviceName,
          due: s.nextDueDate,
          amount: s.currentDue > 0 ? s.currentDue : s.usedAmount // Show full used if due, or currentDue
        }))

      const reminders = [...emiReminders, ...cardReminders, ...bnplReminders].sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())

      setStats({
        totalAssets,
        totalLiabilities, // Updated to include BNPL
        monthlyIncome,
        monthlyExpenses,
        activeLoans: loans.length,
        totalLoanOutstanding,
        projectedAnnualExpense,
        activeGoals: goals.length,
        totalCreditCardBalance,
        recentTransactions,
        partitionSplit: { bi, pi, pe, be },
        projection: { months, startLiquidity: totalAssets, path },
        upcoming: { count: upcomingList.length, amount: upcomingAmount },
        upcomingList,
        ratios: { monthlyEmi, savingsRate, debtService, liquidityRatio },
        reminders
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setDataLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const netWorth = stats.totalAssets - stats.totalLiabilities
  const monthlySavings = stats.monthlyIncome - stats.monthlyExpenses

  // Show auth loading screen if authenticating or redirecting
  if (LoadingComponent) {
    return LoadingComponent
  }

  // Show data loading screen if loading dashboard data
  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-success-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-semibold text-2xl">₹</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-success-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // ... inside Dashboard component

  // ... (keep existing effects)

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Modal Overlay */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowBudgetModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Projected Expenses (2026) Breakdown
                    </h3>
                    <div className="mt-4 max-h-96 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {budgetBreakdown.map((item) => (
                            <tr key={item.category}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.total)}</td>
                            </tr>
                          ))}
                          <tr className="bg-gray-50 font-bold">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(stats.projectedAnnualExpense)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowBudgetModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ... (Welcome Header) */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
            Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-neutral-600">Here&apos;s an overview of your financial portfolio</p>
        </div>




        {/* Professional Financial Metrics */}
        {/* ... (Keep existing first row of cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* ... (Net Worth, Income, Expenses, Savings - NO CHANGES NEEDED HERE if not requested, but let's keep them clean) */}
          {/* Copying existing lines 370-425 roughly, assume user wants ME to rewrite the file section correctly. */}
          {/* Since I am using replace_file_content, I must be precise. I will target the specific card section below. */}
          <GlassCard>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Worth</p>
                <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netWorth >= 0 ? '+' : '-'}₹{Math.abs(netWorth).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Assets minus liabilities</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-gray-900">{`₹${stats.monthlyIncome.toLocaleString()}`}</p>
                <p className="text-sm text-gray-500">Current month</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingDownIcon className="h-8 w-8 text-rose-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                <p className="text-2xl font-bold text-gray-900">{`₹${stats.monthlyExpenses.toLocaleString()}`}</p>
                <p className="text-sm text-gray-500">Current month</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Savings</p>
                <p className={`text-2xl font-bold ${monthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {`₹${Math.abs(monthlySavings).toLocaleString()}`}
                </p>
                <p className="text-sm text-gray-500">Income - Expenses</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Second Row - Modified for Interactivity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/loans" className="block transition-transform hover:scale-[1.02]">
            <GlassCard className="h-full cursor-pointer hover:shadow-md transition-all">
              <div className="flex items-center">
                <BuildingLibraryIcon className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Outstanding Loans</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalLoanOutstanding)}
                  </p>
                  <p className="text-xs text-indigo-600 mt-1">Click to view details &rarr;</p>
                </div>
              </div>
            </GlassCard>
          </Link>

          <div onClick={() => setShowBudgetModal(true)} className="block transition-transform hover:scale-[1.02] cursor-pointer">
            <GlassCard className="h-full hover:shadow-md transition-all">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Projected Expenses (2026)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.projectedAnnualExpense)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">Click to view breakdown &rarr;</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* ... Rest of the component (Tables, Charts, etc.) */}

        {/* ... (Rest of existing content) */}
        {/* Legacy Partition Cards Removed by Request */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* ... (Ratios cards) keeping existing calls */}


          <GlassCard>
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ratios.savingsRate}%</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center">
              <BuildingLibraryIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Debt Service</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ratios.debtService}%</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center">
              <BanknotesIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Liquidity Ratio</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ratios.liquidityRatio}%</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Upcoming Payments Table */}
        <GlassCard>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming in 30 Days</h3>
            <p className="text-sm text-gray-500">Total: ₹{stats.upcoming.amount.toLocaleString()} ({stats.upcoming.count} items)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.upcomingList?.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map((item: any, idx: number) => {
                  const dueDate = new Date(item.dueDate)
                  const today = new Date()
                  const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.type === 'Card Statement' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                          {item.type || 'EMI'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.source}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-right text-gray-900">₹{item.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        <span className={`font-medium ${daysUntil <= 7 ? 'text-red-600' : daysUntil <= 14 ? 'text-orange-600' : 'text-gray-600'}`}>
                          {daysUntil} days
                        </span>
                      </td>
                    </tr>
                  )
                })}</tbody>
            </table>
          </div>
        </GlassCard>

        {/* ... (Charts section) */}
        {/* Skipping large existing chunks for brevity, handled by replace_file_content smartly usually, but here I am replacing the main BODY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Asset vs Liability Pie Chart */}
          <GlassCard>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Asset vs Liability Breakdown</h3>
            <div className="h-64 sm:h-72 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Assets', value: stats.totalAssets, fill: '#10B981' },
                      { name: 'Liabilities', value: stats.totalLiabilities, fill: '#EF4444' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#10B981" stroke="#ffffff" strokeWidth={3} />
                    <Cell fill="#EF4444" stroke="#ffffff" strokeWidth={3} />
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Monthly Income vs Expenses Bar Chart */}
          <GlassCard>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Monthly Financial Overview</h3>
            <div className="h-64 sm:h-72 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: 'This Month',
                      Income: stats.monthlyIncome,
                      Expenses: stats.monthlyExpenses,
                      Savings: monthlySavings > 0 ? monthlySavings : 0
                    }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#374151" fontSize={12} />
                  <YAxis stroke="#374151" fontSize={12} />
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="Income" fill="#10B981" stroke="#ffffff" strokeWidth={2} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#EF4444" stroke="#ffffff" strokeWidth={2} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Savings" fill="#3B82F6" stroke="#ffffff" strokeWidth={2} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
        {/* ... (3-Month Projection & Quick Actions) */}
        <GlassCard className="mb-8">
          {/* ... Projection cards ... */}
          <h3 className="text-xl font-semibold text-gray-900 mb-6">3-Month Projection</h3>
          {/* ... */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.projection.months.map((m, idx) => (
              <div key={m.label} className="rounded-lg border p-4">
                <p className="text-sm text-gray-600">{m.label}</p>
                <p className="text-lg font-bold text-rose-600">₹{m.outflows.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Projected outflows</p>
                {m.inflows ? (
                  <p className="text-sm mt-1 text-green-700">Inflows: <span className="font-semibold">₹{m.inflows.toLocaleString()}</span></p>
                ) : null}
                <p className="text-sm mt-2">Liquidity: <span className="font-semibold">₹{stats.projection.path.points[idx]?.toLocaleString() ?? '...'}</span></p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">Start Liquidity: ₹{stats.projection.startLiquidity.toLocaleString()}</p>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Quick Actions and Recent Transactions */}
          {/* ... Quick Actions */}
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </div>
              {/* ... Links ... */}
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/accounts"
                  className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {/* ... */}
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    <div className="icon-golden-card">
                      <BuildingLibraryIcon className="h-5 w-5 icon-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Accounts</p>
                    <p className="text-sm text-gray-500">(10)</p>
                  </div>
                </Link>
                <Link
                  href="/budget"
                  className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {/* ... */}
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    <div className="icon-golden-card">
                      <ChartBarIcon className="h-5 w-5 icon-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Budget</p>
                    <p className="text-sm text-gray-500">(12)</p>
                  </div>
                </Link>
                <Link
                  href="/goals"
                  className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {/* ... */}
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    <div className="icon-golden-card">
                      <TargetIcon className="h-5 w-5 icon-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Goals</p>
                    <p className="text-sm text-gray-500">(15)</p>
                  </div>
                </Link>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="icon-golden-card mr-2">
                    <ChartBarIcon className="h-5 w-5 icon-white" />
                  </div>
                  Recent Transactions
                </h3>
                <Link
                  href="/activity"
                  className="text-sm font-medium text-success-600 hover:text-success-700"
                >
                  View all
                </Link>
              </div>
              {/* ... List ... */}
              <div className="space-y-4">
                {stats.recentTransactions.length > 0 ? (
                  stats.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {transaction.description || 'Transaction'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.categories?.name} • {formatDate(transaction.date)}
                        </p>
                      </div>
                      <div className={`text-sm font-semibold px-2 py-1 rounded ${transaction.type === 'income' ? 'text-success-700 bg-success-100' : 'text-error-700 bg-error-100'}`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ChartBarIcon className="h-12 w-12 text-indigo-500 icon-indigo-shine mx-auto mb-4" />
                    <p className="text-gray-600">No transactions yet</p>
                    <p className="text-sm text-gray-500 mt-2">Start by adding your first transaction!</p>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Floating Action Button */}
        <Link
          href="/transactions/add"
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 z-50 group"
          aria-label="Add Transaction"
        >
          <PlusIcon className="h-7 w-7 group-hover:scale-110 transition-transform" />
        </Link>

      </div>
    </div>
  )
}
