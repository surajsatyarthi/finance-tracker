// Database entity types matching the Supabase schema

export interface User {
  id: string
  email: string
  name?: string
  default_currency: string
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string // 'SBI', 'CBI', 'Cash', 'Jupiter'
  type: 'savings' | 'current' | 'wallet' | 'investment' | 'cash'
  balance: number
  currency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: 'income' | 'expense'
  parent_category_id?: string
  color?: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id?: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  category_id?: string
  subcategory?: string
  description?: string
  payment_method: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque'
  date: string
  month?: number
  year?: number
  is_recurring: boolean
  recurring_pattern?: RecurringPattern
  tags?: string[]
  created_at: string
  updated_at: string
  
  // Joined data
  category?: Category
  account?: Account
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number // every X days/weeks/months/years
  end_date?: string
  count?: number // or end after X occurrences
}

export interface CreditCard {
  id: string
  user_id: string
  name: string // 'SBI BPCL', 'SBI Paytm', 'SBI Simply save'
  bank?: string
  card_type?: string // 'VISA', 'MASTERCARD'
  last_four_digits?: string
  credit_limit?: number
  current_balance: number
  statement_date?: number // day of month (1-31)
  due_date?: number // day of month (1-31)
  annual_fee?: number
  cashback_rate?: number // percentage
  reward_points_rate?: number // points per 100 spent
  reward_point_value?: number // 1 RP = INR
  reward_points_expiry_months?: number
  partner_merchants?: string[]
  benefits?: CreditCardBenefits
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreditCardBenefits {
  national_airport_lounge?: boolean
  international_airport_lounge?: boolean
  railway_lounge?: boolean
  dining_discounts?: boolean
  fuel_surcharge_waiver?: boolean
  [key: string]: boolean | string | number | undefined
}

export interface CreditCardTransaction {
  id: string
  user_id: string
  credit_card_id: string
  amount: number
  type: 'purchase' | 'payment' | 'emi' | 'fee' | 'interest'
  description?: string
  transaction_date: string
  emi_months?: number
  emi_amount?: number
  emi_remaining?: number
  interest_rate?: number
  created_at: string
  
  // Joined data
  credit_card?: CreditCard
}

export interface Loan {
  id: string
  user_id: string
  name: string // 'Education loan', 'Car loan'
  type: 'education' | 'home' | 'personal' | 'auto' | 'credit_card'
  principal_amount: number
  current_balance: number
  interest_rate: number
  emi_amount: number
  total_emis: number
  emis_paid: number
  emis_remaining?: number
  start_date: string
  end_date?: string
  next_emi_date?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoanPayment {
  id: string
  user_id: string
  loan_id: string
  amount: number
  principal_amount: number
  interest_amount: number
  payment_date: string
  balance_after_payment: number
  created_at: string
  
  // Joined data
  loan?: Loan
}

export interface Goal {
  id: string
  user_id: string
  name: string // 'Bike overhaul', 'Car overhaul', 'Bike insurance'
  target_amount: number
  current_amount: number
  target_date?: string
  category?: string // 'vehicle', 'vacation', 'emergency'
  priority: 'high' | 'medium' | 'low'
  is_completed: boolean
  progress_percentage?: number
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id?: string
  category_name: string
  monthly_limit: number
  year: number
  month: number
  spent_amount: number
  remaining_amount?: number
  created_at: string
  updated_at: string
  
  // Joined data
  category?: Category
}

// API response types
export interface DashboardSummary {
  total_assets: number
  total_liabilities: number
  monthly_income: number
  monthly_expenses: number
  total_savings: number
  active_loans: number
  active_goals: number
  total_credit_card_balance: number
  budget_utilization: number
}

export interface MonthlyTrend {
  month: string
  income: number
  expenses: number
  savings: number
  budget_vs_actual: number
}

export interface CategoryWiseExpense {
  category: string
  amount: number
  budget: number
  percentage: number
  transactions_count: number
}

export interface GoalProgress {
  goal_id: string
  name: string
  target_amount: number
  current_amount: number
  progress_percentage: number
  days_remaining?: number
  monthly_required?: number
}

// Form input types
export interface TransactionInput {
  amount: number
  type: 'income' | 'expense' | 'transfer'
  category_id?: string
  subcategory?: string
  description?: string
  payment_method: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque'
  date: string
  account_id?: string
  is_recurring?: boolean
  recurring_pattern?: RecurringPattern
  tags?: string[]
}

export interface CreditCardInput {
  name: string
  bank?: string
  card_type?: string
  last_four_digits?: string
  credit_limit?: number
  statement_date?: number
  due_date?: number
  annual_fee?: number
  cashback_rate?: number
  reward_points_rate?: number
  reward_point_value?: number
  reward_points_expiry_months?: number
  partner_merchants?: string[]
  benefits?: CreditCardBenefits
}

export interface LoanInput {
  name: string
  type: 'education' | 'home' | 'personal' | 'auto' | 'credit_card'
  principal_amount: number
  interest_rate: number
  emi_amount: number
  total_emis: number
  start_date: string
  end_date?: string
  next_emi_date?: string
}

export interface GoalInput {
  name: string
  target_amount: number
  current_amount?: number
  target_date?: string
  category?: string
  priority: 'high' | 'medium' | 'low'
}

export interface AccountInput {
  name: string
  type: 'savings' | 'current' | 'wallet' | 'investment' | 'cash'
  balance: number
  currency?: string
}

export interface BudgetInput {
  category_id?: string
  category_name: string
  monthly_limit: number
  year: number
  month: number
}

// Filter and search types
export interface TransactionFilter {
  date_from?: string
  date_to?: string
  category_id?: string
  type?: 'income' | 'expense' | 'transfer'
  payment_method?: string
  amount_min?: number
  amount_max?: number
  tags?: string[]
}

export interface ReportFilter {
  year?: number
  month?: number
  category?: string
  account_id?: string
  period: 'monthly' | 'quarterly' | 'yearly'
}

// Chart data types
export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface TrendData {
  date: string
  income: number
  expenses: number
  savings: number
}

// Excel/CSV import types
export interface ExcelImportData {
  transactions: Partial<Transaction>[]
  accounts: Partial<Account>[]
  credit_cards: Partial<CreditCard>[]
  loans: Partial<Loan>[]
  goals: Partial<Goal>[]
}

export interface ImportResult {
  success: number
  errors: number
  details: string[]
}

// Common types
export type SortDirection = 'asc' | 'desc'
export type Currency = 'INR' | 'USD' | 'EUR'

export interface PaginationParams {
  page: number
  per_page: number
  sort_by?: string
  sort_direction?: SortDirection
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}