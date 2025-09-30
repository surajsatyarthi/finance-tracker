import { supabase } from './supabase'

const USER_ID = '00000000-0000-0000-0000-000000000001'

// Simple account operations
export const getAccounts = async () => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', USER_ID)
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

export const createAccount = async (accountData: {
  name: string
  type: string
  balance: number
}) => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: USER_ID,
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

export const getCashBalance = async () => {
  try {
    const accounts = await getAccounts()
    const cashAccount = accounts.find(acc => acc.type === 'cash')
    return cashAccount ? cashAccount.balance : 0
  } catch (error) {
    console.error('Error getting cash balance:', error)
    return 0
  }
}

export const getTotalLiquidity = async () => {
  try {
    const accounts = await getAccounts()
    return accounts.reduce((total, account) => total + account.balance, 0)
  } catch (error) {
    console.error('Error getting total liquidity:', error)
    return 0
  }
}

// Simple transaction operations
export const getTransactions = async (type?: 'income' | 'expense') => {
  try {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', USER_ID)
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

export const createTransaction = async (transactionData: {
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
        user_id: USER_ID,
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
export const initializeSupabaseData = async () => {
  try {
    const accounts = await getAccounts()
    
    // If no accounts exist, create a basic cash account
    if (accounts.length === 0) {
      console.log('No accounts found, creating cash account...')
      await createAccount({
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