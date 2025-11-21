# Architecture

## Overview
- Next.js App Router in `src/app`
- React + TypeScript
- Tailwind v4 (globals with glass utilities)
- Local storage as primary data store
- Optional AES-GCM encrypted backup/restore

## Key Modules
- `src/lib/dataManager.ts`: local data models and CRUD (accounts, transactions, loans, cards, FDs, goals, budgets)
- `src/contexts/PrivacyContext.tsx`: lock/unlock, inactivity auto-lock
- `src/components`: Header, GlassCard, BottomNav, DataBackup
- Pages under `src/app`: dashboard, accounts, transactions/add, loans, cards, savings-fds, goals, budget, emis

## Data
- Transactions: include `partition: 'business' | 'personal'` and optional `recurring` metadata
- Loans: EMI computed with standard formula; mark paid updates next due
- Budgets: local overrides per month/category; analysis merges with baseline
- Reminders: derived from future payables, FD maturities, and card due day

## Security
- Lock masks amounts across pages
- Encrypted backups: PBKDF2 → AES-GCM, with salt and IV per backup

## Styling
- Tailwind v4 + global glass utilities: `glass-card`, `glass-panel`, `glass-input`, `glass-nav`
