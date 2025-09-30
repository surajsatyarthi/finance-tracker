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
  const accounts = localStorage.getItem('bank_accounts')
  return accounts ? JSON.parse(accounts) : []
}

// Get cash balance
export const getCashBalance = (): number => {
  // For now, return 0 - will be replaced by Supabase data
  return 0
}

// Get total liquidity
export const getTotalLiquidity = (): number => {
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
        id: 'sbi_bpcl',
        name: 'SBI BPCL',
        cardNumber: '4611199394936358',
        lastFourDigits: '6358',
        cvv: 430, // CVV + 1 for security (429 + 1)
        expiryMonth: 2,
        expiryYear: 26,
        dueDate: 20,
        statementDate: '12 Aug',
        creditLimit: 34000,
        currentBalance: 0,
        annualFee: 499,
        renewalMonth: 'Feb',
        isActive: true
      },
      {
        id: 'sbi_paytm',
        name: 'SBI Paytm',
        cardNumber: '4129470904684092',
        lastFourDigits: '4092',
        cvv: 964, // CVV + 1 for security (963 + 1)
        expiryMonth: 5,
        expiryYear: 29,
        dueDate: 6,
        statementDate: '18 June',
        creditLimit: 150000,
        currentBalance: 0,
        annualFee: 500,
        renewalMonth: 'Feb',
        isActive: true
      },
      {
        id: 'sbi_simply_save',
        name: 'SBI Simply save',
        cardNumber: '5241828335115905',
        lastFourDigits: '5905',
        cvv: 949, // CVV + 1 for security (948 + 1)
        expiryMonth: 8,
        expiryYear: 26,
        dueDate: 28,
        statementDate: '9 Mar',
        creditLimit: 16000,
        currentBalance: 0,
        annualFee: 499,
        renewalMonth: '',
        isActive: true
      },
      {
        id: 'sc_easemytrip',
        name: 'SC EaseMyTrip',
        cardNumber: '4940777670885621',
        lastFourDigits: '5621',
        cvv: 537, // CVV + 1 for security (536 + 1)
        expiryMonth: 9,
        expiryYear: 28,
        dueDate: 2,
        statementDate: '11 Oct',
        creditLimit: 214500,
        currentBalance: 0,
        annualFee: 350,
        renewalMonth: 'Oct',
        isActive: true
      },
      {
        id: 'axis_rewards',
        name: 'Axis Rewards',
        cardNumber: '5521370103599086',
        lastFourDigits: '9086',
        cvv: 47, // CVV + 1 for security (o46 -> 046 + 1, treating 'o' as '0')
        expiryMonth: 3,
        expiryYear: 30,
        dueDate: 8,
        statementDate: '21 Mar',
        creditLimit: 120000,
        currentBalance: 0,
        annualFee: 1000,
        renewalMonth: 'Feb',
        isActive: true
      },
      {
        id: 'axis_my_zone',
        name: 'Axis My Zone',
        cardNumber: '4514570059089170',
        lastFourDigits: '9170',
        cvv: 44, // CVV + 1 for security (o43 -> 043 + 1, treating 'o' as '0')
        expiryMonth: 10,
        expiryYear: 27,
        dueDate: 30,
        statementDate: '13 July',
        creditLimit: 154000,
        currentBalance: 0,
        annualFee: 0,
        renewalMonth: 'NA',
        isActive: true
      },
      {
        id: 'axis_neo',
        name: 'Axis Neo',
        cardNumber: '4641180019364980',
        lastFourDigits: '4980',
        cvv: 917, // CVV + 1 for security (916 + 1)
        expiryMonth: 5,
        expiryYear: 27,
        dueDate: 5,
        statementDate: '18 July',
        creditLimit: 154000,
        currentBalance: 0,
        annualFee: 250,
        renewalMonth: 'May',
        isActive: true
      },
      {
        id: 'rbl_platinum_delight',
        name: 'RBL Platinum Delight',
        cardNumber: '4391230234617795',
        lastFourDigits: '7795',
        cvv: 438, // CVV + 1 for security (437 + 1)
        expiryMonth: 7,
        expiryYear: 30,
        dueDate: 2,
        statementDate: '12 August',
        creditLimit: 160000,
        currentBalance: 0,
        annualFee: 1000,
        renewalMonth: 'Feb',
        isActive: true
      },
      {
        id: 'rbl_bajaj_finserv',
        name: 'RBL Bajaj Finserv',
        cardNumber: '4391230898849635',
        lastFourDigits: '9635',
        cvv: 947, // CVV + 1 for security (946 + 1)
        expiryMonth: 2,
        expiryYear: 30,
        dueDate: 2,
        statementDate: '12 August',
        creditLimit: 160000,
        currentBalance: 0,
        annualFee: 1000,
        renewalMonth: 'Dec',
        isActive: true
      },
      {
        id: 'hdfc_millenia',
        name: 'HDFC Millenia',
        cardNumber: '36113573131470',
        lastFourDigits: '1470',
        cvv: 865, // CVV + 1 for security (864 + 1)
        expiryMonth: 6,
        expiryYear: 28,
        dueDate: 7,
        statementDate: '19 Dec',
        creditLimit: 10000,
        currentBalance: 0,
        annualFee: 0,
        renewalMonth: 'NA',
        isActive: true
      },
      {
        id: 'hdfc_neu',
        name: 'HDFC Neu',
        cardNumber: '6529250009245556',
        lastFourDigits: '5556',
        cvv: 645, // CVV + 1 for security (644 + 1)
        expiryMonth: 8,
        expiryYear: 31,
        dueDate: 21,
        statementDate: '2 Feb',
        creditLimit: 10000,
        currentBalance: 0,
        annualFee: 499,
        renewalMonth: 'Sep',
        isActive: true
      },
      {
        id: 'indusind_platinum_aura_edge',
        name: 'Indusind Platinum Aura Edge',
        cardNumber: '4412859670930976',
        lastFourDigits: '0976',
        cvv: 751, // CVV + 1 for security (750 + 1)
        expiryMonth: 1,
        expiryYear: 28,
        dueDate: 2,
        statementDate: '13 June',
        creditLimit: 151000,
        currentBalance: 0,
        annualFee: 0,
        renewalMonth: '',
        isActive: true
      },
      {
        id: 'indusind_rupay',
        name: 'Indusind Rupay',
        cardNumber: '3561420006556273',
        lastFourDigits: '6273',
        cvv: 756, // CVV + 1 for security (755 + 1)
        expiryMonth: 9,
        expiryYear: 29,
        dueDate: 1,
        statementDate: '',
        creditLimit: 100000,
        currentBalance: 0,
        annualFee: 0,
        renewalMonth: '',
        isActive: true
      },
      {
        id: 'icici_amazon',
        name: 'ICICI Amazon',
        cardNumber: '4315812748438017',
        lastFourDigits: '8017',
        cvv: 955, // CVV + 1 for security (954 + 1)
        expiryMonth: 3,
        expiryYear: 32,
        dueDate: 5,
        statementDate: '18 July',
        creditLimit: 460000,
        currentBalance: 0,
        annualFee: 0,
        renewalMonth: '',
        isActive: true
      },
      {
        id: 'icici_coral_rupay',
        name: 'ICICI Coral Rupay',
        cardNumber: '6528681673153026',
        lastFourDigits: '3026',
        cvv: 986, // CVV + 1 for security (985 + 1)
        expiryMonth: 11,
        expiryYear: 31,
        dueDate: 20,
        statementDate: '2 August',
        creditLimit: 0,
        currentBalance: 0,
        annualFee: 0,
        renewalMonth: 'Aug',
        isActive: true
      },
      {
        id: 'icici_adani_one',
        name: 'ICICI Adani One',
        cardNumber: '4786723001037026',
        lastFourDigits: '7026',
        cvv: 242, // CVV + 1 for security (241 + 1)
        expiryMonth: 2,
        expiryYear: 32,
        dueDate: 23,
        statementDate: '5 Aug',
        creditLimit: 0,
        currentBalance: 0,
        annualFee: 0,
        renewalMonth: 'Feb',
        isActive: true
      },
      {
        id: 'pop_yes_bank',
        name: 'Pop YES Bank',
        cardNumber: '3561395210028238',
        lastFourDigits: '8238',
        cvv: 346, // CVV + 1 for security (345 + 1)
        expiryMonth: 1,
        expiryYear: 32,
        dueDate: 5,
        statementDate: '16 Aug',
        creditLimit: 300000,
        currentBalance: 0,
        annualFee: 0,
        renewalMonth: 'NA',
        isActive: true
      },
      {
        id: 'bajaj_finserv_emi',
        name: 'BAJAJ Finserv EMI',
        cardNumber: '',
        lastFourDigits: '7910',
        cvv: 0, // No CVV available
        expiryMonth: 0,
        expiryYear: 0,
        dueDate: 1,
        statementDate: '',
        creditLimit: 115000,
        currentBalance: 0,
        annualFee: 0,
        renewalMonth: '',
        isActive: true
      }
    ]
    localStorage.setItem('credit_cards', JSON.stringify(userCreditCards))
  }
}

