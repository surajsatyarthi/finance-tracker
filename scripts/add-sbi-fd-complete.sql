-- Quick Create & Insert SBI FD
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zzwouesueadoqrlmteyh/sql/new

-- Step 1: Create Table
CREATE TABLE IF NOT EXISTS fixed_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT,
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    start_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    maturity_amount DECIMAL(15,2),
    interest_earned DECIMAL(15,2),
    status TEXT DEFAULT 'active',
    auto_renew BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable RLS
ALTER TABLE fixed_deposits ENABLE ROW LEVEL SECURITY;

-- Step 3: Add Policies
CREATE POLICY "Users can manage own FDs" ON fixed_deposits
    FOR ALL USING (auth.uid() = user_id);

-- Step 4: Insert Your SBI FD
INSERT INTO fixed_deposits (
    user_id,
    bank_name,
    account_number,
    principal_amount,
    interest_rate,
    start_date,
    maturity_date,
    maturity_amount,
    interest_earned,
    status
) VALUES (
    '8a7ce6b7-eec8-401a-a94e-46685e18a218',
    'SBI',
    '43059571386',
    15000.00,
    7.00,
    '2025-12-26',
    '2026-06-14',
    15489.00,
    489.00,
    'active'
);

-- Step 5: Verify
SELECT 
    bank_name,
    account_number,
    principal_amount,
    interest_rate,
    maturity_date,
    maturity_amount,
    status
FROM fixed_deposits
WHERE user_id = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

-- Should show: SBI FD #43059571386, ₹15,000 → ₹15,489 on 2026-06-14
