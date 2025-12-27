require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== UPDATING CREDIT CARD LIMITS ===\n');

    // Axis bank cards - combined limit of 334000
    const axisUpdates = [
        { name: 'Axis Rewards', newLimit: 334000, reason: 'Combined limit of all 3 Axis cards' },
        { name: 'Axis Neo', newLimit: 1, reason: 'Part of combined Axis limit' },
        { name: 'Axis My Zone', newLimit: 1, reason: 'Part of combined Axis limit' }
    ];

    // ICICI cards
    const iciciUpdates = [
        { name: 'ICICI Amazon', newLimit: 38000, reason: 'Corrected limit' }
    ];

    const allUpdates = [...axisUpdates, ...iciciUpdates];

    for (const update of allUpdates) {
        const { data: card } = await supabase
            .from('credit_cards')
            .select('*')
            .eq('user_id', userId)
            .eq('name', update.name)
            .single();

        if (card) {
            console.log(`${update.name}:`);
            console.log(`  Old limit: ₹${card.credit_limit?.toLocaleString('en-IN')}`);
            console.log(`  New limit: ₹${update.newLimit.toLocaleString('en-IN')}`);
            console.log(`  Reason: ${update.reason}`);

            await supabase
                .from('credit_cards')
                .update({ credit_limit: update.newLimit })
                .eq('user_id', userId)
                .eq('name', update.name);

            console.log(`  ✅ Updated\n`);
        }
    }

    // Display updated cards grouped by bank
    console.log('\n=== CREDIT CARDS BY BANK ===\n');

    const { data: allCards } = await supabase
        .from('credit_cards')
        .select('name, credit_limit')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('name');

    const cardsByBank = {
        'SBI': [],
        'Axis': [],
        'HDFC': [],
        'ICICI': [],
        'Indusind': [],
        'RBL': [],
        'SC': [],
        'Pop': [],
        'SuperMoney': [],
        'BAJAJ': []
    };

    allCards.forEach(card => {
        if (card.name.startsWith('SBI')) cardsByBank['SBI'].push(card);
        else if (card.name.startsWith('Axis')) cardsByBank['Axis'].push(card);
        else if (card.name.startsWith('HDFC')) cardsByBank['HDFC'].push(card);
        else if (card.name.startsWith('ICICI')) cardsByBank['ICICI'].push(card);
        else if (card.name.startsWith('Indusind')) cardsByBank['Indusind'].push(card);
        else if (card.name.startsWith('RBL')) cardsByBank['RBL'].push(card);
        else if (card.name.startsWith('SC')) cardsByBank['SC'].push(card);
        else if (card.name.startsWith('Pop')) cardsByBank['Pop'].push(card);
        else if (card.name.startsWith('SuperMoney')) cardsByBank['SuperMoney'].push(card);
        else if (card.name.startsWith('BAJAJ')) cardsByBank['BAJAJ'].push(card);
    });

    let totalLimit = 0;
    Object.keys(cardsByBank).forEach(bank => {
        const cards = cardsByBank[bank];
        if (cards.length > 0) {
            console.log(`\n${bank}:`);
            cards.forEach(card => {
                console.log(`  - ${card.name}: ₹${card.credit_limit?.toLocaleString('en-IN')}`);
                totalLimit += card.credit_limit || 0;
            });
            const bankTotal = cards.reduce((sum, c) => sum + (c.credit_limit || 0), 0);
            console.log(`  Subtotal: ₹${bankTotal.toLocaleString('en-IN')}`);
        }
    });

    console.log(`\n${'='.repeat(50)}`);
    console.log(`Total Credit Limit: ₹${totalLimit.toLocaleString('en-IN')}`);
    console.log(`Total Cards: ${allCards.length}`);
    console.log('='.repeat(50));

    console.log('\n✅ UPDATE COMPLETE\n');
    process.exit(0);
})();
