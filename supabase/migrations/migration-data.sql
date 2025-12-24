-- Insert your finance data into Supabase
-- Run this in Supabase Dashboard -> SQL Editor

-- First, create the user record (skip if email already exists)
INSERT INTO users (id, email, name, default_currency) VALUES
('00000000-0000-0000-0000-000000000001', 'surajstoic@gmail.com', 'Suraj', 'INR')
ON CONFLICT (email) DO UPDATE SET id = '00000000-0000-0000-0000-000000000001';

-- Insert cash account
INSERT INTO accounts (user_id, name, type, balance, currency, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'Cash', 'cash', 2843.00, 'INR', true);

-- Insert your bank accounts with real balances
INSERT INTO accounts (user_id, name, type, balance, currency, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'State Bank of India', 'savings', 61.98, 'INR', true),
('00000000-0000-0000-0000-000000000001', 'Central Bank of India', 'savings', 652.28, 'INR', true),
('00000000-0000-0000-0000-000000000001', 'Jupiter Bank', 'savings', 163.80, 'INR', true),
('00000000-0000-0000-0000-000000000001', 'Slice Bank', 'savings', 90103.00, 'INR', true),
('00000000-0000-0000-0000-000000000001', 'Kotak 811', 'savings', 715.00, 'INR', true),
('00000000-0000-0000-0000-000000000001', 'Tide Bank', 'current', 189.80, 'INR', true),
('00000000-0000-0000-0000-000000000001', 'Indian Postal Bank', 'savings', 1000.00, 'INR', true),
('00000000-0000-0000-0000-000000000001', 'DCB Bank', 'savings', 0, 'INR', true),
('00000000-0000-0000-0000-000000000001', 'SBM Bank', 'savings', 0, 'INR', true),
('00000000-0000-0000-0000-000000000001', 'SBI Fixed Deposit', 'investment', 15000.00, 'INR', true);

-- Insert your credit cards
INSERT INTO credit_cards (user_id, name, bank, last_four_digits, credit_limit, current_balance, statement_date, due_date, annual_fee, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'SBI BPCL', 'SBI', '6358', 34000, 0, 20, 20, 499, true),
('00000000-0000-0000-0000-000000000001', 'SBI Paytm', 'SBI', '4092', 150000, 0, 6, 6, 500, true),
('00000000-0000-0000-0000-000000000001', 'SBI Simply save', 'SBI', '5905', 16000, 0, 28, 28, 499, true),
('00000000-0000-0000-0000-000000000001', 'SC EaseMyTrip', 'Standard Chartered', '5621', 214500, 0, 2, 2, 350, true),
('00000000-0000-0000-0000-000000000001', 'Axis Rewards', 'Axis Bank', '9086', 120000, 0, 8, 8, 1000, true),
('00000000-0000-0000-0000-000000000001', 'Axis My Zone', 'Axis Bank', '9170', 154000, 0, 30, 30, 0, true),
('00000000-0000-0000-0000-000000000001', 'Axis Neo', 'Axis Bank', '4980', 154000, 0, 5, 5, 250, true),
('00000000-0000-0000-0000-000000000001', 'RBL Platinum Delight', 'RBL Bank', '7795', 160000, 0, 2, 2, 1000, true),
('00000000-0000-0000-0000-000000000001', 'RBL Bajaj Finserv', 'RBL Bank', '9635', 160000, 0, 2, 2, 1000, true),
('00000000-0000-0000-0000-000000000001', 'HDFC Millenia', 'HDFC Bank', '1470', 10000, 0, 7, 7, 0, true),
('00000000-0000-0000-0000-000000000001', 'HDFC Neu', 'HDFC Bank', '5556', 10000, 0, 21, 21, 499, true),
('00000000-0000-0000-0000-000000000001', 'Indusind Platinum Aura Edge', 'IndusInd Bank', '0976', 151000, 0, 2, 2, 0, true),
('00000000-0000-0000-0000-000000000001', 'Indusind Rupay', 'IndusInd Bank', '6273', 100000, 0, 1, 1, 0, true),
('00000000-0000-0000-0000-000000000001', 'ICICI Amazon', 'ICICI Bank', '8017', 460000, 0, 5, 5, 0, true),
('00000000-0000-0000-0000-000000000001', 'ICICI Coral Rupay', 'ICICI Bank', '3026', 0, 0, 20, 20, 0, true),
('00000000-0000-0000-0000-000000000001', 'ICICI Adani One', 'ICICI Bank', '7026', 0, 0, 23, 23, 0, true),
('00000000-0000-0000-0000-000000000001', 'Pop YES Bank', 'YES Bank', '8238', 300000, 0, 5, 5, 0, true),
('00000000-0000-0000-0000-000000000001', 'BAJAJ Finserv EMI', 'Bajaj Finserv', '7910', 115000, 0, 1, 1, 0, true);