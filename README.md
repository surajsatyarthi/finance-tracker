# Finance Tracker - Personal Finance Management App

**Status:** 🟡 In Development - Core Features Complete, Additional Features Planned  
**Last Updated:** December 27, 2025

A forward-looking personal finance management application that helps you plan your financial future, not just track your past. Built with Next.js, Supabase, and TypeScript.

---

## 🎯 Purpose

This app is designed for **personal financial planning** with a focus on **future predictions** rather than just historical tracking. The primary goal is to answer: **"Can I afford this?"** and **"Will I have cash flow issues next month?"**

### Key Philosophy
- **Predictive, not just reactive** - Forecast future expenses based on budget, EMIs, and credit card dues
- **Decision support** - Help make smart financial decisions today
- **Comprehensive** - Track all aspects of personal finance in one place
- **Mobile-first** - Optimized for quick entries on the go

---

## ✅ Current Features (Implemented)

### 1. **Dashboard**
- Real-time financial overview
- Total liquidity across all accounts
- Monthly income/expense summary
- Quick metrics and insights

### 2. **Income & Expense Tracking**
- Add income/expenses via transaction form
- Categorize by type (expense has parent/subcategories, income is flat)
- Filter and search transactions
- Payment method tracking (UPI, cash, card, bank transfer)

### 3. **Budget Management**
- Set monthly budget by category
- Compare actual vs projected spending
- Identify surplus and deficit
- 13-month budget projection view

### 4. **Credit Card Management**
- Store credit card details (number, CVV, expiry, limits)
- Track credit card expenses separately (EMI vs non-EMI)
- Statement date and due date tracking
- Benefits and rewards tracking

### 5. **Bank Accounts**
- Multiple account support (savings, current, wallet, cash)
- Real-time balance tracking
- Account-to-account transfers
- Customer ID and account number storage
- +1 digit offset display for screenshot security

### 6. **Loans**
- Education loan, car loan, housing loan, personal loan tracking
- EMI amount and schedule
- Outstanding balance calculation
- Next EMI due date tracking

### 7. **Goals**
- Set financial goals (vacation, emergency fund, etc.)
- Track progress toward goals
- Target amount and current savings
- Visual progress indicators

### 8. **Fixed Deposits**
- FD tracking with maturity dates
- Interest calculation (simple and compound)
- Countdown timers to maturity
- Principal and interest breakdown

### 9. **Analytics**
- Spending breakdown by category
- Income vs expense trends
- Visual charts and graphs
- Category-wise analysis

### 10. **Security**
- +1 digit offset for sensitive data (screenshot security)
- Copy-to-clipboard with real values
- Row Level Security (RLS) in database
- User authentication via Supabase

---

## 🚧 Planned Features (Not Yet Implemented)

### Priority 1 - Core Predictions
1. **Net Worth Tracking** - Track total assets vs liabilities over time
2. **Safe to Spend Calculator** - How much can I spend right now without consequences?
3. **90-Day Cash Flow Forecast** - Predict balance for next 3 months based on budget, EMIs, bills
4. **Debt Payoff Calculator** - Optimize loan payments (snowball vs avalanche)

### Priority 2 - Smart Analysis
5. **Alerts & Notifications** - Bill reminders, budget warnings, unusual spending
6. **Subscription Manager** - Auto-detect recurring charges, find unused subscriptions
7. **AI Spending Insights** - Anomaly detection, trend analysis, recommendations
8. **Scenario Modeling** - "What if I buy X?" impact calculator

### Priority 3 - Automation
9. **Automatic Bank Syncing** - Parse SMS for auto transaction import
10. **PDF Statement Analysis** - Upload CC statements, auto-extract expenses

**Full Feature Plan:** See `/docs/feature_implementation_plan.md`  
**Timeline:** 12-14 weeks for all 10 planned features

---

## 🏗️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Charts:** Recharts
- **Deployment:** Vercel

---

## 📊 Database Structure

### Current Tables
- `users` - User profiles
- `accounts` - Bank accounts (savings, current, wallet, cash)
- `categories` - Expense/income categories (parent/subcategory hierarchy)
- `transactions` - All income and expense transactions
- `credit_cards` - Credit card details
- `credit_card_transactions` - CC-specific transactions
- `loans` - Loan tracking
- `loan_payments` - EMI payment history
- `goals` - Financial goals
- `budgets` - Monthly budget by category
- `fixed_deposits` - FD tracking

### Planned Tables
- `net_worth_snapshots` - Daily/weekly net worth history
- `subscriptions` - Recurring charge tracking
- `notifications` - User alerts
- `recurring_bills` - Scheduled payments
- `spending_insights` - AI-generated insights
- `scenarios` - Saved "what-if" calculations

