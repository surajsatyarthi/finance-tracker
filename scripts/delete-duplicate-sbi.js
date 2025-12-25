require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== REMOVING DUPLICATE SBI SIMPLY SAVE ===\n');

    // Get both entries
    const { data: cards } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .eq('last_four_digits', '5905')
        .order('created_at');

    if (!cards || cards.length !== 2) {
        console.log(`Expected 2 cards, found ${cards?.length || 0}`);
        process.exit(1);
    }

    console.log('Found 2 "SBI Simply save" cards:\n');
    console.table(cards.map(c => ({
        'ID': c.id.slice(0, 8),
        'Name': c.name,
        'Created': c.created_at,
        'Balance': c.current_balance
    })));

    // Delete the older one (first in array since we ordered by created_at)
    const toDelete = cards[0];
    const toKeep = cards[1];

    console.log(`\nDeleting: ${toDelete.name} (created ${toDelete.created_at})`);
    console.log(`Keeping: ${toKeep.name} (created ${toKeep.created_at})\n`);

    const { error } = await supabase
        .from('credit_cards')
        .delete()
        .eq('id', toDelete.id);

    if (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }

    console.log('✅ Duplicate deleted!\n');

    // Verify
    const { data: remaining } = await supabase
        .from('credit_cards')
        .select('name, last_four_digits')
        .eq('user_id', userId)
        .eq('last_four_digits', '5905');

    console.log(`Remaining cards with last 4 = 5905: ${remaining?.length || 0}\n`);

    process.exit(0);
})();
