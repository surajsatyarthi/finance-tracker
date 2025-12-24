// Debug script to check localStorage content
// Run this in your browser console on your finance tracker app

console.log("=== FINANCE TRACKER DATA AUDIT ===");

// Check for specific keys
const keys = [
  'bank_accounts',
  'cash_balance', 
  'income_transactions',
  'expense_transactions',
  'credit_cards',
  'future_payables',
  'total_liquidity'
];

keys.forEach(key => {
  const value = localStorage.getItem(key);
  console.log(`${key}:`, value ? JSON.parse(value) : 'NOT FOUND');
});

console.log("\n=== ALL FINANCE-RELATED KEYS ===");
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('bank') || key.includes('income') || key.includes('expense') || key.includes('cash') || key.includes('credit') || key.includes('liquidity'))) {
    console.log(`${key}:`, localStorage.getItem(key));
  }
}

console.log("\n=== ALL KEYS ===");
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`${key}:`, localStorage.getItem(key));
}