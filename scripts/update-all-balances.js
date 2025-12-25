require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

// Correct unbilled balances
const updates = [
    { last4: '7087', balance: 0 },
    { last4: '0976', balance: 0 },
    { last4: '4980', balance: 0 },
    { last4: '9572', balance: 0 },
    { last4: '8017', balance: 0 },
    { last4: '7026', balance: 4266.29 },
    { last4: '6273', balance: 770 },
    { last4: '5905', balance: 1274.78 },
    { last4: '5621', balance: 0 },
    { last4: '9296', balance: 0 } // SuperMoney - setting to 0, user said ₹191 stationery was added
];

// Cards to deactivate
const deactivateList = ['9086', '7910', '2802', '0178', '9534', '9778', '9635', '4350', '2636', '5685', '4595'];

(async () => {
    console.log('\n=== UPDATING CREDIT CARD BALANCES ===\n');

    for (const update of updates) {
        const { data, error } = await supabase
            .from('credit_cards')
            .update({ current_balance: update.balance })
            .eq('user_id', userId)
            .eq('last_four_digits', update.last4)
            .select('name');

        if (error) {
            console.error(`❌ Error updating ${update.last4}:`, error.message);
        } else if (data && data.length > 0) {
            console.log(`✅ ${data[0].name} (${update.last4}): → ₹${update.balance}`);
        }
    }

    console.log('\n=== DEACTIVATING OLD CARDS ===\n');

    for (const last4 of deactivateList) {
        const { data, error } = await supabase
            .from('credit_cards')
            .update({ is_active: false })
            .eq('user_id', userId)
            .eq('last_four_digits', last4)
            .select('name');

        if (error) {
            console.error(`❌ Error deactivating ${last4}:`, error.message);
        } else if (data && data.length > 0) {
            console.log(`🔒 Deactivated: ${data[0].name} (${last4})`);
        }
    }

    // Also deactivate HDFC Millennia with null last_four_digits
    const { data: hdfc } = await supabase
        .from('credit_cards')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('name', 'HDFC Millennia')
        .is('last_four_digits', null)
        .select();

    if (hdfc && hdfc.length > 0) {
        console.log(`🔒 Deactivated: HDFC Millennia (no last 4 digits)`);
    }

    console.log('\n=== VERIFICATION ===\n');

    const { data: activeCards } = await supabase
        .from('credit_cards')
        .select('name, last_four_digits, current_balance, last_statement_amount')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('name');

    console.log(`Active cards: ${activeCards.length}\n`);
    console.table(activeCards.map(c => ({
        'Card': c.name,
        'Last 4': c.last_four_digits,
        'Unbilled': `₹${c.current_balance || 0}`,
        'Billed': c.last_statement_amount ? `₹${c.last_statement_amount}` : '-'
    })));

    const totalUnbilled = activeCards.reduce((sum, c) => sum + (c.current_balance || 0), 0);
    const totalBilled = activeCards.reduce((sum, c) => sum + (c.last_statement_amount || 0), 0);

    console.log(`\nTotal Unbilled: ₹${totalUnbilled.toLocaleString()}`);
    console.log(`Total Billed: ₹${totalBilled.toLocaleString()}`);
    console.log(`Total Credit Card Liability: ₹${(totalBilled + totalUnbilled).toLocaleString()}\n`);

    console.log('✅ All balances updated!\n');

    process.exit(0);
})();
