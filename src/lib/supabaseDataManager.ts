// Enterprise-Grade Supabase Data Manager
// Commercial-grade finance tracker with proper error handling, validation, and logging

import { supabase } from './supabase'
import { Database } from '../types/database.types'

// Type definitions
type Tables = Database['public']['Tables']
type Account = Tables['accounts']['Row']
type Transaction = Tables['transactions']['Row']
type CreditCard = Tables['credit_cards']['Row'] & { current_balance: number; credit_limit: number; due_date: number | null }
type Goal = Tables['goals']['Row']
type Loan = Tables['loans']['Row']
type LoanPayment = Tables['loan_payments']['Row']

// --- Interfaces matching dataManager.ts for compatibility ---

export interface BankAccount {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  lastUpdated: string
}

export interface LiquidityData {
  cashBalance: number
  bankAccounts: BankAccount[]
  totalLiquidity: number
  lastUpdated: string
}

export interface FuturePayable {
  id: string
  type: 'credit_card' | 'emi' | 'bnpl'
  amount: number
  dueDate: string
  description: string
  source: string
  originalTransactionId: string
  status: 'pending' | 'paid'
  timestamp: string
}

export interface EnhancedTransaction extends Omit<Transaction, 'created_at' | 'updated_at'> {
  created_at: string
  updated_at: string
  formatted_amount: string
  account_name?: string
  category_name?: string
}

export class FinanceDataError extends Error {
  constructor(message: string, public code: string, public context?: Record<string, unknown>) {
    super(message)
    this.name = 'FinanceDataError'
  }
}

class Logger {
  private static instance: Logger
  private logs: Array<{ timestamp: string; level: 'info' | 'warn' | 'error'; message: string; data?: unknown }> = []

  static getInstance(): Logger {
    if (!Logger.instance) Logger.instance = new Logger()
    return Logger.instance
  }

  info(message: string, data?: unknown) {
    console.log(`[INFO] ${message}`, data)
    this.logs.push({ timestamp: new Date().toISOString(), level: 'info', message, data })
  }
  warn(message: string, data?: unknown) {
    console.warn(`[WARN] ${message}`, data)
    this.logs.push({ timestamp: new Date().toISOString(), level: 'warn', message, data })
  }
  error(message: string, data?: unknown) {
    console.error(`[ERROR] ${message}`, data)
    this.logs.push({ timestamp: new Date().toISOString(), level: 'error', message, data })
  }
}
const logger = Logger.getInstance()

export const validators = {
  email: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  amount: (amount: number) => typeof amount === 'number' && amount >= 0 && !isNaN(amount),
}

export const sanitizers = {
  amount: (amount: number) => Math.round(amount * 100) / 100,
  string: (str: string) => str.trim().replace(/[<>]/g, ''),
  description: (desc: string) => sanitizers.string(desc).substring(0, 500)
}

export class FinanceDataManager {
  private static instance: FinanceDataManager
  private userId: string | null = null

  static getInstance(): FinanceDataManager {
    if (!FinanceDataManager.instance) FinanceDataManager.instance = new FinanceDataManager()
    return FinanceDataManager.instance
  }

  async initialize(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        this.userId = user.id
        logger.info('Finance Data Manager initialized', { userId: this.userId })
        return { success: true }
      }

