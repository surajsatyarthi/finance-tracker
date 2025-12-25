-- Add statement tracking columns to credit_cards table
-- These allow us to track what's actually due vs unbilled transactions

ALTER TABLE credit_cards 
ADD COLUMN IF NOT EXISTS last_statement_amount DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS last_statement_date DATE;

-- Add comments for clarity
COMMENT ON COLUMN credit_cards.last_statement_amount IS 'Amount from the most recent statement that is due for payment';
COMMENT ON COLUMN credit_cards.last_statement_date IS 'Date when the most recent statement was generated';
COMMENT ON COLUMN credit_cards.current_balance IS 'Unbilled transactions - NOT the amount due';
