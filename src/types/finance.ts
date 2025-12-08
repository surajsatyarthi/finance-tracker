export interface Category {
    id: string
    user_id: string
    name: string
    type: 'income' | 'expense'
    parent_category_id?: string
    color?: string
    created_at: string
}

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

export interface Transaction {
    id: string
    user_id: string
    amount: number
    type: 'income' | 'expense' | 'transfer'
    category_id?: string
    subcategory?: string
    description?: string
    payment_method: string
    date: string
    month?: number
    year?: number
    is_recurring?: boolean
    tags?: string[]
    created_at: string
    updated_at: string
}

export interface EnhancedTransaction extends Omit<Transaction, 'created_at' | 'updated_at'> {
    created_at: string
    updated_at: string
    formatted_amount: string
    account_name?: string
    category_name?: string
}

export interface CreditCard {
    id: string
    user_id: string
    name: string
    bank?: string
    card_type?: string
    last_four_digits?: string
    credit_limit: number
    current_balance: number
    statement_date?: number
    due_date?: number
    annual_fee?: number
    is_active?: boolean
    created_at: string
    updated_at: string
}

export interface Loan {
    id: string
    user_id: string
    name: string
    type: string
    principal_amount: number
    current_balance: number
    interest_rate?: number
    emi_amount?: number
    total_emis?: number
    emis_paid: number
    start_date: string
    end_date?: string
    next_emi_date?: string
    is_active?: boolean
    linked_credit_card_id?: string
    created_at: string
    updated_at: string
}

export interface Goal {
    id: string
    user_id: string
    name: string
    target_amount: number
    current_amount: number
    target_date?: string
    category?: string
    priority?: string
    is_completed?: boolean
    created_at: string
    updated_at: string
}

export interface FuturePayable {
    id: string
    type: 'loan_emi' | 'credit_card_due' | 'expense'
    amount: number
    dueDate: string
    description: string
    source: string
    originalTransactionId?: string
    status: 'pending' | 'paid' | 'overdue'
    timestamp?: string
}

export interface Investment {
    id: string
    user_id: string
    name: string
    type: 'stock' | 'mutual_fund' | 'gold' | 'fd' | 'real_estate' | 'crypto' | 'other'
    amount_invested: number
    current_value: number
    quantity?: number
    purchase_date?: string
    is_active: boolean
    created_at?: string
    updated_at?: string
}

export interface Budget {
    id: string
    user_id: string
    category_id: string
    category_name: string
    monthly_limit: number
    year: number
    month: number
    spent_amount: number
    remaining_amount: number
    created_at: string
    updated_at: string
}

export interface PayLaterService {
    id: string
    serviceName: string
    serviceCode: string
    creditLimit: number
    usedAmount: number
    availableAmount: number
    currentDue: number
    nextDueDate: string
    dueSchedule: string
    status: 'active' | 'due_soon' | 'overdue' | 'suspended'
    lastUsed?: string
    interestRate?: number
    penaltyFee?: number
}
