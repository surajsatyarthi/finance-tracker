import { supabase } from './supabase'

// Business account types and interfaces
export interface BusinessAccount {
  id: string
  user_id: string
  account_name: string
  account_type: 'personal' | 'business'
  bank_name: string
  account_number: string
  balance: number
  gst_number?: string
  business_name?: string
  business_address?: string
  pan_number?: string
  created_at: string
  updated_at: string
}

export interface BusinessCategory {
  id: string
  user_id: string
  name: string
  description: string
  is_deductible: boolean
  gst_applicable: boolean
  created_at: string
  updated_at: string
}

export interface GSTCalculation {
  taxable_amount: number
  gst_amount: number
  total_amount: number
  gst_rate: number
}

export interface BusinessExpenseSummary {
  period: {
    start_date: string
    end_date: string
  }
  total_expenses: number
  total_gst_paid: number
  deductible_expenses: number
  potential_tax_saving: number
}

export interface GSTReturn {
  id: string
  user_id: string
  return_period: string
  return_type: 'GSTR1' | 'GSTR3B' | 'GSTR9'
  due_date: string
  filed_date?: string
  status: 'pending' | 'filed' | 'overdue'
  total_sales: number
  total_purchases: number
  output_tax: number
  input_tax_credit: number
  tax_liability: number
  created_at: string
  updated_at: string
}

// Business account management
export const createBusinessAccount = async (accountData: {
  account_name: string
  bank_name: string
  account_number: string
  balance: number
  gst_number?: string
  business_name?: string
  business_address?: string
  pan_number?: string
}): Promise<{ success: boolean; account?: BusinessAccount; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000001',
        name: accountData.account_name,
        type: 'current', // Business accounts are usually current accounts
        balance: accountData.balance,
        // Business fields enabled after migration
        gst_number: accountData.gst_number,
        business_name: accountData.business_name,
        business_address: accountData.business_address,
        pan_number: accountData.pan_number,
        account_type: 'business'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating business account:', error)
      return { success: false, error: error.message }
    }

    // Map schema to BusinessAccount interface
    const businessAccount: BusinessAccount = {
      id: data.id,
      user_id: data.user_id,
      account_name: data.name,
      account_type: 'business',
      bank_name: data.type,
      account_number: '',
      balance: data.balance,
      gst_number: data.gst_number || undefined,
      business_name: data.business_name || undefined,
      business_address: data.business_address || undefined,
      pan_number: data.pan_number || undefined,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
    return { success: true, account: businessAccount }
  } catch (error) {
    console.error('Error creating business account:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}

// Get business accounts
export const getBusinessAccounts = async (): Promise<BusinessAccount[]> => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000001')
      .eq('account_type', 'business')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching business accounts:', error)
      return []
    }

    // Map schema to BusinessAccount interface
    return data.map(account => ({
      id: account.id,
      user_id: account.user_id,
      account_name: account.name,
      account_type: 'business' as const,
      bank_name: account.type,
      account_number: '',
      balance: account.balance,
      gst_number: account.gst_number || undefined,
      business_name: account.business_name || undefined,
      business_address: account.business_address || undefined,
      pan_number: account.pan_number || undefined,
      created_at: account.created_at,
      updated_at: account.updated_at
    })) as BusinessAccount[]
  } catch (error) {
    console.error('Error fetching business accounts:', error)
    return []
  }
}

// Get personal accounts  
export const getPersonalAccounts = async (): Promise<BusinessAccount[]> => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000001')
      .eq('account_type', 'personal')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching personal accounts:', error)
      return []
    }

    // Map schema to BusinessAccount interface
    return data.map(account => ({
      id: account.id,
      user_id: account.user_id,
      account_name: account.name,
      account_type: 'personal' as const,
      bank_name: account.type,
      account_number: '',
      balance: account.balance,
      created_at: account.created_at,
      updated_at: account.updated_at
    })) as BusinessAccount[]
  } catch (error) {
    console.error('Error fetching personal accounts:', error)
    return []
  }
}

// GST calculation utilities
export const calculateGST = async (
  baseAmount: number,
  gstRate: number,
  isInclusive: boolean = false
): Promise<GSTCalculation | null> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rpcCall = (supabase as typeof supabase & { 
      rpc: (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }> 
    })
    
    const { data, error } = await rpcCall.rpc('calculate_gst_amount', {
      base_amount: baseAmount,
      gst_rate: gstRate,
      is_inclusive: isInclusive
    })

    if (error) {
      console.error('Error calculating GST:', error)
      return null
    }

    return data as GSTCalculation
  } catch {
    // Fallback calculation if RPC is not available
    let taxableAmount: number
    let gstAmount: number
    let totalAmount: number

    if (isInclusive) {
      taxableAmount = baseAmount / (1 + (gstRate / 100))
      gstAmount = baseAmount - taxableAmount
      totalAmount = baseAmount
    } else {
      taxableAmount = baseAmount
      gstAmount = baseAmount * (gstRate / 100)
      totalAmount = baseAmount + gstAmount
    }

    return {
      taxable_amount: Math.round(taxableAmount * 100) / 100,
      gst_amount: Math.round(gstAmount * 100) / 100,
      total_amount: Math.round(totalAmount * 100) / 100,
      gst_rate: gstRate
    }
  }
}

