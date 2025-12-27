-- ===============================================
-- ADD SOFT DELETES - PREVENT DATA LOSS
-- ===============================================
-- Adds deleted_at column to critical tables
-- Data is never actually deleted, just marked as deleted

-- Add deleted_at to accounts
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_accounts_not_deleted ON accounts(user_id) WHERE deleted_at IS NULL;

-- Add deleted_at to credit_cards
ALTER TABLE credit_cards ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_credit_cards_not_deleted ON credit_cards(user_id) WHERE deleted_at IS NULL;

-- Add deleted_at to goals
ALTER TABLE goals ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_goals_not_deleted ON goals(user_id) WHERE deleted_at IS NULL;

-- Add deleted_at to loans
ALTER TABLE loans ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_loans_not_deleted ON loans(user_id) WHERE deleted_at IS NULL;

-- Add deleted_at to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_categories_not_deleted ON categories(user_id) WHERE deleted_at IS NULL;

COMMENT ON COLUMN accounts.deleted_at IS 'Soft delete timestamp - NULL means active';
COMMENT ON COLUMN credit_cards.deleted_at IS 'Soft delete timestamp - NULL means active';
COMMENT ON COLUMN goals.deleted_at IS 'Soft delete timestamp - NULL means active';

-- Function to soft delete (for future use)
CREATE OR REPLACE FUNCTION soft_delete(table_name TEXT, record_id UUID)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('UPDATE %I SET deleted_at = NOW() WHERE id = $1', table_name)
    USING record_id;
END;
$$ LANGUAGE plpgsql;

-- ✅ From now on, deletions are reversible
-- To restore: UPDATE table SET deleted_at = NULL WHERE id = 'xxx'
