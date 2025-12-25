require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CHECKING FOR DUPLICATE CARDS ===\n');

    // Get ALL credit cards, not just the 5
    const { data: allCards } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .order('name');

    console.log(`Total cards in database: ${allCards.length}\n`);

    // Check for duplicates by name
    const nameCount = {};
    allCards.forEach(card => {
        nameCount[card.name] = (nameCount[card.name] || 0) + 1;
    });

    const duplicates = Object.keys(nameCount).filter(name => nameCount[name] > 1);

    if (duplicates.length > 0) {
        console.log(`❗ FOUND ${duplicates.length} DUPLICATE CARD NAMES:\n`);

        for (const dupName of duplicates) {
            const cards = allCards.filter(c => c.name === dupName);
            console.log(`\n"${dupName}" appears ${cards.length} times:`);
            console.table(cards.map(c => ({
                'ID': c.id.slice(0, 8),
                'Last 4': c.last_four_digits,
                'Statement Amount': c.last_statement_amount ? `₹${c.last_statement_amount}` : 'NULL',
                'Current Balance': c.current_balance ? `₹${c.current_balance}` : '₹0',
                'Active': c.is_active ? 'Yes' : 'No'
            })));
        }
    } else {
        console.log('✅ No duplicate card names found\n');
    }

    // Show RBL and ICICI specifically
    console.log('\n=== RBL CARDS ===\n');
    const rblCards = allCards.filter(c => c.name?.toLowerCase().includes('rbl'));
    if (rblCards.length > 0) {
        console.table(rblCards.map(c => ({
            'Name': c.name,
            'Last 4': c.last_four_digits,
            'Statement Amount': c.last_statement_amount ? `₹${c.last_statement_amount}` : 'NULL',
            'Current Balance': `₹${c.current_balance || 0}`,
            'Active': c.is_active ? 'Yes' : 'No'
        })));
    }

    console.log('\n=== ICICI CARDS ===\n');
    const iciciCards = allCards.filter(c => c.name?.toLowerCase().includes('icici'));
    if (iciciCards.length > 0) {
        console.table(iciciCards.map(c => ({
            'Name': c.name,
            'Last 4': c.last_four_digits,
            'Statement Amount': c.last_statement_amount ? `₹${c.last_statement_amount}` : 'NULL',
            'Current Balance': `₹${c.current_balance || 0}`,
            'Active': c.is_active ? 'Yes' : 'No'
        })));
    }

    // Calculate what the total SHOULD be if aggregating all RBL/ICICI
    console.log('\n=== POTENTIAL AGGREGATION ===\n');

    const rblTotal = rblCards.reduce((sum, c) => sum + (c.last_statement_amount || 0) + (c.current_balance || 0), 0);
    console.log(`All RBL cards total (statement + balance): ₹${rblTotal}`);
    console.log(`Dashboard shows for RBL: ₹9,672.46`);
    console.log(`Match: ${Math.abs(rblTotal - 9672.46) < 1 ? '✅' : '❌'}\n`);

    const iciciTotal = iciciCards.reduce((sum, c) => sum + (c.last_statement_amount || 0) + (c.current_balance || 0), 0);
    console.log(`All ICICI cards total (statement + balance): ₹${iciciTotal}`);
    console.log(`Dashboard shows for ICICI: ₹4,797.34`);
    console.log(`Match: ${Math.abs(iciciTotal - 4797.34) < 1 ? '✅' : '❌'}\n`);

    process.exit(0);
})();
