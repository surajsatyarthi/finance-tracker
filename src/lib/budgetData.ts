// Real 2025 Budget Data extracted from CSV
// Updated budget with optimizations: Total ₹12,30,469 annually

export interface BudgetItem {
  category: string
  subcategory?: string
  monthly: number[]
  total: number
  type: 'fixed' | 'variable' | 'seasonal'
  priority: 'high' | 'medium' | 'low'
}

export interface MonthlyBudget {
  month: string
  year: number
  monthIndex: number
  categories: Record<string, number>
  total: number
}

// Main budget categories with subcategories
export const budgetCategories = {
  loan: {
    name: 'Loan',
    icon: '🏠',
    color: 'bg-red-100 text-red-800 border-red-200',
    subcategories: ['Education loan']
  },
  transport: {
    name: 'Transport',
    icon: '🚗', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    subcategories: ['Travel', 'Petrol', 'Bike Insurance', 'Car Insurance', 'Pollution Certificate']
  },
  data: {
    name: 'Data & Communications',
    icon: '📱',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200', 
    subcategories: ['Jio', 'Airtel', 'WiFi']
  },
  education: {
    name: 'Self Growth',
    icon: '📚',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    subcategories: ['Books']
  },
  food: {
    name: 'Food',
    icon: '🍽️',
    color: 'bg-green-100 text-green-800 border-green-200',
    subcategories: ['Eating out', 'Swiggy', 'Groceries', 'Dry fruits', 'Vegetables', 'Fruits', 'Snacks']
  },
  grooming: {
    name: 'Grooming',
    icon: '✂️',
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    subcategories: ['Haircut', 'Toiletries']
  },
  health: {
    name: 'Health',
    icon: '⚕️',
    color: 'bg-teal-100 text-teal-800 border-teal-200',
    subcategories: ['Fitness bootcamp', 'Chef', 'Yoga instructor', 'Supplements + Vitamins', 'Medicine']
  },
  clothing: {
    name: 'Clothing',
    icon: '👕',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    subcategories: ['Clothing']
  },
  insurance: {
    name: 'Insurance',
    icon: '🛡️',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    subcategories: ['Medical Insurance', 'Life Insurance']
  },
  subscriptions: {
    name: 'Subscriptions',
    icon: '💳',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    subcategories: ['Donation', 'Youtube', 'Google one', 'Grok', 'LinkedIn Premium']
  },
  creditCard: {
    name: 'Credit Cards',
    icon: '💎',
    color: 'bg-red-100 text-red-800 border-red-200',
    subcategories: ['Monthly Payments', 'EMI Payments']
  },
  miscellaneous: {
    name: 'Miscellaneous',
    icon: '💼',
    color: 'bg-slate-100 text-slate-800 border-slate-200',
    subcategories: ['Amazon Pay Recharge', 'Supplement', 'Shopping', 'Miscellaneous']
  }
}

