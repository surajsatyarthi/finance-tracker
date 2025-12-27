import { supabase } from './supabase'
import { getExpenseTransactions } from './dataManager'
import { 
  getBudgetForMonth, 
  getBudgetForCategory, 
  calculateBudgetVsActual,
  formatCurrency,
  budgetCategories,
  type BudgetVsActual 
} from './budgetData'
import { getLocalBudget } from './dataManager'

export interface ExpenseData {
  id: string
  amount: number
  type: string
  description: string | null
  date: string
  payment_method: string
  category?: string
  subcategory?: string | null
  user_id?: string
  account_id?: string | null
  category_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface CategorySpending {
  category: string
  budgeted: number
  actual: number
  difference: number
  percentage: number
  status: 'under' | 'over' | 'on-track'
  transactions: ExpenseData[]
}

export interface MonthlyAnalysis {
  month: string
  monthIndex: number
  totalBudgeted: number
  totalActual: number
  totalDifference: number
  overallPercentage: number
  overallStatus: 'under' | 'over' | 'on-track'
  categories: CategorySpending[]
  alerts: BudgetAlert[]
}

export interface BudgetAlert {
  type: 'warning' | 'danger' | 'success'
  category: string
  message: string
  percentage: number
  amount: number
}

// Mapping transaction descriptions to budget categories
const categoryMapping: Record<string, string> = {
  // Loan
  'education loan': 'loan',
  'emi': 'loan',
  
  // Transport
  'petrol': 'transport',
  'fuel': 'transport',
  'uber': 'transport',
  'ola': 'transport',
  'auto': 'transport',
  'bus': 'transport',
  'train': 'transport',
  'bike': 'transport',
  'car': 'transport',
  'insurance': 'transport',
  
  // Data & Communications
  'jio': 'data',
  'airtel': 'data',
  'wifi': 'data',
  'internet': 'data',
  'mobile': 'data',
  
  // Food
  'food': 'food',
  'swiggy': 'food',
  'zomato': 'food',
  'grocery': 'food',
  'vegetables': 'food',
  'fruits': 'food',
  'restaurant': 'food',
  'eating': 'food',
  'snacks': 'food',
  'dry fruits': 'food',
  
  // Health
  'gym': 'health',
  'fitness': 'health',
  'yoga': 'health',
  'chef': 'health',
  'medicine': 'health',
  'hospital': 'health',
  'doctor': 'health',
  'supplements': 'health',
  'vitamins': 'health',
  
  // Grooming
  'haircut': 'grooming',
  'salon': 'grooming',
  'toiletries': 'grooming',
  'shampoo': 'grooming',
  
  // Clothing
  'clothing': 'clothing',
  'clothes': 'clothing',
  'shirt': 'clothing',
  'shoes': 'clothing',
  
  // Insurance
  'life insurance': 'insurance',
  'medical insurance': 'insurance',
  'health insurance': 'insurance',
  
  // Subscriptions
  'netflix': 'subscriptions',
  'amazon prime': 'subscriptions',
  'youtube': 'subscriptions',
  'spotify': 'subscriptions',
  'linkedin': 'subscriptions',
  'donation': 'subscriptions',
  
  // Credit Cards
  'credit card': 'creditCard',
  'cc payment': 'creditCard',
  'card payment': 'creditCard',
  
  // Education
  'books': 'education',
  'course': 'education',
  'learning': 'education',
  
  // Default
  'shopping': 'miscellaneous',
  'amazon': 'miscellaneous',
  'miscellaneous': 'miscellaneous'
}

// Categorize transaction based on description
export const categorizeTransaction = (description: string, paymentMethod: string): string => {
  const desc = description.toLowerCase()
  
  // Check for exact matches first
  for (const [keyword, category] of Object.entries(categoryMapping)) {
    if (desc.includes(keyword)) {
      return category
    }
  }
  
  // Check payment method for credit card transactions
  if (paymentMethod.toLowerCase().includes('credit') || paymentMethod.toLowerCase().includes('card')) {
    return 'creditCard'
  }
  
  // Default to miscellaneous
  return 'miscellaneous'
}

// Get actual expenses from Supabase for a specific month
export const getActualExpenses = async (monthIndex: number, year: number = 2025): Promise<ExpenseData[]> => {
  const localMode = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_LOCAL_MODE === 'true'
  const startDate = new Date(year, monthIndex, 1)
  const endDate = new Date(year, monthIndex + 1, 0)

  if (localMode) {
    try {
      const local = getExpenseTransactions()
      const filtered = local.filter((t) => {
        const d = new Date(t.date)
        return d >= startDate && d <= endDate
      })
      return filtered.map((t) => ({
        id: t.id,
        amount: t.amount,
        type: 'expense',
        description: t.description,
        date: t.date,
        payment_method: t.paymentMethod,
        category: t.category,
        subcategory: null,
        user_id: 'local',
        account_id: null,
        category_id: null,
        created_at: t.timestamp,
        updated_at: t.timestamp,
      }))
    } catch (e) {
      console.error('Local expense fetch failed:', e)
      return []
    }
  }

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('type', 'expense')
    .eq('user_id', '00000000-0000-0000-0000-000000000001')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])

  if (error) {
    console.error('Error fetching expenses:', error)
    return []
  }
  return transactions || []
}

