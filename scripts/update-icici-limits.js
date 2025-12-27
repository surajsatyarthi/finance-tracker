require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== UPDATING ICICI CARD LIMITS ===\n');

    // Update ICICI Adani One (7026)
    console.log('1. Updating ICICI Adani One (7026)...');
    await supabase
        .from('credit_cards')
        .update({ credit_limit: 20000 })
        .eq('user_id', userId)
        .eq('name', 'ICICI Adani One');
    console.log('   ✅ Updated to ₹20,000');

    // Update ICICI Amazon (8017)
    console.log('\n2. Updating ICICI Amazon (8017)...');
    await supabase
        .from('credit_cards')
        .update({ credit_limit: 38000 })
        .eq('user_id', userId)
        .eq('name', 'ICICI Amazon');
    console.log('   ✅ Updated to ₹38,000');

    // Verify both changes
    console.log('\n=== VERIFICATION ===\n');

    const { data: cards } = await supabase
        .from('credit_cards')
        .select('name, card_number, credit_limit')
        .eq('user_id', userId)
        .ilike('name', 'icici%');

    cards.forEach(card => {
        const last4 = card.card_number.slice(-4);
        console.log(`${card.name} (${last4}): ₹${card.credit_limit.toLocaleString('en-IN')}`);
    });

    console.log('\n✅ ALL UPDATES COMPLETE\n');
    process.exit(0);
})();
