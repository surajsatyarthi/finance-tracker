require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const USER_ID = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

// Month name to number mapping
const MONTHS = {
  'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
  'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
};

async function updateAnnualFees() {
  console.log('\n💳 UPDATING CREDIT CARD ANNUAL FEES\n');
  
  // Get all credit cards with annual fees
  const { data: cards } = await supabase
    .from('credit_cards')
    .select('name, annual_fee, benefits')
    .eq('user_id', USER_ID);
  
  let updated = 0;
  let totalFees = 0;
  
  for (const card of cards) {
    if (!card.annual_fee || card.annual_fee === 0) continue;
    
    const renewalMonth = card.benefits?.renewalMonth;
    // Default to January if no renewal month specified or "NA"
    let monthNum = 1; // Default to January
    
    if (renewalMonth && renewalMonth !== 'NA' && renewalMonth !== 'Unknown') {
      monthNum = MONTHS[renewalMonth];
      if (!monthNum) {
        console.log(`⚠️  ${card.name}: Invalid renewal month "${renewalMonth}", using January`);
        monthNum = 1;
      }
    } else {
      console.log(`ℹ️  ${card.name}: No renewal month specified, defaulting to January`);
    }
    
    // Find the category
    const categoryName = `Credit Card Monthly - ${card.name} MP`;
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', USER_ID)
      .eq('name', categoryName)
      .single();
    
    if (!category) {
      console.log(`❌ Category not found: ${categoryName}`);
      continue;
    }
    
    // Update the budget for the renewal month
    const { error } = await supabase
      .from('budgets')
      .update({ 
        monthly_limit: card.annual_fee
      })
      .eq('category_id', category.id)
      .eq('year', 2026)
      .eq('month', monthNum);
    
    if (error) {
      console.log(`❌ ${card.name}: Error - ${error.message}`);
    } else {
      const monthName = Object.keys(MONTHS).find(k => MONTHS[k] === monthNum) || 'Jan';
      console.log(`✅ ${card.name}: ₹${card.annual_fee} in ${monthName} 2026`);
      updated++;
      totalFees += card.annual_fee;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Cards with annual fees: ${updated}`);
  console.log(`   Total annual fees: ₹${totalFees}`);
}

updateAnnualFees();
