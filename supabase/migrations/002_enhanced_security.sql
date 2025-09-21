-- Enhanced Security for Financial Data
-- Additional security measures for sensitive financial information

-- Create audit log table for tracking all financial data changes
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable audit logging for sensitive tables
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, table_name, record_id, action, new_values, created_at)
    VALUES (NEW.user_id, TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), NOW());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, table_name, record_id, action, old_values, new_values, created_at)
    VALUES (NEW.user_id, TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), NOW());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, table_name, record_id, action, old_values, created_at)
    VALUES (OLD.user_id, TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), NOW());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for all financial tables
CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_accounts AFTER INSERT OR UPDATE OR DELETE ON accounts
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_credit_cards AFTER INSERT OR UPDATE OR DELETE ON credit_cards
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_loans AFTER INSERT OR UPDATE OR DELETE ON loans
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_goals AFTER INSERT OR UPDATE OR DELETE ON goals
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Add data validation functions
CREATE OR REPLACE FUNCTION validate_transaction_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent unrealistic amounts (adjust limits as needed)
  IF NEW.amount < 0 THEN
    RAISE EXCEPTION 'Transaction amount cannot be negative';
  END IF;
  
  IF NEW.amount > 10000000 THEN -- 1 crore limit
    RAISE EXCEPTION 'Transaction amount exceeds maximum limit';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_transaction_amount_trigger
  BEFORE INSERT OR UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION validate_transaction_amount();

-- Add credit card validation
CREATE OR REPLACE FUNCTION validate_credit_card_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate credit limit
  IF NEW.credit_limit IS NOT NULL AND NEW.credit_limit <= 0 THEN
    RAISE EXCEPTION 'Credit limit must be positive';
  END IF;
  
  -- Validate statement and due dates
  IF NEW.statement_date IS NOT NULL AND (NEW.statement_date < 1 OR NEW.statement_date > 31) THEN
    RAISE EXCEPTION 'Statement date must be between 1 and 31';
  END IF;
  
  IF NEW.due_date IS NOT NULL AND (NEW.due_date < 1 OR NEW.due_date > 31) THEN
    RAISE EXCEPTION 'Due date must be between 1 and 31';
  END IF;
  
  -- Ensure current balance doesn't exceed credit limit
  IF NEW.current_balance > COALESCE(NEW.credit_limit, NEW.current_balance) THEN
    RAISE EXCEPTION 'Current balance cannot exceed credit limit';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_credit_card_trigger
  BEFORE INSERT OR UPDATE ON credit_cards
  FOR EACH ROW EXECUTE FUNCTION validate_credit_card_data();

-- Add loan validation
CREATE OR REPLACE FUNCTION validate_loan_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate loan amounts
  IF NEW.principal_amount <= 0 THEN
    RAISE EXCEPTION 'Principal amount must be positive';
  END IF;
  
  IF NEW.current_balance < 0 THEN
    RAISE EXCEPTION 'Current balance cannot be negative';
  END IF;
  
  IF NEW.current_balance > NEW.principal_amount THEN
    RAISE EXCEPTION 'Current balance cannot exceed principal amount';
  END IF;
  
  IF NEW.interest_rate < 0 OR NEW.interest_rate > 100 THEN
    RAISE EXCEPTION 'Interest rate must be between 0 and 100';
  END IF;
  
  IF NEW.emi_amount <= 0 THEN
    RAISE EXCEPTION 'EMI amount must be positive';
  END IF;
  
  IF NEW.total_emis <= 0 THEN
    RAISE EXCEPTION 'Total EMIs must be positive';
  END IF;
  
  IF NEW.emis_paid < 0 OR NEW.emis_paid > NEW.total_emis THEN
    RAISE EXCEPTION 'EMIs paid must be between 0 and total EMIs';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_loan_trigger
  BEFORE INSERT OR UPDATE ON loans
  FOR EACH ROW EXECUTE FUNCTION validate_loan_data();