// Analyze budget vs actual for a specific month
export const analyzeMonthlyBudget = async (monthIndex: number, year: number = 2025): Promise<MonthlyAnalysis> => {
  const base = getBudgetForMonth(monthIndex)
  const local = getLocalBudget(monthIndex, year)
  const budget = base && local ? { ...base, categories: local.categories, total: local.total } : base
  const actualExpenses = await getActualExpenses(monthIndex, year)
  
  if (!budget) {
    throw new Error(`No budget found for month ${monthIndex}`)
  }
  
  // Group actual expenses by category
  const actualByCategory: Record<string, ExpenseData[]> = {}
  actualExpenses.forEach(expense => {
    const category = categorizeTransaction(expense.description || '', expense.payment_method)
    if (!actualByCategory[category]) {
      actualByCategory[category] = []
    }
    actualByCategory[category].push(expense)
  })
  
  // Calculate totals by category
  const categoryAnalysis: CategorySpending[] = []
  const alerts: BudgetAlert[] = []
  
  let totalActual = 0
  
  for (const [categoryKey, budgetAmount] of Object.entries(budget.categories)) {
    const actualTransactions = actualByCategory[categoryKey] || []
    const actualAmount = actualTransactions.reduce((sum, t) => sum + t.amount, 0)
    const difference = actualAmount - budgetAmount
    const percentage = budgetAmount > 0 ? (actualAmount / budgetAmount) * 100 : 0
    const status = calculateBudgetVsActual(budgetAmount, actualAmount)
    
    totalActual += actualAmount
    
    categoryAnalysis.push({
      category: categoryKey,
      budgeted: budgetAmount,
      actual: actualAmount,
      difference,
      percentage,
      status,
      transactions: actualTransactions
    })
    
    // Generate alerts
    if (status === 'over' && percentage > 110) {
      alerts.push({
        type: 'danger',
        category: categoryKey,
        message: `${budgetCategories[categoryKey as keyof typeof budgetCategories]?.name || categoryKey} is ${percentage.toFixed(0)}% over budget`,
        percentage,
        amount: difference
      })
    } else if (status === 'over' && percentage > 100) {
      alerts.push({
        type: 'warning',
        category: categoryKey,
        message: `${budgetCategories[categoryKey as keyof typeof budgetCategories]?.name || categoryKey} is slightly over budget`,
        percentage,
        amount: difference
      })
    }
  }
  
  const totalDifference = totalActual - budget.total
  const overallPercentage = budget.total > 0 ? (totalActual / budget.total) * 100 : 0
  const overallStatus = calculateBudgetVsActual(budget.total, totalActual)
  
  // Add overall budget alert
  if (overallStatus === 'over') {
    alerts.unshift({
      type: overallPercentage > 120 ? 'danger' : 'warning',
      category: 'overall',
      message: `Total spending is ${overallPercentage.toFixed(0)}% of monthly budget`,
      percentage: overallPercentage,
      amount: totalDifference
    })
  }
  
  return {
    month: budget.month,
    monthIndex,
    totalBudgeted: budget.total,
    totalActual,
    totalDifference,
    overallPercentage,
    overallStatus,
    categories: categoryAnalysis.sort((a, b) => b.actual - a.actual), // Sort by actual spending
    alerts: alerts.sort((a, b) => b.percentage - a.percentage) // Sort by severity
  }
}

// Get current month analysis
export const getCurrentMonthAnalysis = async (): Promise<MonthlyAnalysis> => {
  const currentMonth = new Date().getMonth()
  return analyzeMonthlyBudget(currentMonth)
}

// Get year-to-date analysis
export const getYearToDateAnalysis = async (year: number = 2025) => {
  const currentMonth = new Date().getMonth()
  const analyses = []
  
  for (let i = 0; i <= currentMonth; i++) {
    try {
      const analysis = await analyzeMonthlyBudget(i, year)
      analyses.push(analysis)
    } catch (error) {
      console.error(`Error analyzing month ${i}:`, error)
    }
  }
  
  return analyses
}

// Calculate spending velocity (how fast you're spending compared to budget)
export const calculateSpendingVelocity = (
  actualAmount: number, 
  budgetAmount: number, 
  daysElapsed: number, 
  totalDaysInMonth: number
): number => {
  const expectedSpending = (budgetAmount / totalDaysInMonth) * daysElapsed
  return expectedSpending > 0 ? (actualAmount / expectedSpending) * 100 : 0
}

export default {
  categorizeTransaction,
  getActualExpenses,
  analyzeMonthlyBudget,
  getCurrentMonthAnalysis,
  getYearToDateAnalysis,
  calculateSpendingVelocity
}
