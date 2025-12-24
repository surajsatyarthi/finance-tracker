require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
    const { data, error } = await supabase
        .from('credit_cards')
        .select('name, statement_date, due_date, current_balance, is_active')
        .eq('user_id', '8a7ce6b7-eec8-401a-a94e-46685e18a218')
        .order('name');

    if (error) {
        console.error('Error:', error);
        process.exit(1);
    }

    console.log('\n=== CREDIT CARD DATES ===\n');
    console.table(data.map(card => ({
        'Card Name': card.name,
        'Statement Date (Day)': card.statement_date || 'Not set',
        'Due Date (Day)': card.due_date || 'Not set',
        'Current Balance': `₹${card.current_balance?.toLocaleString() || 0}`,
        'Active': card.is_active ? 'Yes' : 'No'
    })));

    console.log('\nToday is:', new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }));

    process.exit(0);
})();
