-- Add customer_id field to accounts table
-- Run this in Supabase SQL Editor

ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS customer_id TEXT;

-- Update Slice Business with customer ID
UPDATE accounts 
SET customer_id = '380000214602'
WHERE user_id = '8a7ce6b7-eec8-401a-a94e-46685e18a218'
  AND name = 'Slice Business';

-- Post Office customer ID (user needs to provide)
-- UPDATE accounts 
-- SET customer_id = 'XXXXX'  -- Replace with actual customer ID
-- WHERE user_id = '8a7ce6b7-eec8-401a-a94e-46685e18a218'
--   AND name ILIKE '%post%office%';

-- Verify
SELECT name, account_number, customer_id
FROM accounts
WHERE user_id = '8a7ce6b7-eec8-401a-a94e-46685e18a218'
  AND customer_id IS NOT NULL;
