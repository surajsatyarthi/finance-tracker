// Data Management for Finance Tracker
// Handles all localStorage operations and data calculations

export interface BankAccount {
  id: string
  name: string
  type: 'savings' | 'current' | 'salary'
  balance: number
  lastUpdated: string
}

export interface IncomeTransaction {
  id: string
  amount: number
  description: string
  date: string
  type: 'cash' | 'non-cash'
  bankAccount?: string
  category: string
  timestamp: string
  recurring?: { frequency: 'monthly' | 'quarterly' }
  partition?: 'business' | 'personal'
}

export interface ExpenseTransaction {
  id: string
  amount: number
  description: string
  date: string
  paymentMethod: 'cash' | 'upi' | 'credit_card' | 'credit_card_emi' | 'bnpl'
  bankAccount?: string // for UPI
  creditCard?: string // for credit card payments
  bnplProvider?: string // for BNPL
  emiDetails?: {
    tenure: number // months
    interestRate: number // annual percentage
    monthlyAmount: number
    totalAmount: number
  }
  category: string
  timestamp: string
  status: 'paid' | 'pending' | 'scheduled'
  recurring?: { frequency: 'monthly' | 'quarterly' }
  partition?: 'business' | 'personal'
}

export interface FuturePayable {
  id: string
  type: 'credit_card' | 'emi' | 'bnpl'
  amount: number
  dueDate: string
  description: string
  source: string // credit card name, EMI source, BNPL provider
  originalTransactionId: string
  status: 'pending' | 'paid'
  timestamp: string
}

export interface CreditCard {
  id: string
  name: string
  cardNumber: string // full card number for copying
  lastFourDigits: string
  cvv: number // CVV + 1 for security
  expiryMonth: number
  expiryYear: number
  dueDate: number // payment day of month (1-31)
  statementDate: string // statement date
  creditLimit: number
  currentBalance: number // actual spending/liability
  annualFee: number
  renewalMonth: string
  isActive: boolean
}

export interface LiquidityData {
  cashBalance: number
  bankAccounts: BankAccount[]
  totalLiquidity: number
  lastUpdated: string
}

export interface LocalBudget {
  year: number
  monthIndex: number
  categories: Record<string, number>
  total: number
}

export const getLocalBudget = (monthIndex: number, year: number): LocalBudget | null => {
  if (typeof window === 'undefined') return null
  const key = `budget_${year}_${monthIndex}`
  const raw = localStorage.getItem(key)
  return raw ? JSON.parse(raw) : null
}

export const setLocalBudgetCategory = (monthIndex: number, year: number, category: string, amount: number): LocalBudget => {
  const key = `budget_${year}_${monthIndex}`
  const current = getLocalBudget(monthIndex, year) || { year, monthIndex, categories: {}, total: 0 }
  current.categories[category] = Math.max(0, Number(amount) || 0)
  current.total = Object.values(current.categories).reduce((sum, v) => sum + (Number(v) || 0), 0)
  localStorage.setItem(key, JSON.stringify(current))
  return current
}

export const copyBudgetFromPrevious = (monthIndex: number, year: number, fallbackCategories: Record<string, number>): LocalBudget => {
  const prevIndex = monthIndex === 0 ? 0 : monthIndex - 1
  const prev = getLocalBudget(prevIndex, year)
  const categories = prev ? prev.categories : fallbackCategories
  const total = Object.values(categories).reduce((sum, v) => sum + (Number(v) || 0), 0)
  const record: LocalBudget = { year, monthIndex, categories, total }
  const key = `budget_${year}_${monthIndex}`
  localStorage.setItem(key, JSON.stringify(record))
  return record
}

export interface LocalGoal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  target_date?: string | null
  category?: string | null
  priority: 'high' | 'medium' | 'low'
  is_completed: boolean
  created_at: string
  updated_at: string
}

export const getGoals = (): LocalGoal[] => {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem('goals')
  return raw ? JSON.parse(raw) : []
}

