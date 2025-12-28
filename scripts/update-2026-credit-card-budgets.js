require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const USER_ID = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

async function updateCreditCardBudgets() {
  console.log('\n🔧 UPDATING CREDIT CARD BUDGETS FOR 2026\n');
  
  // Step 1: Get all credit card EMI loans
  console.log('Step 1: Fetching credit card EMI from loans...');
  const { data: loans, error: loansError } = await supabase
    .from('loans')
    .select('*, credit_cards!linked_credit_card_id(name)')
    .eq('user_id', USER_ID)
    .eq('type', 'credit_card')
    .not('linked_credit_card_id', 'is', null);
  
  if (loansError) {
    console.log('❌ Error fetching loans:', loansError.message);
    return;
  }
  
  console.log(`✅ Found ${loans.length} credit card EMI loans\n`);
  
  // Create a map of card name to total EMI amount (sum multiple EMIs per card)
  const emiMap = {};
  loans.forEach(loan => {
    const cardName = loan.credit_cards?.name;
    if (!cardName) return;
    
    const emi = parseFloat(loan.emi_amount || 0);
    console.log(`  ${loan.name}: ₹${emi}/month (${cardName})`);
    
    if (!emiMap[cardName]) {
      emiMap[cardName] = 0;
    }
    emiMap[cardName] += emi;
  });
  
  console.log('\nTotal EMI per card:');
  Object.entries(emiMap).forEach(([card, emi]) => {
    console.log(`  ${card}: ₹${emi.toFixed(2)}/month`);
  });
  
  // Step 2: Set all Credit Card Monthly budgets to 0
  console.log('\nStep 2: Setting all Credit Card Monthly payments to ₹0...');
  const { data: monthlyCategories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('user_id', USER_ID)
    .like('name', 'Credit Card Monthly%');
  
  for (const cat of monthlyCategories) {
    await supabase
      .from('budgets')
      .update({ monthly_limit: 0, remaining_amount: 0 })
      .eq('user_id', USER_ID)
      .eq('category_id', cat.id)
      .eq('year', 2026);
  }
  console.log(`✅ Updated ${monthlyCategories.length} monthly payment categories to ₹0`);
  
  // Step 3: Update Credit Card EMI budgets from loans
  console.log('\nStep 3: Updating Credit Card EMI budgets from loans...');
  const { data: emiCategories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('user_id', USER_ID)
    .like('name', 'Credit Card EMI%');
  
  let updated = 0;
  let notFound = 0;
  
  for (const cat of emiCategories) {
    // Extract card name from category (e.g., "Credit Card EMI - Axis My Zone EMI" -> "Axis My Zone")
    const cardName = cat.name.replace('Credit Card EMI - ', '').replace(' EMI', '');
    
    // Find matching loan
    const emi = emiMap[cardName];
    
    if (emi !== undefined) {
      // Update all 12 months with the EMI amount
      await supabase
        .from('budgets')
        .update({ 
          monthly_limit: emi,
          remaining_amount: emi 
        })
        .eq('user_id', USER_ID)
        .eq('category_id', cat.id)
        .eq('year', 2026);
      
      console.log(`  ✅ ${cardName}: ₹${emi}/month`);
      updated++;
    } else {
      // No loan found - set to 0
      await supabase
        .from('budgets')
        .update({ 
          monthly_limit: 0,
          remaining_amount: 0 
        })
        .eq('user_id', USER_ID)
        .eq('category_id', cat.id)
        .eq('year', 2026);
      
      console.log(`  ℹ️  ${cardName}: No loan found, set to ₹0`);
      notFound++;
    }
  }
  
  console.log(`\n✅ Summary:`);
  console.log(`  Updated with EMI: ${updated}`);
  console.log(`  No loan (set to ₹0): ${notFound}`);
  console.log(`  All monthly fees: ₹0`);
}

updateCreditCardBudgets();
