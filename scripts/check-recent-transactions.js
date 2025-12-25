require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CHECKING RECENT TRANSACTIONS ===\n');

    // Get last 10 transactions
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*, accounts(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

    if (!transactions || transactions.length === 0) {
        console.log('No transactions found');
        process.exit(0);
    }

    console.log('Last 10 transactions:\n');
    console.table(transactions.map(t => ({
        'Date': t.date,
        'Type': t.type,
        'Amount': `₹${t.amount}`,
        'Payment Method': t.payment_method,
        'Account': t.accounts?.name || '❌ NULL',
        'Description': t.description || '-',
        'Created': new Date(t.created_at).toLocaleString('en-IN')
    })));

    // Count transactions without account_id
    const noAccountLink = transactions.filter(t => !t.account_id);
    if (noAccountLink.length > 0) {
        console.log(`\n❌ ${noAccountLink.length} transactions have NO account_id:\n`);
        noAccountLink.forEach(t => {
            console.log(`  - ₹${t.amount} (${t.payment_method}) on ${t.date}: ${t.description}`);
        });
        console.log('\nThese transactions did NOT update any account balance!');
    } else {
        console.log('\n✅ All recent transactions are linked to accounts');
    }

    process.exit(0);
})();
