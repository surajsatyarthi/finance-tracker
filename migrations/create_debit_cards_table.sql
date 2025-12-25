-- Create bank_accounts table first (for debit card linking)
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Account Details
  account_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT, -- Encrypted with +1 offset
  ifsc_code TEXT,
  account_type TEXT, -- 'savings', 'current', 'salary', etc.
  
  -- Balance
  current_balance DECIMAL(12,2) DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for bank_accounts
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_active ON bank_accounts(is_active);

-- RLS Policies for bank_accounts
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bank accounts"
  ON bank_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank accounts"
  ON bank_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank accounts"
  ON bank_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bank accounts"
  ON bank_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Create debit_cards table with full card data storage
-- Uses +1 offset encryption for security

CREATE TABLE IF NOT EXISTS debit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Card Identity
  name TEXT NOT NULL,
  bank TEXT,
  card_number TEXT, -- Stored with +1 offset
  last_four_digits TEXT, -- For display (also offset)
  expiry_month INTEGER, -- 1-12
  expiry_year INTEGER, -- e.g., 2030
  cvv TEXT, -- Stored with +1 offset
  
  -- Linking
  linked_account_id UUID REFERENCES bank_accounts(id), -- Links to specific bank account
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_debit_cards_user_id ON debit_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_debit_cards_active ON debit_cards(is_active);

-- RLS Policies
ALTER TABLE debit_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own debit cards"
  ON debit_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debit cards"
  ON debit_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debit cards"
  ON debit_cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own debit cards"
  ON debit_cards FOR DELETE
  USING (auth.uid() = user_id);

-- Also add full card data columns to credit_cards table
ALTER TABLE credit_cards 
ADD COLUMN IF NOT EXISTS card_number TEXT,
ADD COLUMN IF NOT EXISTS expiry_month INTEGER,
ADD COLUMN IF NOT EXISTS expiry_year INTEGER,
ADD COLUMN IF NOT EXISTS cvv_encrypted TEXT;

COMMENT ON COLUMN debit_cards.card_number IS 'Full card number with +1 offset encryption';
COMMENT ON COLUMN debit_cards.cvv IS 'CVV with +1 offset encryption';
COMMENT ON COLUMN credit_cards.card_number IS 'Full card number with +1 offset encryption';
COMMENT ON COLUMN credit_cards.cvv_encrypted IS 'CVV with +1 offset encryption';
