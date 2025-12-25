require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CHECKING KOTAK CARDS ===\n');

    // Check credit_cards table
    const { data: kotakCredit } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .ilike('name', '%kotak%');

    console.log('In CREDIT_CARDS table:');
    if (!kotakCredit || kotakCredit.length === 0) {
        console.log('  ❌ No Kotak cards found\n');
    } else {
        kotakCredit.forEach(card => {
            console.log(`  ${card.name}`);
            console.log(`    Type: ${card.card_type}`);
            console.log(`    Limit: ₹${card.credit_limit}`);
            console.log(`    Active: ${card.is_active}`);
            console.log('');
        });
    }

    // Check accounts table (for debit card)
    const { data: kotakAccount } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .ilike('name', '%kotak%');

    console.log('In ACCOUNTS table:');
    if (!kotakAccount || kotakAccount.length === 0) {
        console.log('  ❌ No Kotak accounts found\n');
    } else {
        kotakAccount.forEach(acc => {
            console.log(`  ${acc.name}`);
            console.log(`    Type: ${acc.type}`);
            console.log(`    Balance: ₹${acc.balance}`);
            console.log(`    Card Number: ${acc.card_number || 'N/A'}`);
            console.log('');
        });
    }

    console.log('\nWHAT WAS DELETED:');
    console.log('  "Kotak Debit" from credit_cards table');
    console.log('  Reason: card_type = "DEBIT" and is_active = false');
    console.log('  Created: Dec 24, 2025 (recent entry)');
    console.log('\nNote: Kotak account still exists in accounts table with all details');

    process.exit(0);
})();
