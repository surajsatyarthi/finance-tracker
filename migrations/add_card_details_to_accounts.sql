-- Add debit card details and IFSC code to existing accounts table
-- Uses +1 offset encryption for security

ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS ifsc_code TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT, -- Encrypted with +1 offset
ADD COLUMN IF NOT EXISTS card_number TEXT, -- Debit card number with +1 offset
ADD COLUMN IF NOT EXISTS card_expiry_month INTEGER, -- 1-12
ADD COLUMN IF NOT EXISTS card_expiry_year INTEGER, -- e.g., 2030
ADD COLUMN IF NOT EXISTS card_cvv TEXT; -- CVV with +1 offset

-- Add helpful comments
COMMENT ON COLUMN accounts.account_number IS 'Bank account number with +1 offset encryption';
COMMENT ON COLUMN accounts.card_number IS 'Debit card number with +1 offset encryption';
COMMENT ON COLUMN accounts.card_cvv IS 'Debit card CVV with +1 offset encryption';
COMMENT ON COLUMN accounts.ifsc_code IS 'Bank IFSC code';
