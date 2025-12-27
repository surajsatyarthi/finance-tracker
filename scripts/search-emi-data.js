require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== SEARCHING FOR EMI DATA EVERYWHERE ===\n');

    // Check credit_card_transactions for EMI
    console.log('1. Checking credit_card_transactions table:');
    const { data: emiTransactions } = await supabase
        .from('credit_card_transactions')
        .select('*')
        .eq('user_id', userId)
        .ilike('description', '%emi%');

    if (emiTransactions && emiTransactions.length > 0) {
        console.log(`Found ${emiTransactions.length} EMI transactions:`);
        emiTransactions.forEach(t => {
            console.log(`  - ${t.description}: ₹${t.amount} (${t.transaction_date})`);
        });
    } else {
        console.log('  No EMI transactions found');
    }

    // Check transactions table
    console.log('\n2. Checking transactions table:');
    const { data: allTrans } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .ilike('description', '%emi%');

    if (allTrans && allTrans.length > 0) {
        console.log(`Found ${allTrans.length} EMI in transactions:`);
        allTrans.forEach(t => {
            console.log(`  - ${t.description}: ₹${t.amount}`);
        });
    } else {
        console.log('  No EMI in transactions');
    }

    // Check if there's a column in credit_cards for EMI
    console.log('\n3. Checking credit_cards for EMI-related fields:');
    const { data: cards } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

    if (cards && cards.length > 0) {
        console.log('  Available columns in credit_cards:');
        Object.keys(cards[0]).forEach(key => {
            if (key.toLowerCase().includes('emi')) {
                console.log(`    ✓ ${key}: ${cards[0][key]}`);
            }
        });
    }

    // Check user_id column names
    console.log('\n4. Listing ALL tables in database:');
    const { data: tables, error } = await supabase
        .rpc('list_tables');

    if (error) {
        console.log('  Cannot query tables directly');
    }

    process.exit(0);
})();