// Business categories management
export const getBusinessCategories = async (): Promise<BusinessCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('business_categories')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000001')
      .order('name')

    if (error) {
      console.error('Error fetching business categories:', error)
      return []
    }

    return data as BusinessCategory[]
  } catch (error) {
    console.error('Error fetching business categories:', error)
    return []
  }
}

// Get business expense summary
export const getBusinessExpenseSummary = async (
  startDate?: string,
  endDate?: string
): Promise<BusinessExpenseSummary | null> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rpcCall = (supabase as typeof supabase & { 
      rpc: (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }> 
    })
    
    const { data, error } = await rpcCall.rpc('get_business_expense_summary', {
      p_user_id: '00000000-0000-0000-0000-000000000001',
      p_start_date: startDate || null,
      p_end_date: endDate || null
    })

    if (error) {
      console.error('Error getting business expense summary:', error)
      return null
    }

    return data as BusinessExpenseSummary
  } catch (error) {
    console.error('Error getting business expense summary:', error)
    
    // Fallback: Basic calculation without RPC
    const start = startDate || new Date().toISOString().split('T')[0].slice(0, 8) + '01'
    const end = endDate || new Date().toISOString().split('T')[0]
    
    return {
      period: { start_date: start, end_date: end },
      total_expenses: 0,
      total_gst_paid: 0,
      deductible_expenses: 0,
      potential_tax_saving: 0
    }
  }
}

// GST return management
export const getGSTReturns = async (): Promise<GSTReturn[]> => {
  try {
    const { data, error } = await supabase
      .from('gst_returns')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000001')
      .order('return_period', { ascending: false })

    if (error) {
      console.error('Error fetching GST returns:', error)
      return []
    }

    return data as GSTReturn[]
  } catch (error) {
    console.error('Error fetching GST returns:', error)
    return []
  }
}

// Create or update GST return
export const createGSTReturn = async (returnData: {
  return_period: string
  return_type: 'GSTR1' | 'GSTR3B' | 'GSTR9'
  due_date: string
  total_sales?: number
  total_purchases?: number
  output_tax?: number
  input_tax_credit?: number
}): Promise<{ success: boolean; gstReturn?: GSTReturn; error?: string }> => {
  try {
    const taxLiability = (returnData.output_tax || 0) - (returnData.input_tax_credit || 0)
    
    const { data, error } = await supabase
      .from('gst_returns')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000001',
        return_period: returnData.return_period,
        return_type: returnData.return_type,
        due_date: returnData.due_date,
        total_sales: returnData.total_sales || 0,
        total_purchases: returnData.total_purchases || 0,
        output_tax: returnData.output_tax || 0,
        input_tax_credit: returnData.input_tax_credit || 0,
        tax_liability: taxLiability,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating GST return:', error)
      return { success: false, error: error.message }
    }

    return { success: true, gstReturn: data as GSTReturn }
  } catch (error) {
    console.error('Error creating GST return:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Validate GST number
export const validateGSTNumber = (gstNumber: string): boolean => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return gstRegex.test(gstNumber)
}

// Common GST rates in India
export const GST_RATES = [0, 5, 12, 18, 28] as const
export type GSTRate = typeof GST_RATES[number]

// Get upcoming GST return due dates
export const getUpcomingGSTDueDates = async (): Promise<GSTReturn[]> => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('gst_returns')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000001')
      .eq('status', 'pending')
      .gte('due_date', today)
      .lte('due_date', thirtyDaysLater)
      .order('due_date')

    if (error) {
      console.error('Error fetching upcoming GST due dates:', error)
      return []
    }

    return data as GSTReturn[]
  } catch (error) {
    console.error('Error fetching upcoming GST due dates:', error)
    return []
  }
}

export default {
  createBusinessAccount,
  getBusinessAccounts,
  getPersonalAccounts,
  calculateGST,
  getBusinessCategories,
  getBusinessExpenseSummary,
  getGSTReturns,
  createGSTReturn,
  validateGSTNumber,
  getUpcomingGSTDueDates,
  GST_RATES
}