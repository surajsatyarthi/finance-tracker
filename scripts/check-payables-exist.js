require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CHECKING ALL PAYABLES ===\n');

    const { data, error } = await supabase
        .from('payables')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.log('Error:', error.message);
        process.exit(1);
    }

    if (!data || data.length === 0) {
        console.log('❌ NO PAYABLES FOUND IN DATABASE');
        console.log('\nThis means:');
        console.log('- EMIs are being generated dynamically by getFuturePayables()');
        console.log('- They are NOT stored in payables table');
        console.log('- They need to be added to payables table with credit_card_id link');
    } else {
        console.log(`Found ${data.length} payables:`);
        data.forEach(p => {
            console.log(`- ${p.type}: ${p.description} - ₹${p.amount}`);
        });
    }

    process.exit(0);
})();
