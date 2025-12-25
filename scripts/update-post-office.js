require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

// Apply +1 offset encryption
function applyOffset(value) {
    return value
        .split('')
        .map(char => {
            if (char >= '0' && char <= '9') {
                const digit = parseInt(char);
                return ((digit + 1) % 10).toString();
            }
            return char;
        })
        .join('');
}

(async () => {
    console.log('\n=== UPDATING POST OFFICE ACCOUNT ===\n');

    // Find Post Office account
    const { data: accounts } = await supabase
        .from('accounts')
        .select('id, name, balance')
        .eq('user_id', userId)
        .ilike('name', '%post office%');

    if (!accounts || accounts.length === 0) {
        console.log('❌ Post Office account not found');
        process.exit(1);
    }

    const account = accounts[0];
    console.log(`Found: ${account.name} (Balance: ₹${account.balance})`);

    // Update with postal account details (encrypted)
    const { error } = await supabase
        .from('accounts')
        .update({
            ifsc_code: 'IPOS0000DOP',
            account_number: applyOffset('010034267754'), // Encrypted
            // No card details for postal account
            card_number: null,
            card_cvv: null,
            card_expiry_month: null,
            card_expiry_year: null
        })
        .eq('id', account.id);

    if (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }

    console.log('\n✅ Updated Post Office account:');
    console.log('  IFSC: IPOS0000DOP');
    console.log('  Account #: 121145378865 (encrypted +1)');
    console.log('  Real Account #: 010034267754');
    console.log('  Customer ID: 446914972 (not stored - for reference)');
    console.log('  Balance: ₹1,000\n');

    process.exit(0);
})();
