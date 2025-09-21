// Client-side security utilities for sensitive financial data

import { supabase } from './supabase'

// Rate limiting for client-side operations
class RateLimiter {
  private operations: Map<string, number[]> = new Map()
  
  isAllowed(key: string, maxOps: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Get existing operations for this key
    const ops = this.operations.get(key) || []
    
    // Filter out operations outside the current window
    const recentOps = ops.filter(timestamp => timestamp > windowStart)
    
    // Check if we're within the limit
    if (recentOps.length >= maxOps) {
      return false
    }
    
    // Add current operation
    recentOps.push(now)
    this.operations.set(key, recentOps)
    
    return true
  }
  
  clear(key?: string): void {
    if (key) {
      this.operations.delete(key)
    } else {
      this.operations.clear()
    }
  }
}

export const rateLimiter = new RateLimiter()

// Input sanitization for financial data
export const sanitizeFinancialInput = {
  amount: (value: string | number): number => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value
    if (isNaN(num) || !isFinite(num)) {
      throw new Error('Invalid amount format')
    }
    if (num < 0) {
      throw new Error('Amount cannot be negative')
    }
    if (num > 100000000) { // 10 crore limit
      throw new Error('Amount exceeds maximum limit')
    }
    // Round to 2 decimal places
    return Math.round(num * 100) / 100
  },
  
  text: (value: string, maxLength: number = 255): string => {
    if (typeof value !== 'string') {
      throw new Error('Value must be a string')
    }
    // Remove any potentially dangerous characters
    const sanitized = value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/[<>]/g, '') // Remove < and >
      .trim()
      .substring(0, maxLength)
    
    return sanitized
  },
  
  email: (value: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format')
    }
    return value.toLowerCase().trim()
  },
  
  date: (value: string): string => {
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format')
    }
    // Ensure date is not too far in the future or past
    const now = new Date()
    const maxFutureDate = new Date(now.getFullYear() + 10, 11, 31)
    const minPastDate = new Date(1900, 0, 1)
    
    if (date > maxFutureDate || date < minPastDate) {
      throw new Error('Date is outside acceptable range')
    }
    
    return date.toISOString().split('T')[0]
  }
}

