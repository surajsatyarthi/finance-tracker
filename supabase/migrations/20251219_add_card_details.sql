-- Add new columns for sensitive card data
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS card_number TEXT;
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS cvv TEXT;
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS expiry_date TEXT;
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS card_network TEXT; -- VISA, MASTERCARD, RUPAY, etc.
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS renewal_month TEXT;
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS waiver_limit INTEGER;
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS use_on TEXT;
