const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createDebitCardsTable() {
    console.log('\nCreating debit_cards table...\n');
    
    const { error } = await supabase.rpc('exec_sql', {
        sql: `
CREATE TABLE IF NOT EXISTS debit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  bank_name TEXT NOT NULL,
  card_number TEXT NOT NULL,
  cardholder_name TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  cvv TEXT NOT NULL,
  card_type TEXT DEFAULT 'debit',
  network TEXT,
  linked_account_id UUID REFERENCES accounts(id),
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_debit_cards_user_id ON debit_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_debit_cards_active ON debit_cards(is_active);

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
        `
    });
    
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('✅ debit_cards table created successfully\n');
    }
}

createDebitCardsTable();