      // Fallback for development/testing if enabled
      logger.warn('No authenticated user found for Finance Manager')
      return { success: false, error: 'User not authenticated' }
    } catch (error) {
      logger.error('Failed to initialize Finance Data Manager', error)
      return { success: false, error: 'Initialization error' }
    }
  }

  // --- Account & Liquidity Operations ---

  async getLiquidityData(): Promise<LiquidityData> {
    try {
      if (!this.userId) await this.initialize()
      if (!this.userId) throw new Error('User not initialized')

      const { data: accounts, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', this.userId)
        .eq('is_active', true)

      if (error) throw error

      let cashBalance = 0
      const bankAccounts: BankAccount[] = []

      accounts.forEach(acc => {
        if (acc.type === 'cash') {
          cashBalance += acc.balance
        } else {
          bankAccounts.push({
            id: acc.id,
            name: acc.name,
            type: acc.type || 'savings',
            balance: acc.balance,
            currency: acc.currency || 'INR',
            lastUpdated: acc.updated_at
          })
        }
      })

      const totalLiquidity = cashBalance + bankAccounts.reduce((sum, acc) => sum + acc.balance, 0)

      return {
        cashBalance,
        bankAccounts,
        totalLiquidity,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Error fetching liquidity data', error)
      return { cashBalance: 0, bankAccounts: [], totalLiquidity: 0, lastUpdated: new Date().toISOString() }
    }
  }

  async getAccounts(): Promise<BankAccount[]> {
    const data = await this.getLiquidityData()
    return data.bankAccounts
  }

  async storeAccount(account: Omit<BankAccount, 'id' | 'lastUpdated'>) {
    if (!this.userId) await this.initialize()
    if (!this.userId) throw new Error('User not initialized')

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: this.userId,
        name: account.name,
        type: account.type,
        balance: account.balance,
        currency: account.currency,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // --- Transactions ---

  async getTransactions(limit = 100): Promise<EnhancedTransaction[]> {
    if (!this.userId) await this.initialize()
    if (!this.userId) return []

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', this.userId)
      .order('date', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Error fetching transactions', error)
      return []
    }

    return data.map(t => ({
      ...t,
      formatted_amount: `₹${t.amount}`,
      created_at: t.created_at,
      updated_at: t.updated_at
    }))
  }

  async createTransaction(tx: { amount: number; type: string; description: string; date: string; category?: string; payment_method: string; account_id?: string }) {
    if (!this.userId) await this.initialize()

    const { data, error } = await supabase.from('transactions').insert({
      user_id: this.userId!,
      amount: tx.amount,
      type: tx.type,
      description: tx.description,
      date: tx.date,
      payment_method: tx.payment_method,
      account_id: tx.account_id || null,
      category_id: null, // needs resolution
      subcategory: tx.category || null,
      is_recurring: false
    }).select().single()

    if (error) throw error

    // Update account balance
    if (tx.account_id) {
      // Logic to update account balance
      const rpcMethod = tx.type === 'income' ? 'increment_balance' : 'decrement_balance'
      // For now, simpler read-update
      const { data: acc } = await supabase.from('accounts').select('balance').eq('id', tx.account_id).single()
      if (acc) {
        const newBal = tx.type === 'income' ? acc.balance + tx.amount : acc.balance - tx.amount
        await supabase.from('accounts').update({ balance: newBal }).eq('id', tx.account_id)
      }
    }
    return data
  }

  async getTransactionsByDateRange(startDate: string, endDate: string) {
    if (!this.userId) await this.initialize()
    if (!this.userId) return []

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', this.userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) {
      logger.error('Error fetching transactions by range', error)
      return []
    }
    return data
  }

  async getIncomeTransactions() {
    if (!this.userId) await this.initialize()
    const { data } = await supabase.from('transactions').select('*').eq('user_id', this.userId!).eq('type', 'income').order('date', { ascending: false })
    return data || []
  }

  async getExpenseTransactions() {
    if (!this.userId) await this.initialize()
    const { data } = await supabase.from('transactions').select('*').eq('user_id', this.userId!).eq('type', 'expense').order('date', { ascending: false })
    return data || []
  }

  // --- Credit Cards ---

  async getCreditCards(): Promise<any[]> {
    if (!this.userId) await this.initialize()
    const { data, error } = await supabase.from('credit_cards').select('*').eq('user_id', this.userId!).eq('is_active', true)

    if (error) return []

    return data.map(c => ({
      id: c.id,
      name: c.name,
      creditLimit: c.credit_limit || 0,
      currentBalance: c.current_balance,
      dueDate: c.due_date || 1,
      isActive: c.is_active,
      lastFourDigits: c.last_four_digits,
      statementDate: c.statement_date ? `${c.statement_date}` : '',
      annualFee: c.annual_fee,
      renewalMonth: undefined // Not in schema for now
    }))
  }

  async storeCreditCard(card: any) {
    if (!this.userId) await this.initialize()
    const { data, error } = await supabase.from('credit_cards').insert({
      user_id: this.userId!,
      name: card.name,
      credit_limit: card.creditLimit,
      current_balance: card.currentBalance || 0,
      due_date: card.dueDate,
      last_four_digits: card.lastFourDigits,
      statement_date: parseInt(card.statementDate) || null, // Convert string to number if schema requires
      is_active: true
    }).select().single()

    if (error) throw error
    return data
  }

  async updateCreditCard(id: string, updates: any) {
    if (!this.userId) await this.initialize()

    // Map local keys to DB keys
    const dbUpdates: any = {}
    if (updates.name) dbUpdates.name = updates.name
    if (updates.creditLimit) dbUpdates.credit_limit = updates.creditLimit
    if (updates.currentBalance !== undefined) dbUpdates.current_balance = updates.currentBalance
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive

    const { error } = await supabase.from('credit_cards').update({ ...dbUpdates, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
    return { success: true }
  }

  async deleteCreditCard(id: string) {
    if (!this.userId) await this.initialize()
    const { error } = await supabase.from('credit_cards').update({ is_active: false }).eq('id', id)
    if (error) throw error
    return { success: true }
  }

  // --- Credit Card Transactions ---
  async getCreditCardTransactions(cardId: string) {
    if (!this.userId) await this.initialize()
    const { data, error } = await supabase
      .from('credit_card_transactions')
      .select('*')
      .eq('credit_card_id', cardId)
      .eq('user_id', this.userId!)
      .order('transaction_date', { ascending: false })

    if (error) return []
    return data.map(t => ({
      ...t,
      date: t.transaction_date,
      paymentMethod: 'credit_card'
    }))
  }

  async createCreditCardTransaction(tx: any) {
    if (!this.userId) await this.initialize()
    const { data, error } = await supabase.from('credit_card_transactions').insert({
      user_id: this.userId!,
      credit_card_id: tx.creditCard,
      amount: tx.amount,
      description: tx.description,
      type: 'expense',
      transaction_date: tx.date,
      emi_months: tx.emiDetails?.tenure || null,
      emi_amount: tx.emiDetails?.monthlyAmount || null
    }).select().single()

    if (error) throw error

    // Update Card Balance
    // Assuming expense INCREASES balance (liability)
    const { data: card } = await supabase.from('credit_cards').select('current_balance').eq('id', tx.creditCard).single()
    if (card) {
      await supabase.from('credit_cards').update({
        current_balance: card.current_balance + tx.amount
      }).eq('id', tx.creditCard)
    }

    return data
  }

  async getCreditCardLiabilitySummary() {
    const cards = await this.getCreditCards()
    const totalLimit = cards.reduce((sum, c) => sum + c.creditLimit, 0)
    const totalOutstanding = cards.reduce((sum, c) => sum + c.currentBalance, 0)
    return {
      totalCards: cards.length,
      totalLimit,
      totalOutstanding,
      overallUtilization: totalLimit > 0 ? Math.round((totalOutstanding / totalLimit) * 100) : 0,
      cards: cards.map(c => ({
        ...c,
        utilization: c.creditLimit > 0 ? Math.round((c.currentBalance / c.creditLimit) * 100) : 0
      }))
    }
  }

  // --- Loans (New) ---

  async getLoans(): Promise<any[]> {
    if (!this.userId) await this.initialize()
    const { data, error } = await supabase.from('loans').select('*').eq('user_id', this.userId!).eq('is_active', true)
    if (error) return []

    return data.map(l => ({
      id: l.id,
      name: l.name,
      principal: l.principal_amount,
      currentBalance: l.current_balance,
      monthlyAmount: l.emi_amount,
      rate: l.interest_rate,
      tenureMonths: l.total_emis,
      emisPaid: l.emis_paid,
      startDate: l.start_date,
      nextDueDate: l.next_emi_date,
      type: l.type // Added type to distinguish 'EMI' vs 'LOAN'
    }))
  }

  async createLoan(loan: any) {
    if (!this.userId) await this.initialize()
    const { error } = await supabase.from('loans').insert({
      user_id: this.userId!,
      name: loan.name,
      type: loan.type || 'LOAN',
      principal_amount: loan.principal,
      current_balance: loan.principal, // initially same
      emi_amount: loan.monthlyAmount,
      total_emis: loan.tenureMonths,
      emis_paid: loan.emisPaid || 0,
      start_date: loan.startDate,
      next_emi_date: loan.nextDueDate,
      interest_rate: loan.rate,
      is_active: true
    })
    if (error) throw error
    return { success: true }
  }

  async updateLoan(id: string, updates: any) {
    if (!this.userId) await this.initialize()
    const { error } = await supabase.from('loans').update({
      name: updates.name,
      principal_amount: updates.principal,
      current_balance: updates.currentBalance,
      emi_amount: updates.monthlyAmount,
      total_emis: updates.tenureMonths,
      emis_paid: updates.emisPaid,
      next_emi_date: updates.nextDueDate,
      is_active: updates.isActive
    }).eq('id', id)
    if (error) throw error
    return { success: true }
  }

  async deleteLoan(id: string) {
    if (!this.userId) await this.initialize()
    await supabase.from('loans').delete().eq('id', id)
    return { success: true }
  }


  // --- Future Payables / Projections ---
  // This is a computed view in Supabase mode, aggregating from Loans and Cards
  async getFuturePayables(): Promise<FuturePayable[]> {
    if (!this.userId) await this.initialize()
    const payables: FuturePayable[] = []

    // 1. Credit Card Dues
    const cards = await this.getCreditCards()
    const now = new Date()

    cards.forEach(card => {
      if (card.currentBalance > 0) {
        // Calculate due date based on statement cycle
        // Logic:
        // If today > statementDate: Bill likely generated. Due date is imminent (next occurrence of dueDay).
        // If today <= statementDate: Bill not generated. Amount is "Unbilled". Due date is further out?
        // Actually, typically: Statement Jan 12 -> Due Feb 2.
        // Jan 10 (Pre-Stmt): Balance is Unbilled. Next Stmt Jan 12. Due Feb 2.
        // Jan 15 (Post-Stmt): Balance is Billed (mostly). Due Feb 2.
        // So Due Date is the same in both cases relative to current month?
        // Let's refine based on "Next Due Date".

        let dueYear = now.getFullYear()
        let dueMonth = now.getMonth()

        // If due day < current day, it must be next month at least
        if (card.dueDate < now.getDate()) {
          dueMonth++
        }

        // Adjust for Statement Cycle if available
        // If statement date exists and we are BEFORE it, the bill for this month isn't generated yet.
        // But the due date for *this* bill (once generated) will be next month usually.
        // Example: Stmt 12th, Due 2nd. Today 10th.
        // Balance is for Stmt Jan 12. Due Feb 2.
        // My simple check "dueDay(2) < today(10)" -> next month (Feb 2). Correct.

        // Example: Stmt 12th, Due 2nd. Today 15th.
        // Balance is for Stmt Jan 12. Due Feb 2.
        // My simple check "dueDay(2) < today(15)" -> next month (Feb 2). Correct.

        // Example: Stmt 20th, Due 10th. Today 25th.
        // Stmt Jan 20 generated. Due Feb 10.
        // Check "dueDay(10) < today(25)" -> next month (Feb 10). Correct.

        // Example: Stmt 20th, Due 10th. Today 5th.
        // Stmt Jan 20 NOT generated.
        // But wait, previous Stmt Dec 20 generated -> Due Jan 10.
        // Is current balance for Dec 20 bill or Jan 20 accumulation?
        // Likely mix. If we assume user pays Bills, then balance is NEW spending?
        // Or if unpaid, it's Due Jan 10.
        // Check "dueDay(10) > today(5)" -> This month (Jan 10).
        // So simple logic holds?

        // User request: "add it to future payables based on card's statement date"
        // Let's try to infer status "Billed" vs "Unbilled" for clarity.

        let due = new Date(dueYear, dueMonth, card.dueDate)
        let status: 'pending' | 'due' = 'pending'
        let desc = `Next Bill for ${card.name}`

        if (card.statementDate) {
          const stmtDay = typeof card.statementDate === 'string' ? parseInt(card.statementDate) : card.statementDate
          if (now.getDate() < stmtDay) {
            desc = `Unbilled - ${card.name}`
          } else {
            desc = `Statement Due - ${card.name}`
          }
        }

        payables.push({
          id: `due_${card.id}_${Date.now()}`,
          type: 'credit_card',
          amount: card.currentBalance,
          dueDate: due.toISOString().split('T')[0],
          description: desc,
          source: card.name,
          originalTransactionId: '',
          status: 'pending',
          timestamp: new Date().toISOString()
        })
      }
    })

    // 2. Upcoming Loan EMIs
    const loans = await this.getLoans()
    loans.forEach(loan => {
      if (loan.nextDueDate) {
        payables.push({
          id: `emi_${loan.id}`,
          type: 'emi',
          amount: loan.monthlyAmount,
          dueDate: loan.nextDueDate,
          description: `EMI for ${loan.name}`,
          source: loan.name,
          originalTransactionId: '',
          status: 'pending',
          timestamp: new Date().toISOString()
        })
      }
    })

    return payables.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }

  // --- Goals & FDs ---
  async getGoals() {
    if (!this.userId) await this.initialize()
    const { data } = await supabase.from('goals').select('*').eq('user_id', this.userId!)
    return data || []
  }

  async getFDs() {
    // Map Goals to FDs where category = 'Fixed Deposit'
    if (!this.userId) await this.initialize()
    const { data } = await supabase.from('goals').select('*').eq('user_id', this.userId!).eq('category', 'Fixed Deposit')

    if (!data) return []

    return data.map(g => ({
      id: g.id,
      name: g.name,
      amount: g.current_amount, // Principal
      rate: parseFloat(g.priority) || 0, // Storing rate in priority field if numeric? Or abuse name?
      // Actually 'priority' is text enum in DB check. 'high/med/low'. 
      // Let's use metadata or description if available? DB schema had no notes.
      // Abuse 'priority' for now or 'name'. 
      // Let's store rate in name like "FD Name | 7.5%" and parse it out? Hacky but works without schema change.
      // Better: Store in 'priority' as string "7.5".
      startDate: g.created_at, // Use created_at as start
      maturityDate: g.target_date,
      autoRenew: false,
      notes: ''
    }))
  }

  async storeFD(fd: any) {
    if (!this.userId) await this.initialize()
    // Using Goals table
    const { data, error } = await supabase.from('goals').insert({
      user_id: this.userId!,
      name: fd.name,
      current_amount: fd.amount, // Principal
      target_amount: fd.amount + (fd.amount * (fd.rate / 100)), // Maturity Value approx
      target_date: fd.maturityDate,
      category: 'Fixed Deposit',
      priority: `${fd.rate}`, // Storing Rate here
      is_completed: false
    }).select().single()

    if (error) throw error
    return data
  }

  async updateFD(id: string, updates: any) {
    // Forward to goal update
    const goalUpdates: any = {}
    if (updates.amount) goalUpdates.current_amount = updates.amount
    if (updates.maturityDate) goalUpdates.target_date = updates.maturityDate
    if (updates.name) goalUpdates.name = updates.name

    return this.updateGoal(id, goalUpdates)
  }

  async deleteFD(id: string) {
    return this.deleteGoal(id)
  }

  // --- Migration ---
  // Keeping the existing migration logic? It's useful.
  // We'll leave it out for brevity in this "Usage" file, 
  // or import it from a separate migration helper if needed. 
  // For now, let's keep the file focused on Runtime Data Access.

  async migrateFromLocalStorage() {
    try {
      if (!this.userId) await this.initialize()
      if (typeof window === 'undefined') return { success: false, error: 'Server side' }

      logger.info('Starting migration...')

      // 1. Migrate Accounts
      const localAccountsStr = localStorage.getItem('bank_accounts')
      const cashBalStr = localStorage.getItem('cash_balance')

      if (localAccountsStr) {
        const accounts = JSON.parse(localAccountsStr)
        for (const acc of accounts) {
          // Check existence logic skipped for bulk simplicity, utilizing upsert if ID matches? 
          // Local IDs might be numbers or UUIDs. Let's create new or match.
          // For simplicity in migration, we insert as new if name doesn't match?
          // Safer: Insert all, user can clean up. Or clearer:
          await supabase.from('accounts').insert({
            user_id: this.userId!,
            name: acc.name,
            type: acc.type || 'savings',
            balance: acc.balance,
            currency: acc.currency || 'INR',
            is_active: true
          })
        }
      }

      if (cashBalStr) {
        // Check if Cash exists
        const { data: existing } = await supabase.from('accounts').select('id').eq('user_id', this.userId!).eq('type', 'cash').single()
        if (!existing) {
          await supabase.from('accounts').insert({
            user_id: this.userId!,
            name: 'Cash',
            type: 'cash',
            balance: parseFloat(cashBalStr),
            currency: 'INR',
            is_active: true
          })
        }
      }

      // 2. Migrate Transactions
      const txsStr = localStorage.getItem('transactions')
      if (txsStr) {
        const txs = JSON.parse(txsStr)
        // Bulk insert chunks
        const chunkSize = 50
        for (let i = 0; i < txs.length; i += chunkSize) {
          const chunk = txs.slice(i, i + chunkSize).map((t: any) => ({
            user_id: this.userId!,
            amount: t.amount,
            type: t.type,
            description: t.description,
            date: t.date,
            category_id: null, // Legacy didn't use IDs
            subcategory: t.category, // Map legacy category to subcategory or text
            payment_method: t.paymentMethod || 'cash'
          }))

          const { error } = await supabase.from('transactions').insert(chunk)
          if (error) logger.error('Error migrating transaction chunk', error)
        }
      }

      // 3. Migrate Loans
      const loansStr = localStorage.getItem('loans')
      if (loansStr) {
        const loans = JSON.parse(loansStr)
        for (const l of loans) {
          await this.createLoan({
            name: l.name,
            principal: l.principalAmount, // Legacy name check
            rate: l.interestRate,
            tenureMonths: l.tenureMonths,
            startDate: l.startDate
          })
        }
      }

      // 4. Migrate Goals
      const goalsStr = localStorage.getItem('goals')
      if (goalsStr) {
        const goals = JSON.parse(goalsStr)
        for (const g of goals) {
          await this.createGoal({
            name: g.name,
            target_amount: g.targetAmount,
            current_amount: g.currentAmount,
            target_date: g.targetDate,
            category: g.category,
            priority: g.priority
          })
        }
      }

      logger.info('Migration completed successfully')
      return { success: true }

    } catch (e: any) {
      logger.error('Migration failed', e)
      return { success: false, error: e.message }
    }
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.userId) await this.initialize()

      const { error } = await supabase
        .from('transactions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', this.userId!)

      if (error) throw error
      return { success: true }
    } catch (error) {
      logger.error('Error updating transaction', error)
      return { success: false, error: 'Update failed' }
    }
  }


  // --- Accounts (Update) ---
  async updateAccount(id: string, updates: Partial<Account>) {
    if (!this.userId) await this.initialize()
    if (!this.userId) throw new Error('User not initialized')

    const { error } = await supabase
      .from('accounts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', this.userId)

    if (error) throw error
    return { success: true }
  }

  // --- Loans (CRUD) ---


  async markLoanEmiPaid(loanId: string) {
    if (!this.userId) await this.initialize()

    // Get loan details
    const { data: loan, error: fetchError } = await supabase
      .from('loans')
      .select('*')
      .eq('id', loanId)
      .single()

    if (fetchError || !loan) throw new Error('Loan not found')

    // Create Expense Transaction
    await this.createTransaction({
      amount: loan.emi_amount,
      type: 'expense',
      description: `EMI Payment for ${loan.name}`,
      date: new Date().toISOString(),
      category: 'Loans', // Subcategory
      payment_method: 'bank_transfer'
    })

    // Update Loan State
    const nextDue = new Date(loan.next_emi_date || new Date())
    nextDue.setMonth(nextDue.getMonth() + 1)

    // Principal reduction logic is complex, for MVP simple reduction
    // Ideally: Interest = Balance * Rate/1200; Principal = EMI - Interest
    // Here we just decrement emis_paid for tracking. Real principal calc might differ.
    // Let's assume standard amortization logic or simple decrement for now.
    const interest = loan.current_balance * (loan.interest_rate / 1200)
    const principalComponent = loan.emi_amount - interest
    const newBalance = Math.max(0, loan.current_balance - principalComponent)

    const { error } = await supabase
      .from('loans')
      .update({
        emis_paid: loan.emis_paid + 1,
        current_balance: newBalance,
        next_emi_date: nextDue.toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', loanId)

    if (error) throw error
    return { success: true }
  }

  // --- Goals (CRUD) ---
  async createGoal(goal: any) {
    if (!this.userId) await this.initialize()
    const { data, error } = await supabase.from('goals').insert({
      user_id: this.userId!,
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount || 0,
      target_date: goal.target_date,
      category: goal.category,
      priority: goal.priority || 'medium',
      is_completed: goal.is_completed || false
    }).select().single()

    if (error) throw error
    return data
  }

  async updateGoal(id: string, updates: any) {
    if (!this.userId) await this.initialize()
    const { error } = await supabase
      .from('goals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', this.userId!)

    if (error) throw error
    return { success: true }
  }

  async deleteGoal(id: string) {
    if (!this.userId) await this.initialize()
    const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', this.userId!)
    if (error) throw error
    return { success: true }
  }

  // --- Budgets ---
  async getBudgetLimits(month: number, year: number) {
    if (!this.userId) await this.initialize()
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', this.userId!)
      .eq('month', month)
      .eq('year', year)

    if (error) return []
    return data
  }

  async setBudgetLimit(month: number, year: number, category: string, limit: number) {
    if (!this.userId) await this.initialize()

    // Check if exists
    const { data: existing } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', this.userId!)
      .eq('month', month)
      .eq('year', year)
      .eq('category_name', category)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('budgets')
        .update({ monthly_limit: limit, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('budgets')
        .insert({
          user_id: this.userId!,
          month,
          year,
          category_name: category,
          monthly_limit: limit,
          spent_amount: 0, // recalculated elsewhere
          remaining_amount: limit
        })
      if (error) throw error
    }
    return { success: true }
  }

  async importYearlyBudget(year: number, projections: { category: string, limits: number[] }[]) {
    if (!this.userId) await this.initialize()

    // Flatten data
    const records: any[] = []

    projections.forEach(proj => {
      proj.limits.forEach((limit, index) => {
        if (limit > 0) {
          records.push({
            user_id: this.userId!,
            month: index, // 0-11
            year: year,
            category_name: proj.category,
            monthly_limit: limit,
            spent_amount: 0,
            remaining_amount: limit,
            updated_at: new Date().toISOString()
          })
        }
      })
    })

    // Upsert in chunks
    const chunkSize = 50
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize)
      const { error } = await supabase.from('budgets').upsert(chunk, { onConflict: 'user_id, month, year, category_name' as any })
      if (error) {
        logger.error('Bulk upsert failed', error)
      }
    }

    return { success: true }
  }

  async seedGoals(goals: { name: string; target_amount: number; category: string; priority: string }[]) {
    if (!this.userId) await this.initialize()

    for (const g of goals) {
      const { data: existing } = await supabase
        .from('goals')
        .select('id')
        .eq('user_id', this.userId!)
        .eq('name', g.name)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('goals')
          .update({
            target_amount: g.target_amount,
            category: g.category,
            priority: g.priority,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('goals')
          .insert({
            user_id: this.userId!,
            name: g.name,
            target_amount: g.target_amount,
            current_amount: 0,
            target_date: new Date(new Date().getFullYear(), 11, 31).toISOString(), // End of year default?
            category: g.category,
            priority: g.priority,
            is_completed: false
          })
      }
    }
    return { success: true }
  }

  async seedCreditCards(cards: any[]) { // Using any to avoid strict type mismatch with new fields
    if (!this.userId) await this.initialize()

    for (const c of cards) {
      const { data: existing } = await supabase
        .from('credit_cards')
        .select('id')
        .eq('user_id', this.userId!)
        .eq('name', c.name)
        .maybeSingle()

      // Convert "20 Aug" to 20 for due_date
      let dueDate = 1
      if (typeof c.paymentDate === 'string') {
        const match = c.paymentDate.match(/^(\d+)/)
        if (match) dueDate = parseInt(match[1])
      } else if (typeof c.paymentDate === 'number') {
        dueDate = c.paymentDate
      }

      const cardData = {
        user_id: this.userId!,
        name: c.name,
        credit_limit: c.limit || 0,
        current_balance: existing ? undefined : 0,
        due_date: dueDate,
        statement_date: typeof c.statementDate === 'number' ? c.statementDate : parseInt(c.statementDate || '1'),
        last_four_digits: c.number.slice(-4),
        is_active: true,
        annual_fee: c.annualFee,
        card_type: c.type, // Map VISA/Mastercard etc
        partner_merchants: c.partners ? c.partners.split(',').map((p: string) => p.trim()) : [],
        // Store rich metadata in benefits JSON
        benefits: {
          cashback: c.cashback,
          rewardPoints: c.rewardPoints,
          lounge: {
            national: c.loungeNational,
            international: c.loungeInternational,
            railway: c.railwayLounge
          },
          rewardRate: {
            value: c.rpValue,
            expiry: c.rpExpiryMonths,
            limit: c.rpLimit
          },
          waveOffLimit: c.waveOffLimit,
          renewalMonth: c.renewalMonth
        },
        updated_at: new Date().toISOString()
      }

      if (existing) {
        await supabase.from('credit_cards').update(cardData).eq('id', existing.id)
      } else {
        await supabase.from('credit_cards').insert(cardData)
      }
    }
    return { success: true }
  }

  async seedLiquidity(accounts: { name: string; type: string; balance: number; currency: string }[]) {
    if (!this.userId) await this.initialize()

    // Upsert accounts based on name + user_id? 
    // Schema might not have unique constraint on (user_id, name).
    // So we check existence first or just insert.
    // User wants to "update it in the app", implies persistence.
    // I'll check if account with name exists, if so update balance, else insert.

    for (const acc of accounts) {
      const { data: existing } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', this.userId!)
        .eq('name', acc.name)
        .maybeSingle()

      if (existing) {
        // Update balance? User provided "current liquidity", so yes overwrite.
        await supabase
          .from('accounts')
          .update({
            balance: acc.balance,
            type: acc.type,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('accounts')
          .insert({
            user_id: this.userId!,
            name: acc.name,
            type: acc.type,
            balance: acc.balance,
            currency: acc.currency,
            is_active: true
          })
      }
    }
    return { success: true }
  }

  async deleteTransaction(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.userId) await this.initialize()

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', this.userId!)

      if (error) throw error
      return { success: true }
    } catch (error) {
      logger.error('Error deleting transaction', error)
      return { success: false, error: 'Delete failed' }
    }
  }
  // --- Net Worth History (Snapshot Strategy) ---
  async saveDailySnapshot(stats: { totalAssets: number; totalLiabilities: number }) {
    if (!this.userId) await this.initialize()
    if (typeof window === 'undefined') return // Don't run on server side render

    const today = new Date().toISOString().slice(0, 10)

    // Check if snapshot exists
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', this.userId!)
      .eq('type', 'net_worth_snapshot')
      .eq('date', today)
      .maybeSingle()

    if (existing) {
      // Optional: Update it? For now, first snapshot of the day is fine.
      return
    }

    const netWorth = stats.totalAssets - stats.totalLiabilities

    await supabase.from('transactions').insert({
      user_id: this.userId!,
      type: 'net_worth_snapshot',
      amount: netWorth,
      date: today,
      description: 'Daily Net Worth Snapshot',
      payment_method: 'system',
      // Store breakdown in recurring_pattern as it is a JSON column
      recurring_pattern: {
        assets: stats.totalAssets,
        liabilities: stats.totalLiabilities,
        breakdown: 'auto-generated'
      }
    })
  }

  async getNetWorthHistory() {
    if (!this.userId) await this.initialize()

    const { data, error } = await supabase
      .from('transactions')
      .select('date, amount, recurring_pattern')
      .eq('user_id', this.userId!)
      .eq('type', 'net_worth_snapshot')
      .order('date', { ascending: true })
      .limit(365) // Last 1 year

    if (error) return []
    return data.map(d => ({
      date: d.date,
      netWorth: d.amount,
      assets: (d.recurring_pattern as any)?.assets || 0,
      liabilities: (d.recurring_pattern as any)?.liabilities || 0
    }))
  }

  async getBudgets() {
    if (!this.userId) await this.initialize()
    const { data } = await supabase.from('budgets').select('*').eq('user_id', this.userId!)
    return data || []
  }

  // --- Backup / Export ---
  async exportUserData() {
    if (!this.userId) await this.initialize()

    const [accounts, transactions, loans, cards, goals, budgets] = await Promise.all([
      this.getAccounts(),
      this.getTransactions(),
      this.getLoans(),
      this.getCreditCards(),
      this.getGoals(),
      this.getBudgets()
    ])

    return {
      timestamp: new Date().toISOString(),
      accounts,
      transactions,
      loans,
      cards,
      goals,
      budgets
    }
  }
}

export const financeManager = FinanceDataManager.getInstance()
export { Logger }