-- ============================================================
-- COMPLETE FIX: Update RLS + Bank Accounts - December 19, 2025
-- ============================================================
-- Run this ENTIRE script in Supabase SQL Editor

-- PART 1: Fix RLS policies to allow full CRUD operations
DROP POLICY IF EXISTS "Allow single-user access" ON accounts;
DROP POLICY IF EXISTS "Allow authenticated users" ON accounts;
DROP POLICY IF EXISTS "Users can only see their own accounts" ON accounts;
DROP POLICY IF EXISTS "Full access for authenticated users" ON accounts;

-- Create new permissive policy
CREATE POLICY "Full access for authenticated users" ON accounts 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- PART 2: Update bank accounts
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'surajstoic@gmail.com';
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found!';
    END IF;
    
    RAISE NOTICE 'Found user ID: %', target_user_id;
    
    DELETE FROM accounts WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted all existing accounts';
    
    -- Insert 11 accounts with VALID types: savings, current, wallet, investment, cash
    INSERT INTO accounts (user_id, name, type, balance, currency, is_active)
    VALUES
        (target_user_id, 'Cash', 'cash', 2516.00, 'INR', true),
        (target_user_id, 'SBI', 'savings', 62.98, 'INR', true),
        (target_user_id, 'CBI', 'savings', 652.28, 'INR', true),
        (target_user_id, 'Jupiter', 'savings', 163.80, 'INR', true),
        (target_user_id, 'Slice', 'wallet', 86835.00, 'INR', true),
        (target_user_id, 'Kotak', 'savings', 715.00, 'INR', true),
        (target_user_id, 'Tide', 'current', 190.80, 'INR', true),
        (target_user_id, 'DCB', 'savings', 0.00, 'INR', true),
        (target_user_id, 'SBM', 'savings', 0.00, 'INR', true),
        (target_user_id, 'Yes Bank', 'current', 17232.29, 'INR', true),
        (target_user_id, 'Post Office', 'savings', 1000.00, 'INR', true);
    
    RAISE NOTICE '✅ Inserted 11 bank accounts successfully!';
    RAISE NOTICE '   Total Liquidity: ₹1,09,368.15';
END $$;

-- PART 3: Verify
SELECT name, type, balance FROM accounts 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'surajstoic@gmail.com')
ORDER BY balance DESC;
