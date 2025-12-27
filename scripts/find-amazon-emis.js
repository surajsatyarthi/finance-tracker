require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CHECKING AMAZON CARD EMIs ===\n');

    // Check Amazon card
    const { data: amazonCard } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .ilike('name', '%amazon%')
        .single();

    console.log('ICICI Amazon Card:');
    console.log(`  Limit: ₹${amazonCard.credit_limit?.toLocaleString('en-IN')}`);
    console.log(`  Current Balance: ₹${amazonCard.current_balance?.toLocaleString('en-IN')}`);

    // Check for EMIs
    const { data: allPayables } = await supabase
        .from('payables')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

    console.log('\n=== ALL ACTIVE PAYABLES ===');
    if (allPayables && allPayables.length > 0) {
        allPayables.forEach(p => {
            console.log(`${p.type.toUpperCase()}: ${p.description} - ₹${p.amount?.toLocaleString('en-IN')}`);
        });
    } else {
        console.log('None found in payables table');
    }

    // Check credit_card_transactions for EMI
    const { data: transactions } = await supabase
        .from('credit_card_transactions')
        .select('*')
        .eq('user_id', userId)
        .ilike('description', '%emi%')
        .limit(10);

    console.log('\n=== EMI TRANSACTIONS ===');
    if (transactions && transactions.length > 0) {
        transactions.forEach(t => {
            console.log(`${t.transaction_date}: ${t.description} - ₹${t.amount?.toLocaleString('en-IN')}`);
        });
    } else {
        console.log('None found in transactions');
    }

    process.exit(0);
})();
