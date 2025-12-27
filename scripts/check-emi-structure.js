require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CURRENT EMI DATA STRUCTURE ===\n');

    const { data: emis } = await supabase
        .from('payables')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'emi')
        .eq('is_active', true);

    console.log('EMIs in payables table:');
    emis.forEach(emi => {
        console.log(`\n${emi.description}`);
        console.log(`  Amount: ₹${emi.amount}`);
        console.log(`  Due Date: ${emi.due_date}`);
        console.log(`  Source: ${emi.source || 'N/A'}`);
        console.log(`  Credit Card ID: ${emi.credit_card_id || '❌ MISSING'}`);
    });

    console.log('\n\n=== PROBLEM ===');
    console.log('To calculate utilization correctly, I need to:');
    console.log('1. Know which card each EMI belongs to (credit_card_id)');
    console.log('2. Sum all EMI amounts for each card');
    console.log('3. Add to current_balance for total utilization');
    console.log('\nChecking if credit_card_id field exists...');

    process.exit(0);
})();
