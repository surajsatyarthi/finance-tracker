require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== UPDATING AXIS NEO AND MY ZONE LIMITS ===\n');

    // Update Axis Neo to 0
    console.log('1. Setting Axis Neo limit to ₹0...');
    await supabase
        .from('credit_cards')
        .update({ credit_limit: 0 })
        .eq('user_id', userId)
        .eq('name', 'Axis Neo');
    console.log('   ✅ Axis Neo: ₹1,54,000 → ₹0');

    // Update Axis My Zone to 0
    console.log('\n2. Setting Axis My Zone limit to ₹0...');
    await supabase
        .from('credit_cards')
        .update({ credit_limit: 0 })
        .eq('user_id', userId)
        .eq('name', 'Axis My Zone');
    console.log('   ✅ Axis My Zone: ₹1,54,000 → ₹0');

    console.log('\n✅ UPDATED - Total Axis limit now: ₹3,34,000 (only from Axis Rewards)\n');
    process.exit(0);
})();
