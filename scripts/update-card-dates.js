require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const updates = [
    { name: 'SBI BPCL', statement_date: 12, due_date: 20 },
    { name: 'SBI Paytm', statement_date: 18, due_date: 6 },
    { name: 'SBI Simply save', statement_date: 9, due_date: 28 },
    { name: 'SBI Simply Save', statement_date: 9, due_date: 28 }, // Alternative spelling
    { name: 'Indusind Rupay', statement_date: 11, due_date: 21 }
];

(async () => {
    console.log('\n=== UPDATING CREDIT CARD DATES ===\n');

    const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

    for (const update of updates) {
        const { data, error } = await supabase
            .from('credit_cards')
            .update({
                statement_date: update.statement_date,
                due_date: update.due_date
            })
            .eq('user_id', userId)
            .eq('name', update.name)
            .select();

        if (error) {
            console.error(`❌ Error updating ${update.name}:`, error.message);
        } else if (data && data.length > 0) {
            console.log(`✅ Updated ${update.name}: Statement=${update.statement_date}, Due=${update.due_date}`);
        } else {
            console.log(`⚠️  No card found matching: ${update.name}`);
        }
    }

    console.log('\n=== VERIFICATION ===\n');

    // Verify the updates
    const { data: allCards, error: fetchError } = await supabase
        .from('credit_cards')
        .select('name, statement_date, due_date')
        .eq('user_id', userId)
        .in('name', updates.map(u => u.name));

    if (fetchError) {
        console.error('Error fetching cards:', fetchError);
    } else {
        console.table(allCards);
    }

    console.log('\n✅ Database update complete!\n');
    process.exit(0);
})();
