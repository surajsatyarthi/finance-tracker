require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CHECKING HDFC MILLENNIA CARDS ===\n');

    // Check ALL HDFC Millennia cards (active or inactive)
    const { data: millenniaCards } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .ilike('name', '%millennia%');

    if (!millenniaCards || millenniaCards.length === 0) {
        console.log('⚠️  No HDFC Millennia cards found in database');
        console.log('   The deleted card data is PERMANENTLY LOST');
        console.log('   Card number and CVV cannot be retrieved\n');
        process.exit(0);
    }

    console.log(`Found ${millenniaCards.length} HDFC Millennia card(s):\n`);

    millenniaCards.forEach((card, idx) => {
        console.log(`Card ${idx + 1}: ${card.name}`);
        console.log(`  ID: ${card.id.slice(0, 8)}...`);
        console.log(`  Type: ${card.card_type}`);
        console.log(`  Limit: ₹${card.credit_limit?.toLocaleString('en-IN')}`);
        console.log(`  Active: ${card.is_active}`);
        console.log(`  Card Number: ${card.card_number || 'NOT STORED'}`);
        console.log(`  CVV: ${card.cvv || 'NOT STORED'}`);
        console.log(`  Expiry: ${card.expiry_date || 'NOT STORED'}`);
        console.log('');
    });

    process.exit(0);
})();
