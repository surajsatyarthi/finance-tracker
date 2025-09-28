# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## 🏗️ Architecture Overview

This is a **Personal Finance Tracker** built as a Next.js 15 application with Supabase backend, designed to replace Excel-based finance tracking with a modern, secure web application.

### Core Tech Stack
- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **State Management**: React Context (AuthContext)
- **UI Components**: Headless UI, Heroicons, Lucide React
- **Charts**: Recharts (integrated but not yet implemented)
- **Deployment**: Vercel + Supabase

### Key Architecture Patterns

**Authentication Flow**: App uses Supabase Auth with custom `AuthContext` that automatically creates user profiles in the database. All pages redirect through authentication checking.

**Database Design**: Comprehensive financial schema with 10 main entities (users, accounts, transactions, credit_cards, loans, goals, budgets, etc.) with full Row Level Security (RLS) ensuring users only see their own data.

**Security-First Approach**: Bank-level security with RLS policies, audit logging, rate limiting, input sanitization, and secure headers configured in `vercel.json`.

## 🚀 Development Commands

### Setup & Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# Run database migrations (copy SQL to Supabase SQL editor)
# 1. supabase/migrations/001_initial_schema.sql
# 2. supabase/migrations/002_enhanced_security.sql
```

### Development
```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Database Operations
```bash
# Access Supabase dashboard
# Go to your project at supabase.com/dashboard

# Run SQL migrations
# Copy contents from supabase/migrations/*.sql to SQL Editor

# View audit logs (in production)
# SELECT * FROM audit_logs WHERE user_id = auth.uid() ORDER BY created_at DESC;
```

### Testing & Deployment
```bash
# Test authentication flow
# 1. Create account at /signup
# 2. Verify email confirmation
# 3. Test login/logout

# Deploy to Vercel (auto-deploys from main branch)
git push origin main

# Manual deployment
npx vercel --prod
```

## 📊 Data Model & Business Logic

### Financial Entity Relationships

**Core Flow**: Users → Accounts → Transactions  
**Credit Flow**: Users → Credit Cards → Credit Card Transactions  
**Debt Flow**: Users → Loans → Loan Payments  
**Planning Flow**: Users → Goals & Budgets

### Key Database Tables
- **`users`**: User profiles with default currency (INR)
- **`accounts`**: Bank accounts (SBI, CBI, Cash, etc.)  
- **`transactions`**: Income/expense records with categories
- **`credit_cards`**: Credit card details with EMI tracking
- **`loans`**: Loan management with automatic EMI calculations
- **`goals`**: Savings goals with progress tracking
- **`budgets`**: Monthly budget limits with spent tracking

### Computed Fields & Business Rules
- Net Worth = Total Account Balances - Total Loan Balances - Credit Card Balances
- Monthly Savings = Monthly Income - Monthly Expenses  
- Goal Progress = (current_amount / target_amount) * 100
- EMI Remaining = total_emis - emis_paid (computed in database)
- Budget Remaining = monthly_limit - spent_amount (computed in database)

### Currency & Localization
- Default currency: INR (Indian Rupees)
- All monetary fields use DECIMAL(15,2) for precision
- Date fields use DATE type, with generated month/year columns for faster queries

## 🔒 Security Implementation

### Row Level Security (RLS)
All tables have RLS policies ensuring `auth.uid() = user_id`. Users cannot access other users' financial data under any circumstance.

### Rate Limiting (Database Level)
- Financial transactions: 20 per minute
- Other operations: 10 per minute  
- Implemented in `002_enhanced_security.sql`

### Input Validation & Sanitization
- Monetary limits: 10 crore INR maximum
- Text input sanitization against XSS
- Server-side validation for all financial data

### Production Security Headers
Configured in `vercel.json`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff  
- Strict-Transport-Security with HSTS
- Permissions-Policy restricting sensitive APIs

## 🏗️ Component Architecture

### Authentication System
- **AuthContext** (`src/contexts/AuthContext.tsx`): Manages user state, sign up/in/out
- **useAuth()**: Hook for accessing user state
- **useRequireAuth()**: Hook for protected routes with auto-redirect

### Route Structure
- **`/`**: Root redirect to dashboard or login
- **`/login`**, **`/signup`**: Authentication pages
- **`/dashboard`**: Main financial overview (implemented)
- **Future routes**: `/transactions`, `/cards`, `/loans`, `/goals`

### Type Safety
- Complete TypeScript types in `src/types/database.types.ts`
- Generated from Supabase schema
- Includes Row, Insert, Update types for all tables

## 🎯 Development Status & Next Steps

### ✅ Production Ready
- Authentication system with email verification
- Complete database schema with security
- Main dashboard with financial metrics
- Deployment configuration (Vercel + Supabase)

### 🚧 High Priority Features
1. **Transaction Management**: Form for adding income/expenses with category selection
2. **Credit Card Module**: Add/edit cards, EMI tracking, payment reminders
3. **Data Import**: CSV import functionality for migrating from Excel
4. **Loan Management**: Loan entry forms with EMI calculations

### 🎨 UI Development Patterns
- Use **Tailwind CSS** with mobile-first responsive design
- **Headless UI** for complex components (modals, dropdowns)
- **Heroicons** for consistent iconography
- **Lucide React** for additional icons
- Color scheme: Indigo primary, gray neutrals

## 🔧 Common Development Tasks

### Adding New Financial Features
1. Create database table/columns in new migration file
2. Update TypeScript types (`database.types.ts`)
3. Add RLS policy for user data isolation  
4. Create React components with form validation
5. Implement Supabase queries with error handling
6. Add to main dashboard metrics if needed

### Working with Supabase
```typescript
// Standard pattern for database operations
import { supabase } from '@/lib/supabase'

// Always include user_id filter for RLS
const { data, error } = await supabase
  .from('transactions')
  .select('*')
  .eq('user_id', user.id)
  .order('date', { ascending: false })
```

### Form Handling Patterns
- Use controlled inputs with React state
- Validate on client and server side
- Handle Supabase errors gracefully with user-friendly messages
- Show loading states during submissions

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📱 Progressive Web App (PWA)
The application is designed for PWA functionality (mobile installation) but not yet implemented. When adding:
- Configure service worker for offline support
- Add manifest.json with app icons
- Implement push notifications for payment reminders

## 💰 Migration from Excel
This app replaces a personal Excel-based finance system with these sheet mappings:
- **Expense Sheet** → Transaction Management
- **Income Sheet** → Transaction Management  
- **Cards Sheet** → Credit Card Module
- **Loans Sheet** → Loan Tracking
- **Goals Sheet** → Goals Tracker
- **Liquidity Sheet** → Accounts Management

Import functionality should preserve existing categorization and date ranges.