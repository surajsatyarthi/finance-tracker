require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== ALL ACCOUNT BALANCES ===\n');

    const { data: accounts } = await supabase
        .from('accounts')
        .select('name, type, balance')
        .eq('user_id', userId)
        .order('balance', { ascending: false });

    if (!accounts || accounts.length === 0) {
        console.log('No accounts found');
        process.exit(0);
    }

    console.table(accounts.map((acc, idx) => ({
        '#': idx + 1,
        'Account Name': acc.name,
        'Type': acc.type,
        'Balance': `₹${acc.balance?.toLocaleString('en-IN') || 0}`
    })));

    const total = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    console.log(`\nTotal Liquidity: ₹${total.toLocaleString('en-IN')}\n`);

    process.exit(0);
})();
