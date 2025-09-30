-- Add business features and GST tracking
-- This migration adds support for business accounts and GST compliance

-- Add business-related columns to accounts table
ALTER TABLE accounts 
ADD COLUMN account_type VARCHAR(20) DEFAULT 'personal' CHECK (account_type IN ('personal', 'business')),
ADD COLUMN gst_number VARCHAR(15),
ADD COLUMN business_name VARCHAR(255),
ADD COLUMN business_address TEXT,
ADD COLUMN pan_number VARCHAR(10);

-- Add GST-related columns to transactions table
ALTER TABLE transactions
ADD COLUMN gst_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN gst_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN is_gst_inclusive BOOLEAN DEFAULT FALSE,
ADD COLUMN hsn_sac_code VARCHAR(10),
ADD COLUMN invoice_number VARCHAR(50),
ADD COLUMN vendor_gst_number VARCHAR(15),
ADD COLUMN is_business_expense BOOLEAN DEFAULT FALSE,
ADD COLUMN business_entity VARCHAR(50) DEFAULT NULL; -- 'BMN', 'CSuite Agency', or NULL for personal

-- Create business_categories table for business-specific expense categories
CREATE TABLE business_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_deductible BOOLEAN DEFAULT TRUE,
  gst_applicable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gst_returns table for tracking GST filing
CREATE TABLE gst_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  return_period VARCHAR(7) NOT NULL, -- Format: YYYY-MM or YYYY-QQ
  return_type VARCHAR(10) NOT NULL CHECK (return_type IN ('GSTR1', 'GSTR3B', 'GSTR9')),
  due_date DATE NOT NULL,
  filed_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'filed', 'overdue')),
  total_sales DECIMAL(15,2) DEFAULT 0,
  total_purchases DECIMAL(15,2) DEFAULT 0,
  output_tax DECIMAL(15,2) DEFAULT 0,
  input_tax_credit DECIMAL(15,2) DEFAULT 0,
  tax_liability DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_accounts_account_type ON accounts(account_type);
CREATE INDEX idx_accounts_gst_number ON accounts(gst_number);
CREATE INDEX idx_transactions_is_business ON transactions(is_business_expense);
CREATE INDEX idx_transactions_gst_rate ON transactions(gst_rate);
CREATE INDEX idx_business_categories_user_id ON business_categories(user_id);
CREATE INDEX idx_gst_returns_user_id ON gst_returns(user_id);
CREATE INDEX idx_gst_returns_period ON gst_returns(return_period);

