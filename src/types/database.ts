/**
 * Centralized Type Definitions for Finance Tracker
 * 
 * This file provides clean, application-level type definitions that build on top of
 * the auto-generated Supabase database types.
 * 
 * Type Generation:
 * - Database types are auto-generated from Supabase schema
 * - Run: `npx supabase gen types typescript --project-id zzwouesueadoqrlmteyh > src/lib/database.types.ts`
 * - Application types extend database types for frontend use
 */

import { Database } from '@/lib/database.types'

// ============================================================================
// Database Table Types (Direct from Supabase)
// ============================================================================

export type DbAccount = Database['public']['Tables']['accounts']['Row']
export type DbTransaction = Database['public']['Tables']['transactions']['Row']
export type DbCreditCard = Database['public']['Tables']['credit_cards']['Row']
export type DbLoan = Database['public']['Tables']['loans']['Row']
export type DbGoal = Database['public']['Tables']['goals']['Row']
export type DbBudget = Database['public']['Tables']['budgets']['Row']
export type DbCategory = Database['public']['Tables']['categories']['Row']
export type DbInvestment = Database['public']['Tables']['investments']['Row']
export type DbPayLaterService = Database['public']['Tables']['pay_later_services']['Row']

// Insert types for creating new records
export type DbAccountInsert = Database['public']['Tables']['accounts']['Insert']
export type DbTransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type DbCreditCardInsert = Database['public']['Tables']['credit_cards']['Insert']
export type DbLoanInsert = Database['public']['Tables']['loans']['Insert']

// ============================================================================
// Application Types (Extended/Transformed for Frontend)
// ============================================================================

/**
 * Bank Account with computed fields
 */
export interface BankAccount extends DbAccount {
  // Add any computed or derived fields here
  displayBalance?: string
  isOverdrawn?: boolean
}

/**
 * Transaction with enhanced metadata
 */
export interface Transaction extends DbTransaction {
  // Computed fields
  formattedDate?: string
  categoryName?: string
  accountName?: string
}

/**
 * Enhanced transaction for specific use cases
 */
export interface EnhancedTransaction extends Transaction {
  category_name?: string
  account_name?: string
}

/**
 * Credit Card with computed limits and usage
 */
export interface CreditCard extends DbCreditCard {
  utilization_percentage?: number
  available_credit?: number
  display_last_four?: string
}

/**
 * Loan with amortization details
 */
export interface Loan extends DbLoan {
  monthly_payment?: number
  total_paid?: number
  total_interest?: number
  progress_percentage?: number
}

/**
 * Goal with progress tracking
 */
export interface Goal extends DbGoal {
  days_remaining?: number
  monthly_target?: number
  on_track?: boolean
}

/**
 * Budget with spending analysis
 */
export interface Budget extends DbBudget {
  spent_percentage?: number
  is_over_budget?: boolean
  days_left_in_month?: number
}

/**
 * Category with transaction counts
 */
export interface Category extends DbCategory {
  transaction_count?: number
  total_amount?: number
}

// ============================================================================
// Input Types (for Forms and API calls)
// ============================================================================

export interface TransactionInput {
  amount: number
  type: 'income' | 'expense' | 'transfer'
  description?: string
  date: string
  category_id?: string
  subcategory?: string
  payment_method?: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque'
  account_id?: string
  is_recurring?: boolean
}

export interface AccountInput {
  name: string
  type: 'savings' | 'current' | 'wallet' | 'investment' | 'cash'
  balance?: number
  currency?: string
  account_number?: string
  ifsc_code?: string
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
}

export interface LoanInput {
  name: string
  type?: 'education' | 'home' | 'personal' | 'auto' | 'credit_card'
  principal_amount: number
  interest_rate: number
  emi_amount: number
  total_emis: number
  start_date: string
  credit_card_id?: string
}

export interface GoalInput {
  name: string
  target_amount: number
  current_amount?: number
  target_date?: string
  category?: string
  priority?: 'high' | 'medium' | 'low'
}

export interface BudgetInput {
  category_id: string
  category_name: string
  monthly_limit: number
  year: number
  month: number
}

// ============================================================================
// Dashboard & Analytics Types
// ============================================================================

export interface LiquidityData {
  totalLiquidity: number
  totalCash: number
  bankAccounts: BankAccount[]
  lastUpdated: string
}

export interface FuturePayable {
  id: string
  description: string
  amount: number
  dueDate: string
  type: 'emi' | 'bill' | 'card_payment' | 'investment'
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'paid' | 'overdue'
}

export interface DashboardStats {
  totalLiquidity: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number
  activeLoan: number
  creditCardDebt: number
  totalInvestments: number
}

export interface BudgetProjection {
  category: string
  allocated: number
  spent: number
  remaining: number
  percentage: number
}

export interface BudgetAlert {
  category: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  percentage: number
}

// ============================================================================
// Filter & Query Types
// ============================================================================

export interface TransactionFilter {
  type?: 'income' | 'expense' | 'transfer'
  category_id?: string
  account_id?: string
  start_date?: string
  end_date?: string
  min_amount?: number
  max_amount?: number
  payment_method?: string
  search?: string
}

export interface DateRange {
  start: string
  end: string
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}

// ============================================================================
// Utility Types
// ============================================================================

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque'
export type TransactionType = 'income' | 'expense' | 'transfer'
export type AccountType = 'savings' | 'current' | 'wallet' | 'investment' | 'cash'
export type LoanType = 'education' | 'home' | 'personal' | 'auto' | 'credit_card'
export type Priority = 'high' | 'medium' | 'low'

/**
 * Helper to make certain fields required
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

/**
 * Helper to make all fields partial
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
