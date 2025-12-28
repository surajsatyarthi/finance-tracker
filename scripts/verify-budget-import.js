require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyBudget() {
  console.log('\n📊 BUDGET VERIFICATION\n');
  
  // Count total 2026 budget records
  const { data: budgets, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('year', 2026)
    .eq('user_id', '8a7ce6b7-eec8-401a-a94e-46685e18a218');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`✅ Total 2026 budget records: ${budgets.length}`);
  
  // Group by month
  const byMonth = budgets.reduce((acc, b) => {
    acc[b.month] = (acc[b.month] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n📅 Records per month:');
  Object.entries(byMonth).sort(([a], [b]) => a - b).forEach(([month, count]) => {
    const monthName = new Date(2026, month - 1).toLocaleString('default', { month: 'short' });
    console.log(`  ${monthName} 2026: ${count} categories`);
  });
  
  // Calculate total budget
  const total = budgets.reduce((sum, b) => sum + parseFloat(b.monthly_limit || 0), 0);
  console.log(`\n💰 Total annual budget: ₹${total.toLocaleString('en-IN')}`);
  console.log(`📊 Monthly average: ₹${(total / 12).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`);
  
  // Show categories with budgets
  const { data: categories } = await supabase
    .from('categories')
    .select('name')
    .in('id', [...new Set(budgets.map(b => b.category_id))]);
    
  console.log(`\n📁 Categories with budgets: ${categories.length}`);
  console.log('Sample categories:', categories.slice(0, 5).map(c => c.name).join(', ') + '...');
}

verifyBudget();
