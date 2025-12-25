require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== UPDATING MISSING CARD DETAILS ===\n');

    // Update SBI Paytm
    console.log('1. Updating SBI Paytm...');
    await supabase
        .from('credit_cards')
        .update({
            card_number: '4129470904684092',
            cvv: '963',
            expiry_date: '05/29'
        })
        .eq('user_id', userId)
        .eq('name', 'SBI Paytm');
    console.log('   ✅ SBI Paytm updated');

    // Note: BAJAJ Finserv EMI CVV was never provided in the original data
    console.log('\n2. BAJAJ Finserv EMI:');
    console.log('   ⚠️  CVV was not provided in original data');
    console.log('   Card already has: 2030403213037910, Expiry: 10/22');

    // Check if there's data for Axis Rewards
    const { data: axisFile } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .ilike('name', '%axis%')
        .limit(5);

    console.log('\n3. Axis cards in database:');
    axisFile.forEach(c => {
        console.log(`   ${c.name}: Card# ${c.card_number || 'MISSING'}, CVV ${c.cvv || 'MISSING'}`);
    });

    console.log('\n✅ DONE\n');
    process.exit(0);
})();
