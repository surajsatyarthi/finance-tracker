-- Create Fixed Deposits Table
-- Purpose: Store Fixed Deposit (FD) accounts with interest calculations

CREATE TABLE IF NOT EXISTS fixed_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Details
    bank_name TEXT NOT NULL,
    account_number TEXT,
    
    -- Financial Details
    principal_amount DECIMAL(15,2) NOT NULL CHECK (principal_amount > 0),
    interest_rate DECIMAL(5,2) NOT NULL CHECK (interest_rate >= 0),
    
    -- Dates
    start_date DATE NOT NULL,
    maturity_date DATE NOT NULL CHECK (maturity_date > start_date),
    
    -- Calculated Fields
    maturity_amount DECIMAL(15,2),
    interest_earned DECIMAL(15,2),
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'matured', 'premature_withdrawal', 'closed')),
    auto_renew BOOLEAN DEFAULT false,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Optional: Nomination, joint holder, etc.
    nominee_name TEXT,
    notes TEXT
);

-- Add RLS policies
ALTER TABLE fixed_deposits ENABLE ROW LEVEL SECURITY;

-- Users can view their own FDs
CREATE POLICY "Users can view own FDs"
    ON fixed_deposits FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own FDs
CREATE POLICY "Users can insert own FDs"
    ON fixed_deposits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own FDs
CREATE POLICY "Users can update own FDs"
    ON fixed_deposits FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own FDs
CREATE POLICY "Users can delete own FDs"
    ON fixed_deposits FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_fixed_deposits_user_id ON fixed_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_fixed_deposits_maturity_date ON fixed_deposits(maturity_date);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_fixed_deposits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fixed_deposits_updated_at
    BEFORE UPDATE ON fixed_deposits
    FOR EACH ROW
    EXECUTE FUNCTION update_fixed_deposits_updated_at();

-- Verify table created
SELECT 'Fixed Deposits table created successfully!' as status;
