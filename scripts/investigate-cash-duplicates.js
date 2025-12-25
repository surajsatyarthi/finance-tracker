require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== INVESTIGATING DUPLICATE CASH ENTRIES ===\n');

    const { data: cashAccounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('name', 'Cash')
        .order('created_at');

    if (!cashAccounts || cashAccounts.length === 0) {
        console.log('No cash accounts found');
        process.exit(0);
    }

    console.log(`Found ${cashAccounts.length} "Cash" entries:\n`);

    cashAccounts.forEach((acc, idx) => {
        console.log(`Entry ${idx + 1}:`);
        console.log(`  ID: ${acc.id.slice(0, 8)}...`);
        console.log(`  Balance: ₹${acc.balance}`);
        console.log(`  Created: ${new Date(acc.created_at).toLocaleString('en-IN')}`);
        console.log(`  Updated: ${new Date(acc.updated_at).toLocaleString('en-IN')}`);
        console.log(`  Type: ${acc.type}`);
        console.log('');
    });

    // Determine which to keep
    console.log('=== RECOMMENDATION ===\n');
    console.log('Keep: Entry 1 (oldest, created first)');
    console.log(`Delete: Entry 2 (duplicate, ₹${cashAccounts[1]?.balance})`);
    console.log(`Delete: Entry 3 (duplicate, ₹${cashAccounts[2]?.balance})`);
    console.log('');

    const totalBalance = cashAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    console.log(`Current total across all 3: ₹${totalBalance}`);
    console.log(`After cleanup (keeping Entry 1): ₹${cashAccounts[0].balance}\n`);

    process.exit(0);
})();
