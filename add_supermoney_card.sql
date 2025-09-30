-- Add SuperMoney RUPAY Credit Card
-- Generated: 2025-09-29

INSERT INTO credit_cards (
  user_id,
  name,
  bank,
  card_type,
  last_four_digits,
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
  'SuperMoney',                            -- Card name
  'SuperMoney',                           -- Bank/Issuer
  'RUPAY',                                -- Card type
  '9296',                                 -- Last four digits
  180000,                                 -- Credit limit: ₹18,00,000 (1800 * 100)
  0,                                      -- Current balance: ₹0 (starting fresh)
  1,                                      -- Statement date: 1st of every month
  5,                                      -- Due date: 5th of every month
  0,                                      -- Annual fee: ₹0
  1.00,                                   -- Cashback rate: 1% UPI cashback
  NULL,                                   -- No reward points system
  NULL,                                   -- No reward point value
  NULL,                                   -- No reward points expiry
  ARRAY['UPI', 'Flipkart', 'Myntra'],    -- Partner merchants
  '{
    "upi_cashback": "1% cashback on UPI transactions",
    "partner_benefits": {
      "Flipkart": "Special offers",
      "Myntra": "Special offers"
    },
    "annual_fee": "₹0",
    "renewal": "September",
    "wave_off_limit": "Not applicable"
  }'::jsonb,                             -- Benefits as JSON
  true                                    -- Card is active
);

-- Verification query to check if the card was added
SELECT 
  name,
  bank,
  card_type,
  last_four_digits,
  credit_limit,
  statement_date,
  due_date,
  annual_fee,
  cashback_rate,
  partner_merchants,
  benefits
FROM credit_cards 
WHERE user_id = '00000000-0000-0000-0000-000000000001' 
AND name = 'SuperMoney';

-- Optional: View all your credit cards
-- SELECT name, bank, card_type, last_four_digits, credit_limit, cashback_rate 
-- FROM credit_cards 
-- WHERE user_id = '00000000-0000-0000-0000-000000000001' 
-- ORDER BY name;