require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    // Check both Axis Rewards cards
    const { data: axisCards } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .ilike('name', 'axis%rewards%');

    console.log('\nAxis Rewards cards:');
    axisCards.forEach(c => {
        console.log(`${c.name} | ID: ${c.id.slice(0, 8)} | Limit: ₹${c.credit_limit?.toLocaleString('en-IN')} | Active: ${c.is_active} | Created: ${c.created_at}`);
    });

    // Keep only the newer one with higher limit (₹3,34,000)
    console.log('\n✅ Deactivating older Axis Rewards (₹1,20,000)...');
    await supabase
        .from('credit_cards')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('credit_limit', 120000)
        .ilike('name', 'axis%rewards%');

    console.log('Done!');
    process.exit(0);
})();
