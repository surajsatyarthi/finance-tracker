require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== DELETING RBL BAJAJ FINSERV ===\n');

    const { data: card } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .eq('name', 'RBL Bajaj Finserv')
        .single();

    if (!card) {
        console.log('Card not found');
        process.exit(0);
    }

    console.log('Found card:');
    console.log(`  Name: ${card.name}`);
    console.log(`  Limit: ₹${card.credit_limit?.toLocaleString('en-IN')}`);
    console.log(`  Balance: ₹${card.current_balance?.toLocaleString('en-IN')}`);

    await supabase
        .from('credit_cards')
        .delete()
        .eq('user_id', userId)
        .eq('name', 'RBL Bajaj Finserv');

    console.log('\n✅ DELETED permanently\n');
    process.exit(0);
})();
