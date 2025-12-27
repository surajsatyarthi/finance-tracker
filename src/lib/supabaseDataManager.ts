// Enterprise-Grade Supabase Data Manager
// Commercial-grade finance tracker with proper error handling, validation, and logging

import { supabase } from './supabase'
import { Database } from '../types/database.types'
import {
  BankAccount,
  LiquidityData,
  FuturePayable,
  EnhancedTransaction,
  Category,
  Budget,
  Transaction,
  CreditCard as DSCreditCard,
  Loan,
  Goal
} from '@/types/finance'

// Type definitions
type Tables = Database['public']['Tables']
type DBAccount = Tables['accounts']['Row']
type DBTransaction = Tables['transactions']['Row']
type DBCreditCard = Tables['credit_cards']['Row']
type DBLoan = Tables['loans']['Row']


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
            lastUpdated: acc.updated_at,
            // Card and account details
            card_number: acc.card_number || undefined,
            card_cvv: acc.card_cvv || undefined,
            card_expiry_month: acc.card_expiry_month || undefined,
            card_expiry_year: acc.card_expiry_year || undefined,
            account_number: acc.account_number || undefined,
            ifsc_code: acc.ifsc_code || undefined,
            customer_id: acc.customer_id || undefined
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

  async getCategories(): Promise<Category[]> {
    if (!this.userId) await this.initialize()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', this.userId!)
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }
    return data || []
  }

  async getBudgets(year?: number): Promise<Budget[]> {
    if (!this.userId) await this.initialize()
    if (!this.userId) return []

    let query = supabase
      .from('budgets')
      .select('*')
      .eq('user_id', this.userId)

    if (year) {
      query = query.eq('year', year)
    }

    const { data, error } = await query

    if (error) {
      console.error(`Error fetching budgets${year ? ` for ${year}` : ''}:`, error)
      return []
    }

    return data || []
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



  async createTransaction(tx: { amount: number; type: 'income' | 'expense' | 'transfer'; description: string; date: string; category?: string; payment_method: string; account_id?: string }) {
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
    // Fetch all for aggregation (limit might need adjustment for very large datasets)
    const { data } = await supabase.from('transactions').select('*').eq('user_id', this.userId!).eq('type', 'expense').order('date', { ascending: false })
    return data || []
  }

  // --- Reports & Aggregations ---

  async getMonthlyFlows(year: number) {
    if (!this.userId) await this.initialize()

    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', this.userId!)
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) {
      logger.error('Error fetching yearly flows', error)
      return []
    }

    const monthlyData = new Array(12).fill(0).map((_, i) => ({
      month: i, // 0-11
      income: 0,
      expense: 0
    }))

    transactions.forEach(t => {
      const date = new Date(t.date)
      const monthIndex = date.getMonth()
      if (monthIndex >= 0 && monthIndex < 12) {
        if (t.type === 'income') {
          monthlyData[monthIndex].income += t.amount
        } else if (t.type === 'expense') {
          monthlyData[monthIndex].expense += t.amount
        }
      }
    })

    return monthlyData
  }

  async getCategoryBreakdown(startDate: string, endDate: string) {
    if (!this.userId) await this.initialize()

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, category:categories(name)')
      .eq('user_id', this.userId!)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) {
      logger.error('Error fetching category breakdown', error)
      return []
    }

    const categoryMap: Record<string, number> = {}

    transactions.forEach((t: any) => {
      const catName = t.category?.name || 'Uncategorized'
      categoryMap[catName] = (categoryMap[catName] || 0) + t.amount
    })

    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }

  async getNetWorthHistory(days = 30) {
    if (!this.userId) await this.initialize()

    const { data, error } = await supabase
      .from('daily_snapshots')
      .select('*')
      .eq('user_id', this.userId!)
      .order('date', { ascending: true })
      .limit(days) // This might fetch oldest first due to order, let's check

    // If we want last 30 days history...
    // We should probably order desc limit 30 then reverse.
    // But for chart line, asc is good.
    // We need date range filter usually.

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = cutoff.toISOString().split('T')[0]

    const { data: history, error: hError } = await supabase
      .from('daily_snapshots')
      .select('date, total_assets, total_liabilities, net_worth')
      .eq('user_id', this.userId!)
      .gte('date', cutoffStr)
      .order('date', { ascending: true })

    if (hError) return []
    return history
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

  async seedLoans(loans: any[]) {
    if (!this.userId) await this.initialize()

    // Check if loans exist using exact count in a lightweight way
    const { count } = await supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId!)

    // Only seed if absolutely no loans exist
    if (count === 0) {
      console.log('Seeding Loans...')
      for (const loan of loans) {
        // Use createLoan but ensure we catch errors individually
        try {
          await this.createLoan(loan)
        } catch (e) {
          console.error('Error seeding loan:', loan.name, e)
        }
      }
    }
  }

  async getLoans(): Promise<Loan[]> {
    if (!this.userId) await this.initialize()
    const { data, error } = await supabase.from('loans').select('*').eq('user_id', this.userId!).eq('is_active', true)
    if (error) return []

    return data.map(l => ({
      id: l.id,
      user_id: l.user_id,
      name: l.name,
      type: l.type,
      principal_amount: l.principal_amount,
      current_balance: l.current_balance,
      interest_rate: l.interest_rate,
      emi_amount: l.emi_amount,
      total_emis: l.total_emis,
      emis_paid: l.emis_paid,
      start_date: l.start_date,
      next_emi_date: l.next_emi_date || undefined,
      linked_credit_card_id: l.linked_credit_card_id || undefined,
      is_active: l.is_active || false,
      created_at: l.created_at,
      updated_at: l.updated_at
    }))
  }

  async createLoan(loan: any) {
    if (!this.userId) await this.initialize()
    const { error } = await supabase.from('loans').insert({
      user_id: this.userId!,
      name: loan.name,
      type: loan.type,
      principal_amount: loan.principal_amount,
      current_balance: loan.principal_amount, // Start full
      interest_rate: loan.interest_rate,
      emi_amount: loan.emi_amount,
      total_emis: loan.total_emis,
      emis_paid: 0,
      start_date: loan.start_date,
      next_emi_date: loan.start_date, // First EMI due on start or next month? Usually next month. user can edit.
      is_active: true,
      linked_credit_card_id: loan.linked_credit_card_id || null
    }).select().single()
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

  // --- Investments (New) ---

  async getInvestments(): Promise<any[]> {
    if (!this.userId) await this.initialize()
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', this.userId!)
      .eq('is_active', true)
      .order('current_value', { ascending: false })

    if (error) {
      logger.error('Error fetching investments', error)
      return []
    }
    return data
  }

  async createInvestment(investment: {
    name: string
    type: string
    amount_invested: number
    current_value: number
    quantity?: number
    purchase_date?: string
  }) {
    if (!this.userId) await this.initialize()
    const { error } = await supabase.from('investments').insert({
      user_id: this.userId!,
      name: investment.name,
      type: investment.type,
      amount_invested: investment.amount_invested,
      current_value: investment.current_value,
      quantity: investment.quantity,
      purchase_date: investment.purchase_date,
      is_active: true
    })

    if (error) throw error
    return { success: true }
  }

  async deleteInvestment(id: string) {
    if (!this.userId) await this.initialize()
    await supabase.from('investments').delete().eq('id', id)
    return { success: true }
  }

  async getLoanPayments(loanId: string) {
    if (!this.userId) await this.initialize()
    const { data, error } = await supabase
      .from('loan_payments')
      .select('*')
      .eq('loan_id', loanId)
      .eq('user_id', this.userId!)
      .order('payment_date', { ascending: false })

    if (error) {
      logger.error('Error fetching loan payments', error)
      return []
    }
    return data
  }

  async updateLoanWithPayment(loanId: string, payment: { amount: number; date: string; type: string; notes?: string }) {
    if (!this.userId) await this.initialize()

    // 1. Get Loan details
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('*')
      .eq('id', loanId)
      .single()

    if (loanError || !loan) throw new Error('Loan not found')

    // 2. Calculate components (simple logic for now, precise logic belongs in component/utils to pre-calc)
    // Here we assume the client passes correct split or we calc?
    // Let's calc simply:
    const monthlyRate = loan.interest_rate / 12 / 100
    const interestComponent = loan.current_balance * monthlyRate
    const principalComponent = Math.min(payment.amount - interestComponent, loan.current_balance)

    // 3. Insert Payment
    const { error: paymentError } = await supabase.from('loan_payments').insert({
      user_id: this.userId!,
      loan_id: loanId,
      amount: payment.amount,
      payment_date: payment.date,
      principal_amount: principalComponent,
      interest_amount: interestComponent,
      balance_after_payment: loan.current_balance - principalComponent
    })

    if (paymentError) throw paymentError

    // 4. Update Loan Balance & EMIs Paid
    const newBalance = loan.current_balance - principalComponent
    let newEmisPaid = loan.emis_paid
    let nextDueDate = loan.next_emi_date

    if (payment.amount >= loan.emi_amount) {
      newEmisPaid += 1
      // Calculate next due date (simple: add 1 month)
      if (nextDueDate) {
        const d = new Date(nextDueDate)
        d.setMonth(d.getMonth() + 1)
        nextDueDate = d.toISOString().split('T')[0]
      }
    }

    await this.updateLoan(loanId, {
      currentBalance: newBalance,
      emisPaid: newEmisPaid,
      nextDueDate: nextDueDate
    })

    return { newBalance, newEmisPaid }
  }

  // --- Pay Later (BNPL) ---

  async getPayLaterServices(): Promise<any[]> {
    if (!this.userId) await this.initialize()
    const { data, error } = await supabase
      .from('pay_later_services')
      .select('*')
      .eq('user_id', this.userId!)
      .neq('status', 'deleted') // Soft delete check if implemented, else just filter
      .order('next_due_date', { ascending: true })

    if (error) {
      // If table doesn't exist yet, return empty to prevent crash
      console.warn('Error fetching pay later services (Table might be missing):', error.message)
      return []
    }

    return data.map(s => ({
      id: s.id,
      serviceName: s.service_name,
      serviceCode: s.service_code,
      creditLimit: s.credit_limit,
      usedAmount: s.used_amount,
      currentDue: s.current_due,
      availableAmount: s.credit_limit - s.used_amount, // Calc on fly
      nextDueDate: s.next_due_date,
      dueSchedule: s.due_schedule,
      status: s.status,
      interestRate: s.interest_rate,
      penaltyFee: s.penalty_fee,
      lastUsed: s.last_used
    }))
  }

  async createPayLaterService(service: any) {
    if (!this.userId) await this.initialize()
    const { error } = await supabase.from('pay_later_services').insert({
      user_id: this.userId!,
      service_name: service.serviceName,
      service_code: service.serviceCode,
      credit_limit: service.creditLimit,
      used_amount: service.usedAmount || 0,
      current_due: service.currentDue || 0,
      next_due_date: service.nextDueDate,
      due_schedule: service.dueSchedule,
      status: service.status || 'active',
      interest_rate: service.interestRate,
      penalty_fee: service.penaltyFee
    })
    if (error) throw error
    return { success: true }
  }

  async updatePayLaterService(id: string, updates: any) {
    if (!this.userId) await this.initialize()

    const dbUpdates: any = {}
    if (updates.serviceName) dbUpdates.service_name = updates.serviceName
    if (updates.serviceCode) dbUpdates.service_code = updates.serviceCode
    if (updates.creditLimit !== undefined) dbUpdates.credit_limit = updates.creditLimit
    if (updates.usedAmount !== undefined) dbUpdates.used_amount = updates.usedAmount
    if (updates.currentDue !== undefined) dbUpdates.current_due = updates.currentDue
    if (updates.nextDueDate) dbUpdates.next_due_date = updates.nextDueDate
    if (updates.status) dbUpdates.status = updates.status

    const { error } = await supabase.from('pay_later_services').update({
      ...dbUpdates,
      updated_at: new Date().toISOString()
    }).eq('id', id)

    if (error) throw error
    return { success: true }
  }

  async deletePayLaterService(id: string) {
    if (!this.userId) await this.initialize()
    const { error } = await supabase.from('pay_later_services').delete().eq('id', id)
    if (error) throw error
    return { success: true }
  }

  // --- Goals (New) ---

  async getGoals(): Promise<Goal[]> {
    if (!this.userId) await this.initialize()
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', this.userId!)
      .order('target_date', { ascending: true })

    if (error) {
      logger.error('Error fetching goals', error)
      return []
    }

    return data.map(g => ({
      ...g,
      target_date: g.target_date || undefined
    }))
  }

  async createGoal(goal: { name: string; target_amount: number; target_date?: string; category?: string; priority?: string }) {
    if (!this.userId) await this.initialize()
    const { error } = await supabase.from('goals').insert({
      user_id: this.userId!,
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: 0,
      target_date: goal.target_date,
      category: goal.category,
      priority: goal.priority || 'medium',
      is_completed: false
    })

    if (error) throw error
    return { success: true }
  }

  async updateGoalProgress(id: string, amountToAdd: number) {
    if (!this.userId) await this.initialize()

    // Get current amount first (atomicity issue? ideally use RPC, but read-write ok for single user)
    const { data: goal } = await supabase.from('goals').select('current_amount').eq('id', id).single()
    if (!goal) throw new Error('Goal not found')

    const newAmount = goal.current_amount + amountToAdd
    const { error } = await supabase.from('goals').update({
      current_amount: newAmount,
      updated_at: new Date().toISOString()
    }).eq('id', id)

    if (error) throw error
    return { success: true, newAmount }
  }

  async deleteGoal(id: string) {
    if (!this.userId) await this.initialize()
    await supabase.from('goals').delete().eq('id', id)
    return { success: true }
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

  // --- Account Management ---

  async updateAccountBalance(id: string, newBalance: number) {
    if (!this.userId) await this.initialize()
    const { error } = await supabase.from('accounts').update({
      balance: newBalance,
      updated_at: new Date().toISOString()
    }).eq('id', id)

    if (error) throw error
    return { success: true }
  }



  async processExpense(expense: {
    amount: number
    description: string
    date: string
    paymentMethod: string
    bankAccount?: string
    creditCard?: string
    bnplProvider?: string
    emiDetails?: any
    category: string
  }) {
    if (!this.userId) await this.initialize()

    // Resolve Category ID (Simple lookup or null for now)
    // Ideally we cache categories or search. For now we put string in description if needed or subcategory.
    // Assuming 'uncategorized' or similar handling in real app.
    // We will store category string in 'subcategory' for now to preserve data.

    const commonPayload = {
      user_id: this.userId!,
      amount: expense.amount,
      date: expense.date, // transaction_date or date
      description: expense.description,
      subcategory: expense.category, // Storing category string here for legacy compatibility
      type: 'expense',
      created_at: new Date().toISOString()
    }

    if (expense.paymentMethod === 'cash' || expense.paymentMethod === 'upi') {
      // 1. Transaction Table
      const { error: txError } = await supabase.from('transactions').insert({
        ...commonPayload,
        payment_method: expense.paymentMethod,
        account_id: expense.bankAccount // Null for cash? Or cash account?
      })
      if (txError) throw txError

      // 2. Update Balance if Bank Account involved (UPI)
      if (expense.paymentMethod === 'upi' && expense.bankAccount) {
        // Fetch current balance
        const { data: account } = await supabase.from('accounts').select('balance').eq('id', expense.bankAccount).single()
        if (account) {
          await supabase.from('accounts').update({
            balance: account.balance - expense.amount
          }).eq('id', expense.bankAccount)
        }
      }
      return { success: true }

    } else if (expense.paymentMethod === 'credit_card_emi') {
      if (!expense.creditCard) throw new Error('Credit card required')
      if (!expense.emiDetails) throw new Error('EMI Details required')

      // Create a Linked Loan instead of a Transaction
      await this.createLoan({
        name: expense.description, // e.g. "iPhone 16"
        type: 'credit_card', // New type? Or use 'personal'? Let's use 'credit_card' as per schema check
        principal_amount: expense.amount,
        interest_rate: expense.emiDetails.interestRate,
        emi_amount: expense.emiDetails.monthlyAmount,
        total_emis: expense.emiDetails.tenure,
        start_date: expense.date,
        linked_credit_card_id: expense.creditCard
      })

      // Do NOT update credit card balance immediately with full amount? 
      // Actually, the card limit IS blocked by 50k usually. 
      // User said "do not write 50000 in expense". 
      // But for "Credit Card Balance" tracking (Limit Utilization), we DO need to reduce available limit.
      // But the user's "Current Balance" on card usually reflects unbilled amount.
      // If converted to EMI, the bank moves it to a separate loan bucket usually.
      // The "Outstanding" on card statement increases by EMI amount each month.
      // So I should NOT add 50k to `current_balance`. 
      // I will only touch `createLoan`.

      // Handle Processing Fee
      const fee = expense.emiDetails.processingFee
      if (fee && fee > 0) {
        const { error: feeError } = await supabase.from('credit_card_transactions').insert({
          user_id: this.userId!,
          credit_card_id: expense.creditCard,
          amount: fee,
          type: 'fee',
          description: `Processing Fee: ${expense.description}`,
          transaction_date: expense.date
        })
        if (feeError) throw feeError

        // Update card balance for fee only
        const { data: card } = await supabase.from('credit_cards').select('current_balance').eq('id', expense.creditCard).single()
        if (card) {
          await supabase.from('credit_cards').update({
            current_balance: card.current_balance + fee
          }).eq('id', expense.creditCard)
        }
      }

      return { success: true }

    } else if (expense.paymentMethod === 'credit_card') {
      if (!expense.creditCard) throw new Error('Credit card required')

      // Fetch card details to determine if it's a debit card or credit card
      const { data: cardDetails, error: cardError } = await supabase
        .from('credit_cards')
        .select('card_type, current_balance, name')
        .eq('id', expense.creditCard)
        .single()

      if (cardError || !cardDetails) throw new Error('Card not found')

      // Check if this is a debit card
      const isDebitCard = cardDetails.card_type?.toLowerCase() === 'debit'

      if (isDebitCard) {
        // DEBIT CARD: Treat like a bank account withdrawal (similar to UPI)
        // 1. Record transaction in transactions table
        const { error: txError } = await supabase.from('transactions').insert({
          ...commonPayload,
          payment_method: 'card',
          account_id: null, // We could link to a specific account if needed
          description: `[Debit Card: ${cardDetails.name}] ${expense.description}`
        })
        if (txError) throw txError

        // 2. Find linked bank account (assuming debit card name matches account name)
        // Or we can look for an account with the same name prefix
        const { data: account } = await supabase
          .from('accounts')
          .select('id, balance')
          .eq('user_id', this.userId!)
          .eq('name', cardDetails.name)
          .single()

        // 3. Update bank account balance
        if (account) {
          await supabase.from('accounts').update({
            balance: account.balance - expense.amount
          }).eq('id', account.id)
        } else {
          logger.warn(`No matching bank account found for debit card: ${cardDetails.name}`)
        }

        return { success: true }

      } else {
        // CREDIT CARD: Only update card balance (do NOT touch bank accounts)
        // 1. Credit Card Transaction Table
        const { error: ccError } = await supabase.from('credit_card_transactions').insert({
          user_id: this.userId!,
          credit_card_id: expense.creditCard,
          amount: expense.amount,
          type: 'purchase',
          description: expense.description,
          transaction_date: expense.date
        })
        if (ccError) throw ccError

        // 2. Update Credit Card Balance (increase liability)
        await supabase.from('credit_cards').update({
          current_balance: cardDetails.current_balance + expense.amount
        }).eq('id', expense.creditCard)

        return { success: true }
      }

    } else if (expense.paymentMethod === 'bnpl') {
      // BNPL handling - Map to transactions for now or custom logic
      const { error: txError } = await supabase.from('transactions').insert({
        ...commonPayload,
        payment_method: 'bnpl',
        description: `[BNPL: ${expense.bnplProvider}] ${expense.description}`
      })
      if (txError) throw txError
      return { success: true }
    }

    throw new Error('Unsupported payment method')
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

    // 2. Upcoming Loan EMIs - Project for next 12 months
    const loans = await this.getLoans()
    loans.forEach(loan => {
      if (loan.next_emi_date && loan.is_active) {
        let baseDate = new Date(loan.next_emi_date)
        const day = baseDate.getDate()

        // Generate for 12 months
        for (let i = 0; i < 12; i++) {
          // Check if loan expires before this? (emis_paid + i < total_emis)
          if (loan.total_emis > 0 && (loan.emis_paid + i) >= loan.total_emis) break

          const dueDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, day)

          payables.push({
            id: `emi_${loan.id}_${i}`,
            type: 'emi',
            amount: loan.emi_amount,
            dueDate: dueDate.toISOString().split('T')[0],
            description: `EMI ${loan.emis_paid + i + 1}/${loan.total_emis} - ${loan.name}`,
            source: loan.name,
            originalTransactionId: '',
            status: 'pending',
            timestamp: new Date().toISOString()
          })
        }
      }
    })

    return payables.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }

  // --- Goals & FDs ---

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
          spent_amount: 0 // recalculated elsewhere
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
            month: index + 1, // 1-12 (fixed from 0-11)
            year: year,
            category_name: proj.category,
            monthly_limit: limit,
            spent_amount: 0,
            updated_at: new Date().toISOString()
          })
        }
      })
    })

    // Insert/update records individually to handle conflicts properly
    for (const record of records) {
      // Check if budget exists
      const { data: existing } = await supabase
        .from('budgets')
        .select('id')
        .eq('user_id', record.user_id)
        .eq('month', record.month)
        .eq('year', record.year)
        .eq('category_name', record.category_name)
        .maybeSingle()

      if (existing) {
        // Update existing
        await supabase
          .from('budgets')
          .update({
            monthly_limit: record.monthly_limit,
            updated_at: record.updated_at
          })
          .eq('id', existing.id)
      } else {
        // Insert new
        const { error } = await supabase.from('budgets').insert(record)
        if (error) {
          logger.error('Budget insert failed', error)
        }
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

    // Clean replacement: Delete all existing accounts and insert fresh
    // This ensures exact match with the provided baseline data (Dec 19, 2025)

    // Step 1: Delete all existing accounts for this user
    await supabase
      .from('accounts')
      .delete()
      .eq('user_id', this.userId!)

    // Step 2: Insert all new accounts with exact names as provided
    for (const acc of accounts) {
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

    logger.info('Accounts seeded successfully', { count: accounts.length })
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

  async getMonthlyCategorySpending(month: number, year: number): Promise<{ category: string; limit: number; spent: number }[]> {
    if (!this.userId) await this.initialize()

    // 1. Get Budgets
    const budgets = await this.getBudgets()
    // Filter for current month/year or general defaults?
    // DB has specific month/year. Let's assume we fetch relevant ones.
    const relevantBudgets = budgets.filter((b: any) => b.month === month && b.year === year)
    const budgetMap = new Map<string, number>()
    relevantBudgets.forEach((b: any) => budgetMap.set(b.category_name, b.monthly_limit))

    // 2. Aggregate Transactions (Cash/Bank)
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0] // Last day of month

    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, subcategory') // subcategory holds the category string currently
      .eq('user_id', this.userId!)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)

    // 3. Aggregate CC Transactions
    const { data: ccTransactions } = await supabase
      .from('credit_card_transactions')
      .select('amount, description') // description often holds category or we need to infer?
      // Wait, processExpense puts category in description for CC?
      // Let's look at processExpense:
      // description: expense.description (which was category in Add Page UI)
      // So yes, description likely holds the category name for CC transactions currently.
      .eq('user_id', this.userId!)
      .eq('type', 'debit')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)

    const spendingMap = new Map<string, number>()

    // Helper to normalize category names
    const normalize = (s: string) => s?.trim() || 'Uncategorized'

    transactions?.forEach((t: any) => {
      const cat = normalize(t.subcategory)
      spendingMap.set(cat, (spendingMap.get(cat) || 0) + t.amount)
    })

    ccTransactions?.forEach((t: any) => {
      const cat = normalize(t.description)
      spendingMap.set(cat, (spendingMap.get(cat) || 0) + t.amount)
    })

    // 4. Merge
    const result: { category: string; limit: number; spent: number }[] = []

    // Add all budgeted categories
    budgetMap.forEach((limit, category) => {
      result.push({
        category,
        limit,
        spent: spendingMap.get(category) || 0
      })
      spendingMap.delete(category) // Remove so we know what's left
    })

    // Add remaining spending (Unbudgeted)
    spendingMap.forEach((spent, category) => {
      result.push({
        category,
        limit: 0, // No budget set
        spent
      })
    })

    return result.sort((a, b) => b.spent - a.spent)
  }

  async getProjectedLiabilities(): Promise<FuturePayable[]> {
    if (!this.userId) await this.initialize()

    // Import helper dynamically or ensure it is imported at top. 
    // Since we can't edit top easily in this chunk, we assume it's available or we use dynamic import
    // Ideally, we should add the import. For now, let's use the tool again to fix imports if needed.
    const { calculateCreditCardDueDate } = await import('./financialUtils')

    // 1. Get all Active Credit Cards
    const { data: cards, error: cardError } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', this.userId!)
      .eq('is_active', true)

    if (cardError || !cards) return []

    const liabilities: FuturePayable[] = []

    // 2. For each card, get UNPAID transactions
    // In a real system, we'd need a way to link payments to transactions or track "open" items.
    // For now, simpler approximation: 
    // Get all transactions in the current billing cycle? 
    // OR: Get all transactions since the last "Payment" type transaction?
    // Let's use: transactions "since the start of the current cycle" if defined, 
    // or just fetch all recent and let the user see them.

    // BETTER: Any `purchase` that hasn't been effectively "cleared".
    // Since we don't have atomic clearing, we can just project ALL transactions from the last 2 months
    // and group them. The USER interprets the total.
    // OR: Use the `Calculate Balance` approach -> `current_balance` is the truth. 
    // But the User wants to know specific due dates.

    // STRATEGY: 
    // Fetch all transactions from last 45 days.
    // Calculate Due Date for each.
    // Sum them up by Due Date bucket.

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 60) // Look back 60 days

    const { data: txs } = await supabase
      .from('credit_card_transactions')
      .select('*')
      .eq('user_id', this.userId!)
      .eq('type', 'purchase') // Only new liabilities
      .gte('transaction_date', cutoffDate.toISOString())

    if (!txs) return []

    // Group by (Card + DueDate)
    const liabilityMap = new Map<string, { amount: number, cardName: string, notes: string[] }>()

    txs.forEach((tx: any) => {
      const card = cards.find(c => c.id === tx.credit_card_id)
      if (!card || !card.statement_date || !card.due_date) return

      const dueDate = calculateCreditCardDueDate(
        tx.transaction_date,
        card.statement_date,
        card.due_date
      )

      // Key: HDFC-2024-10-05
      const key = `${card.name}|${dueDate}`
      const existing = liabilityMap.get(key) || { amount: 0, cardName: card.name, notes: [] }

      existing.amount += tx.amount
      // existing.notes.push(`${tx.description} (${tx.amount})`) // Optional detail

      liabilityMap.set(key, existing)
    })

    // 2.5 Fetch and Merge Linked Loans (EMIs)
    const { data: linkedLoans } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', this.userId!)
      .eq('is_active', true)
      .not('linked_credit_card_id', 'is', null)
      .gt('current_balance', 0)

    if (linkedLoans) {
      linkedLoans.forEach((loan: any) => {
        const card = cards.find(c => c.id === loan.linked_credit_card_id)
        if (!card || !card.statement_date || !card.due_date) return

        // Project the EMI for the current billing cycle
        // We simulate a transaction happening "today" to find the next relevant due date
        const dueDate = calculateCreditCardDueDate(
          new Date().toISOString(),
          card.statement_date,
          card.due_date
        )

        const key = `${card.name}|${dueDate}`
        const existing = liabilityMap.get(key) || { amount: 0, cardName: card.name, notes: [] }

        existing.amount += loan.emi_amount
        // existing.notes.push(`EMI: ${loan.name} (${loan.emi_amount})`)

        liabilityMap.set(key, existing)
      })
    }

    // Convert to FuturePayable list
    liabilityMap.forEach((val, key) => {
      const [_, dueDate] = key.split('|')

      // Filter out past due dates? Or keep them as "Overdue"?
      // Keep them.

      liabilities.push({
        id: key, // unique enough for UI key
        type: 'credit_card_due',
        amount: val.amount,
        dueDate: dueDate,
        description: `Credit Card Bill: ${val.cardName}`,
        source: val.cardName,
        status: new Date(dueDate) < new Date() ? 'overdue' : 'pending'
      })
    })

    return liabilities.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }



  // --- Category Management ---

  async addCategory(name: string, type: 'income' | 'expense') {
    if (!this.userId) await this.initialize()
    const { data, error } = await supabase.from('categories').insert({
      user_id: this.userId!,
      name: name,
      type: type
    }).select().single()

    if (error) throw error
    return data
  }

  async deleteCategory(id: string) {
    if (!this.userId) await this.initialize()
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    return { success: true }
  }

  // --- Backup / Export ---
  async exportUserData() {
    if (!this.userId) await this.initialize()

    // Fetch all relevant data
    const [accounts, transactions, categories, creditCards, loans, goals, payLater] = await Promise.all([
      this.getAccounts(),
      this.getTransactions(10000), // All txns
      this.getCategories(),
      this.getCreditCards(),
      this.getLoans(),
      this.getGoals(),
      this.getPayLaterServices()
    ])

    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      accounts,
      transactions,
      categories,
      creditCards,
      loans,
      goals,
      payLater
    }

    return exportData
  }

  // --- Feedback ---
  async submitFeedback(message: string, userAgent: string, images: string[] = []): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          message,
          user_agent: userAgent,
          images
        })

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Submit feedback error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const financeManager = FinanceDataManager.getInstance()