// 2025 Monthly Budget Data
export const monthlyBudgets: MonthlyBudget[] = [
  {
    month: 'January 2025',
    year: 2025,
    monthIndex: 0,
    total: 156741,
    categories: {
      loan: 29361,
      transport: 7180,
      data: 9135,
      education: 2000,
      food: 14400,
      grooming: 1400,
      health: 20500,
      clothing: 3000,
      insurance: 40000,
      subscriptions: 4000,
      creditCard: 16265, // Monthly + EMI
      miscellaneous: 9500
    }
  },
  {
    month: 'February 2025',
    year: 2025,
    monthIndex: 1,
    total: 101429,
    categories: {
      loan: 29361,
      transport: 3000,
      data: 0,
      education: 2000,
      food: 14400,
      grooming: 1400,
      health: 20500,
      clothing: 3000,
      insurance: 0,
      subscriptions: 3300,
      creditCard: 14968,
      miscellaneous: 9500
    }
  },
  {
    month: 'March 2025',
    year: 2025,
    monthIndex: 2,
    total: 99829,
    categories: {
      loan: 29361,
      transport: 6000,
      data: 0,
      education: 2000,
      food: 14400,
      grooming: 1400,
      health: 20500,
      clothing: 3000,
      insurance: 0,
      subscriptions: 2000,
      creditCard: 11668,
      miscellaneous: 9500
    }
  },
  {
    month: 'April 2025',
    year: 2025,
    monthIndex: 3,
    total: 111609,
    categories: {
      loan: 29361,
      transport: 3000,
      data: 3537,
      education: 2000,
      food: 14400,
      grooming: 1400,
      health: 30500,
      clothing: 3000,
      insurance: 0,
      subscriptions: 4000,
      creditCard: 10911,
      miscellaneous: 9500
    }
  },
  {
    month: 'May 2025',
    year: 2025,
    monthIndex: 4,
    total: 108072,
    categories: {
      loan: 29361,
      transport: 3000,
      data: 0,
      education: 2000,
      food: 14400,
      grooming: 1400,
      health: 30500,
      clothing: 3000,
      insurance: 0,
      subscriptions: 2000,
      creditCard: 12911,
      miscellaneous: 9500
    }
  },
  {
    month: 'June 2025',
    year: 2025,
    monthIndex: 5,
    total: 96072,
    categories: {
      loan: 29361,
      transport: 3000,
      data: 0,
      education: 2000,
      food: 14400,
      grooming: 1400,
      health: 20500,
      clothing: 3000,
      insurance: 0,
      subscriptions: 2000,
      creditCard: 10911,
      miscellaneous: 9500
    }
  },
  {
    month: 'July 2025',
    year: 2025,
    monthIndex: 6,
    total: 98220,
    categories: {
      loan: 29361,
      transport: 3000,
      data: 3537,
      education: 2000,
      food: 14400,
      grooming: 1400,
      health: 20500,
      clothing: 3000,
      insurance: 0,
      subscriptions: 4000,
      creditCard: 7522,
      miscellaneous: 9500
    }
  },
  {
    month: 'August 2025',
    year: 2025,
    monthIndex: 7,
    total: 94683,
    categories: {
      loan: 29361,
      transport: 3000,
      data: 0,
      education: 2000,
      food: 14400,
      grooming: 1400,
      health: 20500,
      clothing: 3000,
      insurance: 0,
      subscriptions: 2000,
      creditCard: 9522,
      miscellaneous: 9500
    }
  },
  {
    month: 'September 2025',
    year: 2025,
    monthIndex: 8,
    total: 90153,
    categories: {
      loan: 29361,
      transport: 3000,
      data: 0,
      education: 2000,
      food: 14400,
      grooming: 1400,
      health: 20500,
      clothing: 3000,
      insurance: 0,
      subscriptions: 2000,
      creditCard: 4992,
      miscellaneous: 9500
    }
  },
  {
    month: 'October 2025',
    year: 2025,
    monthIndex: 9,
    total: 95690,
    categories: {
      loan: 29361,
      transport: 3000,
      data: 3537,
      education: 2000,
      food: 14400,
      grooming: 1400,
      health: 20500,
      clothing: 3000,
      insurance: 0,
      subscriptions: 4000,
      creditCard: 4992,
      miscellaneous: 9500
    }
  },
  {
    month: 'November 2025',
    year: 2025,
    monthIndex: 10,
    total: 90251,
    categories: {
      loan: 29361,
      transport: 3000,
      data: 0,
      education: 2000,
      food: 14400,
      grooming: 1400,
      health: 20500,
      clothing: 3000,
      insurance: 0,
      subscriptions: 2000,
      creditCard: 5090,
      miscellaneous: 9500
    }
  },
  {
    month: 'December 2025',
    year: 2025,
    monthIndex: 11,
    total: 87720,
    categories: {
      loan: 29361,
      transport: 3000,
      data: 0,
      education: 2000,
      food: 14400,
      grooming: 1400,
      health: 20500,
      clothing: 3000,
      insurance: 0,
      subscriptions: 2000,
      creditCard: 2559,
      miscellaneous: 9500
    }
  }
]

// Annual summary
export const annualBudgetSummary = {
  totalBudget: 1230469,
  averageMonthly: 102539,
  categoryTotals: {
    loan: 352332,
    transport: 43180,
    data: 19746,
    education: 24000,
    food: 172800,
    grooming: 16800,
    health: 266000,
    clothing: 36000,
    insurance: 40000,
    subscriptions: 33300,
    creditCard: 112311,
    miscellaneous: 114000
  },
  highestMonth: { month: 'January 2025', amount: 156741 },
  lowestMonth: { month: 'December 2025', amount: 87720 }
}

// Budget tracking utilities
export const getBudgetForMonth = (monthIndex: number): MonthlyBudget | null => {
  return monthlyBudgets.find(b => b.monthIndex === monthIndex) || null
}

export const getBudgetForCategory = (category: string, monthIndex: number): number => {
  const budget = getBudgetForMonth(monthIndex)
  return budget?.categories[category] || 0
}

export const getCurrentMonthBudget = (): MonthlyBudget => {
  const currentMonth = new Date().getMonth()
  return getBudgetForMonth(currentMonth) || monthlyBudgets[0]
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Budget vs actual calculation
export interface BudgetVsActual {
  category: string
  budgeted: number
  actual: number
  difference: number
  percentage: number
  status: 'under' | 'over' | 'on-track'
}

export const calculateBudgetVsActual = (
  budgetAmount: number, 
  actualAmount: number
): BudgetVsActual['status'] => {
  const percentage = actualAmount / budgetAmount
  if (percentage <= 0.8) return 'under'
  if (percentage >= 1.1) return 'over'
  return 'on-track'
}

export default {
  monthlyBudgets,
  budgetCategories,
  annualBudgetSummary,
  getBudgetForMonth,
  getBudgetForCategory,
  getCurrentMonthBudget,
  formatCurrency,
  calculateBudgetVsActual
}