require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== INVESTIGATING AMOUNT DISCREPANCIES ===\n');

    // Get the 5 cards
    const { data: cards } = await supabase
        .from('credit_cards')
        .select('id, name, last_four_digits, last_statement_amount')
        .eq('user_id', userId)
        .in('last_four_digits', ['7087', '0976', '4980', '9572', '8017']);

    console.log('=== CREDIT CARD STATEMENT AMOUNTS ===\n');
    console.table(cards.map(c => ({
        'Card': c.name,
        'Last 4': c.last_four_digits,
        'Statement Amount': `₹${c.last_statement_amount}`
    })));

    // Check for payables (EMIs) associated with these cards
    console.log('\n=== CHECKING FOR CARD EMIs IN PAYABLES ===\n');

    const { data: payables } = await supabase
        .from('payables')
        .select('*')
        .eq('user_id', userId);

    if (payables && payables.length > 0) {
        console.log(`Found ${payables.length} total payables`);
        console.table(payables.map(p => ({
            'Source': p.source,
            'Amount': `₹${p.amount}`,
            'Due Date': p.dueDate,
            'Type': p.type,
            'Status': p.status
        })));

        // Check if any match RBL or ICICI
        const rblPayables = payables.filter(p =>
            p.source?.toLowerCase().includes('rbl') ||
            p.source?.toLowerCase().includes('platinum')
        );

        const iciciPayables = payables.filter(p =>
            p.source?.toLowerCase().includes('icici') ||
            p.source?.toLowerCase().includes('amazon')
        );

        if (rblPayables.length > 0) {
            console.log('\n❗ RBL Payables Found:');
            console.table(rblPayables);
        }

        if (iciciPayables.length > 0) {
            console.log('\n❗ ICICI Payables Found:');
            console.table(iciciPayables);
        }
    } else {
        console.log('No payables found');
    }

    // Check credit_card_transactions table for EMIs
    console.log('\n=== CHECKING CREDIT CARD TRANSACTIONS FOR EMIs ===\n');

    for (const card of cards) {
        if (card.name === 'RBL Platinum Delight' || card.name === 'ICICI Amazon') {
            const { data: ccTxs } = await supabase
                .from('credit_card_transactions')
                .select('*')
                .eq('user_id', userId)
                .eq('credit_card_id', card.id);

            if (ccTxs && ccTxs.length > 0) {
                console.log(`\n${card.name}:`);
                console.table(ccTxs.map(t => ({
                    'Amount': `₹${t.amount}`,
                    'Type': t.type,
                    'EMI Months': t.emi_months || 'N/A',
                    'EMI Amount': t.emi_amount ? `₹${t.emi_amount}` : 'N/A',
                    'EMI Remaining': t.emi_remaining || 'N/A',
                    'Date': t.transaction_date
                })));
            }
        }
    }

    process.exit(0);
})();
