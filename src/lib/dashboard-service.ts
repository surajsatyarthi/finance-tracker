import { SupabaseClient } from '@supabase/supabase-js'
import type { Account, CreditCard, Loan, EMI, BNPL, Transaction, Investment } from '@/types/database'
import {
  calculateNetWorth,
  calculateSavingsRate,
  calculateCreditUtilization,
  calculateDebtServiceRatio,
  calculateLiquidityRatio,
  getUpcomingPayments
} from './formulas'

export async function getDashboardMetrics(supabase: SupabaseClient, userId: string) {
  // Fetch all data in parallel
  const [
    accountsRes,
    creditCardsRes,
    loansRes,
    emisRes,
    bnplsRes,
    transactionsRes,
    investmentsRes
  ] = await Promise.all([
    supabase.from('accounts').select('*').eq('user_id', userId).eq('is_active', true).limit(10000),
    supabase.from('credit_cards').select('*').eq('user_id', userId).eq('is_active', true).limit(10000),
    supabase.from('loans').select('*').eq('user_id', userId).eq('is_active', true).limit(10000),
    supabase.from('emis').select('*').eq('user_id', userId).is('deleted_at', null).limit(10000),
    supabase.from('bnpls').select('*').eq('user_id', userId).is('deleted_at', null).limit(10000),
    supabase.from('transactions').select('*').eq('user_id', userId).is('deleted_at', null).limit(10000),
    supabase.from('investments').select('*').eq('user_id', userId).is('deleted_at', null).limit(10000)
  ])

  const accounts = (accountsRes.data || []) as Account[]
  const creditCards = (creditCardsRes.data || []) as CreditCard[]
  const loans = (loansRes.data || []) as Loan[]
  const emis = (emisRes.data || []) as EMI[]
  const bnpls = (bnplsRes.data || []) as BNPL[]
  const transactions = (transactionsRes.data || []) as Transaction[]
  const investments = (investmentsRes.data || []) as Investment[]

  // Calculate current month range for income/expense metrics
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Calculate all metrics using verified formulas
  const netWorthData = calculateNetWorth({
    accounts,
    creditCards,
    loans,
    emis,
    bnpls,
    investments
  })

  const savingsRate = calculateSavingsRate({
    transactions,
    startDate: startOfMonth,
    endDate: endOfMonth
  })

  const creditUtilization = calculateCreditUtilization({
    creditCards,
    emis,
    bnpls
  })

  const debtServiceRatio = calculateDebtServiceRatio({
    loans,
    emis,
    bnpls,
    creditCards,
    transactions,
    startDate: startOfMonth,
    endDate: endOfMonth
  })

  const liquidityRatio = calculateLiquidityRatio({
    accounts,
    transactions,
    startDate: startOfMonth,
    endDate: endOfMonth
  })

  const upcomingPayments = getUpcomingPayments({
    creditCards,
    loans,
    emis,
    bnpls
  })

  return {
    netWorth: netWorthData.netWorth,
    totalAssets: netWorthData.totalAssets,
    totalLiabilities: netWorthData.totalLiabilities,
    savingsRate,
    creditUtilization,
    debtServiceRatio,
    liquidityRatio,
    upcomingPayments,
    counts: {
      accounts: accounts.length,
      creditCards: creditCards.length,
      loans: loans.length,
      investments: investments.length
    }
  }
}
