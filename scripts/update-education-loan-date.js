require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = '8a7ce6b7-eec8-401a-a94e-46685e18a218';

(async () => {
    console.log('\n=== UPDATING EDUCATION LOAN EMI DATE ===\n');

    const { data, error } = await supabase
        .from('loans')
        .update({ next_emi_date: '2025-01-18' })
        .eq('user_id', userId)
        .ilike('name', '%education%')
        .select();

    if (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }

    console.log('✅ Updated education loan EMI date');
    console.log('  From: 20th of each month');
    console.log('  To: 18th of each month');
    console.log('  Next EMI: January 18, 2025');
    console.log('');

    process.exit(0);
})();
