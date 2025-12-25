require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== UPDATING AXIS REWARDS CARD ===\n');

    await supabase
        .from('credit_cards')
        .update({
            card_number: '5318610002523605',
            cvv: '718',
            expiry_date: '08/30',
            statement_date: 21,
            due_date: 10
        })
        .eq('user_id', userId)
        .ilike('name', 'axis%rewards%');

    console.log('✅ Axis REWARDS updated with:');
    console.log('   Card: 5318 6100 0252 3605');
    console.log('   Expiry: 08/30');
    console.log('   CVV: 718');
    console.log('   Statement: 21st, Due: 10th');
    console.log('');

    process.exit(0);
})();