-- Create secure views for sensitive data aggregation
CREATE OR REPLACE VIEW user_financial_summary AS
SELECT 
  u.id as user_id,
  u.email,
  -- Assets
  COALESCE(SUM(a.balance), 0) as total_assets,
  -- Liabilities
  COALESCE(SUM(l.current_balance), 0) + COALESCE(SUM(cc.current_balance), 0) as total_liabilities,
  -- Net worth
  COALESCE(SUM(a.balance), 0) - (COALESCE(SUM(l.current_balance), 0) + COALESCE(SUM(cc.current_balance), 0)) as net_worth,
  -- Active counts
  COUNT(DISTINCT CASE WHEN l.is_active THEN l.id END) as active_loans,
  COUNT(DISTINCT CASE WHEN cc.is_active THEN cc.id END) as active_credit_cards,
  COUNT(DISTINCT CASE WHEN NOT g.is_completed THEN g.id END) as active_goals,
  u.updated_at
FROM users u
LEFT JOIN accounts a ON u.id = a.user_id AND a.is_active = true
LEFT JOIN loans l ON u.id = l.user_id AND l.is_active = true
LEFT JOIN credit_cards cc ON u.id = cc.user_id AND cc.is_active = true
LEFT JOIN goals g ON u.id = g.user_id AND NOT g.is_completed
GROUP BY u.id, u.email, u.updated_at;

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policy for audit logs - users can only see their own audit logs
CREATE POLICY "Users can only see their own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Additional RLS policies for enhanced security

-- Prevent bulk operations - limit number of operations per minute
CREATE OR REPLACE FUNCTION check_rate_limit(table_name TEXT, max_ops INTEGER DEFAULT 10)
RETURNS BOOLEAN AS $$
DECLARE
  op_count INTEGER;
BEGIN
  -- Count operations in the last minute for the current user
  EXECUTE format('
    SELECT COUNT(*) 
    FROM audit_logs 
    WHERE user_id = %L 
      AND table_name = %L 
      AND created_at > NOW() - INTERVAL ''1 minute''
  ', auth.uid(), table_name) INTO op_count;
  
  RETURN op_count < max_ops;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add rate limiting to transactions
CREATE OR REPLACE FUNCTION rate_limit_transactions()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT check_rate_limit('transactions', 20) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Too many transaction operations in the last minute.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rate_limit_transactions_trigger
  BEFORE INSERT OR UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION rate_limit_transactions();

-- Create function to sanitize sensitive data for logs
CREATE OR REPLACE FUNCTION sanitize_sensitive_data(data JSONB, table_name TEXT)
RETURNS JSONB AS $$
BEGIN
  CASE table_name
    WHEN 'credit_cards' THEN
      -- Remove or mask sensitive credit card data
      RETURN data - 'last_four_digits';
    WHEN 'accounts' THEN
      -- Mask account balances in logs if needed
      RETURN data;
    ELSE
      RETURN data;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for security and performance
CREATE INDEX idx_audit_logs_user_time ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_table_time ON audit_logs(table_name, created_at DESC);

-- Add session management for additional security
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can only see their own sessions" ON user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Create function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_sessions 
  WHERE expires_at < NOW() OR NOT is_active;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add data encryption at rest indicators (comments for fields that should be encrypted)
COMMENT ON COLUMN credit_cards.last_four_digits IS 'SENSITIVE: Consider encryption at application level';
COMMENT ON COLUMN accounts.balance IS 'SENSITIVE: Financial data - audit all changes';
COMMENT ON COLUMN transactions.amount IS 'SENSITIVE: Financial data - audit all changes';
COMMENT ON COLUMN loans.current_balance IS 'SENSITIVE: Financial data - audit all changes';

-- Create function to check data integrity
CREATE OR REPLACE FUNCTION check_data_integrity()
RETURNS TABLE(table_name TEXT, issue TEXT, count BIGINT) AS $$
BEGIN
  -- Check for orphaned records
  RETURN QUERY
  SELECT 'transactions'::TEXT, 'Orphaned transactions'::TEXT, COUNT(*)
  FROM transactions t
  WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = t.user_id);
  
  RETURN QUERY
  SELECT 'accounts'::TEXT, 'Negative balances'::TEXT, COUNT(*)
  FROM accounts
  WHERE balance < 0;
  
  RETURN QUERY
  SELECT 'loans'::TEXT, 'Invalid loan data'::TEXT, COUNT(*)
  FROM loans
  WHERE current_balance > principal_amount OR emis_paid > total_emis;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;