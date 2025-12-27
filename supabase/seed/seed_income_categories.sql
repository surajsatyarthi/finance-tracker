-- Seed Income Categories for surajstoic@gmail.com
-- Categories: Salary, Investment, Refund, Others

INSERT INTO categories (user_id, name, type)
SELECT id, 'Salary', 'income' FROM auth.users WHERE email = 'surajstoic@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO categories (user_id, name, type)
SELECT id, 'Investment', 'income' FROM auth.users WHERE email = 'surajstoic@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO categories (user_id, name, type)
SELECT id, 'Refund', 'income' FROM auth.users WHERE email = 'surajstoic@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO categories (user_id, name, type)
SELECT id, 'Others', 'income' FROM auth.users WHERE email = 'surajstoic@gmail.com'
ON CONFLICT DO NOTHING;

-- Verify
SELECT name, type FROM categories 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'surajstoic@gmail.com')
AND type = 'income';
