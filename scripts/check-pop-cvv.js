require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CURRENT STATE: Pop YES Bank Card ===\n');

    const { data: card } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .eq('name', 'Pop YES Bank')
        .single();

    if (!card) {
        console.log('❌ Card not found');
        process.exit(1);
    }

    console.log('Current CVV:', card.cvv);
    console.log('Card Number:', card.card_number);
    console.log('\nWill change CVV from:', card.cvv, '→ 095');

    process.exit(0);
})();
