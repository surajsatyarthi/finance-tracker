require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== DELETING OLD DUPLICATE CARDS ===\n');

    // 1. DELETE (not deactivate) old Axis Rewards with ₹1.2L limit
    console.log('1. Deleting old Axis Rewards (₹1,20,000)...');
    await supabase
        .from('credit_cards')
        .delete()
        .eq('user_id', userId)
        .eq('credit_limit', 120000)
        .ilike('name', 'axis%rewards%');
    console.log('   ✅ DELETED permanently');

    // 2. DELETE all inactive cards
    console.log('\n2. Deleting all inactive cards...');
    const { data: toDelete } = await supabase
        .from('credit_cards')
        .select('name')
        .eq('user_id', userId)
        .eq('is_active', false);

    await supabase
        .from('credit_cards')
        .delete()
        .eq('user_id', userId)
        .eq('is_active', false);

    console.log(`   ✅ DELETED ${toDelete.length} inactive cards`);

    console.log('\n✅ DELETION COMPLETE\n');
    process.exit(0);
})();
