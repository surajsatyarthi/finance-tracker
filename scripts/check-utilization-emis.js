require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CHECKING UTILIZATION CALCULATION ===\n');

    // Get all credit cards
    const { data: cards } = await supabase
        .from('credit_cards')
        .select('name, credit_limit, current_balance')
        .eq('user_id', userId)
        .eq('is_active', true)
        .neq('card_type', 'debit');

    const creditCards = (cards || []).filter(c => c.credit_limit !== 1 && c.credit_limit !== 0);

    // Check for EMIs in payables table
    const { data: emis } = await supabase
        .from('payables')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'emi')
        .eq('is_active', true);

    console.log('1. CURRENT UTILIZATION CALCULATION:');
    console.log('   Uses: current_balance field from credit_cards table\n');

    let totalLimit = 0;
    let totalBalance = 0;

    creditCards.forEach(card => {
        totalLimit += (card.credit_limit || 0);
        totalBalance += (card.current_balance || 0);
    });

    console.log(`   Total Limit: ₹${totalLimit.toLocaleString('en-IN')}`);
    console.log(`   Total Balance (from current_balance): ₹${totalBalance.toLocaleString('en-IN')}`);
    console.log(`   Current Utilization: ${((totalBalance / totalLimit) * 100).toFixed(2)}%\n`);

    console.log('2. CREDIT CARD EMIs IN PAYABLES TABLE:');
    if (!emis || emis.length === 0) {
        console.log('   ❌ No EMIs found\n');
    } else {
        let totalEmiAmount = 0;
        emis.forEach(emi => {
            console.log(`   - ${emi.description}: ₹${emi.amount?.toLocaleString('en-IN')}`);
            totalEmiAmount += (emi.amount || 0);
        });
        console.log(`   Total EMIs: ₹${totalEmiAmount.toLocaleString('en-IN')}\n`);
    }

    console.log('3. VERDICT:');
    if (!emis || emis.length === 0) {
        console.log('   ✓ No EMIs to include - current calculation is correct');
    } else {
        console.log('   ⚠️  EMIs exist but are NOT included in utilization');
        console.log(`   Current shows: ${((totalBalance / totalLimit) * 100).toFixed(2)}%`);
        const withEmis = totalBalance + emis.reduce((sum, e) => sum + (e.amount || 0), 0);
        console.log(`   Should show: ${((withEmis / totalLimit) * 100).toFixed(2)}% (including EMIs)`);
    }

    process.exit(0);
})();
