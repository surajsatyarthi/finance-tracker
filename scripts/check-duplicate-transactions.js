require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CHECKING FOR DUPLICATE TRANSACTIONS ===\n');

    // Get today's transactions
    const today = new Date().toISOString().split('T')[0];

    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .order('created_at', { ascending: false });

    if (!transactions || transactions.length === 0) {
        console.log('No transactions found for today');
        process.exit(0);
    }

    console.log(`Found ${transactions.length} transaction(s) for ${today}:\n`);

    transactions.forEach((tx, idx) => {
        console.log(`Transaction ${idx + 1}:`);
        console.log(`  ID: ${tx.id.slice(0, 8)}...`);
        console.log(`  Amount: ₹${tx.amount}`);
        console.log(`  Type: ${tx.type}`);
        console.log(`  Payment Method: ${tx.payment_method}`);
        console.log(`  Account ID: ${tx.account_id?.slice(0, 8) || 'NULL'}...`);
        console.log(`  Description: ${tx.description || tx.subcategory || 'No description'}`);
        console.log(`  Created: ${new Date(tx.created_at).toLocaleTimeString('en-IN')}`);
        console.log('');
    });

    // Check for duplicates (same amount, same time frame)
    const duplicates = [];
    for (let i = 0; i < transactions.length; i++) {
        for (let j = i + 1; j < transactions.length; j++) {
            const tx1 = transactions[i];
            const tx2 = transactions[j];

            const timeDiff = Math.abs(new Date(tx1.created_at) - new Date(tx2.created_at));

            if (tx1.amount === tx2.amount && timeDiff < 5000) { // Within 5 seconds
                duplicates.push({ tx1, tx2, timeDiff });
            }
        }
    }

    if (duplicates.length > 0) {
        console.log('⚠️  DUPLICATE TRANSACTIONS FOUND:\n');
        duplicates.forEach(({ tx1, tx2, timeDiff }) => {
            console.log(`  ₹${tx1.amount} submitted twice:`);
            console.log(`    First: ${new Date(tx1.created_at).toLocaleTimeString('en-IN')}`);
            console.log(`    Second: ${new Date(tx2.created_at).toLocaleTimeString('en-IN')}`);
            console.log(`    Time difference: ${timeDiff}ms`);
            console.log('');
        });
        console.log('CONCLUSION: Form submitted twice (double-click or button sensitivity)\n');
    } else {
        console.log('✅ No duplicate transactions found\n');
    }

    process.exit(0);
})();
