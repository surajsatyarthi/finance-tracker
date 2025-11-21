# Finance Tracker (Manual-Only MVP)

A minimal, glass-styled personal/business finance tracker built with Next.js App Router, Tailwind v4, and local storage. No external sync; all data is entered manually and stays on your device.

## Features
- Partition: Business vs Personal for transactions and dashboards
- Track: income, expense, transfers, loans/EMIs, goals, credit cards, savings/FDs
- Budgets: per-category monthly budgets with variance and drilldown
- Projection: 3-month forecast from EMIs, recurring bills, goals
- Reminders: upcoming EMIs, card statements, FD maturities
- KPIs: savings rate, debt service ratio, liquidity ratio
- Privacy: passphrase lock (auto-lock), optional encrypted backup/restore
- UI: glass surfaces, responsive tabs, tables, minimal icons

## Quick Start
- Requirements: Node 18+
- Dev: `npm install` → `npm run dev` → open `http://localhost:3000`
- Local mode is default. No login.

## Data Entry
- Transactions: `Transactions → Add` (income/expense/transfer, recurring, partition)
- Accounts: `Accounts` (balances, transfers)
- Loans: `Loans` (EMI amounts auto-calculated; mark paid)
- Credit Cards: `Cards` (limits, balances, utilization)
- Savings & FDs: `Savings & FDs` (maturities, ladder)
- Goals: `Goals` (targets, suggested monthly contribution)
- Budgets: `Budget` (inline editor + copy previous month)

## Privacy & Security
- Lock: Header → Lock; auto-lock after inactivity
- Encryption: `DataBackup` supports encrypted JSON export/import (AES-GCM + PBKDF2)
- No secrets logged; no external sync; local-only storage

## Known Limits
- No live bank integrations; CSV import removed after one-time seed
- Tax/GST filings not implemented; basic GST disabled
- Multi-user roles, audit log, multi-currency deferred

## Tech Stack
- Next.js App Router, React, TypeScript
- Tailwind v4
- Local storage + optional encrypted backups

## License
MIT
