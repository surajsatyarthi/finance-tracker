/**
 * Test fixtures and sample data for E2E tests
 */

export const TEST_ACCOUNTS = {
  savings: {
    name: 'Test Savings Account',
    type: 'savings',
    balance: 100000,
    currency: 'INR',
  },
  checking: {
    name: 'Test Checking Account',
    type: 'current',
    balance: 50000,
    currency: 'INR',
  },
  investment: {
    name: 'Test Investment Account',
    type: 'investment',
    balance: 250000,
    currency: 'INR',
  },
};

export const TEST_CREDIT_CARDS = {
  basic: {
    name: 'Test Credit Card',
    bank: 'Test Bank',
    last4: '1234',
    limit: 100000,
    current_balance: 25000,
    billing_date: 5,
    due_date: 25,
    interest_rate: 36.0,
  },
  premium: {
    name: 'Premium Test Card',
    bank: 'Premium Bank',
    last4: '5678',
    limit: 500000,
    current_balance: 100000,
    billing_date: 1,
    due_date: 20,
    interest_rate: 42.0,
  },
};

export const TEST_LOANS = {
  personal: {
    name: 'Test Personal Loan',
    type: 'Personal',
    principal: 200000,
    interest_rate: 12.5,
    tenure_months: 36,
    start_date: '2024-01-01',
    emi: 6722,
  },
  home: {
    name: 'Test Home Loan',
    type: 'Home',
    principal: 5000000,
    interest_rate: 8.5,
    tenure_months: 240,
    start_date: '2024-01-01',
    emi: 43914,
  },
};

export const TEST_INVESTMENTS = {
  stock: {
    name: 'Test Stock Investment',
    type: 'Stocks',
    purchase_value: 100000,
    current_value: 120000,
    purchase_date: '2023-01-01',
  },
  mutualFund: {
    name: 'Test Mutual Fund',
    type: 'Mutual Funds',
    purchase_value: 50000,
    current_value: 55000,
    purchase_date: '2023-06-01',
  },
};

export const TEST_FIXED_DEPOSITS = {
  short: {
    name: 'Test FD 1 Year',
    bank: 'Test Bank',
    principal: 100000,
    interest_rate: 7.5,
    start_date: '2024-01-01',
    maturity_date: '2025-01-01',
  },
  long: {
    name: 'Test FD 5 Year',
    bank: 'Test Bank',
    principal: 500000,
    interest_rate: 8.0,
    start_date: '2024-01-01',
    maturity_date: '2029-01-01',
  },
};

export const TEST_TRANSACTIONS = {
  income: {
    type: 'income',
    amount: 100000,
    description: 'Test Salary',
    category: 'Salary',
    date: '2024-02-01',
  },
  expense: {
    type: 'expense',
    amount: 5000,
    description: 'Test Grocery Shopping',
    category: 'Groceries',
    date: '2024-02-05',
  },
};

export const TEST_CATEGORIES = {
  income: [
    { name: 'Salary', type: 'income' },
    { name: 'Freelance', type: 'income' },
    { name: 'Investment Returns', type: 'income' },
  ],
  expense: [
    { name: 'Groceries', type: 'expense' },
    { name: 'Utilities', type: 'expense' },
    { name: 'Entertainment', type: 'expense' },
    { name: 'Transportation', type: 'expense' },
  ],
};

export const TEST_BUDGETS = {
  monthly: {
    name: 'Monthly Grocery Budget',
    category: 'Groceries',
    amount: 15000,
    period: 'monthly',
  },
};

export const TEST_GOALS = {
  vacation: {
    name: 'Vacation Fund',
    target_amount: 200000,
    current_amount: 50000,
    target_date: '2025-12-31',
  },
  emergency: {
    name: 'Emergency Fund',
    target_amount: 500000,
    current_amount: 250000,
    target_date: '2024-12-31',
  },
};

export const TEST_EMI = {
  basic: {
    name: 'Test EMI Payment',
    amount: 5000,
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    frequency: 'monthly',
  },
};

export const TEST_BNPL = {
  basic: {
    merchant: 'Test Merchant',
    total_amount: 30000,
    installments: 3,
    installment_amount: 10000,
    start_date: '2024-02-01',
  },
};

// Edge case data for testing
export const EDGE_CASES = {
  negativeBalance: {
    name: 'Negative Balance Account',
    type: 'current',
    balance: -5000,
    currency: 'INR',
  },
  zeroBalance: {
    name: 'Zero Balance Account',
    type: 'savings',
    balance: 0,
    currency: 'INR',
  },
  largeBalance: {
    name: 'Large Balance Account',
    type: 'investment',
    balance: 999999999,
    currency: 'INR',
  },
  specialChars: {
    name: "Test's Account <script>alert('xss')</script>",
    type: 'savings',
    balance: 10000,
    currency: 'INR',
  },
  sqlInjection: {
    name: "'; DROP TABLE accounts; --",
    type: 'savings',
    balance: 10000,
    currency: 'INR',
  },
};
