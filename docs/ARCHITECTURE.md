# Architecture

## Overview
- Next.js 15 App Router with Turbopack in `src/app`
- React 19 + TypeScript
- Tailwind CSS v4 with custom glass morphism utilities
- **Supabase (PostgreSQL) as primary and only data store**
- Supabase Auth for authentication with Row-Level Security
- AES-GCM encrypted sensitive data (card CVVs, PINs)

## Key Modules
- `src/lib/supabaseDataManager.ts`: Complete Supabase data manager (2000+ lines) handling all CRUD operations for accounts, transactions, loans, cards, FDs, goals, budgets
- `src/lib/supabase.ts`: Supabase client initialization
- `src/contexts/AuthContext.tsx`: Authentication state management
- `src/contexts/PrivacyContext.tsx`: Lock/unlock UI, inactivity auto-lock
- `src/components`: Reusable UI components (Header, GlassCard, BottomNav, etc.)
- Pages under `src/app/(auth)`: Dashboard, accounts, transactions, loans, cards, investments, goals, budget, analytics

## Data Storage
**All data is stored in Supabase PostgreSQL database with Row-Level Security.**

- Transactions: Include `type` (income/expense/transfer), category, payment method, partition (business/personal), and optional recurring metadata
- Loans: EMI computed with amortization schedule; mark paid updates next due date and balance
- Credit Cards: Track limits, statements, EMIs, rewards points, benefits (JSON), encrypted CVV/PIN
- Budgets: Monthly limits per category with spent tracking and analysis
- Investments: Stocks, mutual funds, FDs with maturity tracking
- Pay Later Services: BNPL tracking (Simpl, ZestMoney, etc.)
- Reminders: Derived from future payables, FD maturities, and card due dates

## Security
- **Supabase Row-Level Security (RLS)**: Users can only access their own data
- **Audit Logging**: All financial changes tracked in audit_logs table
- **Rate Limiting**: 20 transactions/min, 10 other operations/min
- **Data Validation**: Server-side validation with 10 crore limits
- **Encryption**: Sensitive card data (CVV, PIN) encrypted with AES-GCM
- Lock UI feature masks amounts across pages when privacy mode enabled
- Session management with JWT auto-refresh

## Styling
- Tailwind CSS v4 with global glass utilities: `glass-card`, `glass-panel`, `glass-input`, `glass-nav`
- Responsive design with mobile-first approach
- Dark mode support planned

## Database Schema
See `supabase/migrations/001_initial_schema.sql` and `002_enhanced_security.sql` for complete schema.

Key tables:
- `users`, `accounts`, `transactions`, `categories`
- `credit_cards`, `credit_card_transactions`, `loans`, `loan_payments`
- `goals`, `budgets`, `investments`, `pay_later_services`
- `audit_logs`, `user_sessions` (security)