// Get all credit cards
export const getCreditCards = (): CreditCard[] => {
  const cards = localStorage.getItem('credit_cards')
  return cards ? JSON.parse(cards) : []
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

// Calculate credit card utilization
export const getCreditCardUtilization = (card: CreditCard): number => {
  if (card.creditLimit === 0) return 0
  return Math.round((card.currentBalance / card.creditLimit) * 100)
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
      utilization: getCreditCardUtilization(card)
    }))
  }
}

// Get all expense transactions
export const getExpenseTransactions = (): ExpenseTransaction[] => {
  const transactions = localStorage.getItem('expense_transactions')
  return transactions ? JSON.parse(transactions) : []
}

// Get all future payables
export const getFuturePayables = (): FuturePayable[] => {
  const payables = localStorage.getItem('future_payables')
  return payables ? JSON.parse(payables) : []
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

// Reset all data (for testing)
export const resetAllData = () => {
  localStorage.removeItem('cash_balance')
  localStorage.removeItem('bank_accounts')
  localStorage.removeItem('total_liquidity')
  localStorage.removeItem('income_transactions')
  localStorage.removeItem('expense_transactions')
  localStorage.removeItem('future_payables')
  localStorage.removeItem('credit_cards')
  localStorage.removeItem('liquidity_last_updated')
  
  console.log('All financial data reset')
}
