-- Add permissive policies for single-user mode while keeping RLS enabled
-- This is safer than completely disabling RLS

-- Drop existing restrictive policies
DROP POLICY "Users can only see their own accounts" ON accounts;
DROP POLICY "Users can only see their own transactions" ON transactions;
DROP POLICY "Users can only see their own credit cards" ON credit_cards;
DROP POLICY "Users can only see their own categories" ON categories;
DROP POLICY "Users can only see their own goals" ON goals;
DROP POLICY "Users can only see their own budgets" ON budgets;
DROP POLICY "Users can only see their own loans" ON loans;
DROP POLICY "Users can only see their own credit card transactions" ON credit_card_transactions;
DROP POLICY "Users can only see their own loan payments" ON loan_payments;

-- Create permissive policies for single-user mode (using a fixed UUID)
CREATE POLICY "Allow single-user access" ON accounts FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
CREATE POLICY "Allow single-user access" ON transactions FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
CREATE POLICY "Allow single-user access" ON credit_cards FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
CREATE POLICY "Allow single-user access" ON categories FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
CREATE POLICY "Allow single-user access" ON goals FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
CREATE POLICY "Allow single-user access" ON budgets FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
CREATE POLICY "Allow single-user access" ON loans FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
CREATE POLICY "Allow single-user access" ON credit_card_transactions FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
CREATE POLICY "Allow single-user access" ON loan_payments FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Also add authenticated user policies (fallback for regular auth)
CREATE POLICY "Allow authenticated users" ON accounts FOR ALL USING (auth.uid() = user_id::uuid);
CREATE POLICY "Allow authenticated users" ON transactions FOR ALL USING (auth.uid() = user_id::uuid);
CREATE POLICY "Allow authenticated users" ON credit_cards FOR ALL USING (auth.uid() = user_id::uuid);
CREATE POLICY "Allow authenticated users" ON categories FOR ALL USING (auth.uid() = user_id::uuid);
CREATE POLICY "Allow authenticated users" ON goals FOR ALL USING (auth.uid() = user_id::uuid);
CREATE POLICY "Allow authenticated users" ON budgets FOR ALL USING (auth.uid() = user_id::uuid);
CREATE POLICY "Allow authenticated users" ON loans FOR ALL USING (auth.uid() = user_id::uuid);
CREATE POLICY "Allow authenticated users" ON credit_card_transactions FOR ALL USING (auth.uid() = user_id::uuid);
CREATE POLICY "Allow authenticated users" ON loan_payments FOR ALL USING (auth.uid() = user_id::uuid);
