require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// User's provided data
const userProvidedDates = {
    'SBI BPCL': { statement: 12, due: 20 },
    'SBI Paytm': { statement: 18, due: 6 },
    'SBI Simply save': { statement: 9, due: 28 },
    'SC EaseMyTrip': { statement: 11, due: 2 },
    'Axis My Zone': { statement: 13, due: 30 },
    'Axis Neo': { statement: 18, due: 5 },
    'RBL Platinum Delight': { statement: 12, due: 2 },
    'HDFC Millenia': { statement: 19, due: 7 },
    'HDFC Neu': { statement: 2, due: 21 },
    'Indusind Platinum Aura Edge': { statement: 13, due: 2 },
    'Indusind Rupay': { statement: 11, due: 21 },
    'ICICI Amazon': { statement: 18, due: 5 },
    'ICICI Adani One': { statement: 5, due: 23 },
    'Pop YES Bank': { statement: 16, due: 5 },
    'SuperMoney': { statement: 1, due: 5 }
};

(async () => {
    const { data, error } = await supabase
        .from('credit_cards')
        .select('name, statement_date, due_date')
        .eq('user_id', '8a7ce6b7-eec8-401a-a94e-46685e18a218')
        .order('name');

    if (error) {
        console.error('Error:', error);
        process.exit(1);
    }

    console.log('\n=== DATE COMPARISON ===\n');

    const comparison = [];

    Object.keys(userProvidedDates).forEach(cardName => {
        const dbCard = data.find(c => c.name.toLowerCase().includes(cardName.toLowerCase()) || cardName.toLowerCase().includes(c.name.toLowerCase()));
        const userDates = userProvidedDates[cardName];

        if (dbCard) {
            const statementMatch = dbCard.statement_date === userDates.statement;
            const dueMatch = dbCard.due_date === userDates.due;

            comparison.push({
                'Card': cardName,
                'DB Statement': dbCard.statement_date || 'NULL',
                'Your Statement': userDates.statement,
                'Match': statementMatch ? '✓' : '✗',
                'DB Due': dbCard.due_date || 'NULL',
                'Your Due': userDates.due,
                'Match ': dueMatch ? '✓' : '✗'
            });
        } else {
            comparison.push({
                'Card': cardName,
                'DB Statement': 'NOT FOUND',
                'Your Statement': userDates.statement,
                'Match': '✗',
                'DB Due': 'NOT FOUND',
                'Your Due': userDates.due,
                'Match ': '✗'
            });
        }
    });

    console.table(comparison);

    const mismatches = comparison.filter(c => c['Match'] === '✗' || c['Match '] === '✗');
    if (mismatches.length > 0) {
        console.log(`\n❌ Found ${mismatches.length} mismatches!`);
    } else {
        console.log('\n✅ All dates match perfectly!');
    }

    process.exit(0);
})();
