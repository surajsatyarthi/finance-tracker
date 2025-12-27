require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CLEANING UP CREDIT CARDS TABLE ===\n');

    // Debit cards that should NOT be in credit_cards table
    const debitCardsToRemove = ['CBI', 'DCB', 'Jupiter', 'SBI', 'SBM', 'Slice', 'Tide'];
    
    // Also remove duplicate "Axis REWARDS" (uppercase, keeping lowercase one)
    const duplicatesToRemove = ['Axis REWARDS'];

    const allToRemove = [...debitCardsToRemove, ...duplicatesToRemove];

    console.log('Removing these cards from credit_cards table:');
    allToRemove.forEach(name => console.log(`  - ${name}`));

    for (const cardName of allToRemove) {
        const { data: card } = await supabase
            .from('credit_cards')
            .select('*')
            .eq('user_id', userId)
            .eq('name', cardName)
            .maybeSingle();

        if (card) {
            console.log(`\n✓ Found: ${card.name} (Limit: ₹${card.credit_limit?.toLocaleString('en-IN')})`);
            
            await supabase
                .from('credit_cards')
                .delete()
                .eq('user_id', userId)
                .eq('name', cardName);
            
            console.log(`  ✅ Deleted`);
        }
    }

    // Verify cleanup
    console.log('\n=== VERIFICATION ===\n');
    const { data: remaining } = await supabase
        .from('credit_cards')
        .select('name, credit_limit')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('name');

    console.log(`Remaining credit cards: ${remaining.length}\n`);
    remaining.forEach((card, i) => {
        console.log(`${i+1}. ${card.name} - ₹${card.credit_limit?.toLocaleString('en-IN')}`);
    });

    const total = remaining.reduce((sum, card) => sum + (card.credit_limit || 0), 0);
    console.log(`\nTotal Credit Limit: ₹${total.toLocaleString('en-IN')}\n`);

    console.log('✅ CLEANUP COMPLETE\n');
    process.exit(0);
})();
