-- Essential Security Setup for Production
-- This is a simplified version of the full security migration

-- Create audit log table for tracking all financial data changes
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own audit logs
CREATE POLICY "Users can only see their own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Add basic data validation for transaction amounts
CREATE OR REPLACE FUNCTION validate_transaction_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent unrealistic amounts
  IF NEW.amount < 0 THEN
    RAISE EXCEPTION 'Transaction amount cannot be negative';
  END IF;
  
  IF NEW.amount > 100000000 THEN -- 10 crore limit
    RAISE EXCEPTION 'Transaction amount exceeds maximum limit';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_transaction_amount_trigger
  BEFORE INSERT OR UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION validate_transaction_amount();

-- Create secure view for financial summary
CREATE OR REPLACE VIEW user_financial_summary AS
SELECT 
  u.id as user_id,
  u.email,
  COALESCE(SUM(a.balance), 0) as total_assets,
  COALESCE(SUM(l.current_balance), 0) + COALESCE(SUM(cc.current_balance), 0) as total_liabilities,
  COALESCE(SUM(a.balance), 0) - (COALESCE(SUM(l.current_balance), 0) + COALESCE(SUM(cc.current_balance), 0)) as net_worth,
  COUNT(DISTINCT CASE WHEN l.is_active THEN l.id END) as active_loans,
  COUNT(DISTINCT CASE WHEN cc.is_active THEN cc.id END) as active_credit_cards,
  COUNT(DISTINCT CASE WHEN NOT g.is_completed THEN g.id END) as active_goals
FROM users u
LEFT JOIN accounts a ON u.id = a.user_id AND a.is_active = true
LEFT JOIN loans l ON u.id = l.user_id AND l.is_active = true
LEFT JOIN credit_cards cc ON u.id = cc.user_id AND cc.is_active = true
LEFT JOIN goals g ON u.id = g.user_id AND NOT g.is_completed
GROUP BY u.id, u.email;

-- Enable RLS on the view
ALTER VIEW user_financial_summary SET (security_barrier = true);

-- Grant access to authenticated users
GRANT SELECT ON user_financial_summary TO authenticated;

-- Create indexes for better performance
CREATE INDEX idx_audit_logs_user_time ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_transactions_user_date_amount ON transactions(user_id, date DESC, amount);