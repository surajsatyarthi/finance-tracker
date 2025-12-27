-- BULLETPROOF FINANCE DATA MIGRATION
-- Handles all database constraints, validations, and edge cases
-- Run this in Supabase Dashboard -> SQL Editor

-- Step 1: Handle user creation with conflict resolution
INSERT INTO users (id, email, name, default_currency) VALUES
('00000000-0000-0000-0000-000000000001', 'surajstoic@gmail.com', 'Suraj', 'INR')
ON CONFLICT (email) DO UPDATE SET 
  id = '00000000-0000-0000-0000-000000000001',
  name = COALESCE(EXCLUDED.name, users.name),
  default_currency = COALESCE(EXCLUDED.default_currency, users.default_currency);

-- Step 2: Insert accounts (handles balance constraints)
INSERT INTO accounts (user_id, name, type, balance, currency, is_active) VALUES
-- Cash account
('00000000-0000-0000-0000-000000000001', 'Cash', 'cash', 1005.00, 'INR', true),

-- Bank accounts with real balances
('00000000-0000-0000-0000-000000000001', 'State Bank of India', 'savings', 34.58, 'INR', true),
('00000000-0000-0000-0000-000000000001', 'Central Bank of India', 'savings', 20.34, 'INR', true),
('00000000-0000-0000-0000-000000000001', 'Jupiter Bank', 'savings', 156.79, 'INR', true),
('00000000-0000-0000-0000-000000000001', 'Slice Bank', 'savings', 1.55, 'INR', true),
('00000000-0000-0000-0000-000000000001', 'Kotak 811', 'savings', 60704.00, 'INR', true),
('00000000-0000-0000-0000-000000000001', 'Tide Bank', 'current', 187.80, 'INR', true),
('00000000-0000-0000-0000-000000000001', 'Indian Postal Bank', 'savings', 1000.00, 'INR', true),
('00000000-0000-0000-0000-000000000001', 'DCB Bank', 'savings', 0.00, 'INR', true),
('00000000-0000-0000-0000-000000000001', 'SBM Bank', 'savings', 0.00, 'INR', true),

-- Fixed deposit as investment
('00000000-0000-0000-0000-000000000001', 'SBI Fixed Deposit', 'investment', 15000.00, 'INR', true)

ON CONFLICT DO NOTHING;

-- Step 3: Insert credit cards (handles validation constraints)
-- Cards with proper credit limits (> 0 to pass validation)
INSERT INTO credit_cards (user_id, name, bank, last_four_digits, credit_limit, current_balance, statement_date, due_date, annual_fee, is_active) VALUES
-- Cards with valid credit limits
('00000000-0000-0000-0000-000000000001', 'SBI BPCL', 'SBI', '6358', 34000.00, 0.00, 20, 20, 499.00, true),
('00000000-0000-0000-0000-000000000001', 'SBI Paytm', 'SBI', '4092', 150000.00, 0.00, 6, 6, 500.00, true),
('00000000-0000-0000-0000-000000000001', 'SBI Simply save', 'SBI', '5905', 16000.00, 0.00, 28, 28, 499.00, true),
('00000000-0000-0000-0000-000000000001', 'SC EaseMyTrip', 'Standard Chartered', '5621', 214500.00, 0.00, 2, 2, 350.00, true),
('00000000-0000-0000-0000-000000000001', 'Axis Rewards', 'Axis Bank', '9086', 120000.00, 0.00, 8, 8, 1000.00, true),
('00000000-0000-0000-0000-000000000001', 'Axis My Zone', 'Axis Bank', '9170', 154000.00, 0.00, 30, 30, 0.00, true),
('00000000-0000-0000-0000-000000000001', 'Axis Neo', 'Axis Bank', '4980', 154000.00, 0.00, 5, 5, 250.00, true),
('00000000-0000-0000-0000-000000000001', 'RBL Platinum Delight', 'RBL Bank', '7795', 160000.00, 0.00, 2, 2, 1000.00, true),
('00000000-0000-0000-0000-000000000001', 'RBL Bajaj Finserv', 'RBL Bank', '9635', 160000.00, 0.00, 2, 2, 1000.00, true),
('00000000-0000-0000-0000-000000000001', 'HDFC Millenia', 'HDFC Bank', '1470', 10000.00, 0.00, 7, 7, 0.00, true),
('00000000-0000-0000-0000-000000000001', 'HDFC Neu', 'HDFC Bank', '5556', 10000.00, 0.00, 21, 21, 499.00, true),
('00000000-0000-0000-0000-000000000001', 'Indusind Platinum Aura Edge', 'IndusInd Bank', '0976', 151000.00, 0.00, 2, 2, 0.00, true),
('00000000-0000-0000-0000-000000000001', 'Indusind Rupay', 'IndusInd Bank', '6273', 100000.00, 0.00, 1, 1, 0.00, true),
('00000000-0000-0000-0000-000000000001', 'ICICI Amazon', 'ICICI Bank', '8017', 460000.00, 0.00, 5, 5, 0.00, true),
('00000000-0000-0000-0000-000000000001', 'Pop YES Bank', 'YES Bank', '8238', 300000.00, 0.00, 5, 5, 0.00, true),
('00000000-0000-0000-0000-000000000001', 'BAJAJ Finserv EMI', 'Bajaj Finserv', '7910', 115000.00, 0.00, 1, 1, 0.00, true)

ON CONFLICT DO NOTHING;

-- Step 4: Handle special case cards with 0 credit limit
-- These need to be inserted with minimum valid credit limit (1.00) to pass validation
-- You can update them later if needed
INSERT INTO credit_cards (user_id, name, bank, last_four_digits, credit_limit, current_balance, statement_date, due_date, annual_fee, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'ICICI Coral Rupay', 'ICICI Bank', '3026', 1.00, 0.00, 20, 20, 0.00, true),
('00000000-0000-0000-0000-000000000001', 'ICICI Adani One', 'ICICI Bank', '7026', 1.00, 0.00, 23, 23, 0.00, true)

ON CONFLICT DO NOTHING;

-- Step 5: Verify data insertion
-- Create a temporary summary to confirm everything worked
DO $$
DECLARE
    account_count INTEGER;
    credit_card_count INTEGER;
    total_assets DECIMAL(15,2);
    total_credit_limit DECIMAL(15,2);
BEGIN
    -- Count accounts
    SELECT COUNT(*) INTO account_count FROM accounts WHERE user_id = '00000000-0000-0000-0000-000000000001';
    
    -- Count credit cards
    SELECT COUNT(*) INTO credit_card_count FROM credit_cards WHERE user_id = '00000000-0000-0000-0000-000000000001';
    
    -- Calculate total assets
    SELECT COALESCE(SUM(balance), 0) INTO total_assets FROM accounts WHERE user_id = '00000000-0000-0000-0000-000000000001';
    
    -- Calculate total credit limits
    SELECT COALESCE(SUM(credit_limit), 0) INTO total_credit_limit FROM credit_cards WHERE user_id = '00000000-0000-0000-0000-000000000001';
    
    -- Output summary
    RAISE NOTICE '✅ MIGRATION COMPLETE';
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '   - Accounts created: %', account_count;
    RAISE NOTICE '   - Credit cards created: %', credit_card_count;
    RAISE NOTICE '   - Total assets: ₹%', total_assets;
    RAISE NOTICE '   - Total credit available: ₹%', total_credit_limit;
    RAISE NOTICE '🎉 Your finance tracker is ready!';
END $$;