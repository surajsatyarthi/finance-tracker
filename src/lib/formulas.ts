import type { Account, CreditCard, Loan, EMI, BNPL, Transaction, Investment } from '@/types/database'

/**
 * Calculate Net Worth using verified formula from FSD Section 11
 * Net Worth = Total Assets - Total Liabilities
 * NOTE: Data is pre-filtered for is_active=true in dashboard-service
 */
export function calculateNetWorth(data: {
  accounts: Account[]
  creditCards: CreditCard[]
  loans: Loan[]
  emis: EMI[]
  bnpls: BNPL[]
  investments: Investment[]
}) {
  // Assets
  const accountBalances = data.accounts.reduce((sum, a) => sum + a.balance, 0)
  const investmentValues = data.investments.reduce((sum, i) => sum + i.current_value, 0)
  const totalAssets = accountBalances + investmentValues

  // Liabilities
  const loanBalances = data.loans.reduce((sum, l) => sum + l.current_balance, 0)

  // Credit card balances - using current_balance field
  const ccBalances = data.creditCards.reduce((sum, cc) => sum + cc.current_balance, 0)

  // EMI remaining amounts (NOT linked to credit cards to avoid double counting)
  const emiBalances = data.emis
    .filter(e => !e.deleted_at && !e.linked_card_id)
    .reduce((sum, e) => sum + e.remaining_amount, 0)

  // BNPL remaining amounts (NOT linked to credit cards to avoid double counting)
  const bnplBalances = data.bnpls
    .filter(b => !b.deleted_at && !b.linked_card_id)
    .reduce((sum, b) => sum + b.remaining_amount, 0)

  const totalLiabilities = loanBalances + ccBalances + emiBalances + bnplBalances

  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities
  }
}

/**
 * Calculate Savings Rate using verified formula from FSD Section 11
 * Savings Rate = (Monthly Income - Monthly Expenses) / Monthly Income * 100
 */
export function calculateSavingsRate(data: {
  transactions: Transaction[]
  startDate: Date
  endDate: Date
}) {
  const { transactions, startDate, endDate } = data
  const txInRange = transactions.filter(t => {
    if (t.deleted_at) return false
    const txDate = new Date(t.date)
    return txDate >= startDate && txDate <= endDate
  })

  const income = txInRange
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = txInRange
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  if (income === 0) return 0
  return ((income - expenses) / income) * 100
}

/**
 * Calculate Credit Utilization using verified formula from FSD Section 11
 * Credit Utilization = Total Outstanding / Total Credit Limit * 100
 * CRITICAL: Must exclude EMI and BNPL from credit card balances to avoid double counting
 */
export function calculateCreditUtilization(data: {
  creditCards: CreditCard[]
  emis: EMI[]
  bnpls: BNPL[]
}) {
  const totalLimit = data.creditCards.reduce((sum, cc) => sum + cc.credit_limit, 0)

  if (totalLimit === 0) return 0

  let totalOutstanding = 0

  // For each credit card, calculate outstanding excluding linked EMIs/BNPLs
  data.creditCards.forEach(card => {
    let cardOutstanding = card.current_balance

    // Subtract linked EMI amounts from card outstanding
    const linkedEMIs = data.emis.filter(e => !e.deleted_at && e.linked_card_id === card.id)
    const linkedEMIAmount = linkedEMIs.reduce((sum, e) => sum + e.remaining_amount, 0)
    cardOutstanding -= linkedEMIAmount

    // Subtract linked BNPL amounts from card outstanding
    const linkedBNPLs = data.bnpls.filter(b => !b.deleted_at && b.linked_card_id === card.id)
    const linkedBNPLAmount = linkedBNPLs.reduce((sum, b) => sum + b.remaining_amount, 0)
    cardOutstanding -= linkedBNPLAmount

    totalOutstanding += Math.max(0, cardOutstanding)
  })

  return (totalOutstanding / totalLimit) * 100
}

/**
 * Calculate Debt Service Ratio using verified formula from FSD Section 11
 * DSR = Monthly Debt Payments / Monthly Income * 100
 */
