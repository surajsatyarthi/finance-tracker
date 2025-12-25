require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== CHECKING AXIS BANK CARDS ===\n');

    const { data: axisCards } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .ilike('name', 'axis%')
        .eq('is_active', true);

    console.log('Active Axis cards:');
    axisCards.forEach(card => {
        console.log(`${card.name} - Limit: ₹${card.credit_limit?.toLocaleString('en-IN')}`);
    });

    const totalLimit = axisCards.reduce((sum, c) => sum + (c.credit_limit || 0), 0);
    console.log(`\nTotal being counted: ₹${totalLimit.toLocaleString('en-IN')}`);

    console.log('\n⚠️  PROBLEM: If all 3 Axis cards show ₹3.34L, that means we\'re counting it 3 times!');
    console.log('CORRECT: The 3 Axis cards SHARE ₹3.34L total limit');

    process.exit(0);
})();
