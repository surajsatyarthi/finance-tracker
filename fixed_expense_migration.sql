-- 🚨 FIXED COMPREHENSIVE FINANCIAL DATA MIGRATION
-- Compatible with actual transactions table schema
-- Your complete expense discipline: 303 transactions worth ₹311,243
-- Data period: February 2025 to September 2025
-- Generated: 2025-09-29 22:55:31

-- OPTIONAL: Clear existing expense data (uncomment if needed)
-- DELETE FROM transactions WHERE user_id = '00000000-0000-0000-0000-000000000001' AND type = 'expense';

-- Insert all 303 expense transactions
-- Note: Using NULL for category_id and account_id since they need to be set up separately
-- Expense purpose is stored in subcategory field for now
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 20, 'Poha + Samosa', '2025-02-02', 'expense', 'cash', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 2857, 'HDFC Neu', '2025-02-03', 'expense', 'upi', 'HDFC Neu MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 90, 'Vegetables', '2025-02-05', 'expense', 'cash', 'Food: Vegetables');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 3350, 'Medicine', '2025-02-05', 'expense', 'upi', 'Health: Medicine');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 425, 'Rogan', '2025-02-05', 'expense', 'upi', 'Health: Medicine');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 226, 'Chips', '2025-02-05', 'expense', 'upi', 'Food: Snacks');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 40, 'Golgappa', '2025-02-05', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 100, 'Travel', '2025-02-05', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 1770, 'Loan documents', '2025-02-07', 'expense', 'upi', 'Loan:  Home loan 1');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 6846, 'Credit card payment', '2025-02-07', 'expense', 'upi', 'ICICI Adani One MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 204, 'Food', '2025-02-09', 'expense', 'card', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 6700, 'Jacket', '2025-02-09', 'expense', 'card', 'Clothing');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 11628, 'Shoes', '2025-02-09', 'expense', 'card', 'Clothing');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 180, 'Snacks', '2025-02-09', 'expense', 'upi', 'Food: Snacks');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 353, 'Uber', '2025-02-09', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 170, 'Vegetables', '2025-02-10', 'expense', 'cash', 'Food: Vegetables');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 500, 'Food', '2025-02-11', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 187, 'Volini', '2025-02-12', 'expense', 'upi', 'Health: Medicine');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 240, 'Food', '2025-02-13', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 270, 'Food', '2025-02-13', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 225, 'Sugar badam', '2025-02-13', 'expense', 'card', 'Health: Medicine');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 103, 'Food', '2025-02-13', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 178, 'Food', '2025-02-14', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 210, 'Food', '2025-02-15', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 2184, 'Axis Neo CC', '2025-02-18', 'expense', 'upi', 'Axis Neo MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 902, 'Yes Bank CC', '2025-02-18', 'expense', 'upi', 'Pop YES Bank MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 2285, 'BPCL CC', '2025-02-18', 'expense', 'upi', 'SBI BPCL MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 299, 'Indusind', '2025-02-18', 'expense', 'upi', 'Indusind Platinum Aura Edge MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 371, 'Simply Save', '2025-02-18', 'expense', 'upi', 'SBI Simply save MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 6846, 'ICICI', '2025-02-18', 'expense', 'upi', 'ICICI Adani One MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 32005, 'SC', '2025-02-18', 'expense', 'upi', 'SC EaseMyTrip MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 251, 'Food', '2025-02-19', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 1300, 'Google one', '2025-02-22', 'expense', 'card', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 161, 'Food', '2025-02-21', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 202, 'Septlin', '2025-02-21', 'expense', 'upi', 'Health: Medicine');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 135, 'Food', '2025-02-21', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 262, 'Food', '2025-02-22', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 100, 'Food', '2025-02-22', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 60, 'Ride', '2025-02-22', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 70, 'Ride', '2025-02-23', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 500, 'Pamist', '2025-02-23', 'expense', 'cash', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 135, 'Food', '2025-02-23', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 79, 'Uber one', '2025-02-23', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 135, 'Food', '2025-02-25', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 241, 'Ride', '2025-02-24', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 269, 'Ankle weight', '2025-02-25', 'expense', 'upi', 'Health: Supliments + Vitamins');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 786, 'Pooja', '2025-02-26', 'expense', 'card', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 300, 'Pooja', '2025-02-26', 'expense', 'cash', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 1000, 'Petrol', '2025-02-28', 'expense', 'card', 'Transport: Petrol');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 100, 'Visiting card', '2025-03-01', 'expense', 'upi', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 30000, 'Edu loan', '2025-02-28', 'expense', 'upi', 'Loan:  Education loan');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 725, 'Slipper', '2025-03-01', 'expense', 'upi', 'Shopping');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 9054, 'CC bill pay', '2025-03-02', 'expense', 'upi', 'ICICI Amazon MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 1000, 'Bright the soul', '2025-03-02', 'expense', 'upi', 'Subscriptions: Donation');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 786, 'HDFC Neu', '2025-03-03', 'expense', 'upi', 'HDFC Neu MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 3003, 'Axis neo', '2025-03-03', 'expense', 'upi', 'Axis Neo MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 18942, 'ICICI Amazon', '2025-03-03', 'expense', 'upi', 'ICICI Amazon MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 296, 'Coffee', '2025-03-03', 'expense', 'upi', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 60, 'Food', '2025-03-04', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 400, 'Ride', '2025-03-04', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 20, 'Water', '2025-03-04', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 20, 'Travel', '2025-03-04', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 312, 'Sweets', '2025-03-04', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 135, 'Food', '2025-03-05', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 65, 'Food', '2025-03-06', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 60, 'Printout', '2025-03-06', 'expense', 'card', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 33, 'Ride', '2025-03-06', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 29, 'Ride', '2025-03-06', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 20, 'Food', '2025-03-06', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 27, 'Ride', '2025-03-06', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 105, 'Food', '2025-03-07', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 20, 'Water', '2025-03-07', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 300, 'Puncture', '2025-03-07', 'expense', 'upi', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 212, 'Ride baba', '2025-03-07', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 300, 'Youtube', '2025-03-07', 'expense', 'card', 'Subscription: Youtube');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 499, 'Water kettle', '2025-03-09', 'expense', 'card', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 50000, 'Travel', '2025-03-20', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 103, 'Food', '2025-03-20', 'expense', 'upi', 'Food: Snacks');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 10000, 'Photo frame', '2025-03-20', 'expense', 'upi', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 25, 'Food', '2025-03-20', 'expense', 'upi', 'Food: Snacks');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 230, 'Food', '2025-03-20', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 205, 'Food', '2025-03-20', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 60, 'Food', '2025-03-21', 'expense', 'cash', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 400, 'Haircut', '2025-03-21', 'expense', 'upi', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 185, 'Food', '2025-03-21', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 266, 'Food', '2025-03-22', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 226, 'Food', '2025-03-23', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 382, 'Food', '2025-03-25', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 185, 'Food', '2025-03-26', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 300, 'Phone recharge', '2025-03-26', 'expense', 'card', 'Data: Jio');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 229, 'Food', '2025-03-27', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 166, 'Food', '2025-03-28', 'expense', 'upi', 'Food: Groceries');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 215, 'Food', '2025-03-29', 'expense', 'upi', 'Food: Groceries');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 159, 'Food', '2025-03-29', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 158, 'Food', '2025-03-30', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 433, 'Book', '2025-04-01', 'expense', 'card', 'Entertainment: Books');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 200, 'Book', '2025-04-02', 'expense', 'card', 'Entertainment: Books');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 335, 'Bill pay', '2025-04-02', 'expense', 'upi', 'HDFC Neu MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 194, 'Food', '2025-04-03', 'expense', 'upi', 'Food: Snacks');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 382, 'Simpl bill', '2025-04-04', 'expense', 'upi', 'Pay Later: Simpl');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 241, 'Bulb', '2025-04-05', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 271, 'Food', '2025-04-06', 'expense', 'card', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 179, 'Food', '2025-04-07', 'expense', 'card', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 230, 'Food', '2025-04-07', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 368, 'Food', '2025-04-07', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 180, 'Ride', '2025-04-08', 'expense', 'card', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 171, 'Food', '2025-04-10', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 1180, 'Jio fiber', '2025-04-11', 'expense', 'upi', 'Data: WiFi');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 9828, 'ICICI Bill', '2025-04-11', 'expense', 'upi', 'ICICI Adani One MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 2100, 'Dr Pooja Nupur', '2025-04-11', 'expense', 'upi', 'Health: Medicine');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 50, 'Food', '2025-04-11', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 190, 'Food', '2025-04-13', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 115, 'Food', '2025-04-14', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 3988, 'Bill Indusind', '2025-04-14', 'expense', 'upi', 'Indusind Platinum Aura Edge MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 146, 'Food', '2025-04-15', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 240, 'Food', '2025-04-20', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 189, 'Food', '2025-04-20', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 125, 'Redbull', '2025-04-20', 'expense', 'cash', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 40, 'Food', '2025-04-21', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 500, 'Petrol', '2025-04-22', 'expense', 'cash', 'Transport: Petrol');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 40, 'Ice cream', '2025-04-22', 'expense', 'cash', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 200, 'Food', '2025-04-24', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 321, 'Snacks', '2025-04-24', 'expense', 'upi', 'Food: Groceries');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 109, 'Ride', '2025-04-24', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 80, 'Ride', '2025-04-24', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 117, 'Food', '2025-04-26', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 1000, 'Amazon pay recharge', '2025-04-26', 'expense', 'upi', 'Amazon Pay Recharge');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 470, 'Medicine', '2025-04-26', 'expense', 'upi', 'Health: Medicine');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 230, 'Ice cream', '2025-04-26', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 32, 'Ride', '2025-04-26', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 90, 'Ride', '2025-04-26', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 116, 'Food', '2025-04-28', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 206, 'Food', '2025-04-28', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 90, 'Food', '2025-04-29', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 155, 'Food', '2025-05-01', 'expense', 'card', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 200, 'Recharge airtel', '2025-05-03', 'expense', 'upi', 'Data: Airtel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 60, 'Satuu', '2025-05-05', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 249, 'Bsnl sim', '2025-05-05', 'expense', 'upi', 'Data: Airtel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 135, 'Vegetables', '2025-05-05', 'expense', 'cash', 'Food: Vegetables');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 167, 'Rice', '2025-05-05', 'expense', 'upi', 'Food: Groceries');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 5679, 'CC card payment', '2025-05-05', 'expense', 'upi', 'ICICI Amazon EMI');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 1847, 'Credit card', '2025-05-05', 'expense', 'upi', 'Axis Rewards EMI');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 157, 'Ride', '2025-05-05', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 150, 'Ride', '2025-05-06', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 190, 'Book', '2025-05-06', 'expense', 'upi', 'Entertainment: Books');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 2000, 'Photo', '2025-05-07', 'expense', 'upi', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 50, 'CC bill', '2025-05-07', 'expense', 'upi', 'HDFC Neu MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 75, 'Shoe', '2025-05-07', 'expense', 'cash', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 750, 'Wifi router', '2025-05-07', 'expense', 'card', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 1000, 'Pertol', '2025-05-08', 'expense', 'card', 'Transport: Petrol');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 110, 'Food', '2025-05-08', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 500, 'Dr Nupur', '2025-05-09', 'expense', 'upi', 'Health: Medicine');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 15, 'Icecream', '2025-05-09', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 2032, 'Medicine', '2025-05-09', 'expense', 'upi', 'Health: Medicine');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 30, 'Sattu', '2025-05-10', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 525, 'Csuite email', '2025-05-11', 'expense', 'card', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 535, 'CSuite Domain', '2025-05-11', 'expense', 'upi', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 824, 'Wifi Recharge', '2025-05-12', 'expense', 'card', 'Data: WiFi');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 75, 'Food', '2025-05-14', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 70, 'Food', '2025-05-17', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 220, 'Food', '2025-05-18', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 80, 'Travel', '2025-05-18', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 70, 'Food', '2025-05-19', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 220, 'Food', '2025-05-20', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 269, 'Ride', '2025-05-19', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 50, 'Travel', '2025-05-20', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 1367, 'Mayank email', '2025-05-20', 'expense', 'upi', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 168, 'Food', '2025-05-21', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 300, 'Haircut', '2025-05-21', 'expense', 'upi', 'Grooming: Haircut');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 117, 'Food', '2025-05-22', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 175, 'Food', '2025-05-22', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 241, 'Food', '2025-05-26', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 200, 'Ride', '2025-05-26', 'expense', 'cash', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 165, 'Food', '2025-05-27', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 494, 'Alarm clock', '2025-05-28', 'expense', 'card', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 90, 'Food', '2025-05-28', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 80, 'Food', '2025-05-29', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 155, 'Food', '2025-05-30', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 171, 'Food', '2025-05-31', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 201, 'Food', '2025-05-31', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 167, 'Food', '2025-05-31', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 185, 'Food', '2025-06-01', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 176, 'Food', '2025-06-01', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 90, 'Food', '2025-06-01', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 167, 'Food', '2025-06-02', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 196, 'Food', '2025-06-02', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 500, 'Doctor Nupur', '2025-06-02', 'expense', 'upi', 'Health: Medicine');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 1554, 'Medicine', '2025-06-02', 'expense', 'card', 'Health: Medicine');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 50, 'Food', '2025-06-02', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 70, 'Food', '2025-06-02', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 165, 'Food', '2025-06-06', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 101, 'Food', '2025-06-09', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 120, 'Ride', '2025-06-09', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 1200, 'Electrician', '2025-06-10', 'expense', 'upi', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 1180, 'Wifi', '2025-06-10', 'expense', 'upi', 'Data: WiFi');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 101, 'Food', '2025-06-12', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 155, 'Food', '2025-06-13', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 214, 'Food', '2025-06-14', 'expense', 'upi', 'Shopping');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 1000, 'Credit card bill', '2025-06-16', 'expense', 'upi', 'HDFC Neu MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 2265, 'BPCL pay', '2025-06-16', 'expense', 'upi', 'SBI BPCL MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 375, 'Indusind bill pay', '2025-06-16', 'expense', 'upi', 'Indusind Platinum Aura Edge MP');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 100, 'Ride', '2025-06-23', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 100, 'Ride', '2025-06-23', 'expense', 'card', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 120, 'Food', '2025-06-23', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 200, 'Food', '2025-06-23', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 116, 'Food', '2025-06-24', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 200, 'Bsnl', '2025-06-26', 'expense', 'upi', 'Data: Airtel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 110, 'Travel', '2025-06-27', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 138, 'Food', '2025-07-01', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 2100, 'One drive', '2025-07-01', 'expense', 'card', 'Subscription: Google One');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 211, 'Food', '2025-07-04', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 700, 'Grok premium', '2025-07-06', 'expense', 'card', 'Subscription: Grok');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 500, 'Medicine', '2025-07-07', 'expense', 'card', 'Health: Medicine');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 100, 'BMN followers', '2025-07-08', 'expense', 'card', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 60, 'Deposit', '2025-07-09', 'expense', 'cash', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 1179, 'Wifi', '2025-07-11', 'expense', 'upi', 'Data: WiFi');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 2399, 'Bsnl recharge', '2025-07-14', 'expense', 'card', 'Data: Airtel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 186, 'Food', '2025-07-16', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 107, 'Food', '2025-07-16', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 1300, 'Medicine', '2025-07-18', 'expense', 'upi', 'Health: Medicine');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 120, 'Food', '2025-07-19', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 243, 'Food', '2025-07-19', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 295, 'Food', '2025-07-19', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 350, 'Amazon pay recharge', '2025-07-21', 'expense', 'upi', 'Amazon Pay Recharge');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 380, 'Food', '2025-07-25', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 405, 'Food', '2025-08-04', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 605, 'Food', '2025-08-04', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 283, 'Medicine', '2025-08-05', 'expense', 'card', 'Health: Medicine');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 140, 'Food', '2025-08-06', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 30, 'Paan', '2025-08-06', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 216, 'Food', '2025-08-09', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 75, 'Food', '2025-08-13', 'expense', 'cash', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 111, 'Post office', '2025-08-19', 'expense', 'cash', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 143, 'Food', '2025-08-19', 'expense', 'cash', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 30, 'Food', '2025-08-21', 'expense', 'cash', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 1500, 'Car wash', '2025-08-21', 'expense', 'cash', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 96, 'Food', '2025-08-22', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 150, 'Petrol', '2025-08-23', 'expense', 'cash', 'Transport: Petrol');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 900, 'Cars 24 auction', '2025-08-25', 'expense', 'card', 'Transport: Car Insurance');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 174, 'Food', '2025-08-26', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 212, 'Neem capsule', '2025-08-26', 'expense', 'card', 'Health: Medicine');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 140, 'Food', '2025-08-26', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 3566, 'Bike repair', '2025-08-26', 'expense', 'card', 'Transport: Bike Insurance');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 275, 'Food', '2025-09-05', 'expense', 'upi', 'Food: Snacks');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 825, 'Wifi', '2025-09-08', 'expense', 'upi', 'Data: WiFi');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 2233, 'Delhi ticket', '2025-09-08', 'expense', 'card', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 271, 'Food', '2025-09-09', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 825, 'Rides', '2025-09-10', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 430, 'Food', '2025-09-10', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 350, 'Rent agreement', '2025-09-10', 'expense', 'upi', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 121, 'Zepto', '2025-09-13', 'expense', 'upi', 'Food: Groceries');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 300, 'Slice card fee', '2025-09-12', 'expense', 'upi', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 126, 'Food Zepto', '2025-09-12', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 350, 'Rent agreement', '2025-09-12', 'expense', 'upi', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 110, 'Courier', '2025-09-12', 'expense', 'upi', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 186, 'Travel', '2025-09-12', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 20, 'Water', '2025-09-12', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 154, 'Food', '2025-09-12', 'expense', 'card', 'Food: Snacks');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 153, 'Food', '2025-09-13', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 194, 'Perfume', '2025-09-14', 'expense', 'card', 'Grooming: Toiletries');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 114, 'Food', '2025-09-14', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 140, 'Food', '2025-09-14', 'expense', 'card', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 147, 'Food', '2025-09-15', 'expense', 'card', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 96, 'Food', '2025-09-15', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 35, 'Courier', '2025-09-15', 'expense', 'card', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 200, 'Printing', '2025-09-15', 'expense', 'upi', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 440, 'Coder', '2025-09-17', 'expense', 'card', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 50, 'Travel', '2025-09-16', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 200, 'Food', '2025-09-17', 'expense', 'upi', 'Food: Fruits');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 250, 'Stamp', '2025-09-17', 'expense', 'upi', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 172, 'Food', '2025-09-18', 'expense', 'card', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 400, 'Warp subscription', '2025-09-18', 'expense', 'card', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 110, 'Food', '2025-09-18', 'expense', 'card', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 222, 'Food', '2025-09-18', 'expense', 'card', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 23, 'Food', '2025-09-19', 'expense', 'upi', 'Food: Groceries');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 88, 'Travel', '2025-09-20', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 70, 'Food', '2025-09-20', 'expense', 'upi', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 169, 'Food', '2025-09-20', 'expense', 'card', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 108, 'Food', '2025-09-20', 'expense', 'card', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 840, 'Travel urbainia', '2025-09-20', 'expense', 'card', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 800, 'travel from urbainia', '2025-09-20', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 50, 'Food', '2025-09-20', 'expense', 'cash', 'Food: Snacks');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 286, 'Food', '2025-09-21', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 176, 'Grocery', '2025-09-21', 'expense', 'upi', 'Food: Groceries');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 445, 'Food', '2025-09-22', 'expense', 'card', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 51, 'Book', '2025-09-22', 'expense', 'upi', 'Entertainment: Books');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 140, 'Food', '2025-09-22', 'expense', 'card', 'Food: Eating out');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 26, 'Ride', '2025-09-23', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 200, 'Travel', '2025-09-24', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 106, 'Food', '2025-09-24', 'expense', 'card', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 137, 'Grocery', '2025-09-24', 'expense', 'upi', 'Food: Groceries');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 116, 'Food', '2025-09-24', 'expense', 'card', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 121, 'Food', '2025-09-25', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 60, 'Food', '2025-09-25', 'expense', 'card', 'Food: Groceries');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 200, 'Stamp', '2025-09-25', 'expense', 'upi', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 136, 'Food', '2025-09-26', 'expense', 'card', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 97, 'Food', '2025-09-26', 'expense', 'upi', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 70, 'Ride', '2025-09-28', 'expense', 'upi', 'Transport:  Travel');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 212, 'Food', '2025-09-28', 'expense', 'card', 'Food: Swiggy');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 140, 'Grocery', '2025-09-29', 'expense', 'upi', 'Food: Groceries');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 1000, 'Gst fee', '2025-09-29', 'expense', 'upi', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 300, 'Card fee', '2025-09-29', 'expense', 'upi', 'Miscellaneous');
INSERT INTO transactions (user_id, amount, description, date, type, payment_method, subcategory) 
VALUES ('00000000-0000-0000-0000-000000000001', 300, 'Youtube', '2025-07-06', 'expense', 'card', 'Subscription: Youtube');

-- Verification query (run after import to verify)
-- SELECT COUNT(*) as total_transactions, SUM(amount) as total_amount FROM transactions 
-- WHERE user_id = '00000000-0000-0000-0000-000000000001' AND type = 'expense';

-- Optional: View transactions with subcategories
-- SELECT date, amount, description, subcategory, payment_method FROM transactions 
-- WHERE user_id = '00000000-0000-0000-0000-000000000001' AND type = 'expense' 
-- ORDER BY date DESC LIMIT 10;