export const storeGoal = (goal: Omit<LocalGoal, 'id' | 'created_at' | 'updated_at'>) => {
  const goals = getGoals()
  const newGoal: LocalGoal = {
    id: `goal_${Date.now()}`,
    ...goal,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  goals.push(newGoal)
  localStorage.setItem('goals', JSON.stringify(goals))
  return newGoal
}

export const updateGoalAmount = (id: string, current_amount: number) => {
  const goals = getGoals()
  const idx = goals.findIndex((g) => g.id === id)
  if (idx === -1) return false
  goals[idx].current_amount = Math.max(0, current_amount)
  goals[idx].updated_at = new Date().toISOString()
  goals[idx].is_completed = goals[idx].current_amount >= goals[idx].target_amount
  localStorage.setItem('goals', JSON.stringify(goals))
  return true
}

// Savings & FDs
export interface FDRecord {
  id: string
  name: string
  amount: number
  rate: number
  startDate: string
  maturityDate: string
  autoRenew: boolean
  notes?: string
}

export const getFDs = (): FDRecord[] => {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem('fds')
  return raw ? JSON.parse(raw) : []
}

export const storeFD = (fd: Omit<FDRecord, 'id'>) => {
  const fds = getFDs()
  const record: FDRecord = { id: `fd_${Date.now()}`, ...fd }
  fds.push(record)
  localStorage.setItem('fds', JSON.stringify(fds))
  return record
}

export const updateFD = (id: string, patch: Partial<FDRecord>) => {
  const fds = getFDs()
  const idx = fds.findIndex(f => f.id === id)
  if (idx === -1) return false
  fds[idx] = { ...fds[idx], ...patch }
  localStorage.setItem('fds', JSON.stringify(fds))
  return true
}

export const deleteFD = (id: string) => {
  const fds = getFDs().filter(f => f.id !== id)
  localStorage.setItem('fds', JSON.stringify(fds))
  return true
}

// Initialize default data structure
export const initializeDefaultData = () => {
  // Initialize empty bank accounts array if it doesn't exist
  if (!localStorage.getItem('bank_accounts')) {
    localStorage.setItem('bank_accounts', JSON.stringify([]))
  }

  // Initialize cash balance if it doesn't exist
  if (!localStorage.getItem('cash_balance')) {
    localStorage.setItem('cash_balance', '1005') // User's actual cash balance
  }

  // Calculate and set initial total liquidity
  calculateAndUpdateTotalLiquidity()
}

// Get all bank accounts
export const getBankAccounts = (): BankAccount[] => {
  if (typeof window === 'undefined') return []
  const accounts = localStorage.getItem('bank_accounts')
  return accounts ? JSON.parse(accounts) : []
}

// Get cash balance
export const getCashBalance = (): number => {
  if (typeof window === 'undefined') return 0
  const val = localStorage.getItem('cash_balance')
  return val ? parseFloat(val) : 0
}

// Get total liquidity
export const getTotalLiquidity = (): number => {
  if (typeof window === 'undefined') return 0
  return parseFloat(localStorage.getItem('total_liquidity') || '0')
}

// Update cash balance
export const updateCashBalance = (amount: number, isAddition: boolean = true) => {
  const currentCash = getCashBalance()
  const newCash = isAddition ? currentCash + amount : currentCash - amount
  localStorage.setItem('cash_balance', Math.max(0, newCash).toString())

  // Update total liquidity
  calculateAndUpdateTotalLiquidity()

  console.log(`Cash ${isAddition ? 'increased' : 'decreased'}: ₹${currentCash} ${isAddition ? '+' : '-'} ₹${amount} = ₹${newCash}`)
  return newCash
}

// Update specific bank account balance
export const updateBankAccountBalance = (accountId: string, amount: number, isAddition: boolean = true) => {
  const accounts = getBankAccounts()
  const accountIndex = accounts.findIndex(acc => acc.id === accountId)

  if (accountIndex !== -1) {
    const currentBalance = accounts[accountIndex].balance
    const newBalance = isAddition ? currentBalance + amount : currentBalance - amount

    accounts[accountIndex].balance = Math.max(0, newBalance)
    accounts[accountIndex].lastUpdated = new Date().toISOString()

    localStorage.setItem('bank_accounts', JSON.stringify(accounts))

    // Update total liquidity
    calculateAndUpdateTotalLiquidity()

    console.log(`${accounts[accountIndex].name} ${isAddition ? 'increased' : 'decreased'}: ₹${currentBalance} ${isAddition ? '+' : '-'} ₹${amount} = ₹${newBalance}`)
    return newBalance
  } else {
    console.error(`Bank account with ID ${accountId} not found`)
    return 0
  }
}

export const setBankAccountBalance = (accountId: string, newBalance: number) => {
  const accounts = getBankAccounts()
  const idx = accounts.findIndex((acc) => acc.id === accountId)
  if (idx === -1) {
    console.error(`Bank account with ID ${accountId} not found`)
    return 0
  }
  accounts[idx].balance = Math.max(0, newBalance)
  accounts[idx].lastUpdated = new Date().toISOString()
  localStorage.setItem('bank_accounts', JSON.stringify(accounts))
  calculateAndUpdateTotalLiquidity()
  return accounts[idx].balance
}

// Calculate and update total liquidity
export const calculateAndUpdateTotalLiquidity = () => {
  const cashBalance = getCashBalance()
  const bankAccounts = getBankAccounts()
  const bankTotal = bankAccounts.reduce((total, account) => total + account.balance, 0)

  const totalLiquidity = cashBalance + bankTotal
  localStorage.setItem('total_liquidity', totalLiquidity.toString())
  localStorage.setItem('liquidity_last_updated', new Date().toISOString())

  console.log(`Total Liquidity Updated: Cash (₹${cashBalance}) + Bank (₹${bankTotal}) = ₹${totalLiquidity}`)
  return totalLiquidity
}

// Store income transaction
export const storeIncomeTransaction = (incomeData: Omit<IncomeTransaction, 'id' | 'timestamp'>) => {
  const transactions = getIncomeTransactions()
  const newTransaction: IncomeTransaction = {
    id: `income_${Date.now()}`,
    ...incomeData,
    timestamp: new Date().toISOString()
  }

  transactions.push(newTransaction)
  localStorage.setItem('income_transactions', JSON.stringify(transactions))

  console.log('Income transaction stored:', newTransaction)
  return newTransaction
}

// Get all income transactions
export const getIncomeTransactions = (): IncomeTransaction[] => {
  if (typeof window === 'undefined') return []
  const transactions = localStorage.getItem('income_transactions')
  return transactions ? JSON.parse(transactions) : []
}

// Process income entry with proper validation
export const processIncomeEntry = async (incomeData: Omit<IncomeTransaction, 'id' | 'timestamp'>): Promise<IncomeTransaction> => {
  try {
    // Validate data
    if (!incomeData.amount || incomeData.amount <= 0) {
      throw new Error('Invalid amount')
    }

    if (incomeData.type === 'non-cash' && !incomeData.bankAccount) {
      throw new Error('Bank account required for non-cash income')
    }

    // Process the income based on type
    if (incomeData.type === 'cash') {
      // Add to cash balance
      updateCashBalance(incomeData.amount, true)
    } else if (incomeData.type === 'non-cash' && incomeData.bankAccount) {
      // Add to selected bank account
      updateBankAccountBalance(incomeData.bankAccount, incomeData.amount, true)
    }

    // Store the transaction
    const transaction = storeIncomeTransaction(incomeData)

    console.log(`Processed ${incomeData.type} income of ₹${incomeData.amount}`)
    return transaction

  } catch (error) {
    console.error('Error processing income entry:', error)
    throw error
  }
}

// Get liquidity summary
export const getLiquidityData = (): LiquidityData => {
  if (typeof window === 'undefined') {
    return {
      cashBalance: 0,
      bankAccounts: [],
      totalLiquidity: 0,
      lastUpdated: new Date().toISOString()
    }
  }
  return {
    cashBalance: getCashBalance(),
    bankAccounts: getBankAccounts(),
    totalLiquidity: getTotalLiquidity(),
    lastUpdated: localStorage.getItem('liquidity_last_updated') || new Date().toISOString()
  }
}

// Initialize credit cards if they don't exist
export const initializeCreditCards = () => {
  if (!localStorage.getItem('credit_cards')) {
    const userCreditCards: CreditCard[] = [
      {
        "id": "sbi_bpcl",
        "name": "SBI BPCL",
        "cardNumber": "",
        "lastFourDigits": "6358",
        "cvv": 0,
        "expiryMonth": 2,
        "expiryYear": 26,
        "dueDate": 20,
        "statementDate": "12 Aug",
        "creditLimit": 34000,
        "currentBalance": 0,
        "annualFee": 499,
        "renewalMonth": "Feb",
        "isActive": true
      },
      {
        "id": "sbi_paytm",
        "name": "SBI Paytm",
        "cardNumber": "",
        "lastFourDigits": "4092",
        "cvv": 0,
        "expiryMonth": 5,
        "expiryYear": 29,
        "dueDate": 6,
        "statementDate": "18 June",
        "creditLimit": 150000,
        "currentBalance": 0,
        "annualFee": 500,
        "renewalMonth": "Feb",
        "isActive": true
      },
      {
        "id": "sbi_simply_save",
        "name": "SBI Simply save",
        "cardNumber": "",
        "lastFourDigits": "5905",
        "cvv": 0,
        "expiryMonth": 8,
        "expiryYear": 26,
        "dueDate": 28,
        "statementDate": "9 Mar",
        "creditLimit": 16000,
        "currentBalance": 0,
        "annualFee": 499,
        "renewalMonth": "",
        "isActive": true
      },
      {
        "id": "sc_easemytrip",
        "name": "SC EaseMyTrip",
        "cardNumber": "",
        "lastFourDigits": "5621",
        "cvv": 0,
        "expiryMonth": 9,
        "expiryYear": 28,
        "dueDate": 2,
        "statementDate": "11 Oct",
        "creditLimit": 214500,
        "currentBalance": 0,
        "annualFee": 350,
        "renewalMonth": "Oct",
        "isActive": true
      },
      {
        "id": "axis_rewards",
        "name": "Axis Rewards",
        "cardNumber": "",
        "lastFourDigits": "9086",
        "cvv": 0,
        "expiryMonth": 3,
        "expiryYear": 30,
        "dueDate": 8,
        "statementDate": "21 Mar",
        "creditLimit": 120000,
        "currentBalance": 0,
        "annualFee": 1000,
        "renewalMonth": "Feb",
        "isActive": true
      },
      {
        "id": "axis_my_zone",
        "name": "Axis My Zone",
        "cardNumber": "",
        "lastFourDigits": "9170",
        "cvv": 0,
        "expiryMonth": 10,
        "expiryYear": 27,
        "dueDate": 30,
        "statementDate": "13 July",
        "creditLimit": 154000,
        "currentBalance": 0,
        "annualFee": 0,
        "renewalMonth": "",
        "isActive": true
      },
      {
        "id": "axis_neo",
        "name": "Axis Neo",
        "cardNumber": "",
        "lastFourDigits": "4980",
        "cvv": 0,
        "expiryMonth": 5,
        "expiryYear": 27,
        "dueDate": 5,
        "statementDate": "18 July",
        "creditLimit": 154000,
        "currentBalance": 0,
        "annualFee": 250,
        "renewalMonth": "May",
        "isActive": true
      },
      {
        "id": "rbl_platinum_delight",
        "name": "RBL Platinum Delight",
        "cardNumber": "",
        "lastFourDigits": "7087",
        "cvv": 0,
        "expiryMonth": 7,
        "expiryYear": 31,
        "dueDate": 2,
        "statementDate": "12 August",
        "creditLimit": 224000,
        "currentBalance": 0,
        "annualFee": 1000,
        "renewalMonth": "Feb",
        "isActive": true
      },
      {
        "id": "rbl_bajaj_finserv",
        "name": "RBL Bajaj Finserv",
        "cardNumber": "",
        "lastFourDigits": "9635",
        "cvv": 0,
        "expiryMonth": 2,
        "expiryYear": 30,
        "dueDate": 2,
        "statementDate": "12 August",
        "creditLimit": 160000,
        "currentBalance": 0,
        "annualFee": 1000,
        "renewalMonth": "Dec",
        "isActive": true
      },
      {
        "id": "hdfc_millenia",
        "name": "HDFC Millenia",
        "cardNumber": "",
        "lastFourDigits": "1470",
        "cvv": 0,
        "expiryMonth": 6,
        "expiryYear": 28,
        "dueDate": 7,
        "statementDate": "19 Dec",
        "creditLimit": 10000,
        "currentBalance": 0,
        "annualFee": 0,
        "renewalMonth": "",
        "isActive": true
      },
      {
        "id": "hdfc_neu",
        "name": "HDFC Neu",
        "cardNumber": "",
        "lastFourDigits": "5556",
        "cvv": 0,
        "expiryMonth": 8,
        "expiryYear": 31,
        "dueDate": 21,
        "statementDate": "2 Feb",
        "creditLimit": 10000,
        "currentBalance": 0,
        "annualFee": 499,
        "renewalMonth": "Sep",
        "isActive": true
      },
      {
        "id": "indusind_platinum_aura_edge",
        "name": "Indusind Platinum Aura Edge",
        "cardNumber": "",
        "lastFourDigits": "0976",
        "cvv": 0,
        "expiryMonth": 1,
        "expiryYear": 28,
        "dueDate": 2,
        "statementDate": "13 June",
        "creditLimit": 151000,
        "currentBalance": 0,
        "annualFee": 0,
        "renewalMonth": "",
        "isActive": true
      },
      {
        "id": "indusind_rupay",
        "name": "Indusind Rupay",
        "cardNumber": "",
        "lastFourDigits": "6273",
        "cvv": 0,
        "expiryMonth": 9,
        "expiryYear": 29,
        "dueDate": 1,
        "statementDate": "",
        "creditLimit": 100000,
        "currentBalance": 0,
        "annualFee": 0,
        "renewalMonth": "",
        "isActive": true
      },
      {
        "id": "icici_amazon",
        "name": "ICICI Amazon",
        "cardNumber": "",
        "lastFourDigits": "8017",
        "cvv": 0,
        "expiryMonth": 3,
        "expiryYear": 32,
        "dueDate": 5,
        "statementDate": "18 July",
        "creditLimit": 460000,
        "currentBalance": 0,
        "annualFee": 0,
        "renewalMonth": "",
        "isActive": true
      },
      {
        "id": "icici_coral_rupay",
        "name": "ICICI Coral Rupay",
        "cardNumber": "",
        "lastFourDigits": "3026",
        "cvv": 0,
        "expiryMonth": 11,
        "expiryYear": 31,
        "dueDate": 20,
        "statementDate": "2 August",
        "creditLimit": 0,
        "currentBalance": 0,
        "annualFee": 0,
        "renewalMonth": "Aug",
        "isActive": true
      },
      {
        "id": "icici_adani_one",
        "name": "ICICI Adani One",
        "cardNumber": "",
        "lastFourDigits": "7026",
        "cvv": 0,
        "expiryMonth": 2,
        "expiryYear": 32,
        "dueDate": 23,
        "statementDate": "5 Aug",
        "creditLimit": 0,
        "currentBalance": 0,
        "annualFee": 0,
        "renewalMonth": "Feb",
        "isActive": true
      },
      {
        "id": "pop_yes_bank",
        "name": "Pop YES Bank",
        "cardNumber": "",
        "lastFourDigits": "9572",
        "cvv": 0,
        "expiryMonth": 1,
        "expiryYear": 32,
        "dueDate": 5,
        "statementDate": "16 Aug",
        "creditLimit": 300000,
        "currentBalance": 0,
        "annualFee": 0,
        "renewalMonth": "",
        "isActive": true
      },
      {
        "id": "supermoney",
        "name": "SuperMoney",
        "cardNumber": "",
        "lastFourDigits": "9296",
        "cvv": 0,
        "expiryMonth": 9,
        "expiryYear": 32,
        "dueDate": 5,
        "statementDate": "1 Oct",
        "creditLimit": 1800,
        "currentBalance": 0,
        "annualFee": 0,
        "renewalMonth": "Sep",
        "isActive": true
      },
      {
        "id": "bajaj_finserv_emi",
        "name": "BAJAJ Finserv EMI",
        "cardNumber": "",
        "lastFourDigits": "7910",
        "cvv": 0,
        "expiryMonth": 10,
        "expiryYear": 22,
        "dueDate": 1,
        "statementDate": "",
        "creditLimit": 115000,
        "currentBalance": 0,
        "annualFee": 0,
        "renewalMonth": "",
        "isActive": true
      },
      {
        "id": "cbi",
        "name": "CBI",
        "cardNumber": "",
        "lastFourDigits": "2802",
        "cvv": 0,
        "expiryMonth": 5,
        "expiryYear": 28,
        "dueDate": 1,
        "statementDate": "",
        "creditLimit": 0,
        "currentBalance": 0,
        "annualFee": 0,
        "renewalMonth": "",
        "isActive": true
      },
      {
        "id": "sbi",
        "name": "SBI",
        "cardNumber": "",
        "lastFourDigits": "4350",
        "cvv": 0,
        "expiryMonth": 1,
        "expiryYear": 28,
        "dueDate": 1,
        "statementDate": "",
        "creditLimit": 0,
        "currentBalance": 0,
        "annualFee": 0,
        "renewalMonth": "",
        "isActive": true
      },
      {
        "id": "jupiter",
        "name": "Jupiter",
        "cardNumber": "",
        "lastFourDigits": "9534",
        "cvv": 0,
        "expiryMonth": 11,
        "expiryYear": 27,
        "dueDate": 1,
        "statementDate": "",
        "creditLimit": 0,
        "currentBalance": 0,
        "annualFee": 0,
        "renewalMonth": "",
        "isActive": true
      },
      {
        "id": "slice",
        "name": "Slice",
        "cardNumber": "",
        "lastFourDigits": "5685",
        "cvv": 0,
        "expiryMonth": 8,
        "expiryYear": 28,
        "dueDate": 1,
        "statementDate": "",
        "creditLimit": 0,
        "currentBalance": 0,
        "annualFee": 0,
        "renewalMonth": "",
        "isActive": true
      },
      {
        "id": "tide",
        "name": "Tide",
        "cardNumber": "",
        "lastFourDigits": "4595",
        "cvv": 0,
        "expiryMonth": 9,
        "expiryYear": 29,
        "dueDate": 1,
        "statementDate": "",
        "creditLimit": 0,
        "currentBalance": 0,
        "annualFee": 0,
        "renewalMonth": "",
        "isActive": true
      },
      {
        "id": "sbm",
        "name": "SBM",
        "cardNumber": "",
        "lastFourDigits": "2636",
        "cvv": 0,
        "expiryMonth": 6,
        "expiryYear": 99,
        "dueDate": 1,
        "statementDate": "",
        "creditLimit": 0,
        "currentBalance": 0,
        "annualFee": 0,
        "renewalMonth": "",
        "isActive": true
      },
      {
        "id": "dcb",
        "name": "DCB",
        "cardNumber": "",
        "lastFourDigits": "0178",
        "cvv": 0,
        "expiryMonth": 3,
        "expiryYear": 32,
        "dueDate": 1,
        "statementDate": "",
        "creditLimit": 0,
        "currentBalance": 0,
        "annualFee": 0,
        "renewalMonth": "",
        "isActive": true
      }
    ]
    localStorage.setItem('credit_cards', JSON.stringify(userCreditCards))
  }
}

// Get all credit cards
export const getCreditCards = (): CreditCard[] => {
  if (typeof window === 'undefined') return []
  const cards = localStorage.getItem('credit_cards')
  return cards ? JSON.parse(cards) : []
}

export const storeCreditCard = (card: {
  name: string
  lastFourDigits?: string
  creditLimit: number
  currentBalance?: number
  dueDate: number
  statementDate?: string
  annualFee?: number
  renewalMonth?: string
  expiryMonth?: number
  expiryYear?: number
  isActive?: boolean
}): CreditCard => {
  const cards = getCreditCards()
  const record: CreditCard = {
    id: `card_${Date.now()}`,
    name: card.name,
    cardNumber: '',
    lastFourDigits: card.lastFourDigits || '',
    cvv: 0,
    expiryMonth: card.expiryMonth || 0,
    expiryYear: card.expiryYear || 0,
    dueDate: card.dueDate,
    statementDate: card.statementDate || '',
    creditLimit: Math.max(0, card.creditLimit),
    currentBalance: Math.max(0, card.currentBalance || 0),
    annualFee: card.annualFee || 0,
    renewalMonth: card.renewalMonth || '',
    isActive: card.isActive !== false,
  }
  cards.push(record)
  localStorage.setItem('credit_cards', JSON.stringify(cards))
  return record
}

export const updateCreditCard = (id: string, patch: Partial<CreditCard>) => {
  const cards = getCreditCards()
  const idx = cards.findIndex(c => c.id === id)
  if (idx === -1) return false
  const safePatch = { ...patch }
  // Never persist sensitive numbers or cvv from patch
  if (typeof safePatch.cardNumber !== 'undefined') delete (safePatch as Record<string, unknown>).cardNumber
  if (typeof safePatch.cvv !== 'undefined') delete (safePatch as Record<string, unknown>).cvv
  cards[idx] = { ...cards[idx], ...safePatch }
  localStorage.setItem('credit_cards', JSON.stringify(cards))
  return true
}

export const deleteCreditCard = (id: string) => {
  const cards = getCreditCards().filter(c => c.id !== id)
  localStorage.setItem('credit_cards', JSON.stringify(cards))
  return true
}

// Update credit card balance
export const updateCreditCardBalance = (cardId: string, amount: number, isAddition: boolean = true) => {
  const cards = getCreditCards()
  const cardIndex = cards.findIndex(card => card.id === cardId)

  if (cardIndex !== -1) {
    const currentBalance = cards[cardIndex].currentBalance
    const newBalance = isAddition ? currentBalance + amount : currentBalance - amount

    cards[cardIndex].currentBalance = Math.max(0, newBalance)

    localStorage.setItem('credit_cards', JSON.stringify(cards))

    console.log(`${cards[cardIndex].name} balance ${isAddition ? 'increased' : 'decreased'}: ₹${currentBalance} ${isAddition ? '+' : '-'} ₹${amount} = ₹${newBalance}`)
    return newBalance
  } else {
    console.error(`Credit card with ID ${cardId} not found`)
    return 0
  }
}


// Get credit card liability summary
export const getCreditCardLiabilitySummary = () => {
  const cards = getCreditCards()
  const totalLimit = cards.reduce((sum, card) => sum + card.creditLimit, 0)
  const totalOutstanding = cards.reduce((sum, card) => sum + card.currentBalance, 0)
  const overallUtilization = totalLimit > 0 ? Math.round((totalOutstanding / totalLimit) * 100) : 0

  return {
    totalCards: cards.length,
    totalLimit,
    totalOutstanding,
    overallUtilization,
    cards: cards.map(card => ({
      ...card,
      utilization: card.creditLimit > 0 ? Math.round((card.currentBalance / card.creditLimit) * 100) : 0
    }))
  }
}

// Get all expense transactions
export const getExpenseTransactions = (): ExpenseTransaction[] => {
  if (typeof window === 'undefined') return []
  const transactions = localStorage.getItem('expense_transactions')
  return transactions ? JSON.parse(transactions) : []
}

// Get all future payables
export const getFuturePayables = (): FuturePayable[] => {
  if (typeof window === 'undefined') return []
  const payables = localStorage.getItem('future_payables')
  return payables ? JSON.parse(payables) : []
}

export const updateFuturePayableStatus = (payableId: string, status: 'pending' | 'paid') => {
  const payables = getFuturePayables()
  const idx = payables.findIndex((p) => p.id === payableId)
  if (idx === -1) return false
  payables[idx].status = status
  localStorage.setItem('future_payables', JSON.stringify(payables))
  return true
}

// Store expense transaction
export const storeExpenseTransaction = (expenseData: Omit<ExpenseTransaction, 'id' | 'timestamp'>) => {
  const transactions = getExpenseTransactions()
  const newTransaction: ExpenseTransaction = {
    id: `expense_${Date.now()}`,
    ...expenseData,
    timestamp: new Date().toISOString()
  }

  transactions.push(newTransaction)
  localStorage.setItem('expense_transactions', JSON.stringify(transactions))

  console.log('Expense transaction stored:', newTransaction)
  return newTransaction
}

// Store future payable
export const storeFuturePayable = (payableData: Omit<FuturePayable, 'id' | 'timestamp'>) => {
  const payables = getFuturePayables()
  const newPayable: FuturePayable = {
    id: `payable_${Date.now()}`,
    ...payableData,
    timestamp: new Date().toISOString()
  }

  payables.push(newPayable)
  localStorage.setItem('future_payables', JSON.stringify(payables))

  console.log('Future payable stored:', newPayable)
  return newPayable
}

// Calculate EMI details
export const calculateEMI = (principal: number, annualRate: number, tenureMonths: number) => {
  const monthlyRate = annualRate / (12 * 100)
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  const totalAmount = emi * tenureMonths

  return {
    monthlyAmount: Math.round(emi * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100
  }
}

export interface LoanRecord {
  id: string
  name: string
  principal: number
  rate: number
  tenureMonths: number
  startDate: string
  emisPaid: number
  monthlyAmount: number
  totalAmount: number
  nextDueDate: string
}

export const getLoans = (): LoanRecord[] => {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem('loans')
  return raw ? JSON.parse(raw) : []
}

export const storeLoan = (payload: Omit<LoanRecord, 'id' | 'monthlyAmount' | 'totalAmount' | 'nextDueDate' | 'emisPaid'>) => {
  const { monthlyAmount, totalAmount } = calculateEMI(payload.principal, payload.rate, payload.tenureMonths)
  const loans = getLoans()
  const start = new Date(payload.startDate)
  const next = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const record: LoanRecord = {
    id: `loan_${Date.now()}`,
    name: payload.name,
    principal: payload.principal,
    rate: payload.rate,
    tenureMonths: payload.tenureMonths,
    startDate: payload.startDate,
    emisPaid: 0,
    monthlyAmount,
    totalAmount,
    nextDueDate: next.toISOString().split('T')[0]
  }
  loans.push(record)
  localStorage.setItem('loans', JSON.stringify(loans))
  return record
}

export const updateLoan = (id: string, patch: Partial<LoanRecord>) => {
  const loans = getLoans()
  const idx = loans.findIndex(l => l.id === id)
  if (idx === -1) return false
  loans[idx] = { ...loans[idx], ...patch }
  localStorage.setItem('loans', JSON.stringify(loans))
  return true
}

export const deleteLoan = (id: string) => {
  const loans = getLoans().filter(l => l.id !== id)
  localStorage.setItem('loans', JSON.stringify(loans))
  return true
}

export const markLoanEmiPaid = (id: string) => {
  const loans = getLoans()
  const idx = loans.findIndex(l => l.id === id)
  if (idx === -1) return false
  const loan = loans[idx]
  const start = new Date(loan.startDate)
  const paid = loan.emisPaid + 1
  const next = new Date(start.getFullYear(), start.getMonth() + paid, start.getDate())
  loans[idx].emisPaid = paid
  loans[idx].nextDueDate = next.toISOString().split('T')[0]
  localStorage.setItem('loans', JSON.stringify(loans))
  return true
}

// ============================================
// LOAN PAYMENTS & AMORTIZATION
// ============================================

export interface LoanPayment {
  id: string
  loanId: string
  paymentDate: string
  amount: number
  paymentType: 'regular_emi' | 'prepayment' | 'partial'
  principalPaid: number
  interestPaid: number
  outstandingBalance: number
  notes?: string
  timestamp: string
}

export interface AmortizationEntry {
  month: number
  emiAmount: number
  principalComponent: number
  interestComponent: number
  outstandingBalance: number
  isPaid: boolean
  paymentDate?: string
}

export interface PrepaymentAnalysis {
  originalTenure: number
  newTenure: number
  tenureReduction: number
  originalTotalInterest: number
  newTotalInterest: number
  interestSaved: number
  newMonthlyEmi: number
  newCompletionDate: string
}

export const getLoanPayments = (loanId?: string): LoanPayment[] => {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem('loan_payments')
  const allPayments: LoanPayment[] = raw ? JSON.parse(raw) : []
  return loanId ? allPayments.filter(p => p.loanId === loanId) : allPayments
}

export const storeLoanPayment = (payment: Omit<LoanPayment, 'id' | 'timestamp'>): string => {
  const payments = getLoanPayments()
  const newPayment: LoanPayment = {
    ...payment,
    id: `loan_payment_${Date.now()}`,
    timestamp: new Date().toISOString()
  }
  payments.push(newPayment)
  localStorage.setItem('loan_payments', JSON.stringify(payments))
  console.log('Loan payment stored:', newPayment.id)
  return newPayment.id
}

export const deleteLoanPayment = (id: string): boolean => {
  if (typeof window === 'undefined') return false
  const payments = getLoanPayments()
  const filtered = payments.filter(p => p.id !== id)
  if (filtered.length === payments.length) return false
  localStorage.setItem('loan_payments', JSON.stringify(filtered))
  console.log('Loan payment deleted:', id)
  return true
}

export const generateAmortizationSchedule = (loanId: string): AmortizationEntry[] => {
  const loans = getLoans()
  const loan = loans.find(l => l.id === loanId)
  if (!loan) return []

  const monthlyRate = loan.rate / 12 / 100
  const schedule: AmortizationEntry[] = []
  let outstandingBalance = loan.principal
  const payments = getLoanPayments(loanId)

  for (let month = 1; month <= loan.tenureMonths; month++) {
    const interestComponent = outstandingBalance * monthlyRate
    const principalComponent = loan.monthlyAmount - interestComponent
    outstandingBalance = Math.max(0, outstandingBalance - principalComponent)

    const isPaid = month <= loan.emisPaid
    const payment = payments.find(p => {
      const paymentMonth = new Date(p.paymentDate).getMonth() + 1
      const loanStartMonth = new Date(loan.startDate).getMonth() + 1
      return paymentMonth - loanStartMonth + 1 === month
    })

    schedule.push({
      month,
      emiAmount: loan.monthlyAmount,
      principalComponent,
      interestComponent,
      outstandingBalance,
      isPaid,
      paymentDate: payment?.paymentDate
    })
  }

  return schedule
}

export const calculatePrepaymentImpact = (
  loanId: string,
  prepaymentAmount: number
): PrepaymentAnalysis | null => {
  const loans = getLoans()
  const loan = loans.find(l => l.id === loanId)
  if (!loan) return null

  const currentOutstanding = getLoanOutstandingBalance(loanId)
  const newPrincipal = Math.max(0, currentOutstanding - prepaymentAmount)
  const monthlyRate = loan.rate / 12 / 100
  const remainingMonths = loan.tenureMonths - loan.emisPaid

  // Calculate new tenure with same EMI
  let newTenure = 0
  if (newPrincipal > 0 && loan.monthlyAmount > 0) {
    newTenure = Math.ceil(
      Math.log(loan.monthlyAmount / (loan.monthlyAmount - newPrincipal * monthlyRate)) /
      Math.log(1 + monthlyRate)
    )
  }

  // Calculate interest saved
  const originalTotalInterest = (loan.monthlyAmount * remainingMonths) - currentOutstanding
  const newTotalInterest = (loan.monthlyAmount * newTenure) - newPrincipal
  const interestSaved = originalTotalInterest - newTotalInterest

  // Calculate new completion date
  const startDate = new Date(loan.startDate)
  const newCompletionDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + loan.emisPaid + newTenure,
    startDate.getDate()
  )

  return {
    originalTenure: remainingMonths,
    newTenure,
    tenureReduction: remainingMonths - newTenure,
    originalTotalInterest,
    newTotalInterest,
    interestSaved,
    newMonthlyEmi: loan.monthlyAmount,
    newCompletionDate: newCompletionDate.toISOString().split('T')[0]
  }
}

export const getLoanOutstandingBalance = (loanId: string): number => {
  const schedule = generateAmortizationSchedule(loanId)
  if (schedule.length === 0) return 0

  const loans = getLoans()
  const loan = loans.find(l => l.id === loanId)
  if (!loan) return 0

  // Find the last paid EMI and return its outstanding balance
  const lastPaidEntry = schedule.find(entry => entry.month === loan.emisPaid)
  return lastPaidEntry ? lastPaidEntry.outstandingBalance : loan.principal
}

export const getLoanTotalInterestPaid = (loanId: string): number => {
  const schedule = generateAmortizationSchedule(loanId)
  return schedule
    .filter(entry => entry.isPaid)
    .reduce((sum, entry) => sum + entry.interestComponent, 0)
}

export const getLoanTotalPrincipalPaid = (loanId: string): number => {
  const schedule = generateAmortizationSchedule(loanId)
  return schedule
    .filter(entry => entry.isPaid)
    .reduce((sum, entry) => sum + entry.principalComponent, 0)
}

export const updateLoanWithPayment = (loanId: string, paymentAmount: number, paymentDate: string): boolean => {
  const loans = getLoans()
  const idx = loans.findIndex(l => l.id === loanId)
  if (idx === -1) return false

  const loan = loans[idx]
  const outstandingBalance = getLoanOutstandingBalance(loanId)
  const monthlyRate = loan.rate / 12 / 100
  const interestComponent = outstandingBalance * monthlyRate
  const principalComponent = Math.min(paymentAmount - interestComponent, outstandingBalance)

  // Store the payment
  storeLoanPayment({
    loanId,
    paymentDate,
    amount: paymentAmount,
    paymentType: paymentAmount > loan.monthlyAmount ? 'prepayment' : 'regular_emi',
    principalPaid: principalComponent,
    interestPaid: interestComponent,
    outstandingBalance: outstandingBalance - principalComponent
  })

  // Update loan EMI count if regular payment
  if (paymentAmount >= loan.monthlyAmount) {
    loans[idx].emisPaid += 1
    const start = new Date(loan.startDate)
    const next = new Date(start.getFullYear(), start.getMonth() + loans[idx].emisPaid, start.getDate())
    loans[idx].nextDueDate = next.toISOString().split('T')[0]
    localStorage.setItem('loans', JSON.stringify(loans))
  }

  return true
}

// Process expense entry with proper validation and routing
export const processExpenseEntry = async (expenseData: Omit<ExpenseTransaction, 'id' | 'timestamp' | 'status'>): Promise<ExpenseTransaction> => {
  try {
    // Validate data
    if (!expenseData.amount || expenseData.amount <= 0) {
      throw new Error('Invalid amount')
    }

    let transactionStatus: 'paid' | 'pending' | 'scheduled' = 'paid'

    // Process based on payment method
    switch (expenseData.paymentMethod) {
      case 'cash':
        // Deduct from cash balance
        updateCashBalance(expenseData.amount, false)
        break

      case 'upi':
        if (!expenseData.bankAccount) {
          throw new Error('Bank account required for UPI payment')
        }
        // Deduct from specific bank account
        updateBankAccountBalance(expenseData.bankAccount, expenseData.amount, false)
        break

      case 'credit_card':
        // Add to future payables based on card due date
        if (!expenseData.creditCard) {
          throw new Error('Credit card required')
        }
        const card = getCreditCards().find(c => c.id === expenseData.creditCard)
        if (!card) {
          throw new Error('Credit card not found')
        }

        // Calculate due date
        const today = new Date()
        const dueDate = new Date(today.getFullYear(), today.getMonth(), card.dueDate)
        if (dueDate <= today) {
          dueDate.setMonth(dueDate.getMonth() + 1)
        }

        // Store as future payable
        storeFuturePayable({
          type: 'credit_card',
          amount: expenseData.amount,
          dueDate: dueDate.toISOString().split('T')[0],
          description: expenseData.description,
          source: card.name,
          originalTransactionId: '',
          status: 'pending'
        })

        transactionStatus = 'pending'
        break

      case 'credit_card_emi':
        if (!expenseData.creditCard || !expenseData.emiDetails) {
          throw new Error('Credit card and EMI details required')
        }

        // Calculate EMI and create monthly payables
        const emiCard = getCreditCards().find(c => c.id === expenseData.creditCard)
        if (!emiCard) {
          throw new Error('Credit card not found')
        }

        // Create monthly EMI payables
        for (let i = 0; i < expenseData.emiDetails.tenure; i++) {
          const emiDueDate = new Date()
          emiDueDate.setMonth(emiDueDate.getMonth() + i + 1)
          emiDueDate.setDate(emiCard.dueDate)

          storeFuturePayable({
            type: 'emi',
            amount: expenseData.emiDetails.monthlyAmount,
            dueDate: emiDueDate.toISOString().split('T')[0],
            description: `EMI ${i + 1}/${expenseData.emiDetails.tenure} - ${expenseData.description}`,
            source: emiCard.name,
            originalTransactionId: '',
            status: 'pending'
          })
        }

        transactionStatus = 'scheduled'
        break

      case 'bnpl':
        if (!expenseData.bnplProvider) {
          throw new Error('BNPL provider required')
        }

        // Add to future payables (typically 30-45 days)
        const bnplDueDate = new Date()
        bnplDueDate.setDate(bnplDueDate.getDate() + 30) // Default 30 days

        storeFuturePayable({
          type: 'bnpl',
          amount: expenseData.amount,
          dueDate: bnplDueDate.toISOString().split('T')[0],
          description: expenseData.description,
          source: expenseData.bnplProvider,
          originalTransactionId: '',
          status: 'pending'
        })

        transactionStatus = 'pending'
        break

      default:
        throw new Error('Invalid payment method')
    }

    // Store the transaction
    const transaction = storeExpenseTransaction({
      ...expenseData,
      status: transactionStatus
    })

    console.log(`Processed ${expenseData.paymentMethod} expense of ₹${expenseData.amount}`)
    return transaction


  } catch (error) {
    console.error('Error processing expense entry:', error)
    throw error
  }
}

// Delete income transaction
export const deleteIncomeTransaction = (id: string): boolean => {
  if (typeof window === 'undefined') return false
  const transactions = getIncomeTransactions()
  const filtered = transactions.filter(t => t.id !== id)
  if (filtered.length === transactions.length) return false
  localStorage.setItem('income_transactions', JSON.stringify(filtered))
  console.log('Income transaction deleted:', id)
  return true
}

// Delete expense transaction
export const deleteExpenseTransaction = (id: string): boolean => {
  if (typeof window === 'undefined') return false
  const transactions = getExpenseTransactions()
  const filtered = transactions.filter(t => t.id !== id)
  if (filtered.length === transactions.length) return false
  localStorage.setItem('expense_transactions', JSON.stringify(filtered))
  console.log('Expense transaction deleted:', id)
  return true
}

// Update income transaction
export const updateIncomeTransaction = (id: string, updates: Partial<Omit<IncomeTransaction, 'id' | 'timestamp'>>): boolean => {
  if (typeof window === 'undefined') return false
  const transactions = getIncomeTransactions()
  const index = transactions.findIndex(t => t.id === id)
  if (index === -1) return false
  transactions[index] = { ...transactions[index], ...updates }
  localStorage.setItem('income_transactions', JSON.stringify(transactions))
  console.log('Income transaction updated:', id)
  return true
}

// Update expense transaction
export const updateExpenseTransaction = (id: string, updates: Partial<Omit<ExpenseTransaction, 'id' | 'timestamp'>>): boolean => {
  if (typeof window === 'undefined') return false
  const transactions = getExpenseTransactions()
  const index = transactions.findIndex(t => t.id === id)
  if (index === -1) return false
  transactions[index] = { ...transactions[index], ...updates }
  localStorage.setItem('expense_transactions', JSON.stringify(transactions))
  console.log('Expense transaction updated:', id)
  return true
}

// Reset all data (for testing)
export const resetAllData = () => {
  localStorage.removeItem('cash_balance')
  localStorage.removeItem('bank_accounts')
  localStorage.removeItem('total_liquidity')
  localStorage.removeItem('income_transactions')
  localStorage.removeItem('expense_transactions')
  localStorage.removeItem('future_payables')
  localStorage.removeItem('credit_cards')
  localStorage.removeItem('liquidity')
  localStorage.removeItem('business_records')
  localStorage.removeItem('credit_card_statements')
  localStorage.removeItem('credit_card_payments')
  localStorage.removeItem('loan_payments')
  console.log('All data has been reset')
}

// ============================================
// CREDIT CARD STATEMENTS
// ============================================

export interface CreditCardStatement {
  id: string
  cardId: string
  statementDate: string
  dueDate: string
  billingCycleStart: string
  billingCycleEnd: string
  previousBalance: number
  newCharges: number
  payments: number
  credits: number
  totalDue: number
  minimumDue: number
  interestCharged: number
  status: 'pending' | 'paid' | 'overdue'
  paidDate?: string
  paidAmount?: number
  timestamp: string
}

export const getCreditCardStatements = (cardId?: string): CreditCardStatement[] => {
  if (typeof window === 'undefined') return []
  const statements = localStorage.getItem('credit_card_statements')
  const allStatements: CreditCardStatement[] = statements ? JSON.parse(statements) : []
  return cardId ? allStatements.filter(s => s.cardId === cardId) : allStatements
}

export const storeCreditCardStatement = (statement: Omit<CreditCardStatement, 'id' | 'timestamp'>): string => {
  if (typeof window === 'undefined') return ''
  const statements = getCreditCardStatements()
  const newStatement: CreditCardStatement = {
    ...statement,
    id: `stmt_${Date.now()}`,
    timestamp: new Date().toISOString()
  }
  statements.push(newStatement)
  localStorage.setItem('credit_card_statements', JSON.stringify(statements))
  console.log('Statement stored:', newStatement.id)
  return newStatement.id
}

export const updateCreditCardStatement = (id: string, updates: Partial<Omit<CreditCardStatement, 'id' | 'timestamp'>>): boolean => {
  if (typeof window === 'undefined') return false
  const statements = getCreditCardStatements()
  const index = statements.findIndex(s => s.id === id)
  if (index === -1) return false
  statements[index] = { ...statements[index], ...updates }
  localStorage.setItem('credit_card_statements', JSON.stringify(statements))
  console.log('Statement updated:', id)
  return true
}

export const deleteCreditCardStatement = (id: string): boolean => {
  if (typeof window === 'undefined') return false
  const statements = getCreditCardStatements()
  const filtered = statements.filter(s => s.id !== id)
  if (filtered.length === statements.length) return false
  localStorage.setItem('credit_card_statements', JSON.stringify(filtered))
  console.log('Statement deleted:', id)
  return true
}

// ============================================
// CREDIT CARD PAYMENTS
// ============================================

export interface CreditCardPayment {
  id: string
  cardId: string
  statementId?: string
  paymentDate: string
  amount: number
  paymentMethod: 'bank_transfer' | 'upi' | 'cash' | 'other'
  bankAccount?: string
  notes?: string
  timestamp: string
}

export const getCreditCardPayments = (cardId?: string): CreditCardPayment[] => {
  if (typeof window === 'undefined') return []
  const payments = localStorage.getItem('credit_card_payments')
  const allPayments: CreditCardPayment[] = payments ? JSON.parse(payments) : []
  return cardId ? allPayments.filter(p => p.cardId === cardId) : allPayments
}

export const storeCreditCardPayment = (payment: Omit<CreditCardPayment, 'id' | 'timestamp'>): string => {
  if (typeof window === 'undefined') return ''
  const payments = getCreditCardPayments()
  const newPayment: CreditCardPayment = {
    ...payment,
    id: `pay_${Date.now()}`,
    timestamp: new Date().toISOString()
  }
  payments.push(newPayment)
  localStorage.setItem('credit_card_payments', JSON.stringify(payments))

  // Update card balance
  const card = getCreditCards().find(c => c.id === payment.cardId)
  if (card) {
    updateCreditCard(payment.cardId, {
      currentBalance: Math.max(0, card.currentBalance - payment.amount)
    })
  }

  console.log('Payment stored:', newPayment.id)
  return newPayment.id
}

export const deleteCreditCardPayment = (id: string): boolean => {
  if (typeof window === 'undefined') return false
  const payments = getCreditCardPayments()
  const filtered = payments.filter(p => p.id !== id)
  if (filtered.length === payments.length) return false
  localStorage.setItem('credit_card_payments', JSON.stringify(filtered))
  console.log('Payment deleted:', id)
  return true
}

// ============================================
// CREDIT CARD ANALYTICS
// ============================================

export const getCreditCardTransactions = (cardId: string): ExpenseTransaction[] => {
  if (typeof window === 'undefined') return []
  const expenses = getExpenseTransactions()
  return expenses.filter(e => e.creditCard === cardId)
}

export const getCreditCardBalance = (cardId: string): number => {
  const card = getCreditCards().find(c => c.id === cardId)
  return card?.currentBalance || 0
}

export const getCreditCardUtilization = (cardId: string): number => {
  const card = getCreditCards().find(c => c.id === cardId)
  if (!card || card.creditLimit === 0) return 0
  return (card.currentBalance / card.creditLimit) * 100
}

export const getCreditCardAvailableCredit = (cardId: string): number => {
  const card = getCreditCards().find(c => c.id === cardId)
  if (!card) return 0
  return Math.max(0, card.creditLimit - card.currentBalance)
}
