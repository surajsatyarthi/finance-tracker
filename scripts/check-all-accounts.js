require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CHECKING ALL ACCOUNTS ===\n');

    const { data: accounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('name');

    console.log(`Total accounts: ${accounts?.length || 0}\n`);

    if (accounts) {
        // Group by type
        const byType = {};
        accounts.forEach(acc => {
            const type = acc.type || 'unknown';
            if (!byType[type]) byType[type] = [];
            byType[type].push(acc);
        });

        console.log('=== ACCOUNTS BY TYPE ===\n');

        Object.keys(byType).sort().forEach(type => {
            console.log(`${type.toUpperCase()} (${byType[type].length}):`);
            byType[type].forEach(acc => {
                console.log(`  - ${acc.name}: ₹${acc.balance || 0}`);
            });
            console.log('');
        });

        // Check for duplicates
        const names = {};
        accounts.forEach(acc => {
            if (!names[acc.name]) names[acc.name] = 0;
            names[acc.name]++;
        });

        const duplicates = Object.keys(names).filter(name => names[name] > 1);
        if (duplicates.length > 0) {
            console.log('⚠️  DUPLICATES FOUND:\n');
            duplicates.forEach(name => {
                console.log(`  "${name}" appears ${names[name]} times`);
            });
            console.log('');
        }
    }

    process.exit(0);
})();
