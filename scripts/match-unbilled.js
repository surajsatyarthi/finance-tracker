require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

// User's provided unbilled amounts
const unbilledData = [
    { last4: '7087', unbilled: 0, statementDate: '2025-12-12' },
    { last4: '0976', unbilled: 0, statementDate: '2025-12-12' },
    { last4: '4980', unbilled: 0, statementDate: '2025-12-15' },
    { last4: '9572', unbilled: 0, statementDate: '2025-12-16' },
    { last4: '8017', unbilled: 0, statementDate: '2025-12-18' },
    { last4: '7026', unbilled: 4266.29, statementDate: '2025-12-05' },
    { last4: '6273', unbilled: 770, statementDate: '2025-12-12' },
    { last4: '5905', unbilled: 1274.78, statementDate: '2025-12-08' },
    { last4: '5556', unbilled: 0, statementDate: '2025-12-01' },
    { last4: '5621', unbilled: 0, statementDate: '2025-12-11' },
    { last4: '3605', unbilled: 0, statementDate: '2025-12-21' },
    { last4: '6358', unbilled: 0, statementDate: '2025-12-11' },
    { last4: '9170', unbilled: 0, statementDate: null },
    { last4: '1470', unbilled: 0, statementDate: null },
    { last4: '4092', unbilled: 0, statementDate: '2025-12-15' },
    { last4: '9296', unbilled: 0, statementDate: null }
];

(async () => {
    console.log('\n=== MATCHING USER DATA TO DATABASE ===\n');

    // Get all cards
    const { data: allCards } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('name');

    console.log(`Total active cards in DB: ${allCards.length}`);
    console.log(`User provided data for: ${unbilledData.length} cards\n`);

    const matches = [];
    const unmatchedDB = [];
    const unmatchedUser = [];

    // Match user data to DB
    for (const userData of unbilledData) {
        const card = allCards.find(c => c.last_four_digits === userData.last4);
        if (card) {
            const statementDateMatch = userData.statementDate === card.last_statement_date;
            matches.push({
                last4: userData.last4,
                name: card.name,
                dbBalance: card.current_balance,
                correctBalance: userData.unbilled,
                needsUpdate: card.current_balance !== userData.unbilled,
                dbStatementDate: card.last_statement_date,
                userStatementDate: userData.statementDate,
                statementMatch: statementDateMatch
            });
        } else {
            unmatchedUser.push(userData);
        }
    }

    // Find DB cards not in user list
    const userLast4s = unbilledData.map(u => u.last4);
    unmatchedDB.push(...allCards.filter(c => !userLast4s.includes(c.last_four_digits)));

    console.log('=== MATCHED CARDS ===\n');
    console.table(matches.map(m => ({
        'Card': m.name,
        'Last 4': m.last4,
        'DB Balance': `₹${m.dbBalance || 0}`,
        'Correct Balance': `₹${m.correctBalance}`,
        'Needs Update': m.needsUpdate ? '❌' : '✅',
        'Statement Match': m.statementMatch ? '✅' : '❌'
    })));

    if (unmatchedDB.length > 0) {
        console.log('\n❗ CARDS IN DATABASE NOT IN YOUR LIST:\n');
        console.table(unmatchedDB.map(c => ({
            'Name': c.name,
            'Last 4': c.last_four_digits,
            'Current Balance': `₹${c.current_balance || 0}`,
            'Statement Amount': c.last_statement_amount ? `₹${c.last_statement_amount}` : 'NULL'
        })));
    }

    if (unmatchedUser.length > 0) {
        console.log('\n❗ CARDS IN YOUR LIST NOT IN DATABASE:\n');
        console.table(unmatchedUser);
    }

    const needsUpdate = matches.filter(m => m.needsUpdate);
    console.log(`\n${needsUpdate.length} cards need current_balance update\n`);

    if (needsUpdate.length > 0) {
        console.log('Cards needing update:');
        needsUpdate.forEach(m => {
            console.log(`  ${m.name} (${m.last4}): ₹${m.dbBalance} → ₹${m.correctBalance}`);
        });
    }

    process.exit(0);
})();
