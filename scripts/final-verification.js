const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

(async () => {
  console.log('\n🔍 FINAL DATA VERIFICATION:\n');
  
  // Check all critical tables
  const checks = [
    { table: 'accounts', name: 'Bank Accounts' },
    { table: 'debit_cards', name: 'Debit Cards' },
    { table: 'credit_cards', name: 'Credit Cards' },
    { table: 'loans', name: 'Loans' },
    { table: 'goals', name: 'Goals' },
    { table: 'fixed_deposits', name: 'Fixed Deposits' },
    { table: 'budgets', name: 'Budget Records' },
    { table: 'categories', name: 'Categories' },
  ];
  
  for (const check of checks) {
    const { count, error } = await supabase
      .from(check.table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ ${check.name}: Error - ${error.message}`);
    } else {
      console.log(`✓ ${check.name}: ${count} records`);
    }
  }
  
  // Check account balances total
  const { data: accounts } = await supabase
    .from('accounts')
    .select('balance');
  
  const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;
  
  console.log(`\n💰 Total Balance: ₹${totalBalance.toLocaleString('en-IN')}`);
  
  // Check budget categories
  const { data: budgets } = await supabase
    .from('budgets')
    .select('category_name');
  
  const uniqueBudgetCats = [...new Set(budgets?.map(b => b.category_name) || [])];
  
  const { data: categories } = await supabase
    .from('categories')
    .select('name');
  
  const categoryNames = categories?.map(c => c.name) || [];
  
  const budgetOnlyCategories = uniqueBudgetCats.filter(b => !categoryNames.includes(b));
  
  if (budgetOnlyCategories.length > 0) {
    console.log(`\n⚠️  Categories in budget but not in categories table: ${budgetOnlyCategories.length}`);
    budgetOnlyCategories.forEach(cat => console.log(`   - ${cat}`));
  } else {
    console.log(`\n✓ All budget categories exist in categories table`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ DATA VERIFICATION COMPLETE');
  console.log('='.repeat(60) + '\n');
})();