**Database Analysis:** See `/docs/database_analysis.md`

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
   ```

4. **Run database migrations**
   
   Go to Supabase SQL Editor and run:
   - `supabase/migrations/001_initial_schema.sql` (if not already run)
   - `supabase/migrations/20251227_seed_categories.sql` (seed categories)
   - `supabase/migrations/20251227_add_soft_deletes.sql` (add soft delete)

5. **Start development server**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:3000

### First-Time Setup
1. Sign up with email/password
2. Categories will be empty initially - run seed migration (step 4 above)
3. Add your bank accounts in `/accounts`
4. Add credit cards in `/credit-cards`
5. Set up budget in `/budget`
6. Start tracking transactions!

---

## 📁 Project Structure

```
finance-tracker/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Protected pages
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── accounts/        # Bank accounts
│   │   │   ├── transactions/    # Add/view transactions
│   │   │   ├── credit-cards/    # Credit card management
│   │   │   ├── budget/          # Budget planning
│   │   │   ├── loans/           # Loan tracking
│   │   │   ├── goals/           # Financial goals
│   │   │   ├── fixed-deposits/  # FD management
│   │   │   ├── investments/     # Investment tracking
│   │   │   └── analytics/       # Spending analysis
│   │   ├── login/               # Authentication pages
│   │   └── signup/
│   ├── components/              # Reusable UI components
│   ├── lib/                     # Utility functions
│   │   ├── supabaseDataManager.ts  # Database operations
│   │   ├── cardsData.ts            # Credit card seed data
│   │   └── budgetData.ts           # Budget categories
│   └── types/                   # TypeScript interfaces
├── supabase/
│   └── migrations/              # Database migrations
├── docs/                        # Documentation
└── scripts/                     # Helper scripts

```

---

## 🔐 Security Features

1. **Authentication:** Supabase Auth with email/password
2. **Row Level Security (RLS):** Users can only access their own data
3. **+1 Offset Display:** Card numbers and CVVs displayed with +1 to each digit for screenshot security
4. **Soft Deletes:** Data marked as deleted, not permanently removed (can be recovered)
5. **No PII in Logs:** Sensitive data never logged to console in production

**Note:** This is for personal use. CVVs and full card numbers are stored for convenience. For production/commercial use, implement encryption.

---

## 🐛 Known Issues & Limitations

### Critical Blockers (Requires Immediate Action)
1. ⚠️ **Categories table empty** - Run migration: `20251227_seed_categories.sql`
2. ⚠️ **Credit cards table empty** - Manually insert credit card data
3. ⚠️ **Missing user data** - Credit card limits need to be entered by user

### Minor Issues
1. Budget uses static file (`budgetData.ts`) - not synced with database
2. Income categories not defined (expense categories only)
3. No validation for duplicate transactions
4. Analytics breaks if no transactions exist

**Full Issue Tracker:** See `/docs/issues_tracker.md`

---

## 📖 Documentation

### For Developers
- `HANDOFF_DOCUMENTATION.md` - Complete project overview and handoff guide
- `QUICK_START_GUIDE.md` - Get started in 30 minutes
- `database_analysis.md` - Database structure analysis (12 issues identified)
- `rca_data_persistence.md` - Root cause analysis of data loss bugs

### For Feature Development
- `feature_implementation_plan.md` - 10 planned features with timelines
- `realistic_timeline.md` - Hour-by-hour breakdown (12-14 weeks total)
- `missing_features_research.md` - Research on top finance apps

### For Testing
- `testing_checklist.md` - Comprehensive test protocol
- `qa_test_plan.md` - QA test plan
- `full_app_test_plan.md` - Test cases for all 10 pages

All documentation located in:
- `/docs/` (code documentation)
- `/.gemini/antigravity/brain/f5b19052-6eda-4bb8-8cdb-1c68672e4374/` (artifacts)

---

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy

### Database Setup
1. Create Supabase project
2. Run all migrations in `/supabase/migrations` in order
3. Verify tables exist: `users`, `accounts`, `categories`, etc.
4. Seed categories: Run `20251227_seed_categories.sql`

---

## 🤝 Contributing

This is a personal project. If you find bugs or have suggestions:
1. Check existing issues in `/docs/issues_tracker.md`
2. Create detailed bug report with steps to reproduce
3. For feature requests, check `/docs/missing_features_research.md` first

---

## 📝 License

Private/Personal Use Only

---

## 🔮 Future Vision

**Goal:** Best-in-class personal finance app that:
- Predicts cash flow problems before they happen
- Optimizes debt repayment automatically
- Provides AI-powered spending insights
- Automates data entry via bank SMS
- Helps make better financial decisions

**Current Progress:** ~40% complete  
**Estimated Completion:** 3-4 months for all planned features

---

## 📞 Support

For issues or questions:
1. Check documentation in `/docs/`
2. Review `HANDOFF_DOCUMENTATION.md` for known issues
3. Check database with: `SELECT COUNT(*) FROM categories;` (should be 54)

---

**Built with frustration, learning, and determination.**  
**Last Major Update:** December 27, 2025
