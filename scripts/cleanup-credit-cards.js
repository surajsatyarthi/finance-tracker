require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CLEANING UP CREDIT CARDS ===\n');

    // 1. Deactivate duplicate "Axis Rewards" (older one)
    console.log('1. Removing older Axis Rewards duplicate...');
    await supabase
        .from('credit_cards')
        .update({ is_active: false })
        .eq('id', 'f6bade10-72bb-4e87-8210-ab37c64ad0fe');
    console.log('   ✅ Deactivated older Axis Rewards (₹1,20,000)');

    // 2. Deactivate inactive HDFC Millenia
    console.log('\n2. Removing inactive HDFC Millennia...');
    await supabase
        .from('credit_cards')
        .update({ is_active: false })
        .eq('id', 'bfb2b954-f43c-4e56-9502-75c0ecb0d6c0');
    console.log('   ✅ Deactivated HDFC Millennia (was already inactive)');

    // 3. Remove all debit cards (credit_limit = 1)
    console.log('\n3. Deactivating all debit cards (limit = ₹1)...');
    const debitCards = ['CBI', 'DCB', 'Jupiter', 'SBI', 'SBM', 'Slice', 'Tide'];
    for (const cardName of debitCards) {
        await supabase
            .from('credit_cards')
            .update({ is_active: false })
            .eq('user_id', userId)
            .eq('name', cardName)
            .eq('credit_limit', 1);
    }
    console.log(`   ✅ Deactivated ${debitCards.length} debit cards`);

    // 4. Deactivate Kotak Debit
    console.log('\n4. Deactivating Kotak Debit...');
    await supabase
        .from('credit_cards')
        .update({ is_active: false })
        .eq('id', '4fc03932-57e1-414c-b3ed-85b14ee18a89');
    console.log('   ✅ Kotak Debit deactivated');

    console.log('\n✅ CLEANUP COMPLETE\n');
    console.log('Remaining active credit cards:');

    const { data: activeCards } = await supabase
        .from('credit_cards')
        .select('name, credit_limit, current_balance')
        .eq('user_id', userId)
        .eq('is_active', true)
        .neq('credit_limit', 1)
        .order('name');

    activeCards.forEach((card, idx) => {
        console.log(`${idx + 1}. ${card.name} - Limit: ₹${card.credit_limit?.toLocaleString('en-IN')}, Balance: ₹${card.current_balance?.toLocaleString('en-IN')}`);
    });

    console.log(`\nTotal Active Credit Cards: ${activeCards.length}`);
    process.exit(0);
})();
