-- Quick fix: Add missing Cash account
INSERT INTO accounts (user_id, name, type, balance, currency, is_active)
SELECT 
    id,
    'Cash',
    'cash',
    2516.00,
    'INR',
    true
FROM auth.users 
WHERE email = 'surajstoic@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM accounts 
    WHERE user_id = (SELECT id FROM auth.users WHERE email = 'surajstoic@gmail.com')
    AND name = 'Cash'
);

-- Verify
SELECT name, balance FROM accounts 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'surajstoic@gmail.com')
ORDER BY balance DESC;
