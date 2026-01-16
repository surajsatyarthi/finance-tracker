import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type ImportTransaction = {
  date: string
  description: string
  amount: number
  transaction_type: 'debit' | 'credit'
  reference: string
}

type StatementData = {
  bank_name: string
  card_type: string
  card_number: string
  statement_date: string
  statement_period: string
  payment_due_date: string
  total_due: number
  minimum_due: number
  credit_limit: number
  available_limit: number
  transactions: ImportTransaction[]
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { statementData, creditCardId } = body as {
      statementData: StatementData
      creditCardId: string
    }

    if (!statementData || !creditCardId) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      )
    }

    // Verify the credit card belongs to the user
    const { data: card, error: cardError } = await supabase
      .from('credit_cards')
      .select('id')
      .eq('id', creditCardId)
      .eq('user_id', user.id)
      .single()

    if (cardError || !card) {
      return NextResponse.json(
        { error: 'Credit card not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update credit card with statement information
    const updateData: any = {}
    if (statementData.credit_limit > 0) {
      updateData.credit_limit = statementData.credit_limit
    }
    if (statementData.total_due > 0) {
      updateData.last_statement_amount = statementData.total_due
      updateData.current_balance = statementData.total_due
    }
    if (statementData.statement_date) {
      updateData.last_statement_date = statementData.statement_date
    }

    if (Object.keys(updateData).length > 0) {
      await supabase
        .from('credit_cards')
        .update(updateData)
        .eq('id', creditCardId)
    }

    // Import transactions
    const importedTransactions = []
    const skippedTransactions = []

    for (const txn of statementData.transactions) {
      // Check if transaction already exists (avoid duplicates)
      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('credit_card_id', creditCardId)
        .eq('date', txn.date)
        .eq('description', txn.description)
        .eq('amount', txn.amount)
        .maybeSingle()

      if (existing) {
        skippedTransactions.push(txn)
        continue
      }

      // Insert transaction
      const { error: txnError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          credit_card_id: creditCardId,
          date: txn.date,
          description: txn.description,
          amount: txn.amount,
          type: txn.transaction_type === 'credit' ? 'income' : 'expense',
          notes: txn.reference || null,
          is_recurring: false
        })

      if (txnError) {
        console.error('Transaction insert error:', txnError)
        skippedTransactions.push(txn)
      } else {
        importedTransactions.push(txn)
      }
    }

    return NextResponse.json({
      success: true,
      imported: importedTransactions.length,
      skipped: skippedTransactions.length,
      total: statementData.transactions.length,
      details: {
        importedTransactions: importedTransactions.slice(0, 5), // First 5 for preview
        skippedCount: skippedTransactions.length
      }
    })
  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json(
      {
        error: 'Failed to import transactions',
        details: error.message
      },
      { status: 500 }
    )
  }
}