export function calculateDebtServiceRatio(data: {
  loans: Loan[]
  emis: EMI[]
  bnpls: BNPL[]
  creditCards: CreditCard[]
  transactions: Transaction[]
  startDate: Date
  endDate: Date
}) {
  // Calculate monthly income
  const txInRange = data.transactions.filter(t => {
    if (t.deleted_at) return false
    const txDate = new Date(t.date)
    return txDate >= data.startDate && txDate <= data.endDate
  })

  const monthlyIncome = txInRange
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  if (monthlyIncome === 0) return 0

  // Calculate total monthly debt payments
  const loanEMIs = data.loans
    .filter(l => l.emi_amount !== null)
    .reduce((sum, l) => sum + (l.emi_amount || 0), 0)

  const emiPayments = data.emis
    .filter(e => !e.deleted_at)
    .reduce((sum, e) => sum + e.monthly_emi, 0)

  const bnplPayments = data.bnpls
    .filter(b => !b.deleted_at)
    .reduce((sum, b) => sum + b.installment_amount, 0)

  const totalMonthlyDebt = loanEMIs + emiPayments + bnplPayments

  return (totalMonthlyDebt / monthlyIncome) * 100
}

/**
 * Calculate Liquidity Ratio using verified formula from FSD Section 11
 * Liquidity Ratio = Liquid Assets / Monthly Expenses
 */
export function calculateLiquidityRatio(data: {
  accounts: Account[]
  transactions: Transaction[]
  startDate: Date
  endDate: Date
}) {
  // Liquid assets = savings + current accounts
  const liquidAssets = data.accounts
    .filter(a => a.type === 'savings' || a.type === 'current')
    .reduce((sum, a) => sum + a.balance, 0)

  // Calculate monthly expenses
  const txInRange = data.transactions.filter(t => {
    if (t.deleted_at) return false
    const txDate = new Date(t.date)
    return txDate >= data.startDate && txDate <= data.endDate
  })

  const monthlyExpenses = txInRange
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  if (monthlyExpenses === 0) return 0

  return liquidAssets / monthlyExpenses
}

/**
 * Get upcoming payments in the next 30 days
 */
export function getUpcomingPayments(data: {
  creditCards: CreditCard[]
  loans: Loan[]
  emis: EMI[]
  bnpls: BNPL[]
}) {
  const payments: Array<{
    name: string
    amount: number
    dueDate: Date
    category: 'Credit Card' | 'Loan' | 'EMI' | 'BNPL'
    subType?: string
  }> = []
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Credit card due dates
  data.creditCards.forEach(card => {
    if (card.due_date && card.current_balance > 0) {
      const dueDate = new Date(now.getFullYear(), now.getMonth(), card.due_date)
      if (dueDate < now) {
        dueDate.setMonth(dueDate.getMonth() + 1)
      }
      if (dueDate <= thirtyDaysFromNow) {
        payments.push({
          name: card.name,
          amount: card.current_balance,
          dueDate,
          category: 'Credit Card',
          subType: card.bank || undefined
        })
      }
    }
  })

  // Loan EMIs
  data.loans.forEach(loan => {
    if (loan.next_emi_date && loan.emi_amount) {
      const dueDate = new Date(loan.next_emi_date)
      if (dueDate <= thirtyDaysFromNow) {
        payments.push({
          name: loan.name,
          amount: loan.emi_amount,
          dueDate,
          category: 'Loan',
          subType: loan.type
        })
      }
    }
  })

  // EMIs
  data.emis.forEach(emi => {
    if (!emi.deleted_at && emi.next_due_date) {
      const dueDate = new Date(emi.next_due_date)
      if (dueDate <= thirtyDaysFromNow) {
        payments.push({
          name: emi.emi_name,
          amount: emi.monthly_emi,
          dueDate,
          category: 'EMI',
          subType: emi.linked_card_id ? 'Card-linked' : 'Standalone'
        })
      }
    }
  })

  // BNPLs
  data.bnpls.forEach(bnpl => {
    if (!bnpl.deleted_at && bnpl.next_due_date) {
      const dueDate = new Date(bnpl.next_due_date)
      if (dueDate <= thirtyDaysFromNow) {
        payments.push({
          name: bnpl.merchant,
          amount: bnpl.installment_amount,
          dueDate,
          category: 'BNPL',
          subType: bnpl.linked_card_id ? 'Card-linked' : 'Standalone'
        })
      }
    }
  })

  return payments.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
}
