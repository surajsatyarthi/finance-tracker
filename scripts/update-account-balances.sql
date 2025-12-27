-- Update account balances to match production values
-- Run this in Supabase SQL Editor

UPDATE accounts SET balance = 17005 WHERE name = 'YES Bank Business';
UPDATE accounts SET balance = 1000 WHERE name = 'Slice Business';
UPDATE accounts SET balance = 191 WHERE name = 'Tide';
UPDATE accounts SET balance = 86059 WHERE name = 'Slice';
UPDATE accounts SET balance = 1000 WHERE name = 'Post Office';
UPDATE accounts SET balance = 241 WHERE name = 'Kotak';
UPDATE accounts SET balance = 164 WHERE name = 'Jupiter';
UPDATE accounts SET balance = 78 WHERE name = 'CBI';
UPDATE accounts SET balance = 63 WHERE name = 'SBI';
UPDATE accounts SET balance = 0 WHERE name = 'DCB';
UPDATE accounts SET balance = 0 WHERE name = 'SBM';

-- Verify the updates
SELECT name, balance, type, updated_at 
FROM accounts 
ORDER BY name;
