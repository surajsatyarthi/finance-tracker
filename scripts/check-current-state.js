require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    // Check what HDFC cards actually exist NOW
    const { data: hdfcCards } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .ilike('name', '%hdfc%')
        .eq('is_active', true);

    console.log('\n=== CURRENT HDFC CARDS ===\n');

    if (!hdfcCards || hdfcCards.length === 0) {
        console.log('❌ NO HDFC CARDS FOUND AT ALL');
    } else {
        hdfcCards.forEach(card => {
            console.log(`${card.name}`);
            console.log(`  Type: ${card.card_type}`);
            console.log(`  Limit: ₹${card.credit_limit?.toLocaleString('en-IN')}`);
            console.log(`  Card Number: ${card.card_number || 'MISSING'}`);
            console.log(`  CVV: ${card.cvv || 'MISSING'}`);
            console.log(`  Expiry: ${card.expiry_date || 'MISSING'}`);
            console.log('');
        });
    }

    // Show ALL active credit cards
    const { data: allCards } = await supabase
        .from('credit_cards')
        .select('name, credit_limit, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('name');

    console.log(`\nTOTAL ACTIVE CARDS: ${allCards.length}\n`);

    process.exit(0);
})();
