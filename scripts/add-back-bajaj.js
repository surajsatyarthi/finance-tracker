require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const USER_ID = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

async function addBackBAJAJ() {
  console.log('\n🔧 ADDING BACK BAJAJ FINSERV EMI CATEGORIES\n');
  
  // 1. Add BAJAJ Finserv EMI category
  console.log('1. Adding BAJAJ Finserv EMI...');
  const { data: emiCat, error: emiError } = await supabase
    .from('categories')
    .insert({
      user_id: USER_ID,
      name: 'Credit Card EMI - BAJAJ Finserv EMI',
      type: 'expense'
    })
    .select()
    .single();
  
  if (emiError) {
    console.log('   ❌ Error:', emiError.message);
  } else if (emiCat) {
    console.log('   ✅ Created category');
    
    // Add 12 months of budget (all 0 for now)
    const budgets = [];
    for (let month = 1; month <= 12; month++) {
      budgets.push({
        user_id: USER_ID,
        category_id: emiCat.id,
        category_name: 'Credit Card EMI - BAJAJ Finserv EMI',
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
  
  // 2. Add BAJAJ Finserv Monthly category
  console.log('2. Adding BAJAJ Finserv Monthly...');
  const { data: monthCat, error: monthError } = await supabase
    .from('categories')
    .insert({
      user_id: USER_ID,
      name: 'Credit Card Monthly - BAJAJ Finserv EMI MP',
      type: 'expense'
    })
    .select()
    .single();
  
  if (monthError) {
    console.log('   ❌ Error:', monthError.message);
  } else if (monthCat) {
    console.log('   ✅ Created category');
    
    // Add 12 months of budget (all 0 for now)
    const budgets = [];
    for (let month = 1; month <= 12; month++) {
      budgets.push({
        user_id: USER_ID,
        category_id: monthCat.id,
        category_name: 'Credit Card Monthly - BAJAJ Finserv EMI MP',
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
  
  // 3. Check if RBL Bajaj Finserv card exists in credit_cards and remove it
  console.log('3. Checking for RBL Bajaj Finserv card...');
  const { data: rblCard } = await supabase
    .from('credit_cards')
    .select('id, name')
    .eq('user_id', USER_ID)
    .like('name', '%RBL%Bajaj%')
    .single();
  
  if (rblCard) {
    console.log(`   Found: ${rblCard.name}`);
    await supabase.from('credit_cards').delete().eq('id', rblCard.id);
    console.log('   ✅ Deleted RBL Bajaj Finserv card');
  } else {
    console.log('   ℹ️  No RBL Bajaj Finserv card found (already removed)');
  }
  
  console.log('\n✅ BAJAJ Finserv EMI categories restored!');
  console.log('   Should now have 34 credit card categories (17 cards × 2)');
}

addBackBAJAJ();
