require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== UPDATING ACCOUNT BALANCES ===\n');

    // Correct balances
    const updates = [
        { name: 'CBI', newBalance: 78.48, oldBalance: 351.28 },
        { name: 'Kotak', newBalance: 261, oldBalance: 715 },
        { name: 'Slice', newBalance: 86059, oldBalance: 86051 },
    ];

    for (const update of updates) {
        const { data: accounts } = await supabase
            .from('accounts')
            .select('id')
            .eq('user_id', userId)
            .ilike('name', update.name)
            .limit(1);

        if (accounts && accounts.length > 0) {
            const { error } = await supabase
                .from('accounts')
                .update({ balance: update.newBalance })
                .eq('id', accounts[0].id);

            if (error) {
                console.error(`❌ Error updating ${update.name}:`, error.message);
            } else {
                const diff = update.newBalance - update.oldBalance;
                console.log(`✅ ${update.name}: ₹${update.oldBalance} → ₹${update.newBalance} (${diff > 0 ? '+' : ''}₹${diff})`);
            }
        }
    }

    // Clean up duplicate cash entries and set to ₹2,816
    console.log('\n=== CLEANING UP CASH DUPLICATES ===\n');

    const { data: cashAccounts } = await supabase
        .from('accounts')
        .select('id, balance, created_at')
        .eq('user_id', userId)
        .eq('name', 'Cash')
        .order('created_at');

    if (cashAccounts && cashAccounts.length > 0) {
        // Keep the oldest one, update its balance
        const keepId = cashAccounts[0].id;

        const { error: updateError } = await supabase
            .from('accounts')
            .update({ balance: 2816 })
            .eq('id', keepId);

        if (!updateError) {
            console.log(`✅ Updated Cash balance to ₹2,816`);
        }

        // Delete the duplicates
        const deleteIds = cashAccounts.slice(1).map(c => c.id);
        if (deleteIds.length > 0) {
            const { error: deleteError } = await supabase
                .from('accounts')
                .delete()
                .in('id', deleteIds);

            if (!deleteError) {
                console.log(`✅ Deleted ${deleteIds.length} duplicate Cash entries`);
            }
        }
    }

    console.log('\n=== INVESTIGATING KOTAK ISSUE ===\n');

    // Check recent Kotak transactions
    const { data: kotak } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', userId)
        .ilike('name', 'Kotak')
        .single();

    if (kotak) {
        const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .eq('account_id', kotak.id)
            .order('date', { ascending: false })
            .limit(5);

        if (transactions && transactions.length > 0) {
            console.log('Recent Kotak transactions:');
            console.table(transactions.map(t => ({
                'Date': t.date,
                'Type': t.type,
                'Amount': `₹${t.amount}`,
                'Category': t.category_id,
                'Description': t.description || '-'
            })));
        } else {
            console.log('❌ NO TRANSACTIONS FOUND linked to Kotak account!');
            console.log('\nThis is the issue: Transactions exist but aren\'t linked to account_id.');
            console.log('The transaction form might not be properly linking transactions to accounts.');
        }
    }

    console.log('\n✅ All updates complete\n');
    process.exit(0);
})();
