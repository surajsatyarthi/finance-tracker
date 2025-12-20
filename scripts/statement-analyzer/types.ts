/**
 * Common types for statement analyzer
 */

export interface StatementData {
    // Card identification
    cardName: string
    lastFourDigits: string
    cardNumber?: string

    // Dates
    statementDate: string  // YYYY-MM-DD
    dueDate: string        // YYYY-MM-DD
    statementPeriod?: {
        from: string
        to: string
    }

    // Balances
    previousBalance: number
    newCharges: number
    paymentsCredits: number
    totalAmountDue: number
    minimumAmountDue: number

    // Limits
    creditLimit: number
    availableCredit: number
    cashLimit?: number

    // EMI Details (if any)
    emis?: EMIDetail[]

    // Transactions (optional)
    transactions?: Transaction[]
}

export interface EMIDetail {
    description: string
    creationDate: string
    finishDate: string
    totalInstallments: number
    pendingInstallments: number
    emiAmount: number
    outstandingAmount: number
    principalAmount?: number
}

export interface Transaction {
    date: string
    description: string
    amount: number
    type: 'debit' | 'credit'
}

export interface ParseResult {
    success: boolean
    data?: StatementData
    error?: string
    bankName: string
}

export interface UpdateResult {
    success: boolean
    cardId?: string
    previousBalance: number
    newBalance: number
    message: string
}
