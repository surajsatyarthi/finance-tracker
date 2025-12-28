-- Enable RLS on user_financial_summary view/table
ALTER TABLE user_financial_summary ENABLE ROW LEVEL SECURITY;

-- Add policy to restrict access to own data only
CREATE POLICY "Users can view own financial summary"
  ON user_financial_summary
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
