-- Add 3 Sample Income Transactions
-- Run this in Supabase SQL Editor

-- Income 1: Salary (December 2025)
INSERT INTO transactions (
  user_id,
  type,
  amount,
  description,
  date,
  payment_method,
  subcategory,
  is_recurring,
  created_at
) VALUES (
  '8a7ce6b7-eec8-401a-a94e-46685e18a218',
  'income',
  75000,
  'Monthly Salary - December',
  '2025-12-01',
  'bank_transfer',
  'Salary',
  true,
  NOW()
);

-- Income 2: Freelance Project (December 2025)
INSERT INTO transactions (
  user_id,
  type,
  amount,
  description,
  date,
  payment_method,
  subcategory,
  is_recurring,
  created_at
) VALUES (
  '8a7ce6b7-eec8-401a-a94e-46685e18a218',
  'income',
  15000,
  'Freelance Web Development Project',
  '2025-12-15',
  'bank_transfer',
  'Freelance',
  false,
  NOW()
);

-- Income 3: Interest Income (December 2025)
INSERT INTO transactions (
  user_id,
  type,
  amount,
  description,
  date,
  payment_method,
  subcategory,
  is_recurring,
  created_at
) VALUES (
  '8a7ce6b7-eec8-401a-a94e-46685e18a218',
  'income',
  500,
  'Bank Interest',
  '2025-12-20',
  'bank_transfer',
  'Interest',
  false,
  NOW()
);

-- Verify the data was added
SELECT 
  type,
  amount,
  description,
  date
FROM transactions
WHERE user_id = '8a7ce6b7-eec8-401a-a94e-46685e18a218'
  AND type = 'income'
ORDER BY date DESC;

-- Expected result: 3 income transactions
-- Total income: ₹90,500 (75,000 + 15,000 + 500)
