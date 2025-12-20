-- ============================================================
-- Add Slice Business Account - December 20, 2025
-- ============================================================
-- Adds a Slice business account with 1000 rupees balance

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'surajstoic@gmail.com';
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found!';
    END IF;
    
    RAISE NOTICE 'Found user ID: %', target_user_id;
    
    -- Insert the Slice Business account
    INSERT INTO accounts (user_id, name, type, balance, currency, is_active)
    VALUES
        (target_user_id, 'Slice Business', 'current', 1000.00, 'INR', true);
    
    RAISE NOTICE '✅ Added Slice Business account with ₹1,000 balance!';
END $$;

-- Verify the account was added
SELECT name, type, balance 
FROM accounts 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'surajstoic@gmail.com')
ORDER BY created_at DESC
LIMIT 1;
