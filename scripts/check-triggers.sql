-- Check Database Triggers and Constraints
-- Run in Supabase SQL Editor to see what's causing validation errors

-- 1. Check triggers on transactions table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'transactions';

-- 2. Check triggers on credit_cards table  
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'credit_cards';

-- 3. Check check constraints
SELECT
    con.conname as constraint_name,
    con.contype as constraint_type,
    pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname IN ('transactions', 'credit_cards')
ORDER BY rel.relname, con.conname;

-- Expected results:
-- For transactions: Should see trigger preventing negative amounts
-- For credit_cards: Should see trigger preventing balance > limit
