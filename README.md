# Personal Finance Tracker

A comprehensive finance tracking application built with Next.js, Supabase, and TypeScript. This app helps you track income, expenses, credit cards, loans, savings goals, and provides detailed analytics - replacing your Excel-based workflow with a modern, responsive web application that works on both mobile and desktop.

## 🚀 Features Completed

### ✅ Authentication & User Management
- User registration and login
- Secure authentication with Supabase Auth
- User profile management

### ✅ Database Schema
- Complete PostgreSQL schema with all tables
- Users, Accounts, Transactions, Credit Cards, Loans, Goals, Budgets
- Row Level Security (RLS) for data protection
- Proper relationships and indexes

### ✅ Main Dashboard
- Financial overview with key metrics
- Net worth calculation
- Monthly income/expense tracking
- Recent transactions display
- Quick action buttons

### ✅ TypeScript Types
- Complete type definitions for all entities
- Database types from Supabase schema
- Form input types and API response types

## 🏗️ Still Building

### 🚧 Transaction Management
- Add/edit income and expenses
- Category management
- Filtering and search

### 🚧 Credit Card Module
- Add/manage credit cards
- Track EMIs and payments
- Statement tracking

### 🚧 Loan Tracking
- Loan management with EMI calculations
- Payment history
- Interest tracking

### 🚧 Goals & Budget Tracking
- Savings goals with progress
- Budget vs actual analysis
- Goal achievement tracking

### 🚧 Analytics & Reporting
- Charts and visualizations
- Monthly/yearly summaries
- Expense categorization

### 🚧 Data Import/Export
- Excel data import
- CSV export functionality
- Migration from your current Excel system

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **UI**: Tailwind CSS + Heroicons
- **Charts**: Recharts (to be integrated)
- **PWA**: Service Workers (to be added)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Database Schema

Run the SQL migration in your Supabase SQL editor:

```bash
# Copy the contents of supabase/migrations/001_initial_schema.sql
# and run it in your Supabase SQL editor
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📱 Progressive Web App (PWA)

This app is designed to work as a PWA, meaning you can:

- Install it on your phone like a native app
- Install it on your macOS desktop
- Use it offline (coming soon)
- Get push notifications (coming soon)

## 📊 Migration from Excel

Your current Excel dashboard tracks:

- **Expense Sheet**: Monthly expenses by category
- **Income Sheet**: Monthly income tracking  
- **Cards Sheet**: Credit card details and benefits
- **Loans Sheet**: Loan EMIs and payment tracking
- **Goals Sheet**: Savings goals with progress
- **Liquidity Sheet**: Account balances (SBI, CBI, Cash)

This app replicates all these features with additional benefits:
- Real-time calculations
- Data validation
- Automatic categorization
- Visual charts and graphs
- Mobile accessibility
- Data backup and sync

## 🔒 Security

- All data is protected with Row Level Security (RLS)
- Users can only access their own data
- Secure authentication with email verification
- HTTPS encryption for all data transfer

## 📈 Key Metrics Tracked

### Dashboard Overview
- **Net Worth**: Assets - Liabilities
- **Monthly Income**: Current month income
- **Monthly Expenses**: Current month expenses  
- **Monthly Savings**: Income - Expenses
- **Active Loans**: Count of active loans
- **Active Goals**: Count of incomplete goals
- **Credit Card Balance**: Total outstanding balance

### Detailed Tracking
- Transaction categorization (matching your Excel categories)
- Credit card EMI tracking
- Loan EMI calculations and remaining balance
- Goal progress with target dates
- Account balance tracking across multiple accounts

## 🎯 Next Steps

1. **Complete Transaction Management**: Add forms for income/expense entry
2. **Build Credit Card Module**: Full credit card management
3. **Implement Loan Tracking**: EMI calculations and payment history
4. **Add Goal Management**: Progress tracking and target setting
5. **Create Analytics Dashboard**: Charts and reporting
6. **Data Import**: Import your existing Excel data
7. **PWA Features**: Offline support and installable app

## 💡 Usage Tips

- Start by creating your accounts (SBI, CBI, Cash, etc.)
- Add your existing credit cards with their details
- Input your current loans with EMI information
- Set up your savings goals
- Begin adding daily transactions
- Review your dashboard regularly for insights
