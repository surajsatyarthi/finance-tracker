require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

// User's provided statement dues
const statementDues = [
    { amount: 1200, last4: '7087', bank: 'RBL', dueInDays: 7 },
    { amount: 1583, last4: '0976', bank: 'Indusind', dueInDays: 7 },
    { amount: 967.55, last4: '4980', bank: 'Axis', dueInDays: 10 },
    { amount: 5079.12, last4: '9572', bank: 'YES Bank', dueInDays: null, dueDate: '2025-01-05' },
    { amount: 3698.34, last4: '8017', bank: 'ICICI', dueInDays: null, dueDate: '2025-01-05' }
];

(async () => {
    console.log('\n=== PROCESSING CREDIT CARD STATEMENT DUES ===\n');
    console.log('Today:', new Date().toLocaleDateString('en-IN'));
    console.log();

    // Calculate due dates
    const today = new Date('2025-12-25'); // Today's date
    const processedDues = statementDues.map(due => {
        let dueDate;
        if (due.dueDate) {
            dueDate = due.dueDate;
        } else {
            const d = new Date(today);
            d.setDate(d.getDate() + due.dueInDays);
            dueDate = d.toISOString().split('T')[0];
        }

        return {
            ...due,
            calculatedDueDate: dueDate
        };
    });

    // Fetch all cards and match
    const { data: allCards, error: cardsError } = await supabase
        .from('credit_cards')
        .select('id, name, bank, last_four_digits, due_date, statement_date')
        .eq('user_id', userId);

    if (cardsError) {
        console.error('❌ Error fetching cards:', cardsError.message);
        process.exit(1);
    }

    console.log('=== MATCHING CARDS ===\n');

    const matched = [];
    const unmatched = [];

    for (const due of processedDues) {
        const card = allCards.find(c =>
            c.last_four_digits === due.last4 ||
            c.last_four_digits === due.last4.padStart(4, '0')
        );

        if (card) {
            matched.push({
                card,
                dueAmount: due.amount,
                dueDate: due.calculatedDueDate
            });
            console.log(`✅ ${card.name} (${card.last_four_digits}): ₹${due.amount} due on ${due.calculatedDueDate}`);
        } else {
            unmatched.push(due);
            console.log(`❌ NO MATCH for ${due.bank} ending ${due.last4}: ₹${due.amount}`);
        }
    }

    console.log(`\n\nMatched: ${matched.length} cards`);
    console.log(`Unmatched: ${unmatched.length} cards\n`);

    if (unmatched.length > 0) {
        console.log('\n=== UNMATCHED CARDS ===');
        console.log('These cards need to be added to the database:\n');
        unmatched.forEach(u => {
            console.log(`- ${u.bank} ending ${u.last4}: ₹${u.amount} due ${u.calculatedDueDate}`);
        });
    }

    console.log('\n=== SUMMARY TABLE ===\n');
    console.table(matched.map(m => ({
        'Card': m.card.name,
        'Bank': m.card.bank,
        'Last 4': m.card.last_four_digits,
        'Statement Amount': `₹${m.dueAmount}`,
        'Due Date': m.dueDate,
        'Stored Due Day': m.card.due_date
    })));

    // Check if last_statement_amount column exists
    console.log('\n=== NEXT STEPS ===\n');
    console.log('1. Need to add column: last_statement_amount (decimal)');
    console.log('2. Need to add column: last_statement_date (date)');
    console.log('3. Then update these cards with statement amounts');
    console.log('\nWaiting for your confirmation to proceed...\n');

    process.exit(0);
})();
