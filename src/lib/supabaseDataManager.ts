// Enterprise-Grade Supabase Data Manager
// Commercial-grade finance tracker with proper error handling, validation, and logging

import { supabase } from './supabase'
import { Database } from '../types/database.types'

// Type definitions
type Tables = Database['public']['Tables']
type Account = Tables['accounts']['Row']
type Transaction = Tables['transactions']['Row']
type CreditCard = Tables['credit_cards']['Row']
type Goal = Tables['goals']['Row']
type Budget = Tables['budgets']['Row']
type Loan = Tables['loans']['Row']

// Enhanced interfaces for application use
export interface EnhancedAccount extends Omit<Account, 'created_at' | 'updated_at'> {
  created_at: string
  updated_at: string
  display_balance: string
  last_transaction_date?: string
}

export interface EnhancedTransaction extends Omit<Transaction, 'created_at' | 'updated_at'> {
  created_at: string
  updated_at: string
  formatted_amount: string
  account_name?: string
  category_name?: string
}

// Error handling class
export class FinanceDataError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'FinanceDataError'
  }
}

// Logging utility
class Logger {
  private static instance: Logger
  private logs: Array<{
    timestamp: string
    level: 'info' | 'warn' | 'error'
    message: string
    data?: unknown
  }> = []

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  info(message: string, data?: unknown) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: 'info' as const,
      message,
      data
    }
    this.logs.push(entry)
    console.log(`[INFO] ${message}`, data)
  }

  warn(message: string, data?: unknown) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: 'warn' as const,
      message,
      data
    }
    this.logs.push(entry)
    console.warn(`[WARN] ${message}`, data)
  }

  error(message: string, data?: unknown) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: 'error' as const,
      message,
      data
    }
    this.logs.push(entry)
    console.error(`[ERROR] ${message}`, data)
  }

  getLogs() {
    return this.logs
  }

  exportLogs() {
    return JSON.stringify(this.logs, null, 2)
  }
}

const logger = Logger.getInstance()

// Validation utilities
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  amount: (amount: number): boolean => {
    return typeof amount === 'number' && amount >= 0 && !isNaN(amount)
  },

  currency: (currency: string): boolean => {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD']
    return validCurrencies.includes(currency)
  },

  accountType: (type: string): boolean => {
    const validTypes = ['savings', 'current', 'credit', 'investment', 'cash']
    return validTypes.includes(type)
  },

  transactionType: (type: string): boolean => {
    const validTypes = ['income', 'expense', 'transfer']
    return validTypes.includes(type)
  }
}

// Data sanitization
export const sanitizers = {
  amount: (amount: number): number => {
    return Math.round(amount * 100) / 100 // Round to 2 decimal places
  },

  string: (str: string): string => {
    return str.trim().replace(/[<>]/g, '') // Basic XSS prevention
  },

  description: (desc: string): string => {
    return sanitizers.string(desc).substring(0, 500) // Max 500 chars
  }
}

// Enterprise-grade data operations
export class FinanceDataManager {
  private static instance: FinanceDataManager
  private userId: string | null = null

  static getInstance(): FinanceDataManager {
    if (!FinanceDataManager.instance) {
      FinanceDataManager.instance = new FinanceDataManager()
    }
    return FinanceDataManager.instance
  }

  // Initialize with user context
  async initialize(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user is logged in via our mock auth system
      const isLoggedIn = localStorage.getItem('finance-tracker-logged-in')
      const userEmail = localStorage.getItem('finance-tracker-user-email')
      
      if (isLoggedIn !== 'true' || !userEmail) {
        throw new FinanceDataError('User not authenticated', 'AUTH_ERROR', { 
          message: 'Please log in to the finance tracker first' 
        })
      }

      // For single-user mode, use a consistent UUID
      this.userId = '00000000-0000-0000-0000-000000000001'
      
      // Test Supabase connection
      try {
        const { data, error } = await supabase
          .from('accounts')
          .select('count')
          .limit(1)
          .single()
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          logger.warn('Supabase connection test failed', error)
        }
      } catch (connectionError) {
        logger.warn('Could not test Supabase connection', connectionError)
      }
      
