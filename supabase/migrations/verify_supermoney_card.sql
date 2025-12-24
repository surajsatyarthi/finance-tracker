-- Verify SuperMoney RUPAY Credit Card was added successfully
-- Run this in Supabase SQL Editor to confirm the card exists

-- 1. Check if SuperMoney card exists
SELECT 
  id,
  name,
  bank,
  card_type,
  last_four_digits,
  credit_limit,
  current_balance,
  statement_date,
  due_date,
  annual_fee,
  cashback_rate,
  partner_merchants,
  is_active,
  created_at
FROM credit_cards 
WHERE user_id = '00000000-0000-0000-0000-000000000001' 
AND name = 'SuperMoney';

-- 2. Count total credit cards for the user
SELECT COUNT(*) as total_cards 
FROM credit_cards 
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- 3. List all credit cards for comparison
SELECT 
  name,
  card_type,
  last_four_digits,
  credit_limit,
  annual_fee,
  is_active
FROM credit_cards 
WHERE user_id = '00000000-0000-0000-0000-000000000001' 
ORDER BY name;

-- 4. Check SuperMoney benefits stored in JSON
SELECT 
  name,
  benefits
FROM credit_cards 
WHERE user_id = '00000000-0000-0000-0000-000000000001' 
AND name = 'SuperMoney';