-- Insert approved business categories for BMN and CSuite Agency
-- Technology & Software
INSERT INTO business_categories (user_id, name, description, is_deductible, gst_applicable) VALUES
('00000000-0000-0000-0000-000000000001', 'Domain & Hosting', 'Domain registration and web hosting services', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Email Services', 'Business email hosting and services', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Warp Subscription', 'Warp terminal subscription', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Canva Subscription', 'Design and graphics subscription', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'LinkedIn Premium', 'LinkedIn Premium and Sales Navigator', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'CRM Software', 'Customer relationship management tools', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Social Media Management Tools', 'Social media scheduling and management', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Analytics Tools', 'Business analytics and tracking tools', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Project Management Tools', 'Project and task management software', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Communication Tools', 'Business communication software', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Calendly Subscription', 'Appointment scheduling tool', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Cloud Storage', 'Cloud storage and backup services', TRUE, TRUE),

-- Communications & Connectivity
('00000000-0000-0000-0000-000000000001', 'WiFi', 'Internet connectivity for business', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Mobile Recharge', 'Business mobile phone expenses', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'International Calling Plans', 'International communication costs', TRUE, TRUE),

-- Professional Services
('00000000-0000-0000-0000-000000000001', 'CA Fees', 'Chartered Accountant professional fees', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Legal Consultation', 'Legal advisory and consultation', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Business Licenses', 'Government licenses and registrations', TRUE, FALSE),

-- Marketing & Business Development
('00000000-0000-0000-0000-000000000001', 'Stock Photos/Videos', 'Stock media for content creation', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Copywriting Services', 'Professional content writing', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Video Editing Tools', 'Video editing software and services', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'LinkedIn Ads', 'LinkedIn advertising campaigns', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Google Ads', 'Google advertising campaigns', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Facebook/Instagram Ads', 'Meta platform advertising', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Workshop Fees', 'Professional development workshops', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Networking Events', 'Business networking and events', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Website Maintenance & SEO', 'Website upkeep and optimization', TRUE, TRUE),

-- Learning & Development
('00000000-0000-0000-0000-000000000001', 'Online Courses', 'Professional skill development courses', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Industry Certifications', 'Professional certifications', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Books & Publications', 'Business books and industry publications', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Training Programs', 'Webinars and training programs', TRUE, TRUE),

-- Operations
('00000000-0000-0000-0000-000000000001', 'Office Supplies', 'Stationery and office materials', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Travel & Transportation', 'Business travel expenses', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Miscellaneous', 'Other operational expenses', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Laptops/Computers', 'Business computing equipment', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Recording Equipment', 'Microphones and recording gear', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Infrastructure', 'Business infrastructure setup', TRUE, TRUE),

-- Financial & Admin
('00000000-0000-0000-0000-000000000001', 'Payment Gateway Fees', 'Online payment processing fees', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Currency Conversion', 'International transaction fees', TRUE, FALSE),
('00000000-0000-0000-0000-000000000001', 'Late Payment Charges', 'Penalty and late fees', FALSE, FALSE),
('00000000-0000-0000-0000-000000000001', 'Government Fees', 'Official filings and registrations', TRUE, FALSE),
('00000000-0000-0000-0000-000000000001', 'Banking Charges', 'Business banking fees', TRUE, FALSE),

-- Human Resources & Commissions
('00000000-0000-0000-0000-000000000001', 'Consultant Commission', 'Commission payments to business consultants and partners', TRUE, FALSE),
('00000000-0000-0000-0000-000000000001', 'Freelancer Payments', 'Payments to freelancers and contractors', TRUE, FALSE),

-- CSuite Agency Specific
('00000000-0000-0000-0000-000000000001', 'LinkedIn Automation Tools', 'LinkedIn management automation', TRUE, TRUE),
('00000000-0000-0000-0000-000000000001', 'Lead Generation Tools', 'Lead generation and prospecting tools', TRUE, TRUE);

-- Create function to calculate GST amounts
CREATE OR REPLACE FUNCTION calculate_gst_amount(
  base_amount DECIMAL,
  gst_rate DECIMAL,
  is_inclusive BOOLEAN
) RETURNS JSON AS $$
DECLARE
  gst_amount DECIMAL;
  taxable_amount DECIMAL;
  total_amount DECIMAL;
BEGIN
  IF is_inclusive THEN
    -- GST is included in the base amount
    taxable_amount := base_amount / (1 + (gst_rate / 100));
    gst_amount := base_amount - taxable_amount;
    total_amount := base_amount;
  ELSE
    -- GST is additional to base amount
    taxable_amount := base_amount;
    gst_amount := base_amount * (gst_rate / 100);
    total_amount := base_amount + gst_amount;
  END IF;

  RETURN json_build_object(
    'taxable_amount', ROUND(taxable_amount, 2),
    'gst_amount', ROUND(gst_amount, 2),
    'total_amount', ROUND(total_amount, 2),
    'gst_rate', gst_rate
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to get business expense summary
CREATE OR REPLACE FUNCTION get_business_expense_summary(
  p_user_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  total_expenses DECIMAL := 0;
  total_gst DECIMAL := 0;
  deductible_expenses DECIMAL := 0;
  result JSON;
BEGIN
  -- Set default dates if not provided
  IF p_start_date IS NULL THEN
    p_start_date := DATE_TRUNC('month', CURRENT_DATE);
  END IF;
  
  IF p_end_date IS NULL THEN
    p_end_date := CURRENT_DATE;
  END IF;

  -- Calculate totals
  SELECT 
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(gst_amount), 0),
    COALESCE(SUM(CASE WHEN bc.is_deductible = TRUE THEN amount ELSE 0 END), 0)
  INTO total_expenses, total_gst, deductible_expenses
  FROM transactions t
  LEFT JOIN business_categories bc ON t.category = bc.name
  WHERE t.user_id = p_user_id
    AND t.is_business_expense = TRUE
    AND t.date BETWEEN p_start_date AND p_end_date;

  result := json_build_object(
    'period', json_build_object(
      'start_date', p_start_date,
      'end_date', p_end_date
    ),
    'total_expenses', total_expenses,
    'total_gst_paid', total_gst,
    'deductible_expenses', deductible_expenses,
    'potential_tax_saving', deductible_expenses * 0.30 -- Assuming 30% tax bracket
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for business tables
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their business categories" ON business_categories FOR ALL 
USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid) 
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Users can manage their GST returns" ON gst_returns FOR ALL 
USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid) 
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Add comments for documentation
COMMENT ON COLUMN accounts.account_type IS 'Type of account: personal or business';
COMMENT ON COLUMN accounts.gst_number IS 'GST registration number for business accounts';
COMMENT ON COLUMN transactions.gst_rate IS 'GST rate applied (0, 5, 12, 18, 28)';
COMMENT ON COLUMN transactions.gst_amount IS 'Calculated GST amount';
COMMENT ON COLUMN transactions.is_gst_inclusive IS 'Whether GST is included in the transaction amount';
COMMENT ON COLUMN transactions.is_business_expense IS 'Whether this is a business expense';