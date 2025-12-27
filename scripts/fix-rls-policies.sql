-- Finance Tracker: RLS Policy Diagnostic & Fix Script
-- Run this in Supabase SQL Editor

-- ======================================
-- STEP 1: CHECK CURRENT RLS POLICIES
-- ======================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check
FROM pg_policies
WHERE tablename = 'transactions'
ORDER BY cmd;

-- ======================================
-- STEP 2: CHECK IF RLS IS ENABLED
-- ======================================

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'transactions';

-- ======================================
-- EXPECTED RESULT:
-- ======================================
-- You should see a policy like:
--   policyname: "Users can view own transactions" (or similar)
--   cmd: SELECT
--   roles: {authenticated}
--   using_expression: (auth.uid() = user_id)

-- If you see NO policies or wrong policies, run STEP 3 below.

-- ======================================
-- STEP 3: FIX RLS POLICIES (IF NEEDED)
-- ======================================

-- Enable RLS if not enabled
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they're wrong (optional - check first!)
-- DROP POLICY IF EXISTS "Enable read access for authenticated users" ON transactions;
-- DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;

-- Create correct SELECT policy
CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create INSERT policy (if users can add transactions)
CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create UPDATE policy (if users can edit transactions)
CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create DELETE policy (if users can delete transactions)
CREATE POLICY "Users can delete own transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ======================================
-- STEP 4: VERIFY FIX
-- ======================================

-- Re-run Step 1 query to confirm policies exist
SELECT 
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies
WHERE tablename = 'transactions';

-- Expected output: 4 policies (SELECT, INSERT, UPDATE, DELETE)

-- ======================================
-- STEP 5: TEST WITH AUTHENTICATED USER
-- ======================================

-- Switch to authenticated context (this won't work in SQL editor)
-- Test by refreshing your app at http://localhost:3000/dashboard
-- Income should still show ₹0 (because no income transactions exist)
-- But console errors should be GONE

-- ======================================
-- ADDITIONAL INFO
-- ======================================

-- Current user transactions breakdown:
SELECT 
  type,
  COUNT(*) as count,
  SUM(amount) as total
FROM transactions
WHERE user_id = '8a7ce6b7-eec8-401a-a94e-46685e18a218'
GROUP BY type;

-- Expected result:
--   type    | count | total
--   --------|-------|-------
--   expense |   6   | (varies)
--   income  |   0   |  NULL

-- This confirms: User has 0 income transactions
-- So ₹0 is CORRECT, not a bug!
-- The 400 error is the RLS policy issue.
