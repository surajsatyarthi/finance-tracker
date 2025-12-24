# 🔄 Transfer Transactions: Setup & Usage Guide

This enables recording transfers between your bank accounts and updating displayed balances accordingly.

## 1) Apply the Supabase Migration

Run this SQL in your Supabase project (SQL Editor):
- Open: `supabase/migrations/004_add_transfer_transactions.sql`
- Copy the full contents
- Paste into Supabase SQL Editor
- Click Run

What it does:
- Adds transfer columns to `transactions`
- Introduces `type = 'transfer'`
- Adds RPC `process_transfer_transaction(...)` to create paired transactions
- Adds RPC `get_account_balance_with_transfers(account_id)` to compute balances = base balance + transfers in − transfers out
- Adds permissive single-user RLS policy for `transactions` if not already present

Verification queries (optional):
- After creating a test transfer, run:
```
select * from transactions where is_transfer = true order by date desc, created_at desc;
```

## 2) App Changes

- The Transfer tab on `/transactions/add` now uses the RPC to record transfers atomically.
- The Bank Accounts page (`/bank-accounts`) shows balances that include transfers using the balance RPC.
- Total Balance at the top of that page is recomputed accordingly.

## 3) How to Record a Transfer

1. Go to: `/transactions/add`
2. Click the "Transfer" tab
3. Pick From Account, To Account, enter Amount and optional Description/Date
4. Submit

On success:
- Two transactions are created (Transfer Out and Transfer In) under one reference
- The Bank Accounts page will reflect updated balances (computed via RPC)

## 4) Notes

- Your stored `accounts.balance` remains your base balance; the displayed balance adds/subtracts transfers on the fly.
- No extra UI changes are required for existing income/expense flows.

## 5) Troubleshooting

- If you see: "Transfer functionality requires database migration to be applied first"
  - Ensure you ran `004_add_transfer_transactions.sql` in Supabase
- If balances don’t change after a transfer:
  - Refresh `/bank-accounts`
  - Confirm the RPC `get_account_balance_with_transfers` exists and returns a number for your account id
- If RPC errors occur:
  - Confirm RLS policies from `003_disable_rls_for_testing.sql` (or use your auth-based policies) allow your user to read/write `transactions`

## 6) Rollback (if needed)

To remove transfer support, you would need to:
- Delete transfer rows in `transactions`
- Drop the new columns and indexes
- Drop the two RPC functions

Reach out if you want a rollback script generated.