// Secure data validation
export const validateFinancialData = {
  transaction: (data: any) => {
    const errors: string[] = []
    
    try {
      sanitizeFinancialInput.amount(data.amount)
    } catch (e) {
      errors.push(`Amount: ${e.message}`)
    }
    
    if (!data.type || !['income', 'expense', 'transfer'].includes(data.type)) {
      errors.push('Invalid transaction type')
    }
    
    try {
      sanitizeFinancialInput.date(data.date)
    } catch (e) {
      errors.push(`Date: ${e.message}`)
    }
    
    if (data.description && data.description.length > 500) {
      errors.push('Description too long')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },
  
  creditCard: (data: any) => {
    const errors: string[] = []
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Credit card name is required')
    }
    
    if (data.credit_limit !== undefined) {
      try {
        const limit = sanitizeFinancialInput.amount(data.credit_limit)
        if (limit <= 0) {
          errors.push('Credit limit must be positive')
        }
      } catch (e) {
        errors.push(`Credit limit: ${e.message}`)
      }
    }
    
    if (data.statement_date !== undefined) {
      const day = parseInt(data.statement_date)
      if (isNaN(day) || day < 1 || day > 31) {
        errors.push('Statement date must be between 1 and 31')
      }
    }
    
    if (data.due_date !== undefined) {
      const day = parseInt(data.due_date)
      if (isNaN(day) || day < 1 || day > 31) {
        errors.push('Due date must be between 1 and 31')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },
  
  loan: (data: any) => {
    const errors: string[] = []
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Loan name is required')
    }
    
    try {
      const principal = sanitizeFinancialInput.amount(data.principal_amount)
      if (principal <= 0) {
        errors.push('Principal amount must be positive')
      }
    } catch (e) {
      errors.push(`Principal amount: ${e.message}`)
    }
    
    try {
      const current = sanitizeFinancialInput.amount(data.current_balance)
      const principal = sanitizeFinancialInput.amount(data.principal_amount)
      if (current > principal) {
        errors.push('Current balance cannot exceed principal amount')
      }
    } catch (e) {
      errors.push(`Balance: ${e.message}`)
    }
    
    const interestRate = parseFloat(data.interest_rate)
    if (isNaN(interestRate) || interestRate < 0 || interestRate > 100) {
      errors.push('Interest rate must be between 0 and 100')
    }
    
    const totalEmis = parseInt(data.total_emis)
    if (isNaN(totalEmis) || totalEmis <= 0) {
      errors.push('Total EMIs must be a positive number')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Secure API wrapper with automatic rate limiting and validation
export class SecureAPIClient {
  private getUserKey(operation: string): string {
    const userId = supabase.auth.getUser().then(({ data: { user } }) => user?.id || 'anonymous')
    return `${operation}`
  }
  
  async executeWithSecurity<T>(
    operation: string,
    apiCall: () => Promise<T>,
    maxOps: number = 10
  ): Promise<T> {
    const key = this.getUserKey(operation)
    
    // Check rate limit
    if (!rateLimiter.isAllowed(key, maxOps)) {
      throw new Error('Too many requests. Please wait before trying again.')
    }
    
    try {
      const result = await apiCall()
      return result
    } catch (error: any) {
      // Log security-relevant errors
      if (error.message?.includes('RLS') || error.message?.includes('permission')) {
        console.error('Security violation attempt:', error)
      }
      throw error
    }
  }
  
  // Secure transaction operations
  async createTransaction(data: any) {
    const validation = validateFinancialData.transaction(data)
    if (!validation.isValid) {
      throw new Error(`Invalid transaction data: ${validation.errors.join(', ')}`)
    }
    
    return this.executeWithSecurity('create_transaction', async () => {
      const { data: result, error } = await supabase
        .from('transactions')
        .insert({
          ...data,
          amount: sanitizeFinancialInput.amount(data.amount),
          description: data.description ? sanitizeFinancialInput.text(data.description) : null,
          date: sanitizeFinancialInput.date(data.date)
        })
        .select()
        .single()
      
      if (error) throw error
      return result
    }, 20) // Allow more transactions per minute
  }
  
  // Secure credit card operations
  async createCreditCard(data: any) {
    const validation = validateFinancialData.creditCard(data)
    if (!validation.isValid) {
      throw new Error(`Invalid credit card data: ${validation.errors.join(', ')}`)
    }
    
    return this.executeWithSecurity('create_credit_card', async () => {
      const { data: result, error } = await supabase
        .from('credit_cards')
        .insert({
          ...data,
          name: sanitizeFinancialInput.text(data.name),
          credit_limit: data.credit_limit ? sanitizeFinancialInput.amount(data.credit_limit) : null
        })
        .select()
        .single()
      
      if (error) throw error
      return result
    })
  }
  
  // Secure loan operations
  async createLoan(data: any) {
    const validation = validateFinancialData.loan(data)
    if (!validation.isValid) {
      throw new Error(`Invalid loan data: ${validation.errors.join(', ')}`)
    }
    
    return this.executeWithSecurity('create_loan', async () => {
      const { data: result, error } = await supabase
        .from('loans')
        .insert({
          ...data,
          name: sanitizeFinancialInput.text(data.name),
          principal_amount: sanitizeFinancialInput.amount(data.principal_amount),
          current_balance: sanitizeFinancialInput.amount(data.current_balance),
          emi_amount: sanitizeFinancialInput.amount(data.emi_amount)
        })
        .select()
        .single()
      
      if (error) throw error
      return result
    })
  }
}

export const secureAPI = new SecureAPIClient()

// Security monitoring
export const SecurityMonitor = {
  logSecurityEvent: async (event: string, details: any = {}) => {
    // In production, this would send to a security monitoring service
    console.warn('Security Event:', event, details)
    
    // Could also log to Supabase audit table or external service
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Log to audit table if needed
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          table_name: 'security_events',
          record_id: crypto.randomUUID(),
          action: 'SECURITY_EVENT',
          new_values: { event, details, timestamp: new Date().toISOString() }
        })
      }
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  },
  
  checkSessionValidity: async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return false
      
      // Check if session is about to expire (within 5 minutes)
      const expiresAt = new Date(session.expires_at! * 1000)
      const now = new Date()
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)
      
      if (expiresAt < fiveMinutesFromNow) {
        // Refresh session
        const { error } = await supabase.auth.refreshSession()
        if (error) {
          await this.logSecurityEvent('SESSION_REFRESH_FAILED', { error: error.message })
          return false
        }
      }
      
      return true
    } catch (error) {
      await this.logSecurityEvent('SESSION_CHECK_FAILED', { error: error.message })
      return false
    }
  }
}

// Data masking utilities for display
export const DataMasking = {
  creditCardNumber: (number: string): string => {
    if (!number || number.length < 4) return '****'
    return '**** **** **** ' + number.slice(-4)
  },
  
  accountBalance: (balance: number, showFull: boolean = true): string => {
    if (showFull) {
      return `₹${balance.toLocaleString('en-IN')}`
    }
    return '₹****'
  },
  
  sensitiveAmount: (amount: number, mask: boolean = false): string => {
    if (mask) {
      return '₹****'
    }
    return `₹${amount.toLocaleString('en-IN')}`
  }
}

// Export all utilities
export * from './supabase'