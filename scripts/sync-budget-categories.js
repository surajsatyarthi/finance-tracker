const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

// Mapping from budget names to proper category names
const categoryMapping = {
  'Airtel': 'Data & WiFi > Airtel',
  'Jio': 'Data & WiFi > Jio',
  'WiFi': 'Data & WiFi > WiFi',
  'Bike Insurance': 'Insurance > Bike Insurance',
  'Car Insurance': 'Insurance > Car Insurance',
  'Bike Pollution Certificate': 'Insurance > Bike Insurance', // merge
  'Car Pollution Certificate': 'Insurance > Car Insurance', // merge
  'Insurance': 'Insurance > Health Insurance', // default to health
  'Books': 'Self Growth > Books',
  'Chef': 'Health > Chef',
  'Yoga instructor': 'Health > Yoga instructor',
  'Fitness bootcamp': 'Health > Fitness bootcamp',
  'Medicine': 'Health > Medicine',
  'Supplement': 'Health > Supplements + Vitamins',
  'Supliments + Vitamins': 'Health > Supplements + Vitamins',
  'Haircut': 'Grooming > Haircut',
  'Tolietries': 'Grooming > Toiletries',
  'Grooming': 'Grooming > Toiletries', // default
  'Eating out': 'Food > Eating out',
  'Swiggy': 'Food > Swiggy',
  'Groceries': 'Food > Groceries',
  'Vegetables': 'Food > Vegetables',
  'Fruits': 'Food > Fruits',
  'Snacks': 'Food > Snacks',
  'Dry fruits': 'Food > Dry fruits',
  'Petrol': 'Transport > Petrol',
  'Travel': 'Transport > Travel',
  'Google one': 'Subscriptions > Google One',
  'LinkedIn Premium': 'Subscriptions > LinkedIn Premium',
  'Grok': 'Subscriptions > Grok',
  'Youtube': 'Subscriptions > Youtube',
  'Subscriptions': 'Subscriptions > Google One', // default
  'Education loan': 'Loan > Education Loan',
  'Donation': 'Others > Donation',
  'Miscellaneous': 'Others > Miscellaneous',
  'Shopping': 'Shopping > Blinkit',
  // Keep these as-is (they're already correct or parent categories)
  'Clothing': 'Clothing',
  'Credit Card EMI': 'Credit Card EMI > Axis My Zone', // default to first card
  'Credit Card Monthly': 'Credit Card Monthly > Axis My Zone', // default to first card
};

(async () => {
  console.log('\n🔄 Syncing budget categories to match expense form...\n');
  
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*');
  
  let updated = 0;
  let errors = 0;
  
  for (const budget of budgets || []) {
    const oldName = budget.category_name;
    const newName = categoryMapping[oldName];
    
    if (newName && newName !== oldName) {
      const { error } = await supabase
        .from('budgets')
        .update({ category_name: newName })
        .eq('id', budget.id);
      
      if (error) {
        console.log(`❌ ${oldName} → ${newName}: ${error.message}`);
        errors++;
      } else {
        console.log(`✓ ${oldName} → ${newName}`);
        updated++;
      }
    }
  }
  
  console.log('\n' + '─'.repeat(60));
  console.log(`Updated: ${updated}, Errors: ${errors}`);
  console.log('');
  
  // Verify unique categories now
  const { data: updatedBudgets } = await supabase
    .from('budgets')
    .select('category_name')
    .order('category_name');
  
  const uniqueCategories = [...new Set(updatedBudgets?.map(b => b.category_name) || [])];
  
  console.log(`\n📊 Unique budget categories now: ${uniqueCategories.length}\n`);
  uniqueCategories.forEach(cat => console.log('  ' + cat));
  console.log('');
})();
