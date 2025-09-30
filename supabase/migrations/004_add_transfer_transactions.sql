-- Add support for transfer transactions
-- This migration adds fields to handle transfers between accounts

-- Add new columns to transactions table for transfer support
ALTER TABLE transactions 
ADD COLUMN from_account_id UUID REFERENCES accounts(id),
ADD COLUMN to_account_id UUID REFERENCES accounts(id),
ADD COLUMN transfer_reference_id UUID,
ADD COLUMN is_transfer BOOLEAN DEFAULT FALSE;

-- Add index for transfer queries
CREATE INDEX idx_transactions_from_account ON transactions(from_account_id);
CREATE INDEX idx_transactions_to_account ON transactions(to_account_id);
CREATE INDEX idx_transactions_transfer_ref ON transactions(transfer_reference_id);
CREATE INDEX idx_transactions_is_transfer ON transactions(is_transfer);

-- Update the type constraint to include 'transfer'
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('income', 'expense', 'transfer'));

-- Create a function to process transfer transactions
CREATE OR REPLACE FUNCTION process_transfer_transaction(
  p_user_id UUID,
  p_from_account_id UUID,
  p_to_account_id UUID,
  p_amount DECIMAL,
  p_description TEXT DEFAULT NULL,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
  transfer_ref_id UUID;
  from_transaction_id UUID;
  to_transaction_id UUID;
  result JSON;
BEGIN
  -- Generate a unique reference ID for this transfer
  transfer_ref_id := gen_random_uuid();
  
  -- Create the "outgoing" transaction (from account)
  INSERT INTO transactions (
    user_id, 
    account_id, 
    from_account_id, 
    to_account_id,
    amount, 
    type, 
    description, 
    date,
    is_transfer,
    transfer_reference_id,
    payment_method
  ) VALUES (
    p_user_id,
    p_from_account_id,
    p_from_account_id,
    p_to_account_id,
    p_amount,
    'transfer',
    p_description || ' (Transfer Out)',
    p_date,
    TRUE,
    transfer_ref_id,
    'transfer'
  ) RETURNING id INTO from_transaction_id;
  
  -- Create the "incoming" transaction (to account)
  INSERT INTO transactions (
    user_id,
    account_id,
    from_account_id,
    to_account_id, 
    amount,
    type,
    description,
    date,
    is_transfer,
    transfer_reference_id,
    payment_method
  ) VALUES (
    p_user_id,
    p_to_account_id,
    p_from_account_id,
    p_to_account_id,
    p_amount,
    'transfer',
    p_description || ' (Transfer In)',
    p_date,
    TRUE,
    transfer_ref_id,
    'transfer'
  ) RETURNING id INTO to_transaction_id;
  
  -- Return the transaction IDs and reference
  result := json_build_object(
    'success', TRUE,
    'transfer_reference_id', transfer_ref_id,
    'from_transaction_id', from_transaction_id,
    'to_transaction_id', to_transaction_id,
    'amount', p_amount,
    'from_account_id', p_from_account_id,
    'to_account_id', p_to_account_id
  );
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  -- Return error information
  RETURN json_build_object(
    'success', FALSE,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to get account balance including transfers
CREATE OR REPLACE FUNCTION get_account_balance_with_transfers(p_account_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  account_balance DECIMAL := 0;
  transfer_in DECIMAL := 0;
  transfer_out DECIMAL := 0;
BEGIN
  -- Get base account balance
  SELECT COALESCE(balance, 0) INTO account_balance
  FROM accounts 
  WHERE id = p_account_id;
  
  -- Calculate transfers into this account
  SELECT COALESCE(SUM(amount), 0) INTO transfer_in
  FROM transactions 
  WHERE to_account_id = p_account_id 
  AND is_transfer = TRUE;
  
  -- Calculate transfers out of this account  
  SELECT COALESCE(SUM(amount), 0) INTO transfer_out
  FROM transactions 
  WHERE from_account_id = p_account_id 
  AND is_transfer = TRUE;
  
  -- Return calculated balance
  RETURN account_balance + transfer_in - transfer_out;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for transfer transactions
CREATE POLICY "Allow single-user access" ON transactions FOR ALL 
USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid) 
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Add comment
COMMENT ON COLUMN transactions.from_account_id IS 'Source account for transfer transactions';
COMMENT ON COLUMN transactions.to_account_id IS 'Destination account for transfer transactions';
COMMENT ON COLUMN transactions.transfer_reference_id IS 'Links paired transfer transactions';
COMMENT ON COLUMN transactions.is_transfer IS 'Indicates if this is a transfer transaction';