-- Run this in your Supabase SQL Editor to delete a specific user
-- Replace the email below with the account you want to delete
DELETE FROM auth.users WHERE email = 'suraj.satyarthi@gmail.com';

-- This will cascade delete their data (Transactions, Accounts, etc.) 
-- IF your foreign keys are set to ON DELETE CASCADE.
-- If not, you might need to delete data manually first:
-- DELETE FROM public.transactions WHERE user_id = (SELECT id FROM auth.users WHERE email = 'suraj.satyarthi@gmail.com');
-- DELETE FROM public.accounts WHERE user_id = (SELECT id FROM auth.users WHERE email = 'suraj.satyarthi@gmail.com');
