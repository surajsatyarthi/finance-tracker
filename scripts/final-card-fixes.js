require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const USER_ID = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

async function finalFixes() {
  console.log('\n🔧 FINAL FIXES\n');
  
  // 1. Fix Indusind Rupay (SC) MP -> Indusind Rupay MP
  console.log('1. Fixing Indusind Rupay (SC) MP...');
  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', USER_ID)
    .eq('name', 'Credit Card Monthly - Indusind Rupay (SC) MP')
    .single();
  
  if (cat) {
    await supabase
      .from('categories')
      .update({ name: 'Credit Card Monthly - Indusind Rupay MP' })
      .eq('id', cat.id);
    console.log('   ✅ Renamed');
  }
  
  // 2. Add SuperMoney EMI category
  console.log('2. Adding SuperMoney EMI...');
  const { data: emiCat, error: emiError } = await supabase
    .from('categories')
    .insert({
      user_id: USER_ID,
      name: 'Credit Card EMI - SuperMoney EMI',
      type: 'expense'
    })
    .select()
    .single();
  
  if (emiError) {
    console.log('   ❌ Error:', emiError.message);
  } else if (emiCat) {
    console.log('   ✅ Created category');
    
    // Add 12 months of budget (all 0)
    const budgets = [];
    for (let month = 1; month <= 12; month++) {
      budgets.push({
        user_id: USER_ID,
        category_id: emiCat.id,
        category_name: 'Credit Card EMI - SuperMoney EMI',
        year: 2026,
        month: month,
        monthly_limit: 0,
        spent_amount: 0,
        remaining_amount: 0
      });
    }
    
    await supabase.from('budgets').insert(budgets);
    console.log('   ✅ Added 12 months of budget');
  }
  
  // 3. Add SuperMoney Monthly category
  console.log('3. Adding SuperMoney Monthly...');
  const { data: monthCat, error: monthError } = await supabase
    .from('categories')
    .insert({
      user_id: USER_ID,
      name: 'Credit Card Monthly - SuperMoney MP',
      type: 'expense'
    })
    .select()
    .single();
  
  if (monthError) {
    console.log('   ❌ Error:', monthError.message);
  } else if (monthCat) {
    console.log('   ✅ Created category');
    
    // Add 12 months of budget (all 0)
    const budgets = [];
    for (let month = 1; month <= 12; month++) {
      budgets.push({
        user_id: USER_ID,
        category_id: monthCat.id,
        category_name: 'Credit Card Monthly - SuperMoney MP',
        year: 2026,
        month: month,
        monthly_limit: 0,
        spent_amount: 0,
        remaining_amount: 0
      });
    }
    
    await supabase.from('budgets').insert(budgets);
    console.log('   ✅ Added 12 months of budget');
  }
  
  console.log('\n✅ All done! Should now have 32 credit card categories.');
}

finalFixes();
