-- Seed Friends & Family Loans
INSERT INTO loans (
  user_id, 
  name, 
  type, 
  principal_amount, 
  current_balance, 
  interest_rate, 
  emi_amount, 
  total_emis, 
  emis_paid, 
  start_date, 
  is_active
) VALUES
((SELECT id FROM users LIMIT 1), 'Rajat', 'personal', 5000, 5000, NULL, NULL, NULL, 0, NOW(), true),
((SELECT id FROM users LIMIT 1), 'Tyagi', 'personal', 10000, 10000, NULL, NULL, NULL, 0, NOW(), true),
((SELECT id FROM users LIMIT 1), 'Dipankar', 'personal', 5000, 5000, NULL, NULL, NULL, 0, NOW(), true),
((SELECT id FROM users LIMIT 1), 'Papa', 'personal', 31000, 31000, NULL, NULL, NULL, 0, NOW(), true);
