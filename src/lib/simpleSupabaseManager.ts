import { supabase } from './supabase'

// Simple account operations
export const getAccounts = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching accounts:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAccounts:', error)
    return []
  }
}

export const createAccount = async (userId: string, accountData: {
  name: string
  type: string
  balance: number
}) => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: userId,
        name: accountData.name,
        type: accountData.type,
        balance: accountData.balance,
        currency: 'INR',
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating account:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in createAccount:', error)
    return { success: false, error: 'Failed to create account' }
  }
}

export const getCashBalance = async (userId: string) => {
  try {
    const accounts = await getAccounts(userId)
    const cashAccount = accounts.find(acc => acc.type === 'cash')
    return cashAccount ? cashAccount.balance : 0
  } catch (error) {
    console.error('Error getting cash balance:', error)
    return 0
  }
}

export const getTotalLiquidity = async (userId: string) => {
  try {
    const accounts = await getAccounts(userId)
    return accounts.reduce((total, account) => total + account.balance, 0)
  } catch (error) {
    console.error('Error getting total liquidity:', error)
    return 0
  }
}

// Simple transaction operations
export const getTransactions = async (userId: string, type?: 'income' | 'expense') => {
  try {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching transactions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getTransactions:', error)
    return []
  }
}

export const createTransaction = async (userId: string, transactionData: {
  amount: number
  type: 'income' | 'expense'
  description: string
  payment_method: string
  date: string
  category?: string
}) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: transactionData.amount,
        type: transactionData.type,
        description: transactionData.description,
        payment_method: transactionData.payment_method,
        date: transactionData.date,
        subcategory: transactionData.category || 'General'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating transaction:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in createTransaction:', error)
    return { success: false, error: 'Failed to create transaction' }
  }
}

// Initialize with basic cash account
export const initializeSupabaseData = async (userId: string) => {
  try {
    const accounts = await getAccounts(userId)
    
    // If no accounts exist, create a basic cash account
    if (accounts.length === 0) {
      console.log('No accounts found, creating cash account...')
      await createAccount(userId, {
        name: 'Cash',
        type: 'cash',
        balance: 1005 // Your current cash balance
      })
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error initializing Supabase data:', error)
    return { success: false, error }
  }
}
