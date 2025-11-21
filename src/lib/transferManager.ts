import { supabase } from './supabase'

export interface TransferData {
  fromAccountId: string
  toAccountId: string
  amount: number
  description?: string
  date?: string
}

export interface TransferResult {
  success: boolean
  transferReferenceId?: string
  fromTransactionId?: string
  toTransactionId?: string
  error?: string
}

export interface TransferTransaction {
  id: string
  user_id: string
  account_id: string
  from_account_id: string
  to_account_id: string
  amount: number
  type: 'transfer'
  description: string
  date: string
  is_transfer: boolean
  transfer_reference_id: string
  payment_method: 'transfer'
  created_at: string
  updated_at: string
}

// Shape returned by process_transfer_transaction RPC
interface TransferRPCResult {
  success: boolean
  transfer_reference_id?: string
  from_transaction_id?: string
  to_transaction_id?: string
  amount?: number
  from_account_id?: string
  to_account_id?: string
  error?: string
}

// Process a transfer between accounts (atomic via RPC)
export const processTransfer = async (userId: string, transferData: TransferData): Promise<TransferResult> => {
  try {
    const description = transferData.description || 'Bank Transfer'
    const date = transferData.date || new Date().toISOString().split('T')[0]

    // @ts-expect-error RPC function exists in DB but is not in generated types
    const { data, error } = await supabase.rpc('process_transfer_transaction', {
      p_user_id: userId,
      p_from_account_id: transferData.fromAccountId,
      p_to_account_id: transferData.toAccountId,
      p_amount: transferData.amount,
      p_description: description,
      p_date: date
    })

    if (error) {
      console.error('RPC error processing transfer:', error)
      return { success: false, error: error.message }
    }

    const result = data as unknown as TransferRPCResult
    if (!result || result.success !== true) {
      const errMsg = typeof result?.error === 'string' ? result.error : 'Transfer failed (unknown)'
      return { success: false, error: errMsg }
    }

    return {
      success: true,
      transferReferenceId: result.transfer_reference_id,
      fromTransactionId: result.from_transaction_id,
      toTransactionId: result.to_transaction_id
    }
  } catch (error) {
    console.error('Transfer processing error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}

// Get all transfers for a user
export const getUserTransfers = async (userId: string): Promise<TransferTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_transfer', true)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching transfers:', error)
      return []
    }

    return (data as unknown as TransferTransaction[]) || []
  } catch (error) {
    console.error('Error getting user transfers:', error)
    return []
  }
}

// Get transfers grouped by reference ID (to show both sides of transfer)
export const getGroupedTransfers = async (userId: string): Promise<Record<string, TransferTransaction[]>> => {
  try {
    const transfers = await getUserTransfers(userId)
    
    const grouped: Record<string, TransferTransaction[]> = {}
    
    transfers.forEach(transfer => {
      if (!grouped[transfer.transfer_reference_id]) {
        grouped[transfer.transfer_reference_id] = []
      }
      grouped[transfer.transfer_reference_id].push(transfer)
    })
    
    return grouped
  } catch (error) {
    console.error('Error grouping transfers:', error)
    return {}
  }
}

// Get account balance including transfers (via RPC)
export const getAccountBalanceWithTransfers = async (accountId: string): Promise<number> => {
  try {
    // @ts-expect-error RPC function exists in DB but is not in generated types
    const { data, error } = await supabase.rpc('get_account_balance_with_transfers', {
      p_account_id: accountId
    })

    if (error) {
      console.error('Error getting computed balance:', error)
      return 0
    }

    // Supabase returns numeric as string sometimes; coerce to number
    const val = typeof data === 'string' ? parseFloat(data) : (data as unknown as number)
    return Number.isFinite(val) ? val : 0
  } catch (error) {
    console.error('Error calculating account balance:', error)
    return 0
  }
}

// Get transfer summary for an account
export const getAccountTransferSummary = async (userId: string, accountId: string) => {
  try {
    const [{ data: inData, error: inErr }, { data: outData, error: outErr }] = await Promise.all([
      supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('is_transfer', true)
        .eq('to_account_id', accountId),
      supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('is_transfer', true)
        .eq('from_account_id', accountId)
    ])

    if (inErr || outErr) {
      console.error('Error computing transfer summary:', inErr || outErr)
      return { transfersIn: 0, transfersOut: 0, netTransfers: 0 }
    }

    type AmountRow = { amount: number | null }
    const transfersIn = ((inData as AmountRow[] | null | undefined) || []).reduce(
      (sum, t) => sum + (t.amount ?? 0),
      0
    )
    const transfersOut = ((outData as AmountRow[] | null | undefined) || []).reduce(
      (sum, t) => sum + (t.amount ?? 0),
      0
    )
    return { transfersIn, transfersOut, netTransfers: transfersIn - transfersOut }
  } catch (error) {
    console.error('Error calculating transfer summary:', error)
    return { transfersIn: 0, transfersOut: 0, netTransfers: 0 }
  }
}

// Validate transfer data
export const validateTransferData = (data: TransferData): string[] => {
  const errors: string[] = []
  
  if (!data.fromAccountId) {
    errors.push('Source account is required')
  }
  
  if (!data.toAccountId) {
    errors.push('Destination account is required')
  }
  
  if (data.fromAccountId === data.toAccountId) {
    errors.push('Source and destination accounts must be different')
  }
  
  if (!data.amount || data.amount <= 0) {
    errors.push('Transfer amount must be greater than zero')
  }
  
  if (data.amount > 10000000) {
    errors.push('Transfer amount is too large')
  }
  
  return errors
}
