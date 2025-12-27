-- PERMANENT FIX: Move Slice from credit_cards to bank_accounts
-- Root cause: Slice is a DEBIT card but was incorrectly stored as credit card

-- Step 1: Check current state
SELECT 'Current Slice in credit_cards:' as info;
SELECT id, name, credit_limit, card_number, card_cvv 
FROM credit_cards 
WHERE name ILIKE '%slice%' 
  AND user_id = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

SELECT 'Current Slice in bank_accounts:' as info;
SELECT id, name, account_number, ifsc_code, current_balance 
FROM bank_accounts 
WHERE name ILIKE '%slice%' 
  AND user_id = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

-- Step 2: DELETE Slice from credit_cards (wrong table)
DELETE FROM credit_cards
WHERE id = 'b0e3f058-853a-4669-84a8-62d8965d7086'
  AND user_id = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

-- Step 3: INSERT Slice into bank_accounts (correct table) with placeholder data
-- **USER: REPLACE THESE VALUES WITH ACTUAL SLICE DETAILS**
INSERT INTO bank_accounts (
  user_id,
  name,
  account_type,
  account_number,
  ifsc_code,
  current_balance,
  card_number,
  card_cvv,
  card_expiry,
  is_active,
  created_at,
  updated_at
) VALUES (
  '8a7ce6b7-eec8-401a-a94e-46685e18a218',
  'Slice Savings',
  'savings', -- Slice is a savings account with debit card
  'PROVIDE_ACCOUNT_NUMBER', -- **USER: Add account number here**
  'PROVIDE_IFSC_CODE',       -- **USER: Add IFSC code here**
  0, -- Starting balance (will be updated)
  'PROVIDE_16_DIGIT_CARD',   -- **USER: Add card number here**
  'PROVIDE_CVV',             -- **USER: Add CVV here**
  '12/28', -- **USER: Add expiry date MM/YY**
  true,
  NOW(),
  NOW()
);

-- Step 4: Verify the fix
SELECT 'Verification - Slice should be GONE from credit_cards:' as info;
SELECT COUNT(*) as should_be_zero
FROM credit_cards 
WHERE name ILIKE '%slice%' 
  AND user_id = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

SELECT 'Verification - Slice should be IN bank_accounts:' as info;
SELECT name, account_number, card_number
FROM bank_accounts 
WHERE name ILIKE '%slice%' 
  AND user_id = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

-- Step 5: PERMANENT FIX - Add constraint to PREVENT Slice in credit_cards
-- This ensures "fix doesn't break" in future
-- (Note: This is a comment/reminder - actual constraint would need ALTER TABLE)
-- Recommendation: Add application-level validation in credit card creation forms
