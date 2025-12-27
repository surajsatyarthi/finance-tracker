const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

(async () => {
  console.log('\n📊 CATEGORIES COMPARISON:\n');
  
  // Get unique categories from budgets table
  const { data: budgets } = await supabase
    .from('budgets')
    .select('category_name')
    .order('category_name');
  
  const budgetCategories = [...new Set(budgets?.map(b => b.category_name) || [])];
  
  // Get categories from categories table
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  const categoryNames = categories?.map(c => c.name) || [];
  
  console.log('📋 BUDGET CATEGORIES (' + budgetCategories.length + '):');
  console.log('─'.repeat(60));
  budgetCategories.forEach(cat => console.log('  ' + cat));
  
  console.log('\n\n📝 EXPENSE FORM CATEGORIES (' + categoryNames.length + '):');
  console.log('─'.repeat(60));
  categories?.forEach(cat => {
    const parent = cat.parent_id ? ' (sub)' : '';
    console.log('  ' + cat.name + parent);
  });
  
  // Find differences
  const onlyInBudget = budgetCategories.filter(b => !categoryNames.includes(b));
  const onlyInCategories = categoryNames.filter(c => !budgetCategories.includes(c));
  
  if (onlyInBudget.length > 0) {
    console.log('\n\n❌ IN BUDGET BUT NOT IN CATEGORIES:');
    console.log('─'.repeat(60));
    onlyInBudget.forEach(cat => console.log('  ' + cat));
  }
  
  if (onlyInCategories.length > 0) {
    console.log('\n\n❌ IN CATEGORIES BUT NOT IN BUDGET:');
    console.log('─'.repeat(60));
    onlyInCategories.forEach(cat => console.log('  ' + cat));
  }
  
  console.log('\n');
})();
