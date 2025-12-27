require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CURRENT STATE: ICICI Cards ===\n');

    const { data: cards } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .ilike('name', 'icici%')
        .eq('is_active', true);

    cards.forEach(card => {
        const last4 = card.card_number ? card.card_number.slice(-4) : 'N/A';
        console.log(`${card.name} (ending ${last4})`);
        console.log(`  Current Limit: ₹${card.credit_limit?.toLocaleString('en-IN')}`);
        console.log('');
    });

    console.log('=== PROPOSED CHANGES ===\n');
    console.log('Card ending 7026: Current ₹50,000 → New ₹20,000');
    console.log('Card ending 8017: Current ₹4,60,000 → New ₹38,000');
    console.log('\nProceed with update? (waiting for confirmation)');

    process.exit(0);
})();
