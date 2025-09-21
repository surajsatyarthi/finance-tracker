-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth, but we can add custom fields)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  default_currency TEXT DEFAULT 'INR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accounts table (Liquidity - SBI, CBI, Cash, etc.)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'SBI', 'CBI', 'Cash', 'Jupiter'
  type TEXT CHECK (type IN ('savings', 'current', 'wallet', 'investment', 'cash')) DEFAULT 'savings',
  balance DECIMAL(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table (for expenses and income)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  parent_category_id UUID REFERENCES categories(id), -- for subcategories
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table (Income and Expenses)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id),
  amount DECIMAL(15,2) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense', 'transfer')) NOT NULL,
  category_id UUID REFERENCES categories(id),
  subcategory TEXT,
  description TEXT,
  payment_method TEXT CHECK (payment_method IN ('cash', 'upi', 'card', 'bank_transfer', 'cheque')) DEFAULT 'upi',
  date DATE NOT NULL,
  month INTEGER GENERATED ALWAYS AS (EXTRACT(month FROM date)) STORED,
  year INTEGER GENERATED ALWAYS AS (EXTRACT(year FROM date)) STORED,
  is_recurring BOOLEAN DEFAULT false,
  recurring_pattern JSONB, -- {frequency: 'monthly', interval: 1, end_date: '2024-12-31'}
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Cards table
CREATE TABLE credit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'SBI BPCL', 'SBI Paytm'
  bank TEXT,
  card_type TEXT, -- 'VISA', 'MASTERCARD'
  last_four_digits TEXT,
  credit_limit DECIMAL(15,2),
  current_balance DECIMAL(15,2) DEFAULT 0,
  statement_date INTEGER, -- day of month (1-31)
  due_date INTEGER, -- day of month (1-31)
  annual_fee DECIMAL(10,2),
  cashback_rate DECIMAL(5,2), -- percentage
  reward_points_rate DECIMAL(10,2), -- points per 100 spent
  reward_point_value DECIMAL(10,4), -- 1 RP = INR
  reward_points_expiry_months INTEGER,
  partner_merchants TEXT[],
  benefits JSONB, -- airport lounge, railway lounge, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Card Transactions/EMIs
CREATE TABLE credit_card_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  credit_card_id UUID REFERENCES credit_cards(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT CHECK (type IN ('purchase', 'payment', 'emi', 'fee', 'interest')) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  emi_months INTEGER, -- if type = 'emi'
  emi_amount DECIMAL(15,2), -- monthly EMI amount
  emi_remaining INTEGER, -- EMIs left
  interest_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loans table
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'Education loan', 'Car loan'
  type TEXT CHECK (type IN ('education', 'home', 'personal', 'auto', 'credit_card')) DEFAULT 'personal',
  principal_amount DECIMAL(15,2) NOT NULL,
  current_balance DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  emi_amount DECIMAL(15,2) NOT NULL,
  total_emis INTEGER NOT NULL,
  emis_paid INTEGER DEFAULT 0,
  emis_remaining INTEGER GENERATED ALWAYS AS (total_emis - emis_paid) STORED,
  start_date DATE NOT NULL,
  end_date DATE,
  next_emi_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loan Payments/EMI History
CREATE TABLE loan_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  principal_amount DECIMAL(15,2) NOT NULL,
  interest_amount DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  balance_after_payment DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals table (Savings Goals)
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'Bike overhaul', 'Car overhaul'
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  target_date DATE,
  category TEXT, -- 'vehicle', 'vacation', 'emergency'
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  is_completed BOOLEAN DEFAULT false,
  progress_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN target_amount = 0 THEN 0
      ELSE LEAST(100, (current_amount / target_amount) * 100)
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets table
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  category_name TEXT NOT NULL, -- denormalized for performance
  monthly_limit DECIMAL(15,2) NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  spent_amount DECIMAL(15,2) DEFAULT 0,
  remaining_amount DECIMAL(15,2) GENERATED ALWAYS AS (monthly_limit - spent_amount) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, year, month)
);

-- Add indexes for performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_month_year ON transactions(user_id, year, month);
CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_credit_cards_user ON credit_cards(user_id);
CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_budgets_user_month ON budgets(user_id, year, month);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only see their own data" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can only see their own accounts" ON accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own categories" ON categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own credit cards" ON credit_cards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own credit card transactions" ON credit_card_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own loans" ON loans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own loan payments" ON loan_payments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own goals" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);

-- Functions for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_credit_cards_updated_at BEFORE UPDATE ON credit_cards 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();