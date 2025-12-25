-- Create triggers to automatically update account balances when transactions are inserted/updated/deleted
-- This ensures balances are ALWAYS in sync with transactions

-- Function to update account balance after transaction insert
CREATE OR REPLACE FUNCTION update_account_balance_after_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if transaction has account_id
  IF NEW.account_id IS NOT NULL THEN
    -- Update account balance based on transaction type
    IF NEW.type = 'income' THEN
      -- Increase balance for income
      UPDATE accounts 
      SET balance = balance + NEW.amount 
      WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      -- Decrease balance for expense
      UPDATE accounts 
      SET balance = balance - NEW.amount 
      WHERE id = NEW.account_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to reverse account balance after transaction update
CREATE OR REPLACE FUNCTION reverse_account_balance_before_transaction_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Reverse old transaction's effect on balance
  IF OLD.account_id IS NOT NULL THEN
    IF OLD.type = 'income' THEN
      UPDATE accounts 
      SET balance = balance - OLD.amount 
      WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE accounts 
      SET balance = balance + OLD.amount 
      WHERE id = OLD.account_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to reverse account balance after transaction delete
CREATE OR REPLACE FUNCTION reverse_account_balance_after_transaction_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Reverse transaction's effect on balance
  IF OLD.account_id IS NOT NULL THEN
    IF OLD.type = 'income' THEN
      UPDATE accounts 
      SET balance = balance - OLD.amount 
      WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE accounts 
      SET balance = balance + OLD.amount 
      WHERE id = OLD.account_id;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Drop triggers if they exist (to avoid errors)
DROP TRIGGER IF EXISTS trg_transaction_insert_update_balance ON transactions;
DROP TRIGGER IF EXISTS trg_transaction_update_reverse_balance ON transactions;
DROP TRIGGER IF EXISTS trg_transaction_delete_reverse_balance ON transactions;

-- Create trigger for INSERT
CREATE TRIGGER trg_transaction_insert_update_balance
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance_after_transaction();

-- Create trigger for UPDATE (reverse old, then insert new will apply)
CREATE TRIGGER trg_transaction_update_reverse_balance
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION reverse_account_balance_before_transaction_update();

CREATE TRIGGER trg_transaction_update_apply_balance
AFTER UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance_after_transaction();

-- Create trigger for DELETE
CREATE TRIGGER trg_transaction_delete_reverse_balance
AFTER DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION reverse_account_balance_after_transaction_delete();

COMMENT ON FUNCTION update_account_balance_after_transaction() IS 'Automatically updates account balance when transaction is inserted';
COMMENT ON FUNCTION reverse_account_balance_before_transaction_update() IS 'Reverses old balance before transaction update';
COMMENT ON FUNCTION reverse_account_balance_after_transaction_delete() IS 'Reverses balance when transaction is deleted';
