# Finance Tracker - Developer Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Data Management](#data-management)
4. [Component Structure](#component-structure)
5. [API Reference](#api-reference)
6. [Development Guide](#development-guide)
7. [Deployment](#deployment)

---

## Project Overview

### Description
A comprehensive personal finance tracking application built with Next.js, featuring transaction management, credit card tracking, loan management with amortization schedules, and data import/export capabilities.

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Heroicons
- **Storage**: localStorage
- **Deployment**: Vercel

### Key Features
- Transaction management (income/expense)
- Credit card tracking with statements
- Loan management with amortization
- Data import/export (CSV/Excel)
- Interactive charts and analytics
- Responsive design

---

## Architecture

### Directory Structure
```
src/
├── app/                          # Next.js App Router
│   ├── dashboard/                # Main dashboard page
│   ├── transactions/             # Transaction management
│   │   ├── page.tsx             # Transaction list
│   │   └── add/page.tsx         # Add transaction
│   ├── credit-cards/            # Credit card module
│   │   ├── page.tsx             # Card list
│   │   └── [id]/page.tsx        # Card detail
│   ├── loans/                   # Loan module
│   │   ├── page.tsx             # Loan list
│   │   └── [id]/page.tsx        # Loan detail
│   ├── settings/                # Settings & data management
│   └── layout.tsx               # Root layout
├── components/                   # Reusable components
│   ├── DataImport.tsx           # CSV import component
│   ├── DataBackup.tsx           # Backup/restore component
│   ├── Header.tsx               # Navigation header
│   └── ...
├── lib/                         # Utility libraries
│   ├── dataManager.ts           # Core data operations
│   ├── importParser.ts          # CSV parsing logic
│   └── ...
└── contexts/                    # React contexts
    ├── AuthContext.tsx          # Authentication
    └── PrivacyContext.tsx       # Privacy settings
```

### Data Flow
```
User Input → Component → dataManager → localStorage → Component → UI
```

---

## Data Management

### Core Module: `dataManager.ts`

#### Key Interfaces

**Transactions**
```typescript
interface IncomeTransaction {
  id: string
  amount: number
  description: string
  category: string
  date: string
  type: 'salary' | 'business' | 'investment' | 'other'
  timestamp: string
}

interface ExpenseTransaction {
  id: string
  amount: number
  description: string
  category: string
  date: string
  paymentMethod: 'cash' | 'bank' | 'credit_card' | 'upi'
  timestamp: string
}
```

**Credit Cards**
```typescript
interface CreditCard {
  id: string
  name: string
  limit: number
  balance: number
  billingDate: number
  dueDate: number
  isVisible: boolean
}

interface CreditCardStatement {
  id: string
  cardId: string
  statementDate: string
  dueDate: string
  billingCycleStart: string
  billingCycleEnd: string
  previousBalance: number
  newCharges: number
  payments: number
  totalDue: number
  minimumDue: number
}

interface CreditCardPayment {
  id: string
  cardId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  notes?: string
  timestamp: string
}
```

**Loans**
```typescript
interface LoanRecord {
  id: string
  name: string
  principal: number
  rate: number
  tenureMonths: number
  startDate: string
  emisPaid: number
  monthlyAmount: number
  totalAmount: number
  nextDueDate: string
}

interface LoanPayment {
  id: string
  loanId: string
  paymentDate: string
  amount: number
  paymentType: 'regular_emi' | 'prepayment' | 'partial'
  principalPaid: number
  interestPaid: number
  outstandingBalance: number
  notes?: string
  timestamp: string
}

interface AmortizationEntry {
  month: number
  emiAmount: number
  principalComponent: number
  interestComponent: number
  outstandingBalance: number
  isPaid: boolean
  paymentDate?: string
}
```

#### Key Functions

**Transaction Management**
```typescript
// Income
getIncomeTransactions(): IncomeTransaction[]
storeIncomeTransaction(transaction): string
updateIncomeTransaction(id, updates): boolean
deleteIncomeTransaction(id): boolean

// Expense
getExpenseTransactions(): ExpenseTransaction[]
storeExpenseTransaction(transaction): string
updateExpenseTransaction(id, updates): boolean
deleteExpenseTransaction(id): boolean
```

**Credit Card Management**
```typescript
getCreditCards(): CreditCard[]
storeCreditCard(card): string
updateCreditCard(id, updates): boolean
deleteCreditCard(id): boolean

// Statements
getCreditCardStatements(cardId?): CreditCardStatement[]
storeCreditCardStatement(statement): string
deleteCreditCardStatement(id): boolean

// Payments
getCreditCardPayments(cardId?): CreditCardPayment[]
storeCreditCardPayment(payment): string
deleteCreditCardPayment(id): boolean

// Analytics
getCreditCardTransactions(cardId, startDate, endDate): Transaction[]
getCreditCardBalance(cardId): number
getCreditCardUtilization(cardId): number
getCreditCardAvailableCredit(cardId): number
```

**Loan Management**
```typescript
getLoans(): LoanRecord[]
storeLoan(loan): LoanRecord
updateLoan(id, updates): boolean
deleteLoan(id): boolean
markLoanEmiPaid(id): boolean

// Payments
getLoanPayments(loanId?): LoanPayment[]
storeLoanPayment(payment): string
deleteLoanPayment(id): boolean

// Analytics
generateAmortizationSchedule(loanId): AmortizationEntry[]
calculatePrepaymentImpact(loanId, amount): PrepaymentAnalysis
getLoanOutstandingBalance(loanId): number
getLoanTotalInterestPaid(loanId): number
getLoanTotalPrincipalPaid(loanId): number
updateLoanWithPayment(loanId, amount, date): boolean
```

**Data Operations**
```typescript
resetAllData(): void  // Clear all localStorage data
```

### localStorage Keys
```typescript
const STORAGE_KEYS = {
  INCOME: 'income_transactions',
  EXPENSE: 'expense_transactions',
  BANK_ACCOUNTS: 'bank_accounts',
  CREDIT_CARDS: 'credit_cards',
  CREDIT_CARD_STATEMENTS: 'credit_card_statements',
  CREDIT_CARD_PAYMENTS: 'credit_card_payments',
  LOANS: 'loans',
  LOAN_PAYMENTS: 'loan_payments',
  CASH_BALANCE: 'cash_balance',
  BUSINESS_RECORDS: 'business_records'
}
```

---

## Component Structure

### Page Components

#### Loan Detail Page (`/loans/[id]/page.tsx`)
```typescript
// Key Features:
- Dynamic route with loan ID
- Tabbed interface (Overview, Schedule, Payments, Calculator)
- Recharts integration for visualizations
- Amortization schedule table
- Prepayment calculator

// State Management:
const [loan, setLoan] = useState<LoanRecord | null>(null)
const [payments, setPayments] = useState<LoanPayment[]>([])
const [schedule, setSchedule] = useState<AmortizationEntry[]>([])
const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'payments' | 'calculator'>('overview')

// Data Loading:
useEffect(() => {
  const loans = getLoans()
  const foundLoan = loans.find(l => l.id === loanId)
  setLoan(foundLoan)
  setPayments(getLoanPayments(loanId))
  setSchedule(generateAmortizationSchedule(loanId))
}, [loanId])
```

#### Credit Card Detail Page (`/credit-cards/[id]/page.tsx`)
```typescript
// Similar structure to loan detail page
// Features: Overview, Transactions, Statements, Payments
```

### Utility Components

#### DataImport Component
```typescript
// Features:
- CSV file upload
- Column mapping
- Data preview
- Validation
- Bulk import

// Usage:
<DataImport />
```

#### DataBackup Component
```typescript
// Features:
- Export all data to JSON
- Import from JSON backup
- Data validation

// Usage:
<DataBackup />
```

---

## API Reference

### EMI Calculation
```typescript
export const calculateEMI = (
  principal: number,
  annualRate: number,
  tenureMonths: number
): { monthlyAmount: number; totalAmount: number } => {
  const monthlyRate = annualRate / 12 / 100
  const emi = principal * monthlyRate * 
    Math.pow(1 + monthlyRate, tenureMonths) / 
    (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  
  return {
    monthlyAmount: Math.round(emi),
    totalAmount: Math.round(emi * tenureMonths)
  }
}
```

### Amortization Schedule
```typescript
export const generateAmortizationSchedule = (
  loanId: string
): AmortizationEntry[] => {
  // For each month:
  // 1. Calculate interest component = outstanding × monthly rate
  // 2. Calculate principal component = EMI - interest
  // 3. Update outstanding balance
  // 4. Check payment status
  // 5. Return complete schedule
}
```

### Prepayment Impact
```typescript
export const calculatePrepaymentImpact = (
  loanId: string,
  prepaymentAmount: number
): PrepaymentAnalysis => {
  // 1. Get current outstanding balance
  // 2. Subtract prepayment
  // 3. Calculate new tenure using loan formula
  // 4. Compute interest saved
  // 5. Return analysis
}
```

---

## Development Guide

### Setup
```bash
# Clone repository
git clone https://github.com/surajsatyarthi/finance-tracker.git
cd finance-tracker

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables
```env
# .env.local (if needed)
NEXT_PUBLIC_API_URL=your_api_url
```

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with Next.js rules
- **Formatting**: Consistent indentation (2 spaces)
- **Naming**: camelCase for variables, PascalCase for components

### Adding New Features

1. **Create Interface** (if needed)
```typescript
// In dataManager.ts
export interface NewFeature {
  id: string
  // ... properties
}
```

2. **Add CRUD Functions**
```typescript
export const getNewFeatures = (): NewFeature[] => {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem('new_features')
  return raw ? JSON.parse(raw) : []
}

export const storeNewFeature = (feature: Omit<NewFeature, 'id'>): string => {
  const features = getNewFeatures()
  const newFeature = { ...feature, id: `feature_${Date.now()}` }
  features.push(newFeature)
  localStorage.setItem('new_features', JSON.stringify(features))
  return newFeature.id
}
```

3. **Create Page Component**
```typescript
// src/app/new-feature/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { getNewFeatures } from '@/lib/dataManager'

export default function NewFeaturePage() {
  const [features, setFeatures] = useState([])
  
  useEffect(() => {
    setFeatures(getNewFeatures())
  }, [])
  
  return <div>{/* UI */}</div>
}
```

4. **Update Navigation**
```typescript
// In Header.tsx or navigation component
<Link href="/new-feature">New Feature</Link>
```

### Testing

**Manual Testing Checklist**:
- [ ] Create operation works
- [ ] Read/List operation displays data
- [ ] Update operation modifies correctly
- [ ] Delete operation removes data
- [ ] Data persists after page reload
- [ ] Responsive design works on mobile
- [ ] Charts render correctly
- [ ] Forms validate input

**Build Testing**:
```bash
npm run build
# Check for errors
# Verify all pages compile
```

---

## Deployment

### Vercel Deployment

**Initial Setup**:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Automatic Deployment**:
- Push to `main` branch
- Vercel automatically builds and deploys
- New URL generated for each deployment
- Production URL remains consistent

**Configuration**:
```json
// vercel.json (if needed)
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### Custom Domain
1. Go to Vercel Dashboard
2. Select project
3. Settings → Domains
4. Add custom domain
5. Configure DNS records

---

## Troubleshooting

### Common Issues

**Build Errors**:
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

**TypeScript Errors**:
- Check for `any` types
- Verify interface definitions
- Ensure proper imports

**localStorage Issues**:
- Check browser compatibility
- Verify data structure
- Clear localStorage if corrupted:
```javascript
localStorage.clear()
```

**Chart Not Rendering**:
- Verify data format
- Check Recharts props
- Ensure ResponsiveContainer has height

---

## Best Practices

### Code Organization
- Keep components small and focused
- Extract reusable logic to utilities
- Use TypeScript interfaces for all data
- Document complex functions

### Performance
- Use `useMemo` for expensive calculations
- Lazy load heavy components
- Optimize images
- Minimize bundle size

### Security
- Validate all user input
- Sanitize data before storage
- Use HTTPS (Vercel provides)
- No sensitive data in localStorage

### Accessibility
- Use semantic HTML
- Add ARIA labels
- Ensure keyboard navigation
- Test with screen readers

---

## Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/en-US/)

### Tools
- [Vercel Dashboard](https://vercel.com/dashboard)
- [GitHub Repository](https://github.com/surajsatyarthi/finance-tracker)

---

**Last Updated**: November 21, 2025  
**Version**: 2.0
