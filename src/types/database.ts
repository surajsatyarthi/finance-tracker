export type Account = {
  id: string
  user_id: string
  name: string
  type: 'savings' | 'current' | 'fd' | 'investment' | 'crypto' | 'cash'
  balance: number
  currency: string
  is_active: boolean
  created_at: string
  updated_at: string
  ifsc_code: string | null
  account_number: string | null
  card_number: string | null
  card_expiry_month: number | null
  card_expiry_year: number | null
  card_cvv: string | null
  customer_id: string | null
}

export type CreditCard = {
  id: string
  user_id: string
  name: string
  bank: string | null
  card_type: string  // Network: VISA, MASTERCARD, RUPAY, JCB, DISCOVER, EMI
  last_four_digits: string | null
  card_number: string | null
  cvv: string | null
  expiry_date: string | null
  card_network: string | null
  credit_limit: number
  current_balance: number
  statement_date: number | null
  due_date: number | null
  last_statement_amount: number | null
  last_statement_date: string | null
  annual_fee: number | null
  cashback_rate: number | null
  reward_points_rate: number | null
  reward_point_value: number | null
  reward_points_expiry_months: number | null
  partner_merchants: string[] | null
  benefits: Record<string, unknown> | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Loan = {
  id: string
  user_id: string
  name: string
  type: 'personal' | 'home' | 'car' | 'education' | 'other'
  principal_amount: number
  current_balance: number
  interest_rate: number | null
  emi_amount: number | null
  total_emis: number | null
  emis_paid: number
  emis_remaining: number | null
  start_date: string
  end_date: string | null
  next_emi_date: string | null
  linked_credit_card_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type EMI = {
  id: string
  user_id: string
  emi_name: string
  total_amount: number
  paid_amount: number
  remaining_amount: number
  monthly_emi: number
  start_date: string
  end_date: string | null
  next_due_date: string | null
  linked_card_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type BNPL = {
  id: string
  user_id: string
  merchant: string
  total_amount: number
  paid_amount: number
  remaining_amount: number
  installment_amount: number
  next_due_date: string | null
  linked_card_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type Transaction = {
  id: string
  user_id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category_id: string | null
  account_id: string | null
  credit_card_id: string | null
  is_recurring: boolean
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type Category = {
  id: string
  user_id: string
  name: string
  type: 'income' | 'expense'
  parent_category_id: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type Budget = {
  id: string
  user_id: string
  category_id: string
  amount: number
  period: 'monthly' | 'yearly'
  start_date: string
  end_date: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type RecurringTransaction = {
  id: string
  user_id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category_id: string | null
  account_id: string | null
  credit_card_id: string | null
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date: string | null
  next_occurrence: string
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type Goal = {
  id: string
  user_id: string
  goal_name: string
  target_amount: number
  current_amount: number
  target_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type Investment = {
  id: string
  user_id: string
  investment_name: string
  investment_type: 'stocks' | 'mf' | 'bonds' | 'ppf' | 'nps' | 'other'
  invested_amount: number
  current_value: number
  account_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type FixedDeposit = {
  id: string
  user_id: string
  bank_name: string
  fd_number: string | null
  principal_amount: number
  interest_rate: number
  tenure_months: number
  start_date: string
  maturity_date: string
  maturity_amount: number
  auto_renew: boolean
  nominee_name: string | null
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}
