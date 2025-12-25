require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CHECKING EXISTING BANK DATA ===\n');

    // Check for liquidity/bank accounts
    const { data: liquidity, error: liqError } = await supabase
        .from('liquidity')
        .select('*')
        .eq('user_id', userId);

    if (liquidity && liquidity.length > 0) {
        console.log(`Found ${liquidity.length} bank accounts in liquidity table:\n`);
        console.table(liquidity.map(acc => ({
            'Name': acc.name,
            'Type': acc.type,
            'Balance': `₹${acc.balance?.toLocaleString() || 0}`
        })));
    } else {
        console.log('No liquidity data found');
    }

    // Check table structure
    const { data: sample } = await supabase
        .from('liquidity')
        .select('*')
        .limit(1)
        .single();

    if (sample) {
        console.log('\nLiquidity table columns:', Object.keys(sample).join(', '));
    }

    process.exit(0);
})();
