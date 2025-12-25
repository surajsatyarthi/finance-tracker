require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

const corrections = [
    { last4: '7087', name: 'RBL Platinum Delight', newDueDate: 1 },
    { last4: '0976', name: 'Indusind Platinum Aura Edge', newDueDate: 1 },
    { last4: '4980', name: 'Axis Neo', newDueDate: 4 }
];

(async () => {
    console.log('\n=== UPDATING CREDIT CARD DUE DATES ===\n');

    for (const correction of corrections) {
        const { data, error } = await supabase
            .from('credit_cards')
            .update({ due_date: correction.newDueDate })
            .eq('user_id', userId)
            .eq('last_four_digits', correction.last4)
            .select();

        if (error) {
            console.error(`❌ Error updating ${correction.name}:`, error.message);
        } else if (data && data.length > 0) {
            console.log(`✅ ${correction.name} (${correction.last4}): due_date updated to ${correction.newDueDate}`);
        } else {
            console.log(`⚠️  No card found: ${correction.name}`);
        }
    }

    console.log('\n=== VERIFICATION ===\n');

    // Verify all 5 cards now
    const { data: cards } = await supabase
        .from('credit_cards')
        .select('name, last_four_digits, statement_date, due_date')
        .eq('user_id', userId)
        .in('last_four_digits', ['7087', '0976', '4980', '9572', '8017'])
        .order('name');

    console.table(cards.map(c => ({
        'Card': c.name,
        'Last 4': c.last_four_digits,
        'Statement Day': `${c.statement_date}th`,
        'Due Day': `${c.due_date}th`
    })));

    console.log('\n✅ All due dates corrected!\n');

    process.exit(0);
})();
