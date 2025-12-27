-- Add Kotak Bank Debit Card
-- Generated: 2024-12-24

INSERT INTO credit_cards (
  user_id,
  name,
  bank,
  card_type,
  card_network,
  card_number,
  last_four_digits,
  cvv,
  expiry_date,
  credit_limit,
  current_balance,
  statement_date,
  due_date,
  annual_fee,
  cashback_rate,
  reward_points_rate,
  reward_point_value,
  reward_points_expiry_months,
  partner_merchants,
  benefits,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001',  -- Your user ID
  'Kotak Debit',                           -- Card name
  'Kotak',                                 -- Bank/Issuer
  'DEBIT',                                 -- Card type (Debit Card)
  'VISA',                                  -- Card network (assuming VISA based on card number starting with 4)
  '4065848000079778',                      -- Full card number
  '9778',                                  -- Last four digits
  '016',                                   -- CVV
  '09/32',                                 -- Expiry date
  NULL,                                    -- No credit limit for debit card
  0,                                       -- Current balance: ₹0 (starting fresh)
  NULL,                                    -- No statement date for debit card
  NULL,                                    -- No due date for debit card
  0,                                       -- Annual fee: ₹0 (assuming free debit card)
  NULL,                                    -- No cashback rate (can be updated later if applicable)
  NULL,                                    -- No reward points system (can be updated if applicable)
  NULL,                                    -- No reward point value
  NULL,                                    -- No reward points expiry
  ARRAY[]::TEXT[],                         -- No specific partner merchants (empty array)
  '{
    "card_type": "Debit Card",
    "bank": "Kotak Mahindra Bank",
    "annual_fee": "₹0",
    "notes": "Standard debit card"
  }'::jsonb,                               -- Benefits as JSON
  true                                     -- Card is active
);

-- Verification query to check if the card was added
SELECT 
  name,
  bank,
  card_type,
  card_network,
  last_four_digits,
  card_number,
  cvv,
  expiry_date,
  is_active
FROM credit_cards 
WHERE user_id = '00000000-0000-0000-0000-000000000001' 
AND name = 'Kotak Debit';

-- Optional: View all your cards (credit and debit)
-- SELECT name, bank, card_type, card_network, last_four_digits, expiry_date 
-- FROM credit_cards 
-- WHERE user_id = '00000000-0000-0000-0000-000000000001' 
-- ORDER BY name;
