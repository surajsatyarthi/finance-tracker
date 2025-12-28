require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const USER_ID = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

// Mapping of incorrect names to correct names or null to delete
const FIXES = {
  // DELETE: No longer in use
  'Credit Card EMI - RBL Bajaj Finserv EMI': null,
  'Credit Card Monthly - RBL Bajaj Finserv MP': null,
  'Credit Card EMI > RBL Bajaj Finserv': null,
  'Credit Card Monthly > RBL Bajaj Finserv': null,
  'Credit Card EMI - BAJAJ Finserv EMI': null,
  'Credit Card Monthly - BAJAJ Finserv EMI MP': null,
  'Credit Card EMI > BAJAJ Finserv EMI': null,
  'Credit Card Monthly > BAJAJ Finserv EMI': null,
  
  // DELETE: ICICI Coral Rupay doesn't exist
  'Credit Card EMI - ICICI Coral Rupay EMI': null,
  'Credit Card Monthly - ICICI Coral Rupay MP': null,
  
  // DELETE: No longer have bike
  'Transport - Bike Insurance': null,
  'Transport - Bike Pollution Certificate': null,
  
  // DELETE: > separator duplicates for EMI
  'Credit Card EMI > Axis My Zone': null,
  'Credit Card EMI > Axis Neo': null,
  'Credit Card EMI > Axis Rewards': null,
  'Credit Card EMI > HDFC Millenia': null,
  'Credit Card EMI > HDFC Neu': null,
  'Credit Card EMI > ICICI Adani One': null,
  'Credit Card EMI > ICICI Amazon': null,
  'Credit Card EMI > Indusind Platinum Aura Edge': null,
  'Credit Card EMI > Indusind Rupay': null,
  'Credit Card EMI > Pop YES Bank': null,
  'Credit Card EMI > RBL Platinum Delight': null,
  'Credit Card EMI > SBI BPCL': null,
  'Credit Card EMI > SBI Paytm': null,
  'Credit Card EMI > SBI Simply Save': null,
  'Credit Card EMI > SC EaseMyTrip': null,
  'Credit Card EMI > SuperMoney': null,
  
  // DELETE: > separator duplicates for Monthly
  'Credit Card Monthly > Axis My Zone': null,
  'Credit Card Monthly > Axis Neo': null,
  'Credit Card Monthly > Axis Rewards': null,
  'Credit Card Monthly > HDFC Millenia': null,
  'Credit Card Monthly > HDFC Neu': null,
  'Credit Card Monthly > ICICI Adani One': null,
  'Credit Card Monthly > ICICI Amazon': null,
  'Credit Card Monthly > Indusind Platinum Aura Edge': null,
  'Credit Card Monthly > Indusind Rupay': null,
  'Credit Card Monthly > Pop YES Bank': null,
  'Credit Card Monthly > RBL Platinum Delight': null,
  'Credit Card Monthly > SBI BPCL': null,
  'Credit Card Monthly > SBI Paytm': null,
  'Credit Card Monthly > SBI Simply Save': null,
  'Credit Card Monthly > SC EaseMyTrip': null,
  'Credit Card Monthly > SuperMoney': null,
};

async function fixCategoryNames() {
  console.log('\n🔧 FIXING CREDIT CARD CATEGORY NAMES\n');
  
  let renamed = 0;
  let deleted = 0;
  let errors = 0;
  
  for (const [oldName, newName] of Object.entries(FIXES)) {
    // Find the category
    const { data: category } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', USER_ID)
      .eq('name', oldName)
      .single();
    
    if (!category) {
      console.log(`  ⚠️  Not found: ${oldName}`);
      continue;
    }
    
    if (newName === null) {
      // Delete category and its budgets
      console.log(`  🗑️  Deleting: ${oldName}`);
      
      // Delete budgets first
      await supabase
        .from('budgets')
        .delete()
        .eq('category_id', category.id);
      
      // Delete category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id);
      
      if (error) {
        console.log(`    ❌ Error: ${error.message}`);
        errors++;
      } else {
        deleted++;
      }
    } else {
      // Rename category
      console.log(`  ✏️  Renaming: ${oldName} → ${newName}`);
      
      const { error } = await supabase
        .from('categories')
        .update({ name: newName })
        .eq('id', category.id);
      
      if (error) {
        console.log(`    ❌ Error: ${error.message}`);
        errors++;
      } else {
        renamed++;
      }
    }
  }
  
  console.log(`\n✅ Summary:`);
  console.log(`  Renamed: ${renamed}`);
  console.log(`  Deleted: ${deleted}`);
  console.log(`  Errors: ${errors}`);
}

fixCategoryNames();
