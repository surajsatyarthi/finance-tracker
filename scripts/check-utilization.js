require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CHECKING UTILIZATION CALCULATION ===\n');

    const { data: cards } = await supabase
        .from('credit_cards')
        .select('name, credit_limit, current_balance')
        .eq('user_id', userId)
        .eq('is_active', true)
        .neq('card_type', 'debit')
        .order('name');

    const creditCards = (cards || []).filter(c => c.credit_limit !== 1 && c.credit_limit !== 0);

    console.log('Active Credit Cards:');
    let totalLimit = 0;
    let totalUsed = 0;

    creditCards.forEach(card => {
        totalLimit += (card.credit_limit || 0);
        totalUsed += (card.current_balance || 0);

        if (card.current_balance > 0) {
            console.log(`${card.name}:`);
            console.log(`  Limit: ₹${card.credit_limit?.toLocaleString('en-IN')}`);
            console.log(`  Balance: ₹${card.current_balance?.toLocaleString('en-IN')}`);
        }
    });

    const utilization = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;

    console.log('\n=== SUMMARY ===');
    console.log(`Total Cards: ${creditCards.length}`);
    console.log(`Total Limit: ₹${totalLimit.toLocaleString('en-IN')}`);
    console.log(`Total Used: ₹${totalUsed.toLocaleString('en-IN')}`);
    console.log(`Calculated Utilization: ${utilization.toFixed(2)}%`);
    console.log(`\nExpected in UI: ${Math.round(utilization)}%`);

    process.exit(0);
})();
