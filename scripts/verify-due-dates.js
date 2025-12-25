require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

// User's CORRECT due dates (year fixed)
const userDueDates = [
    { last4: '7087', name: 'RBL', userDueDate: '2026-01-01', amount: 1200 },
    { last4: '0976', name: 'Indusind', userDueDate: '2026-01-01', amount: 1583 },
    { last4: '4980', name: 'Axis Neo', userDueDate: '2026-01-04', amount: 967.55 },
    { last4: '9572', name: 'YES Bank', userDueDate: '2026-01-05', amount: 5079.12 },
    { last4: '8017', name: 'ICICI', userDueDate: '2026-01-05', amount: 3698.34 }
];

(async () => {
    console.log('\n=== VERIFYING DUE DATES (Year Fixed) ===\n');

    const today = new Date('2025-12-25');
    console.log('Today:', today.toDateString(), '\n');

    const { data: cards, error } = await supabase
        .from('credit_cards')
        .select('name, last_four_digits, statement_date, due_date')
        .eq('user_id', userId)
        .in('last_four_digits', ['7087', '0976', '4980', '9572', '8017']);

    if (error) {
        console.error('Error:', error);
        process.exit(1);
    }

    const comparison = [];
    const corrections = [];

    for (const userData of userDueDates) {
        const card = cards.find(c => c.last_four_digits === userData.last4);

        if (!card) continue;

        const statementDay = card.statement_date;
        const storedDueDay = card.due_date;
        const currentDay = today.getDate();

        // Calculate due date using stored due_date
        let calculatedDueDate;
        if (currentDay >= statementDay) {
            calculatedDueDate = new Date(today.getFullYear(), today.getMonth() + 1, storedDueDay);
        } else {
            calculatedDueDate = new Date(today.getFullYear(), today.getMonth(), storedDueDay);
        }

        const userDue = new Date(userData.userDueDate);
        const match = calculatedDueDate.toDateString() === userDue.toDateString();

        // Extract actual due day from user's date
        const actualDueDay = userDue.getDate();

        comparison.push({
            Card: card.name,
            'Stored Due Day': `${storedDueDay}`,
            'Actual Due Day': `${actualDueDay}`,
            'Calculated': calculatedDueDate.toDateString(),
            'Actual': userDue.toDateString(),
            'Match': match ? '✅' : '❌',
            'Amount': `₹${userData.amount}`
        });

        if (!match && storedDueDay !== actualDueDay) {
            corrections.push({
                cardId: card.last_four_digits,
                cardName: card.name,
                oldDueDate: storedDueDay,
                newDueDate: actualDueDay
            });
        }
    }

    console.table(comparison);

    if (corrections.length > 0) {
        console.log('\n❌ DATABASE DUE_DATE VALUES NEED CORRECTION:\n');
        corrections.forEach(c => {
            console.log(`  ${c.cardName} (${c.cardId}): Change due_date from ${c.oldDueDate} → ${c.newDueDate}`);
        });
        console.log('\nShould I update these in the database?');
    } else {
        console.log('\n✅ All due dates match perfectly!\n');
    }

    process.exit(0);
})();
