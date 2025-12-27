require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CHECKING ACTUAL CVV/CARD DATA ===\n');

    // Check one credit card
    const { data: card } = await supabase
        .from('credit_cards')
        .select('name, card_number, card_cvv')
        .eq('user_id', userId)
        .eq('name', 'ICICI Amazon')
        .single();

    console.log('Database value for ICICI Amazon:');
    console.log('  Card Number:', card?.card_number);
    console.log('  CVV:', card?.card_cvv);

    // Check one account
    const { data: account } = await supabase
        .from('accounts')
        .select('name, card_number, card_cvv')
        .eq('user_id', userId)
        .eq('name', 'Yes Bank Business')
        .single();

    console.log('\nDatabase value for Yes Bank Business:');
    console.log('  Card Number:', account?.card_number);
    console.log('  CVV:', account?.card_cvv);

    console.log('\n=== WHAT SHOULD BE DISPLAYED ===');
    console.log('If database CVV is 953, display should show: 954 (953 + 1)');
    console.log('If database last digit is 6, display should show: 7 (6 + 1)');
    console.log('\nI need to check the frontend code to see if +1 offset is implemented.');

    process.exit(0);
})();
