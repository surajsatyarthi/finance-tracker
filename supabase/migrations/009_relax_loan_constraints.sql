-- Relax constraints for informal/soft loans
ALTER TABLE loans ALTER COLUMN interest_rate DROP NOT NULL;
ALTER TABLE loans ALTER COLUMN emi_amount DROP NOT NULL;
ALTER TABLE loans ALTER COLUMN total_emis DROP NOT NULL;
ALTER TABLE loans ALTER COLUMN next_emi_date DROP NOT NULL;

-- Update validation function to allow soft loans
CREATE OR REPLACE FUNCTION validate_loan_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate loan amounts
  IF NEW.principal_amount <= 0 THEN
    RAISE EXCEPTION 'Principal amount must be positive';
  END IF;
  
  -- Current balance validation
  IF NEW.current_balance < 0 THEN
    RAISE EXCEPTION 'Current balance cannot be negative';
  END IF;
  
  IF NEW.current_balance > NEW.principal_amount THEN
    RAISE EXCEPTION 'Current balance cannot exceed principal amount';
  END IF;
  
  -- Relaxed validation for interest/EMI (only if provided)
  IF NEW.interest_rate IS NOT NULL AND (NEW.interest_rate < 0 OR NEW.interest_rate > 100) THEN
    RAISE EXCEPTION 'Interest rate must be between 0 and 100';
  END IF;
  
  IF NEW.emi_amount IS NOT NULL AND NEW.emi_amount < 0 THEN
     -- Allowed to be 0 for flexible loans, but not negative
    RAISE EXCEPTION 'EMI amount cannot be negative';
  END IF;
  
  IF NEW.total_emis IS NOT NULL AND NEW.total_emis <= 0 THEN
    RAISE EXCEPTION 'Total EMIs must be positive';
  END IF;

  -- Logic for emis_paid check only if total_emis exists
  IF NEW.total_emis IS NOT NULL AND (NEW.emis_paid < 0 OR NEW.emis_paid > NEW.total_emis) THEN
    RAISE EXCEPTION 'EMIs paid must be between 0 and total EMIs';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
