require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CHECKING MISSING CARD DETAILS ===\n');

    const cardNames = ['SBI Paytm', 'BAJAJ Finserv EMI', 'Axis REWARDS'];

    for (const name of cardNames) {
        const { data: card } = await supabase
            .from('credit_cards')
            .select('*')
            .eq('user_id', userId)
            .ilike('name', name)
            .single();

        if (!card) {
            console.log(`❌ ${name}: NOT FOUND\n`);
            continue;
        }

        console.log(`${card.name}:`);
        console.log(`  Card Number: ${card.card_number || '❌ MISSING'}`);
        console.log(`  CVV: ${card.cvv || '❌ MISSING'}`);
        console.log(`  Expiry: ${card.expiry_date || '❌ MISSING'}`);
        console.log(`  Statement Date: ${card.statement_date || '❌ MISSING'}`);
        console.log(`  Due Date: ${card.due_date || '❌ MISSING'}`);
        console.log('');
    }

    console.log('These fields need to be filled in manually if you have the card details.\n');
    process.exit(0);
})();
