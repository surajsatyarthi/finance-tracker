require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== UPDATING Pop YES Bank CVV ===\n');

    // Update CVV
    await supabase
        .from('credit_cards')
        .update({ cvv: '095' })
        .eq('user_id', userId)
        .eq('name', 'Pop YES Bank');

    // Verify the change
    const { data: card } = await supabase
        .from('credit_cards')
        .select('cvv, card_number')
        .eq('user_id', userId)
        .eq('name', 'Pop YES Bank')
        .single();

    console.log('✅ UPDATED');
    console.log('\nVerified - Current CVV:', card.cvv);
    console.log('Card Number:', card.card_number);

    process.exit(0);
})();
