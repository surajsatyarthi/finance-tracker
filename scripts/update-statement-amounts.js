require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

// Statement amounts user provided
const statementData = [
    { last4: '7087', name: 'RBL Platinum Delight', amount: 1200, statementDate: '2025-12-12' },
    { last4: '0976', name: 'Indusind Platinum Aura Edge', amount: 1583, statementDate: '2025-12-13' },
    { last4: '4980', name: 'Axis Neo', amount: 967.55, statementDate: '2025-12-18' },
    { last4: '9572', name: 'Pop YES Bank', amount: 5079.12, statementDate: '2025-12-16' },
    { last4: '8017', name: 'ICICI Amazon', amount: 3698.34, statementDate: '2025-12-18' }
];

(async () => {
    console.log('\n=== UPDATING CREDIT CARD STATEMENT AMOUNTS ===\n');

    // First, check if columns exist by trying to select them
    console.log('Checking if last_statement_amount and last_statement_date columns exist...\n');

    const { data: testCard, error: testError } = await supabase
        .from('credit_cards')
        .select('id, last_statement_amount, last_statement_date')
        .limit(1)
        .single();

    if (testError && testError.message.includes('column')) {
        console.log('⚠️  Columns do not exist yet.');
        console.log('❌ Cannot add columns via Supabase client - need database migration.');
        console.log('\nPlease run this SQL in Supabase dashboard:\n');
        console.log('ALTER TABLE credit_cards ADD COLUMN last_statement_amount DECIMAL(12,2);');
        console.log('ALTER TABLE credit_cards ADD COLUMN last_statement_date DATE;\n');
        console.log('Then run this script again.');
        process.exit(1);
    }

    console.log('✅ Columns exist, proceeding with updates...\n');

    // Update each card
    for (const data of statementData) {
        const { data: updated, error } = await supabase
            .from('credit_cards')
            .update({
                last_statement_amount: data.amount,
                last_statement_date: data.statementDate
            })
            .eq('user_id', userId)
            .eq('last_four_digits', data.last4)
            .select();

        if (error) {
            console.error(`❌ Error updating ${data.name}:`, error.message);
        } else if (updated && updated.length > 0) {
            console.log(`✅ ${data.name} (${data.last4}): ₹${data.amount} due from ${data.statementDate} statement`);
        } else {
            console.log(`⚠️  No card found: ${data.name}`);
        }
    }

    console.log('\n=== VERIFICATION ===\n');

    const { data: cards } = await supabase
        .from('credit_cards')
        .select('name, last_four_digits, last_statement_amount, last_statement_date, due_date')
        .eq('user_id', userId)
        .in('last_four_digits', ['7087', '0976', '4980', '9572', '8017'])
        .order('name');

    console.table(cards.map(c => ({
        'Card': c.name,
        'Statement Amount': c.last_statement_amount ? `₹${c.last_statement_amount}` : 'NULL',
        'Statement Date': c.last_statement_date || 'NULL',
        'Due Day': `${c.due_date}th`
    })));

    const total = cards.reduce((sum, c) => sum + (c.last_statement_amount || 0), 0);
    console.log(`\nTotal Due: ₹${total.toLocaleString()}\n`);

    console.log('✅ All statement amounts updated!\n');

    process.exit(0);
})();
