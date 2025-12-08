-- Add linked_credit_card_id to loans table
ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS linked_credit_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_loans_linked_card ON loans(linked_credit_card_id);
