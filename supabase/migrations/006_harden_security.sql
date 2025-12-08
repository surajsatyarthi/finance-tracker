-- SECURITY HARDENING MIGRATION
-- Purpose: Remove 'Backdoor' policies introduced for testing/single-user mode.
-- Risk Addressed: Prevents unauthorized access via the '0000...001' hardcoded UUID.

-- 1. Drop the dangerous "Single User" policies
DROP POLICY IF EXISTS "Allow single-user access" ON accounts;
DROP POLICY IF EXISTS "Allow single-user access" ON transactions;
DROP POLICY IF EXISTS "Allow single-user access" ON credit_cards;
DROP POLICY IF EXISTS "Allow single-user access" ON categories;
DROP POLICY IF EXISTS "Allow single-user access" ON goals;
DROP POLICY IF EXISTS "Allow single-user access" ON budgets;
DROP POLICY IF EXISTS "Allow single-user access" ON loans;
DROP POLICY IF EXISTS "Allow single-user access" ON credit_card_transactions;
DROP POLICY IF EXISTS "Allow single-user access" ON loan_payments;

-- 2. Verify that Strict Auth policies exists
-- (These should have been created in 003, but we ensure they are the ONLY way in)
-- If 'Allow authenticated users' exists, we are good.
-- The existing policies from 003:
-- CREATE POLICY "Allow authenticated users" ON accounts FOR ALL USING (auth.uid() = user_id::uuid);

-- 3. Ensure RLS is definitely enabled (Defense in Depth)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;

-- Migration 006 Complete: Backdoor Closed.