      logger.info('Finance Data Manager initialized', { 
        userId: this.userId,
        userEmail: userEmail
      })
      return { success: true }
    } catch (error) {
      logger.error('Failed to initialize Finance Data Manager', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown initialization error' 
      }
    }
  }

  // Account operations
  async createAccount(accountData: {
    name: string
    type: string
    balance: number
    currency?: string
  }): Promise<{ data: EnhancedAccount | null; error: string | null }> {
    try {
      if (!this.userId) {
        throw new FinanceDataError('User not initialized', 'USER_NOT_INITIALIZED')
      }

      // Validate input
      if (!accountData.name || !validators.accountType(accountData.type)) {
        throw new FinanceDataError('Invalid account data', 'VALIDATION_ERROR')
      }

      if (!validators.amount(accountData.balance)) {
        throw new FinanceDataError('Invalid account balance', 'VALIDATION_ERROR')
      }

      const sanitizedData = {
        user_id: this.userId,
        name: sanitizers.string(accountData.name),
        type: accountData.type,
        balance: sanitizers.amount(accountData.balance),
        currency: accountData.currency || 'INR',
        is_active: true
      }

      const { data, error } = await supabase
        .from('accounts')
        .insert(sanitizedData)
        .select()
        .single()

      if (error) {
        throw new FinanceDataError('Failed to create account', 'DATABASE_ERROR', { error })
      }

      logger.info('Account created successfully', { accountId: data.id, name: data.name })

      return {
        data: {
          ...data,
          display_balance: `${data.currency} ${data.balance.toLocaleString()}`
        },
        error: null
      }
    } catch (error) {
      const message = error instanceof FinanceDataError ? error.message : 'Unknown error creating account'
      logger.error(message, error)
      return { data: null, error: message }
    }
  }

  async getAccounts(): Promise<{ data: EnhancedAccount[]; error: string | null }> {
    try {
      if (!this.userId) {
        throw new FinanceDataError('User not initialized', 'USER_NOT_INITIALIZED')
      }

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', this.userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        throw new FinanceDataError('Failed to fetch accounts', 'DATABASE_ERROR', { error })
      }

      const enhancedAccounts: EnhancedAccount[] = data.map(account => ({
        ...account,
        display_balance: `${account.currency} ${account.balance.toLocaleString()}`
      }))

      return { data: enhancedAccounts, error: null }
    } catch (error) {
      const message = error instanceof FinanceDataError ? error.message : 'Unknown error fetching accounts'
      logger.error(message, error)
      return { data: [], error: message }
    }
  }

  async updateAccountBalance(
    accountId: string, 
    newBalance: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.userId) {
        throw new FinanceDataError('User not initialized', 'USER_NOT_INITIALIZED')
      }

      if (!validators.amount(newBalance)) {
        throw new FinanceDataError('Invalid balance amount', 'VALIDATION_ERROR')
      }

      const { error } = await supabase
        .from('accounts')
        .update({ 
          balance: sanitizers.amount(newBalance),
          updated_at: new Date().toISOString()
        })
        .eq('id', accountId)
        .eq('user_id', this.userId)

      if (error) {
        throw new FinanceDataError('Failed to update account balance', 'DATABASE_ERROR', { error })
      }

      logger.info('Account balance updated', { accountId, newBalance })
      return { success: true }
    } catch (error) {
      const message = error instanceof FinanceDataError ? error.message : 'Unknown error updating balance'
      logger.error(message, error)
      return { success: false, error: message }
    }
  }

  // Transaction operations
  async createTransaction(transactionData: {
    account_id?: string
    amount: number
    type: string
    description?: string
    payment_method: string
    date: string
    category_id?: string
    subcategory?: string
  }): Promise<{ data: EnhancedTransaction | null; error: string | null }> {
    try {
      if (!this.userId) {
        throw new FinanceDataError('User not initialized', 'USER_NOT_INITIALIZED')
      }

      // Validate input
      if (!validators.amount(transactionData.amount) || !validators.transactionType(transactionData.type)) {
        throw new FinanceDataError('Invalid transaction data', 'VALIDATION_ERROR')
      }

      const sanitizedData = {
        user_id: this.userId,
        account_id: transactionData.account_id || null,
        amount: sanitizers.amount(transactionData.amount),
        type: transactionData.type,
        description: transactionData.description ? sanitizers.description(transactionData.description) : null,
        payment_method: transactionData.payment_method,
        date: transactionData.date,
        category_id: transactionData.category_id || null,
        subcategory: transactionData.subcategory || null,
        month: new Date(transactionData.date).getMonth() + 1,
        year: new Date(transactionData.date).getFullYear(),
        is_recurring: false
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert(sanitizedData)
        .select()
        .single()

      if (error) {
        throw new FinanceDataError('Failed to create transaction', 'DATABASE_ERROR', { error })
      }

      // Update account balance if account specified
      if (transactionData.account_id) {
        const balanceChange = transactionData.type === 'income' ? 
          transactionData.amount : -transactionData.amount

        await this.updateAccountBalanceFromTransaction(transactionData.account_id, balanceChange)
      }

      logger.info('Transaction created successfully', { transactionId: data.id, amount: data.amount })

      return {
        data: {
          ...data,
          formatted_amount: `₹${data.amount.toLocaleString()}`
        },
        error: null
      }
    } catch (error) {
      const message = error instanceof FinanceDataError ? error.message : 'Unknown error creating transaction'
      logger.error(message, error)
      return { data: null, error: message }
    }
  }

  private async updateAccountBalanceFromTransaction(
    accountId: string, 
    balanceChange: number
  ): Promise<void> {
    const { data: account } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .single()

    if (account) {
      const newBalance = account.balance + balanceChange
      await this.updateAccountBalance(accountId, Math.max(0, newBalance))
    }
  }

  async getTransactions(
    filters?: {
      account_id?: string
      type?: string
      start_date?: string
      end_date?: string
      limit?: number
    }
  ): Promise<{ data: EnhancedTransaction[]; error: string | null }> {
    try {
      if (!this.userId) {
        throw new FinanceDataError('User not initialized', 'USER_NOT_INITIALIZED')
      }

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', this.userId)

      if (filters?.account_id) query = query.eq('account_id', filters.account_id)
      if (filters?.type) query = query.eq('type', filters.type)
      if (filters?.start_date) query = query.gte('date', filters.start_date)
      if (filters?.end_date) query = query.lte('date', filters.end_date)

      query = query
        .order('date', { ascending: false })
        .limit(filters?.limit || 100)

      const { data, error } = await query

      if (error) {
        throw new FinanceDataError('Failed to fetch transactions', 'DATABASE_ERROR', { error })
      }

      const enhancedTransactions: EnhancedTransaction[] = data.map(transaction => ({
        ...transaction,
        formatted_amount: `₹${transaction.amount.toLocaleString()}`
      }))

      return { data: enhancedTransactions, error: null }
    } catch (error) {
      const message = error instanceof FinanceDataError ? error.message : 'Unknown error fetching transactions'
      logger.error(message, error)
      return { data: [], error: message }
    }
  }

  // Data migration utilities
  async migrateFromLocalStorage(): Promise<{ success: boolean; migrated: number; error?: string }> {
    try {
      let totalMigrated = 0
      const migrationLog: string[] = []

      logger.info('Starting localStorage migration...')
      
      // Check what data exists in localStorage
      const bankAccounts = localStorage.getItem('bank_accounts')
      const cashBalance = localStorage.getItem('cash_balance')
      const incomeTransactions = localStorage.getItem('income_transactions')
      const expenseTransactions = localStorage.getItem('expense_transactions')
      
      migrationLog.push(`Found localStorage items:`)  
      migrationLog.push(`- bank_accounts: ${bankAccounts ? 'YES' : 'NO'}`)
      migrationLog.push(`- cash_balance: ${cashBalance ? 'YES' : 'NO'}`)
      migrationLog.push(`- income_transactions: ${incomeTransactions ? 'YES' : 'NO'}`)
      migrationLog.push(`- expense_transactions: ${expenseTransactions ? 'YES' : 'NO'}`)
      
      console.log('Migration audit:', migrationLog.join('\n'))

      // Migrate bank accounts
      if (bankAccounts) {
        try {
          const accounts = JSON.parse(bankAccounts)
          migrationLog.push(`Migrating ${accounts.length} bank accounts...`)
          
          for (const account of accounts) {
            logger.info('Migrating bank account', account)
            const result = await this.createAccount({
              name: sanitizers.string(account.name),
              type: account.type === 'savings' || account.type === 'current' || account.type === 'salary' ? account.type : 'savings',
              balance: sanitizers.amount(account.balance)
            })
            
            if (result.data) {
              totalMigrated++
              migrationLog.push(`✅ Migrated account: ${account.name}`)
            } else {
              migrationLog.push(`❌ Failed to migrate account: ${account.name} - ${result.error}`)
            }
          }
        } catch (error) {
          migrationLog.push(`❌ Error parsing bank accounts: ${error}`)
        }
      }

      // Migrate cash balance as an account
      if (cashBalance && parseFloat(cashBalance) > 0) {
        try {
          const balance = parseFloat(cashBalance)
          migrationLog.push(`Migrating cash balance: ₹${balance}...`)
          
          const result = await this.createAccount({
            name: 'Cash',
            type: 'cash',
            balance: sanitizers.amount(balance)
          })
          
          if (result.data) {
            totalMigrated++
            migrationLog.push(`✅ Migrated cash balance: ₹${balance}`)
          } else {
            migrationLog.push(`❌ Failed to migrate cash balance: ${result.error}`)
          }
        } catch (error) {
          migrationLog.push(`❌ Error migrating cash balance: ${error}`)
        }
      }

      // Migrate income transactions
      if (incomeTransactions) {
        try {
          const transactions = JSON.parse(incomeTransactions)
          migrationLog.push(`Migrating ${transactions.length} income transactions...`)
          
          for (const transaction of transactions) {
            logger.info('Migrating income transaction', transaction)
            
            // First, we need to create a default account or use existing cash account
            const result = await this.createTransaction({
              amount: sanitizers.amount(transaction.amount),
              type: 'income',
              description: sanitizers.description(transaction.description || 'Income'),
              payment_method: transaction.type === 'cash' ? 'cash' : 'bank_transfer',
              date: transaction.date,
              subcategory: sanitizers.string(transaction.category || 'General')
            })
            
            if (result.data) {
              totalMigrated++
              migrationLog.push(`✅ Migrated income: ₹${transaction.amount}`)
            } else {
              migrationLog.push(`❌ Failed income transaction: ${result.error}`)
            }
          }
        } catch (error) {
          migrationLog.push(`❌ Error parsing income transactions: ${error}`)
        }
      }

      // Migrate expense transactions
      if (expenseTransactions) {
        try {
          const transactions = JSON.parse(expenseTransactions)
          migrationLog.push(`Migrating ${transactions.length} expense transactions...`)
          
          for (const transaction of transactions) {
            logger.info('Migrating expense transaction', transaction)
            
            const result = await this.createTransaction({
              amount: sanitizers.amount(transaction.amount),
              type: 'expense',
              description: sanitizers.description(transaction.description || 'Expense'),
              payment_method: this.mapPaymentMethod(transaction.paymentMethod),
              date: transaction.date,
              subcategory: sanitizers.string(transaction.category || 'General')
            })
            
            if (result.data) {
              totalMigrated++
              migrationLog.push(`✅ Migrated expense: ₹${transaction.amount}`)
            } else {
              migrationLog.push(`❌ Failed expense transaction: ${result.error}`)
            }
          }
        } catch (error) {
          migrationLog.push(`❌ Error parsing expense transactions: ${error}`)
        }
      }

      migrationLog.push(`Migration completed: ${totalMigrated} items migrated`)
      console.log('Final migration log:', migrationLog.join('\n'))
      
      logger.info('Local storage migration completed', { 
        totalMigrated, 
        migrationLog: migrationLog.slice(-5) // Last 5 log entries
      })
      
      return { success: true, migrated: totalMigrated }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Migration failed'
      logger.error('Migration error', error)
      return { success: false, migrated: 0, error: message }
    }
  }
  
  // Helper method to map old payment methods to new ones
  private mapPaymentMethod(oldMethod: string): string {
    const methodMap: Record<string, string> = {
      'cash': 'cash',
      'upi': 'bank_transfer',
      'credit_card': 'credit_card',
      'credit_card_emi': 'credit_card',
      'bnpl': 'bnpl'
    }
    
    return methodMap[oldMethod] || 'cash'
  }

  // Health check and diagnostics
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: Record<string, boolean>
    message?: string
  }> {
    const checks: Record<string, boolean> = {}

    try {
      // Check database connection
      const { error: dbError } = await supabase.from('users').select('count').limit(1)
      checks.database = !dbError

      // Check authentication
      const { error: authError } = await supabase.auth.getUser()
      checks.authentication = !authError

      // Check user initialization
      checks.userInitialized = this.userId !== null

      const healthyChecks = Object.values(checks).filter(check => check).length
      const totalChecks = Object.keys(checks).length

      if (healthyChecks === totalChecks) {
        return { status: 'healthy', checks }
      } else if (healthyChecks > 0) {
        return { status: 'degraded', checks, message: 'Some systems are not functioning properly' }
      } else {
        return { status: 'unhealthy', checks, message: 'Critical systems are down' }
      }
    } catch (error) {
      return { 
        status: 'unhealthy', 
        checks, 
        message: 'Health check failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      }
    }
  }
}

// Export singleton instance
export const financeManager = FinanceDataManager.getInstance()

// Export utility functions
export { Logger }